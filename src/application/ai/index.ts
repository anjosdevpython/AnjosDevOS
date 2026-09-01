/**
 * AI Application Module
 * Camada: APPLICATION
 *
 * Ponto de entrada para o serviço central de IA.
 *
 * Uso:
 * ```ts
 * import { getAIService } from '@/application/ai';
 * const ai = getAIService();
 * const response = await ai.chat({ model, messages });
 * ```
 */

export { AIService, getAIService, resetAIService } from './AIService';
export type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from './AIService';
