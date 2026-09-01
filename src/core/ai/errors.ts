/**
 * AI Error Hierarchy
 * Erros específicos do domínio de IA. Cada erro preserva contexto sobre a
 * falha (provedor, modelo, requestId) para diagnóstico sem expor secrets.
 *
 * Camada: CORE. Sem dependências externas.
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

/** Erro base para todas as falhas de IA. */
export class AIError extends Error {
  readonly provider?: string;
  readonly model?: string;
  readonly requestId?: string;
  readonly statusCode?: number;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: {
      provider?: string;
      model?: string;
      requestId?: string;
      statusCode?: number;
      retryable?: boolean;
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = 'AIError';
    this.provider = options.provider;
    this.model = options.model;
    this.requestId = options.requestId;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? false;
  }
}

// ---------------------------------------------------------------------------
// Específicos
// ---------------------------------------------------------------------------

/** Erro retornado por um provedor de IA (resposta HTTP 4xx/5xx). */
export class AIProviderError extends AIError {
  constructor(
    message: string,
    options: {
      provider: string;
      model?: string;
      requestId?: string;
      statusCode?: number;
      retryable?: boolean;
      cause?: unknown;
    }
  ) {
    super(message, options);
    this.name = 'AIProviderError';
  }
}

/** Credencial inválida ou ausente. */
export class AIAuthenticationError extends AIError {
  constructor(
    message: string,
    options: {
      provider?: string;
      model?: string;
      requestId?: string;
      cause?: unknown;
    } = {}
  ) {
    super(message, { ...options, statusCode: 401, retryable: false });
    this.name = 'AIAuthenticationError';
  }
}

/** Rate limit excedido. Retryable após backoff. */
export class AIRateLimitError extends AIError {
  readonly retryAfterMs?: number;

  constructor(
    message: string,
    options: {
      provider?: string;
      model?: string;
      requestId?: string;
      retryAfterMs?: number;
      cause?: unknown;
    } = {}
  ) {
    super(message, { ...options, statusCode: 429, retryable: true });
    this.name = 'AIRateLimitError';
    this.retryAfterMs = options.retryAfterMs;
  }
}

/** Timeout na chamada ao provedor. Retryable. */
export class AITimeoutError extends AIError {
  constructor(
    message: string,
    options: {
      provider?: string;
      model?: string;
      requestId?: string;
      cause?: unknown;
    } = {}
  ) {
    super(message, { ...options, retryable: true });
    this.name = 'AITimeoutError';
  }
}

/** Modelo indisponível (fora do ar, removido, etc). */
export class AIModelUnavailableError extends AIError {
  constructor(
    message: string,
    options: {
      provider: string;
      model: string;
      requestId?: string;
      cause?: unknown;
    }
  ) {
    super(message, { ...options, retryable: true });
    this.name = 'AIModelUnavailableError';
  }
}

/** Requisição malformada (não retryable). */
export class AIInvalidRequestError extends AIError {
  constructor(
    message: string,
    options: {
      provider?: string;
      model?: string;
      requestId?: string;
      cause?: unknown;
    } = {}
  ) {
    super(message, { ...options, retryable: false });
    this.name = 'AIInvalidRequestError';
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Serializa um erro desconhecido em AIError, preservando contexto.
 * Nunca expõe tokens ou secrets na mensagem.
 */
export function toAIError(
  error: unknown,
  context: { provider?: string; model?: string; requestId?: string } = {}
): AIError {
  if (error instanceof AIError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message;

    // Detectar padrões conhecidos de erro HTTP
    if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
      return new AIAuthenticationError(`Falha de autenticação: ${message}`, {
        provider: context.provider,
        model: context.model,
        requestId: context.requestId,
      });
    }
    if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
      return new AIRateLimitError(`Rate limit: ${message}`, {
        provider: context.provider,
        model: context.model,
        requestId: context.requestId,
      });
    }
    if (message.includes('timeout') || message.toLowerCase().includes('timeout')) {
      return new AITimeoutError(`Timeout: ${message}`, context);
    }
    if (message.includes('404') || message.toLowerCase().includes('not found')) {
      return new AIModelUnavailableError(`Modelo não encontrado: ${message}`, {
        ...context,
        provider: context.provider ?? 'unknown',
        model: context.model ?? 'unknown',
      });
    }
    if (message.includes('400') || message.toLowerCase().includes('invalid')) {
      return new AIInvalidRequestError(`Requisição inválida: ${message}`, context);
    }

    return new AIProviderError(message, {
      ...context,
      provider: context.provider ?? 'unknown',
      cause: error,
    });
  }

  // Erro não-Error (string, número, etc)
  const stringified = typeof error === 'string' ? error : JSON.stringify(error);
  return new AIProviderError(stringified, {
    ...context,
    provider: context.provider ?? 'unknown',
  });
}
