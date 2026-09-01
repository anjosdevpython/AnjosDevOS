/**
 * Core AI Resolver
 * Ponte real entre o fluxo de aplicação (AIService / AgentExecutor) e o
 * AI Core: ModelRouter → Provider Adapter → Provider API.
 *
 * Implementa a interface `AIRequestResolver` consumida pelo AgentExecutor,
 * e também é usado diretamente pelo AIService para chat/streaming.
 *
 * Arquitetura:
 *
 * ```
 * AIService / AgentExecutor
 *       ↓
 *   CoreAIResolver (esta classe)
 *       ↓
 *   ModelRouter (seleção de modelo/política)
 *       ↓
 *   Provider Adapter (OpenAI/Anthropic/Google)
 *       ↓
 *   Provider API
 * ```
 *
 * Camada: APPLICATION. Depende do AI Core (CORE) e da provider factory.
 */

import type { AIRequest, AIResponse, AIStreamChunk } from '@/core/ai';
import { getModelRouter, ProviderWithFallback, type AIProvider } from '@/core/ai';
import type { AIRequestResolver } from '@/core/agents/executor';
import { createProvider } from './provider-factory';
import { getLogger } from '@/infrastructure/observability/logger';
import { getEventBus } from '@/infrastructure/events';
import type { ProviderId } from '@/lib/ai/providers';

const FALLBACK_ORDER: readonly ProviderId[] = [
  'networktools',
  'aimlapi',
  'openai',
];

export class CoreAIResolver implements AIRequestResolver {
  /**
   * Resolve uma requisição síncrona (não-streaming).
   * Usa o ModelRouter para selecionar o modelo e o adapter do provider.
   */
  async resolve(request: AIRequest): Promise<AIResponse> {
    const router = getModelRouter();
    const { model } = router.select(request);

    const provider = this.resolveProvider(model.providerId as ProviderId);
    const logger = getLogger();

    try {
      const response = await provider.chat({
        ...request,
        model: model.id,
        provider: model.providerId,
      });

      logger.debug('CoreAIResolver: resposta recebida', {
        provider: response.provider,
        model: response.model,
        finishReason: response.finishReason,
      });

      return response;
    } catch (error) {
      getEventBus().publish('ai.error', {
        provider: model.providerId,
        model: model.id,
        message: error instanceof Error ? error.message : 'Erro na chamada de IA',
        error: error instanceof Error ? error.name : 'UnknownError',
      });
      throw error;
    }
  }

  /**
   * Resolve uma requisição com streaming.
   * Retorna um AsyncIterable de chunks normalizados do AI Core.
   */
  async *resolveStream(request: AIRequest): AsyncIterable<AIStreamChunk> {
    const router = getModelRouter();
    const { model } = router.select(request);

    const provider = this.resolveProvider(model.providerId as ProviderId);
    yield* provider.stream({
      ...request,
      model: model.id,
      provider: model.providerId,
    });
  }

  // -------------------------------------------------------------------------
  // Fallback entre providers
  // -------------------------------------------------------------------------

  /**
   * Resolve o provider primário e o envolve com fallback quando o provider
   * primário falhar com erro retryable (ex.: rate limit, timeout, indisponível).
   */
  private resolveProvider(providerId: ProviderId): AIProvider {
    const primary = createProvider(providerId);

    const fallbackId = FALLBACK_ORDER.find(
      (id) => id !== providerId && this.providerAvailable(id)
    );
    if (!fallbackId) return primary;

    return new ProviderWithFallback(primary, createProvider(fallbackId), {
      maxRetries: 1,
      timeoutMs: 30_000,
    });
  }

  private providerAvailable(providerId: ProviderId): boolean {
    try {
      return !!createProvider(providerId);
    } catch {
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let resolverInstance: CoreAIResolver | null = null;

/** Instância compartilhada do resolver do AI Core. */
export function getCoreAIResolver(): CoreAIResolver {
  if (!resolverInstance) {
    resolverInstance = new CoreAIResolver();
  }
  return resolverInstance;
}

/** Reseta o singleton. Uso exclusivo de testes. */
export function resetCoreAIResolver(): void {
  resolverInstance = null;
}
