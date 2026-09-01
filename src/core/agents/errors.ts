/**
 * Agent Error Hierarchy
 * Erros específicos do domínio de agentes.
 *
 * Camada: CORE. Sem dependências externas.
 */

export class AgentError extends Error {
  readonly agentId?: string;
  readonly runId?: string;
  readonly traceId?: string;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: {
      agentId?: string;
      runId?: string;
      traceId?: string;
      retryable?: boolean;
      cause?: unknown;
    } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = 'AgentError';
    this.agentId = options.agentId;
    this.runId = options.runId;
    this.traceId = options.traceId;
    this.retryable = options.retryable ?? false;
  }
}

export class AgentConfigurationError extends AgentError {
  constructor(message: string, options: { agentId?: string; cause?: unknown } = {}) {
    super(message, { ...options, retryable: false });
    this.name = 'AgentConfigurationError';
  }
}

export class AgentExecutionError extends AgentError {
  constructor(
    message: string,
    options: { agentId?: string; runId?: string; traceId?: string; cause?: unknown } = {}
  ) {
    super(message, { ...options, retryable: true });
    this.name = 'AgentExecutionError';
  }
}

export class AgentTimeoutError extends AgentError {
  constructor(
    message: string,
    options: { agentId?: string; runId?: string; traceId?: string; cause?: unknown } = {}
  ) {
    super(message, { ...options, retryable: false });
    this.name = 'AgentTimeoutError';
  }
}

export class AgentCancelledError extends AgentError {
  constructor(
    message: string,
    options: { agentId?: string; runId?: string; traceId?: string } = {}
  ) {
    super(message, { ...options, retryable: false });
    this.name = 'AgentCancelledError';
  }
}

export class AgentStateError extends AgentError {
  readonly currentState: string;
  readonly attemptedTransition: string;

  constructor(
    message: string,
    options: {
      agentId?: string;
      currentState: string;
      attemptedTransition: string;
    }
  ) {
    super(message, { agentId: options.agentId, retryable: false });
    this.name = 'AgentStateError';
    this.currentState = options.currentState;
    this.attemptedTransition = options.attemptedTransition;
  }
}

export class AgentPolicyError extends AgentError {
  constructor(message: string, options: { agentId?: string; cause?: unknown } = {}) {
    super(message, { ...options, retryable: false });
    this.name = 'AgentPolicyError';
  }
}
