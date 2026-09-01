/**
 * Routing Policies
 * Cada política define pesos para os fatores de score do router.
 *
 * Pesos altos = aquele fator tem mais influência na seleção.
 * Todos os pesos somam 1.0 por política.
 *
 * Camada: CORE.
 */

import type { RoutingPolicy } from '../types';
import type { PolicyWeights } from './types';

/**
 * Mapa de políticas para pesos.
 *
 * - FAST: prioriza velocidade, aceita custo mais alto
 * - CHEAP: prioriza custo baixo, aceita menor velocidade
 * - BALANCED: peso igual entre todos os fatores
 * - POWERFUL: prioriza capacidade de raciocínio
 * - LOCAL: prioriza modelos que rodam no dispositivo
 * - PRIVACY: prioriza privacidade, ignora custo
 */
export const POLICY_WEIGHTS: Readonly<Record<RoutingPolicy, PolicyWeights>> = {
  FAST: {
    speed: 0.50,
    cost: 0.10,
    reasoning: 0.10,
    contextFit: 0.30,
  },

  CHEAP: {
    speed: 0.10,
    cost: 0.55,
    reasoning: 0.10,
    contextFit: 0.25,
  },

  BALANCED: {
    speed: 0.25,
    cost: 0.25,
    reasoning: 0.25,
    contextFit: 0.25,
  },

  POWERFUL: {
    speed: 0.05,
    cost: 0.10,
    reasoning: 0.60,
    contextFit: 0.25,
  },

  LOCAL: {
    speed: 0.15,
    cost: 0.05,
    reasoning: 0.10,
    contextFit: 0.10,
    // LOCAL é tratado como filtro especial no router, não apenas pesos
  } as PolicyWeights,

  PRIVATE: {
    speed: 0.05,
    cost: 0.05,
    reasoning: 0.15,
    contextFit: 0.15,
    // PRIVATE é tratado como filtro especial no router
  } as PolicyWeights,
};
