/**
 * Structured Logger
 * Logging estruturado com níveis, contexto de correlação, buffer em memória e
 * transport plugável. Todo registro passa por sanitização de secrets.
 *
 * Camada: INFRASTRUCTURE (mais baixa). Zero dependências externas.
 */

import { sanitizeContext, sanitizeString } from './sanitizer';
import {
  LOG_LEVEL_PRIORITY,
  LogLevel,
  type LogContext,
  type LogEntry,
  type LogTransport,
  type LoggerOptions,
  type SerializedError,
} from './types';

const DEFAULT_MAX_ENTRIES = 1000;

/** Transport padrão: `console`, com uma única string por registro. */
export class ConsoleTransport implements LogTransport {
  write(entry: LogEntry): void {
    const context =
      entry.context && Object.keys(entry.context).length > 0
        ? ` ${safeStringify(entry.context)}`
        : '';
    const error = entry.error ? ` ${entry.error.stack ?? entry.error.message}` : '';
    const line = `[${entry.time}] [${entry.level}] ${entry.message}${context}${error}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(line);
        break;
      case LogLevel.INFO:
        console.info(line);
        break;
      case LogLevel.WARN:
        console.warn(line);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(line);
        break;
    }
  }
}

/** Transport que descarta tudo. Útil em testes e em builds silenciosos. */
export class NoopTransport implements LogTransport {
  write(): void {
    // intencionalmente vazio
  }
}

export class LoggerImpl {
  private minLevel: LogLevel;
  private readonly maxEntries: number;
  private readonly baseContext: LogContext;
  private transport: LogTransport;
  private entries: LogEntry[] = [];

  constructor(options: LogLevel | LoggerOptions = {}) {
    const resolved: LoggerOptions =
      typeof options === 'string' ? { minLevel: options } : options;

    this.minLevel = resolved.minLevel ?? LogLevel.INFO;
    this.maxEntries = resolved.maxEntries ?? DEFAULT_MAX_ENTRIES;
    this.transport = resolved.transport ?? new ConsoleTransport();
    this.baseContext = resolved.baseContext ?? {};
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext, error?: unknown): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: LogContext, error?: unknown): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context?: LogContext, error?: unknown): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  /** `true` se o nível seria efetivamente registrado. */
  isLevelEnabled(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  getMinLevel(): LogLevel {
    return this.minLevel;
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /** Troca o backend de saída (Datadog, OTel, Sentry, arquivo...). */
  setTransport(transport: LogTransport): void {
    this.transport = transport;
  }

  /**
   * Logger derivado que carrega um contexto fixo (ex.: `traceId` de um fluxo).
   * Compartilha o transport; mantém buffer próprio.
   */
  child(context: LogContext): LoggerImpl {
    return new LoggerImpl({
      minLevel: this.minLevel,
      maxEntries: this.maxEntries,
      transport: this.transport,
      baseContext: { ...this.baseContext, ...context },
    });
  }

  /** Snapshot do buffer circular em memória. */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
    if (!this.isLevelEnabled(level)) return;

    const mergedContext: LogContext = { ...this.baseContext, ...context };
    const hasContext = Object.keys(mergedContext).length > 0;

    const entry: LogEntry = {
      level,
      message: sanitizeString(message),
      context: hasContext ? sanitizeContext(mergedContext) : undefined,
      error: error === undefined ? undefined : serializeError(error),
      timestamp: Date.now(),
      time: new Date().toISOString(),
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.splice(0, this.entries.length - this.maxEntries);
    }

    // Um transport defeituoso nunca pode derrubar o caminho de execução.
    try {
      this.transport.write(entry);
    } catch {
      // silenciado por design
    }
  }
}

/** Normaliza qualquer valor lançado em um erro serializável e sanitizado. */
function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeString(error.message),
      stack: error.stack ? sanitizeString(error.stack) : undefined,
    };
  }

  return {
    name: 'UnknownError',
    message: sanitizeString(typeof error === 'string' ? error : safeStringify(error)),
  };
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return '[Unserializable]';
  }
}

let loggerInstance: LoggerImpl | null = null;

/** Instância singleton compartilhada pela aplicação. */
export function getLogger(): LoggerImpl {
  if (!loggerInstance) {
    loggerInstance = new LoggerImpl({
      minLevel:
        process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    });
  }
  return loggerInstance;
}

/** Reseta o singleton. Uso exclusivo de testes. */
export function resetLogger(): void {
  loggerInstance = null;
}
