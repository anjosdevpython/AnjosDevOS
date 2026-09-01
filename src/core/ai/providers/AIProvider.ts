/**
 * AIProvider Interface
 * Contrato abstrato que todo adapter de provedor de IA deve implementar.
 *
 * Camada: CORE. Sem dependências externas.
 *
 * Cada adapter (OpenAI, Anthropic, Google, etc.) implementa esta interface
 * e traduz os formatos nativos para os tipos normalizados do Core.
 */

import type {
  AIModel,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  ProviderCapability,
  ProviderStatus,
} from '../types';
import { AIError, AITimeoutError, toAIError } from '../errors';
import { getEventBus } from '@/infrastructure/events';
import { getLogger } from '@/infrastructure/observability/logger';
import type { EventPublisher } from '@/core';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface AIProvider {
  /** Identificador único do provedor (ex.: 'openai', 'anthropic'). */
  readonly id: string;
  /** Nome amigável. */
  readonly name: string;
  /** Capacidades declaradas. */
  readonly capabilities: ProviderCapability[];

  /** Lista de modelos disponíveis neste provedor. */
  getModels(): AIModel[];

  /** Verifica se o provedor está acessível (chamada leve). */
  checkHealth(): Promise<ProviderStatus>;

  /**
   * Chamada síncrona (não-streaming) ao provedor.
   * Retorna a resposta completa.
   */
  chat(request: AIRequest): Promise<AIResponse>;

  /**
   * Chamada com streaming. Retorna um AsyncIterable de chunks.
   * O caller consome os chunks conforme chegam.
   */
  stream(request: AIRequest): AsyncIterable<AIStreamChunk>;
}

// ---------------------------------------------------------------------------
// Provider com Fallback
// ---------------------------------------------------------------------------

export interface FallbackConfig {
  /** Máximo de tentativas no provider primário. */
  maxRetries?: number;
  /** Delay base em ms para backoff exponencial. */
  baseDelayMs?: number;
  /** Timeout padrão em ms para cada tentativa. */
  timeoutMs?: number;
}

const DEFAULT_FALLBACK_CONFIG: Required<FallbackConfig> = {
  maxRetries: 2,
  baseDelayMs: 1000,
  timeoutMs: 30_000,
};

/**
 * Wraps um AIProvider com lógica de fallback, retry e timeout.
 *
 * ```
 * Primary Provider → FAILED → retry with backoff → FAILED → Fallback Provider → FAILED → AIError
 * ```
 */
