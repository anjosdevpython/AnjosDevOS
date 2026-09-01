/**
 * Core — ponto de entrada público
 *
 * Camada: CORE (domínio). Regra de dependência do projeto:
 *
 *     UI → Application → Core → Infrastructure
 *
 * Core NUNCA importa React, Next.js ou `src/components`.
 *
 * Fase 1: Contratos (portas), Correlation IDs.
 * Fase 2: AI Core, Model Router, Provider Adapters, Error Hierarchy.
 */

// Identity
export { createCorrelationId, createTraceId } from './identity/correlation';

// Contracts
export type {
  EventPublisher,
  EventSubscriber,
  LoggerPort,
} from './contracts/ports';

// AI Core
export * from './ai';

// Agents
export * from './agents';
