/**
 * AI Application Service
 * Camada de aplicação central para chamadas de IA.
 *
 * Arquitetura consolidada:
 * ```
 * ChatInterface / API Route
 *       ↓
 *   AIService (esta camada)
 *       ↓
 *   CoreAIResolver (AIRequestResolver)
 *       ↓
 *   ModelRouter + Provider Adapter
 *       ↓
 *   Provider API
 * ```
 *
 * Camada: APPLICATION. Consumida por UI e API routes.
 * Mantém compatibilidade total com os tipos legados (ChatCompletionRequest,
 * ChatCompletionResponse, ReadableStream SSE) para não quebrar consumidores.
 */

import { getCoreAIResolver, resetCoreAIResolver } from './core-resolver';
import {
  generateImage as transportImage,
  getModels as transportModels,
} from '@/lib/ai/api-client';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from '@/lib/ai/api-client';
import type { AIRequest, AIResponse, AIStreamChunk } from '@/core/ai';
import { getEventBus } from '@/infrastructure/events';

// ---------------------------------------------------------------------------
// Types (re-exportados para convenience)
// ---------------------------------------------------------------------------

export type { ChatCompletionRequest, ChatCompletionResponse };
export type { ImageGenerationRequest, ImageGenerationResponse };

// ---------------------------------------------------------------------------
// AIService
// ---------------------------------------------------------------------------

export class AIService {
  /**
   * Chat completion síncrono (não-streaming).
   *
   * Usa o CoreAIResolver (ModelRouter + adapters) e converte a resposta
   * normalizada para o formato OpenAI-compatível esperado pelos consumidores.
   */
  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const aiRequest: AIRequest = {
      messages: request.messages,
      model: request.model,
      provider: request.provider as string | undefined,
      temperature: request.temperature,
      maxTokens: request.max_tokens,
      stream: false,
    };

    const response = await getCoreAIResolver().resolve(aiRequest);
    return toChatCompletionResponse(response);
  }

  /**
   * Chat completion com streaming.
   *
   * Usa o CoreAIResolver (AsyncIterable<AIStreamChunk>) e converte para
   * ReadableStream SSE no formato que o ChatInterface consome.
   */
  async chatStream(request: ChatCompletionRequest): Promise<ReadableStream> {
    const aiRequest: AIRequest = {
      messages: request.messages,
      model: request.model,
      provider: request.provider as string | undefined,
      temperature: request.temperature,
      maxTokens: request.max_tokens,
      stream: true,
    };

    const iterable = getCoreAIResolver().resolveStream(aiRequest);
    return aiStreamToSSE(iterable);
  }

  /**
   * Geração de imagens.
   * Mantido no transporte legado (o AI Core ainda não cobre imagem).
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return transportImage(request);
  }

  /**
   * Lista modelos disponíveis de um provider.
   * Mantido no transporte legado para compatibilidade.
   */
  async getModels(providerId?: string): Promise<{ data: { id: string; object: string }[] }> {
    const { PROVIDERS } = await import('@/lib/ai/providers');
    type ProviderIdKey = keyof typeof PROVIDERS;
    const resolvedProvider = providerId && providerId in PROVIDERS
      ? (providerId as ProviderIdKey)
      : undefined;
    return transportModels(resolvedProvider as Parameters<typeof transportModels>[0]);
  }
}

// ---------------------------------------------------------------------------
// Conversão de formatos
// ---------------------------------------------------------------------------

/**
 * Converte AIResponse (AI Core) → ChatCompletionResponse (OpenAI compat).
 */
function toChatCompletionResponse(r: AIResponse): ChatCompletionResponse {
  return {
    id: r.id,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: r.model,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: r.content },
        finish_reason: r.finishReason === 'length' ? 'length' : r.finishReason === 'error' ? 'stop' : (r.finishReason || 'stop'),
      },
    ],
    usage: r.usage
      ? {
          prompt_tokens: r.usage.promptTokens,
          completion_tokens: r.usage.completionTokens,
          total_tokens: r.usage.totalTokens,
        }
      : undefined,
  };
}

/**
 * Converte AsyncIterable<AIStreamChunk> → ReadableStream SSE.
 * Formato: `data: {"choices":[{"delta":{"content":"..."},"finish_reason":null}]}\n\n`
 * Final: `data: [DONE]\n\n`
 */
function aiStreamToSSE(iterable: AsyncIterable<AIStreamChunk>): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterable) {
          if (chunk.done) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            break;
          }
          const sse = `data: ${JSON.stringify({
            choices: [{ delta: { content: chunk.content }, finish_reason: null }],
          })}\n\n`;
          controller.enqueue(encoder.encode(sse));
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no streaming';
        getEventBus().publish('ai.error', {
          provider: 'unknown',
          model: 'unknown',
          message: errorMessage,
          error: 'StreamError',
        });
        controller.error(error);
      } finally {
        try { controller.close(); } catch { /* já fechado */ }
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let serviceInstance: AIService | null = null;

/**
 * Retorna a instância compartilhada do AIService.
 */
export function getAIService(): AIService {
  if (!serviceInstance) {
    serviceInstance = new AIService();
  }
  return serviceInstance;
}

/**
 * Reseta o singleton. Uso exclusivo de testes.
 */
export function resetAIService(): void {
  serviceInstance = null;
  resetCoreAIResolver();
}