export class ProviderWithFallback implements AIProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: ProviderCapability[];

  private readonly primary: AIProvider;
  private readonly fallback?: AIProvider;
  private readonly config: Required<FallbackConfig>;
  private readonly eventBus: EventPublisher;
  private readonly logger: ReturnType<typeof getLogger>;

  constructor(
    primary: AIProvider,
    fallback?: AIProvider,
    config?: FallbackConfig
  ) {
    this.primary = primary;
    this.fallback = fallback;
    this.id = primary.id;
    this.name = primary.name;
    this.capabilities = primary.capabilities;
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...config };
    this.eventBus = getEventBus();
    this.logger = getLogger();
  }

  getModels(): AIModel[] {
    return this.primary.getModels();
  }

  async checkHealth(): Promise<ProviderStatus> {
    return this.primary.checkHealth();
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const requestId = request.requestId ?? generateRequestId();
    const traceId = request.traceId;

    this.eventBus.publish(
      'ai.request',
      {
        provider: this.primary.id,
        model: request.model ?? 'default',
        messageCount: request.messages.length,
        stream: false,
      },
      { traceId, requestId, provider: this.primary.id, model: request.model }
    );

    try {
      const response = await this.executeWithRetry(
        (p) => p.chat({ ...request, requestId, traceId }),
        requestId,
        traceId
      );

      const duration = Date.now() - startTime;

      this.eventBus.publish(
        'ai.response',
        {
          provider: response.provider,
          model: response.model,
          tokensIn: response.usage?.promptTokens,
          tokensOut: response.usage?.completionTokens,
          finishReason: response.finishReason,
        },
        { traceId, requestId, provider: response.provider, model: response.model, duration }
      );

      this.logger.info('AI chat concluído', {
        traceId,
        requestId,
        provider: response.provider,
        model: response.model,
        duration,
        toolId: response.usage ? `tokens:${response.usage.totalTokens}` : undefined,
      });

      return { ...response, requestId, traceId, duration };
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const aiError = toAIError(error, {
        provider: this.primary.id,
        model: request.model,
        requestId,
      });

      this.eventBus.publish(
        'ai.error',
        {
          provider: this.primary.id,
          model: request.model ?? 'unknown',
          message: aiError.message,
          error: aiError.name,
        },
        { traceId, requestId, provider: this.primary.id, model: request.model, duration }
      );

      this.logger.error('AI chat falhou', {
        traceId,
        requestId,
        provider: this.primary.id,
        model: request.model,
        duration,
      }, aiError);

      throw aiError;
    }
  }

  async *stream(request: AIRequest): AsyncIterable<AIStreamChunk> {
    const requestId = request.requestId ?? generateRequestId();
    const traceId = request.traceId;

    this.eventBus.publish(
      'ai.request',
      {
        provider: this.primary.id,
        model: request.model ?? 'default',
        messageCount: request.messages.length,
        stream: true,
      },
      { traceId, requestId, provider: this.primary.id, model: request.model }
    );

    try {
      yield* this.streamWithRetry(request, requestId, traceId);

      this.eventBus.publish(
        'ai.response',
        {
          provider: this.primary.id,
          model: request.model ?? 'default',
          finishReason: 'stop',
        },
        { traceId, requestId, provider: this.primary.id, model: request.model }
      );
    } catch (error: unknown) {
      const aiError = toAIError(error, {
        provider: this.primary.id,
        model: request.model,
        requestId,
      });

      this.eventBus.publish(
        'ai.error',
        {
          provider: this.primary.id,
          model: request.model ?? 'unknown',
          message: aiError.message,
          error: aiError.name,
        },
        { traceId, requestId, provider: this.primary.id, model: request.model }
      );

      throw aiError;
    }
  }

  // -------------------------------------------------------------------------
  // Interno
  // -------------------------------------------------------------------------

  private async executeWithRetry<T>(
    operation: (provider: AIProvider) => Promise<T>,
    requestId: string,
    traceId?: string
  ): Promise<T> {
    let lastError: unknown;

    // Tentar no primário
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await withTimeout(
          operation(this.primary),
          this.config.timeoutMs
        );
      } catch (error: unknown) {
        lastError = error;
        const aiError = toAIError(error, { provider: this.primary.id, requestId });

        // Erros não retryable — falhar imediatamente
        if (!aiError.retryable) throw aiError;

        // Última tentativa no primário
        if (attempt < this.config.maxRetries) {
          const delay = this.config.baseDelayMs * Math.pow(2, attempt);
          this.logger.debug(`Retry ${attempt + 1}/${this.config.maxRetries} no provider ${this.primary.id}`, {
            traceId,
            requestId,
            provider: this.primary.id,
          });
          await sleep(delay);
        }
      }
    }

    // Fallback
    if (this.fallback) {
      this.logger.info(`Fallback de ${this.primary.id} para ${this.fallback.id}`, {
        traceId,
        requestId,
        provider: this.fallback.id,
      });

      try {
        const response = await withTimeout(
          operation(this.fallback),
          this.config.timeoutMs
        );
        // Marcar como fallback
        if (typeof response === 'object' && response !== null && 'model' in response) {
          return { ...(response as Record<string, unknown>), isFallback: true } as T;
        }
        return response;
      } catch (error: unknown) {
        throw toAIError(error, { provider: this.fallback.id, requestId });
      }
    }

    throw lastError;
  }

  private async *streamWithRetry(
    request: AIRequest,
    requestId: string,
    traceId?: string
  ): AsyncIterable<AIStreamChunk> {
    // Streaming não suporta retry de buffer — delegamos direto
    try {
      yield* await withTimeoutAsync(
        this.primary.stream({ ...request, requestId, traceId }),
        this.config.timeoutMs
      );
    } catch (error: unknown) {
      const aiError = toAIError(error, { provider: this.primary.id, requestId });
      if (aiError.retryable && this.fallback) {
        this.logger.info(`Fallback streaming de ${this.primary.id} para ${this.fallback.id}`, {
          traceId,
          requestId,
        });
        yield* await withTimeoutAsync(
          this.fallback.stream({ ...request, requestId, traceId }),
          this.config.timeoutMs
        );
      } else {
        throw aiError;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  if (ms <= 0) return promise;

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AITimeoutError(`Timeout de ${ms}ms excedido`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function withTimeoutAsync<T extends AsyncIterable<unknown>>(
  iterable: T,
  ms: number
): Promise<T> {
  // Para streaming, o timeout é aplicado na primeira chunk
  // e resetado a cada chunk subsequente
  const iterator = iterable[Symbol.asyncIterator]();
  const timeoutMs = ms;

  const wrappedIterator: AsyncIterableIterator<unknown> = {
    next() {
      return new Promise<IteratorResult<unknown>>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new AITimeoutError(`Streaming timeout de ${timeoutMs}ms excedido`));
        }, timeoutMs);

        iterator.next().then(
          (result) => {
            clearTimeout(timer);
            resolve(result);
          },
          (error) => {
            clearTimeout(timer);
            reject(error);
          }
        );
      });
    },
    return(value) {
      return iterator.return!(value as undefined);
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };

  return {
    [Symbol.asyncIterator]() {
      return wrappedIterator;
    },
  } as unknown as T;
}
