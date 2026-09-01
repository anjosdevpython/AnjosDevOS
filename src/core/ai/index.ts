/**
 * AI Core — ponto de entrada público
 * Camada: CORE
 *
 * Este módulo centraliza toda a abstração de IA do AnjosDevOS.
 * O resto do sistema consome apenas este barrel — nunca importa diretamente
 * de subdiretórios.
 *
 * Hierarquia de dependência:
 *
 * ```
 * UI → Application → AI Core → Infrastructure (EventBus, Logger, Config)
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type {
  AIMessage,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIModel,
  AIModelCategory,
  AIUsage,
  AIFinishReason,
  RoutingPolicy,
  RoutingResult,
  ProviderCapability,
  ProviderStatus,
} from './types';

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
export {
  AIError,
  AIProviderError,
  AIAuthenticationError,
  AIRateLimitError,
  AITimeoutError,
  AIModelUnavailableError,
  AIInvalidRequestError,
  toAIError,
} from './errors';

// ---------------------------------------------------------------------------
// Provider Interface + Fallback
// ---------------------------------------------------------------------------
export type { AIProvider, FallbackConfig } from './providers/AIProvider';
export { ProviderWithFallback } from './providers/AIProvider';

// ---------------------------------------------------------------------------
// Provider Adapters
// ---------------------------------------------------------------------------
export type { OpenAIAdapterConfig } from './providers/adapters/OpenAIAdapter';
export { OpenAIAdapter } from './providers/adapters/OpenAIAdapter';
export type { AnthropicAdapterConfig } from './providers/adapters/AnthropicAdapter';
export { AnthropicAdapter } from './providers/adapters/AnthropicAdapter';
export type { GoogleAdapterConfig } from './providers/adapters/GoogleAdapter';
export { GoogleAdapter } from './providers/adapters/GoogleAdapter';

// ---------------------------------------------------------------------------
// Model Registry
// ---------------------------------------------------------------------------
export { ModelRegistry, getModelRegistry, resetModelRegistry } from './registry/ModelRegistry';

// ---------------------------------------------------------------------------
// Model Router
// ---------------------------------------------------------------------------
export { ModelRouter, getModelRouter, resetModelRouter } from './router/ModelRouter';
export { POLICY_WEIGHTS } from './router/policies';
export type { ModelScore, ModelRouterOptions, PolicyWeights } from './router/types';
