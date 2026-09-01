/**
 * AI Core Types
 * Tipos normalizados para comunicação com provedores de IA.
 *
 * Camada: CORE. Sem dependências externas — este módulo define o contrato que
 * o resto do sistema consome. Provedores adaptam seus formatos para estes tipos.
 */

// ---------------------------------------------------------------------------
// Mensagens
// ---------------------------------------------------------------------------

export type AIRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  role: AIRole;
  content: string;
}

// ---------------------------------------------------------------------------
// Requisição
// ---------------------------------------------------------------------------

export interface AIRequest {
  /** ID da requisição para correlação (preenchido pelo caller ou pelo Core). */
  requestId?: string;
  /** ID de trace ponta a ponta. */
  traceId?: string;
  messages: AIMessage[];
  /** Modelo específico a usar (ex.: 'gpt-4o', 'claude-sonnet-4-20250514'). */
  model?: string;
  /** Provedor preferido (ex.: 'openai', 'anthropic'). */
  provider?: string;
  /** Política de seleção do Model Router. */
  policy?: RoutingPolicy;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  /** Timeout em milissegundos (0 = sem timeout). */
  timeout?: number;
  /** Metadados livres para o provedor. */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Resposta
// ---------------------------------------------------------------------------

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  provider: string;
  finishReason: AIFinishReason;
  usage?: AIUsage;
  requestId?: string;
  traceId?: string;
  /** Duração total em milissegundos. */
  duration?: number;
  /** Se a resposta veio de um fallback. */
  isFallback?: boolean;
}

export type AIFinishReason =
  | 'stop'
  | 'length'
  | 'tool_call'
  | 'content_filter'
  | 'error'
  | 'timeout'
  | 'unknown';

// ---------------------------------------------------------------------------
// Streaming
// ---------------------------------------------------------------------------

export interface AIStreamChunk {
  /** ID da resposta (presente no primeiro chunk). */
  id?: string;
  /** Texto incremental. */
  content: string;
  /** Modelo used (presente no primeiro chunk). */
  model?: string;
  finishReason?: AIFinishReason;
  /** Se este é o chunk final. */
  done: boolean;
}

// ---------------------------------------------------------------------------
// Modelo
// ---------------------------------------------------------------------------

export interface AIModel {
  /** ID único (ex.: 'gpt-4o', 'claude-sonnet-4-20250514'). */
  id: string;
  /** Nome amigável. */
  name: string;
  /** ID do provedor. */
  providerId: string;
  /** Nome do provedor. */
  providerName: string;
  /** Cor do provedor. */
  providerColor: string;
  category: AIModelCategory;
  /** Janela de contexto máxima em tokens. */
  contextWindow?: number;
  /** Suporta streaming? */
  supportsStreaming?: boolean;
  /** Suporta entrada de imagem? */
  supportsVision?: boolean;
  /** Suporta tool calling? */
  supportsTools?: boolean;
  /** Capacidade de raciocínio (maior = mais potente). */
  reasoningCapability?: number;
  /** Custo relativo (1 = barato, 10 = caro). */
  costTier?: number;
  /** Velocidade relativa (1 = lento, 10 = rápido). */
  speedTier?: number;
  /** É local (roda no dispositivo)? */
  isLocal?: boolean;
  /** Respeita privacidade de dados? */
  respectsPrivacy?: boolean;
  description?: string;
}

export type AIModelCategory = 'chat' | 'image' | 'video' | 'music' | 'tts' | 'audio';

// ---------------------------------------------------------------------------
// Uso
// ---------------------------------------------------------------------------

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// ---------------------------------------------------------------------------
// Router — Políticas
// ---------------------------------------------------------------------------

export type RoutingPolicy =
  | 'FAST'
  | 'CHEAP'
  | 'BALANCED'
  | 'POWERFUL'
  | 'LOCAL'
  | 'PRIVATE';

// ---------------------------------------------------------------------------
// Router — resultado
// ---------------------------------------------------------------------------

export interface RoutingResult {
  model: AIModel;
  /** Se o provider retornou indisponível, o router tenta o fallback. */
  isFallback: boolean;
}

// ---------------------------------------------------------------------------
// Provider — resultado de chamada
// ---------------------------------------------------------------------------

export type ProviderCapability =
  | 'chat'
  | 'stream'
  | 'vision'
  | 'tools'
  | 'image_generation';

export interface ProviderStatus {
  id: string;
  name: string;
  available: boolean;
  capabilities: ProviderCapability[];
  latencyMs?: number;
  error?: string;
}
