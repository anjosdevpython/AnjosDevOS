/**
 * Core Contracts
 * Portas (interfaces) que a camada de aplicação e a UI consomem sem depender
 * de uma implementação concreta.
 *
 * Camada: CORE. Só pode depender de INFRASTRUCTURE (regra de dependência do
 * projeto: UI → Application → Core → Infrastructure). Nunca importa React,
 * Next.js ou nada de `src/components`.
 */

import type {
  DomainEvent,
  EventHandler,
  EventPayload,
  EventType,
  PublishMetadata,
  Subscription,
} from '@/infrastructure/events';
import type { LogContext } from '@/infrastructure/observability/logger';

/** Porta de publicação de eventos. Implementada por `EventBusImpl`. */
export interface EventPublisher {
  publish<T extends EventType>(
    type: T,
    payload: EventPayload<T>,
    metadata?: PublishMetadata
  ): DomainEvent<T>;
}

/** Porta de assinatura de eventos. Implementada por `EventBusImpl`. */
export interface EventSubscriber {
  subscribe<T extends EventType>(eventType: T, handler: EventHandler<T>): Subscription;
}

/** Porta de logging. Implementada por `LoggerImpl`. */
export interface LoggerPort {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext, error?: unknown): void;
  error(message: string, context?: LogContext, error?: unknown): void;
  fatal(message: string, context?: LogContext, error?: unknown): void;
}
