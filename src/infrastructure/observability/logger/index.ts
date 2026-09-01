/**
 * Structured Logger — ponto de entrada público
 * Camada: INFRASTRUCTURE
 */

export {
  ConsoleTransport,
  LoggerImpl,
  NoopTransport,
  getLogger,
  resetLogger,
} from './Logger';
export { LOG_LEVEL_PRIORITY, LogLevel } from './types';
export type {
  LogContext,
  LogEntry,
  LogTransport,
  LoggerOptions,
  SerializedError,
} from './types';
export {
  REDACTED,
  isSensitiveKey,
  sanitizeContext,
  sanitizeString,
  sanitizeValue,
} from './sanitizer';
