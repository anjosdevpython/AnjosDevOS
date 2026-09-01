/**
 * Application — ponto de entrada público
 *
 * Camada: APPLICATION (casos de uso e adapters). Regra de dependência:
 *
 *     UI → Application → Core → Infrastructure
 *
 * Application pode importar CORE e INFRASTRUCTURE. Não importa React, Next.js
 * nem `src/components`: a integração com a UI acontece por portas estruturais
 * (ex.: `OSContextPort`).
 */

export {
  OSContextAdapter,
  getOSContextAdapter,
  resetOSContextAdapter,
} from './os';
export type { OSContextAdapterOptions, OSContextPort } from './os';

// AI Service
export { AIService, getAIService, resetAIService } from './ai';
export type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from './ai';
