/**
 * Logger Types
 * Logging estruturado com níveis, contexto de correlação e transport plugável.
 *
 * Camada: INFRASTRUCTURE (mais baixa). Zero dependências externas.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

/** Ordem de severidade usada para filtrar pelo nível mínimo. */
export const LOG_LEVEL_PRIORITY: Readonly<Record<LogLevel, number>> = {
  [LogLevel.DEBUG]: 10,
  [LogLevel.INFO]: 20,
  [LogLevel.WARN]: 30,
  [LogLevel.ERROR]: 40,
  [LogLevel.FATAL]: 50,
};

/**
 * Contexto de correlação. Os campos nomeados espelham `EventMetadata` do
 * Event Bus para permitir correlacionar log e evento pelo mesmo `traceId`.
 */
export interface LogContext {
  traceId?: string;
  requestId?: string;
  taskId?: string;
  agentId?: string;
  toolId?: string;
  provider?: string;
  model?: string;
  /** Duração em milissegundos. */
  duration?: number;
  userId?: string;
  workspaceId?: string;
  [key: string]: unknown;
}

/** Erro serializado — nunca guardamos a instância crua no registro estruturado. */
export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

/** Registro estruturado — formato estável consumido pelos transports. */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: SerializedError;
  /** Epoch em milissegundos. */
  timestamp: number;
  /** ISO-8601, conveniência para backends de observabilidade. */
  time: string;
}

/**
 * Destino de saída dos logs. Trocar de backend (Datadog, OTel, Sentry...)
 * significa implementar esta interface e chamar `logger.setTransport()`.
 */
export interface LogTransport {
  write(entry: LogEntry): void;
}

export interface LoggerOptions {
  minLevel?: LogLevel;
  /** Tamanho do buffer circular em memória. */
  maxEntries?: number;
  transport?: LogTransport;
  /** Contexto aplicado a todas as entradas (ver `logger.child()`). */
  baseContext?: LogContext;
}
