/**
 * Event Bus — ponto de entrada público
 * Camada: INFRASTRUCTURE
 */

export { EventBusImpl, getEventBus, resetEventBus } from './EventBus';
export { EVENT_TYPES } from './types';
export type {
  AIErrorPayload,
  AIRequestPayload,
  AIResponsePayload,
  AgentEventPayload,
  DomainEvent,
  EventBusOptions,
  EventErrorReporter,
  EventHandler,
  EventMetadata,
  EventPayload,
  EventPayloadMap,
  EventType,
  MemoryEventPayload,
  OSAppEventPayload,
  OSBootEventPayload,
  OSWindowEventPayload,
  OSWorkspaceEventPayload,
  PublishMetadata,
  Subscription,
  SystemErrorPayload,
  TaskEventPayload,
  ToolEventPayload,
} from './types';
