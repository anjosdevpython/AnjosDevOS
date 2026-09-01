/**
 * Router Types
 * Tipos específicos do Model Router.
 *
 * Camada: CORE.
 */

import type { AIModel, RoutingPolicy } from '../types';

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Fatores de score que o router avalia para cada modelo.
 * Todos os campos são 0–10 (maior = melhor para o critério).
 */
export interface ModelScore {
  model: AIModel;
  speed: number;
  cost: number;
  reasoning: number;
  contextFit: number;
  available: number;
}

/**
 * Pesos por política. Cada política define quanto cada fator importa.
 * Pesos somam 1.0.
 */
export interface PolicyWeights {
  speed: number;
  cost: number;
  reasoning: number;
  contextFit: number;
}

// ---------------------------------------------------------------------------
// Router config
// ---------------------------------------------------------------------------

export interface ModelRouterOptions {
  /** Política padrão quando não especificada. */
  defaultPolicy?: RoutingPolicy;
  /** Modelos sempre excluídos da seleção (ex.: modelos deprecated). */
  excludedModels?: Set<string>;
  /** Providers sempre excluídos. */
  excludedProviders?: Set<string>;
}
