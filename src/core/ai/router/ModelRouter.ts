/**
 * Model Router
 * Seleciona o melhor provider/modelo para uma dada requisição, baseado em
 * política, capacidades, custo, velocidade e disponibilidade.
 *
 * Camada: CORE. Não chama APIs externas — apenas seleciona.
 *
 * Arquitetura:
 *
 * ```
 * AI Request → Analyze requirements → Score candidates → Select model
 * ```
 *
 * O Router NÃO executa a chamada. Ele devolve um `RoutingResult` com o
 * modelo escolhido e se é fallback.
 */

import type { AIModel, AIRequest, RoutingPolicy } from '../types';
import type { ModelRegistry } from '../registry/ModelRegistry';
import { getModelRegistry } from '../registry/ModelRegistry';
import type { ModelRouterOptions, ModelScore } from './types';
import { POLICY_WEIGHTS } from './policies';
import { getLogger } from '@/infrastructure/observability/logger';

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export class ModelRouter {
  private readonly registry: ModelRegistry;
  private readonly defaultPolicy: RoutingPolicy;
  private readonly excludedModels: Set<string>;
  private readonly excludedProviders: Set<string>;

  constructor(registry: ModelRegistry, options: ModelRouterOptions = {}) {
    this.registry = registry;
    this.defaultPolicy = options.defaultPolicy ?? 'BALANCED';
    this.excludedModels = options.excludedModels ?? new Set();
    this.excludedProviders = options.excludedProviders ?? new Set();
  }

  /**
   * Seleciona o melhor modelo para uma requisição.
   *
   * Se o `request.model` está definido explicitamente, o router valida se ele
   * existe e é compatível — caso contrário, usa a política para selecionar.
   */
  select(request: AIRequest): { model: AIModel; isFallback: boolean } {
    const policy = request.policy ?? this.defaultPolicy;

    // Se um modelo foi especificado explicitamente, verificar se é válido
    if (request.model) {
      const specified = this.registry.resolve(request.model);
      if (specified && this.isCandidate(specified, request)) {
        return { model: specified, isFallback: false };
      }
      // Modelo especificado não encontrado ou incompatível — cair na política
      getLogger().debug(`Modelo "${request.model}" não encontrado/incompatível, usando política ${policy}`);
    }

    // Filtrar candidatos
    let candidates = this.getCandidates(request);

    if (candidates.length === 0) {
      throw new Error(`Nenhum modelo disponível para a política "${policy}"`);
    }

    // Filtros especiais para LOCAL e PRIVATE
    if (policy === 'LOCAL') {
      const localModels = candidates.filter((m) => m.isLocal);
      if (localModels.length > 0) candidates = localModels;
      // Se não há modelos locais, continua com todos (fallback)
    }

    if (policy === 'PRIVATE') {
      const privateModels = candidates.filter((m) => m.respectsPrivacy);
      if (privateModels.length > 0) candidates = privateModels;
    }

    // Se o provider foi especificado, priorizar
    if (request.provider) {
      const providerModels = candidates.filter((m) => m.providerId === request.provider);
      if (providerModels.length > 0) candidates = providerModels;
    }

    // Score e ranquear
    const scored = candidates.map((model) => this.score(model, policy, request));
    scored.sort((a, b) => this.totalScore(b, policy) - this.totalScore(a, policy));

    const best = scored[0];
    const logger = getLogger();
    logger.debug(`Model Router selecionou: ${best.model.id} (${best.model.providerId}) [${policy}]`, {
      provider: best.model.providerId,
      model: best.model.id,
    });

    return { model: best.model, isFallback: false };
  }

  /**
   * Retorna os modelos candidatos (após filtros de exclusão e compatibilidade).
   */
  private getCandidates(request: AIRequest): AIModel[] {
    return this.registry.getAll().filter((model) => this.isCandidate(model, request));
  }

  /**
   * Verifica se um modelo é compatível com a requisição.
   */
  private isCandidate(model: AIModel, request: AIRequest): boolean {
    // Exclusões
    if (this.excludedModels.has(model.id)) return false;
    if (this.excludedProviders.has(model.providerId)) return false;

    // Só modelos de chat para chat requests
    if (model.category !== 'chat') return false;

    // Verificar janela de contexto (se estimada)
    if (request.messages.length > 0 && model.contextWindow) {
      // Estimativa conservadora: ~4 chars por token
      const estimatedTokens = request.messages.reduce(
        (sum, m) => sum + Math.ceil(m.content.length / 4),
        0
      );
      // Reservar espaço para resposta
      const reservedTokens = request.maxTokens ?? 4096;
      if (estimatedTokens + reservedTokens > model.contextWindow) return false;
    }

    // Se precisa de streaming, verificar suporte
    if (request.stream && model.supportsStreaming === false) return false;

    return true;
  }

  /**
   * Calcula o score de um modelo para uma política dada.
   */
  private score(model: AIModel, policy: RoutingPolicy, _request: AIRequest): ModelScore {
    const weights = POLICY_WEIGHTS[policy];

    // Normalizar fatores para 0–10
    const speed = model.speedTier ?? 5;
    const cost = 10 - (model.costTier ?? 5); // Inverter: menor custo = maior score
    const reasoning = model.reasoningCapability ?? 5;

    // Context fit: 10 se a janela é grande o suficiente, menos se for apertada
    let contextFit = 10;
    if (model.contextWindow) {
      const estimatedTokens = _request.messages.reduce(
        (sum, m) => sum + Math.ceil(m.content.length / 4),
        0
      );
      const ratio = estimatedTokens / model.contextWindow;
      if (ratio > 0.8) contextFit = 2;
      else if (ratio > 0.5) contextFit = 5;
      else if (ratio > 0.2) contextFit = 8;
    }

    return {
      model,
      speed,
      cost,
      reasoning,
      contextFit,
      available: 10, // Default; pode ser ajustado com health check
    };
  }

  /**
   * Calcula o score total (peso × valor) para uma política.
   */
  private totalScore(score: ModelScore, policy: RoutingPolicy): number {
    const weights = POLICY_WEIGHTS[policy];

    return (
      weights.speed * score.speed +
      weights.cost * score.cost +
      weights.reasoning * score.reasoning +
      weights.contextFit * score.contextFit
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let routerInstance: ModelRouter | null = null;

export function getModelRouter(): ModelRouter {
  if (!routerInstance) {
    routerInstance = new ModelRouter(getModelRegistry());
  }
  return routerInstance;
}

export function resetModelRouter(): void {
  routerInstance = null;
}
