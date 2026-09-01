/**
 * Event Bus Types
 * Sistema de pub/sub tipado para comunicação desacoplada entre módulos.
 *
 * Camada: INFRASTRUCTURE (mais baixa). Não importa de core/, application/ ou components/.
 */

// ---------------------------------------------------------------------------
// Payloads de domínio
// ---------------------------------------------------------------------------

export interface TaskEventPayload {
  taskId: string;
  title?: string;
  status?: string;
  result?: unknown;
  error?: string;
}

export interface AgentEventPayload {
  agentId: string;
  agentName?: string;
  taskId?: string;
  runId?: string;
  state?: string;
  result?: unknown;
  error?: string;
  duration?: number;
}

export interface ToolEventPayload {
  toolId: string;
  toolName?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export interface MemoryEventPayload {
  memoryId: string;
  kind?: string;
  scope?: string;
}

export interface AIRequestPayload {
  provider: string;
  model: string;
  messageCount?: number;
  stream?: boolean;
}

export interface AIResponsePayload {
  provider: string;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  finishReason?: string;
}

export interface AIErrorPayload {
  provider: string;
  model: string;
  message: string;
  error?: string;
}

export interface SystemErrorPayload {
  message: string;
  scope?: string;
  error?: string;
}

// Eventos do OS (window manager / shell). Publicados pelo OSContextAdapter.
export interface OSWindowEventPayload {
  windowId: string;
  appId?: string;
}

export interface OSAppEventPayload {
  appId: string;
}

export interface OSWorkspaceEventPayload {
  workspaceId: string;
  previousWorkspaceId?: string;
}

export interface OSBootEventPayload {
  booted: boolean;
}

// ---------------------------------------------------------------------------
// Mapa de eventos -> payload
// ---------------------------------------------------------------------------

/**
 * Contrato central: cada tipo de evento tem exatamente um formato de payload.
 * Adicionar um evento novo = adicionar uma entrada aqui.
 */
export interface EventPayloadMap {
  // Tasks
  'task.created': TaskEventPayload;
  'task.started': TaskEventPayload;
  'task.completed': TaskEventPayload;
  'task.failed': TaskEventPayload;
  // Agents
  'agent.created': AgentEventPayload;
  'agent.ready': AgentEventPayload;
  'agent.started': AgentEventPayload;
  'agent.paused': AgentEventPayload;
  'agent.resumed': AgentEventPayload;
  'agent.completed': AgentEventPayload;
  'agent.failed': AgentEventPayload;
  'agent.cancelled': AgentEventPayload;
  // Tools
  'tool.called': ToolEventPayload;
  'tool.completed': ToolEventPayload;
  'tool.failed': ToolEventPayload;
  // Memory
  'memory.created': MemoryEventPayload;
  'memory.updated': MemoryEventPayload;
  // AI
  'ai.request': AIRequestPayload;
  'ai.response': AIResponsePayload;
  'ai.error': AIErrorPayload;
  // System
  'system.error': SystemErrorPayload;
  // OS shell (integração gradual via OSContextAdapter)
  'os.booted': OSBootEventPayload;
  'os.app.launched': OSAppEventPayload;
  'os.window.opened': OSWindowEventPayload;
  'os.window.closed': OSWindowEventPayload;
  'os.workspace.changed': OSWorkspaceEventPayload;
}

export type EventType = keyof EventPayloadMap;

export type EventPayload<T extends EventType> = EventPayloadMap[T];

/** Lista em runtime de todos os tipos de evento conhecidos. */
export const EVENT_TYPES: readonly EventType[] = [
  'task.created',
  'task.started',
  'task.completed',
  'task.failed',
  'agent.created',
  'agent.ready',
  'agent.started',
  'agent.paused',
  'agent.resumed',
  'agent.completed',
  'agent.failed',
  'agent.cancelled',
  'tool.called',
  'tool.completed',
  'tool.failed',
  'memory.created',
  'memory.updated',
  'ai.request',
  'ai.response',
  'ai.error',
  'system.error',
  'os.booted',
  'os.app.launched',
  'os.window.opened',
  'os.window.closed',
  'os.workspace.changed',
] as const;

// ---------------------------------------------------------------------------
// Metadata e envelope
// ---------------------------------------------------------------------------

/** Metadata de correlação anexada a todo evento publicado. */
export interface EventMetadata {
  /** Correlaciona todos os eventos de um mesmo fluxo ponta a ponta. */
  traceId?: string;
  /** Correlaciona eventos de uma única requisição (ex.: chamada HTTP/AI). */
  requestId?: string;
  taskId?: string;
  agentId?: string;
  toolId?: string;
  provider?: string;
  model?: string;
  /** Duração em milissegundos, quando o evento encerra uma operação. */
  duration?: number;
  /** Módulo que originou o evento (ex.: 'OSContextAdapter'). */
  source?: string;
  /** Preenchido automaticamente pelo EventBus. */
  timestamp: number;
}

/** Metadata que o publisher pode informar (timestamp é sempre do bus). */
export type PublishMetadata = Omit<Partial<EventMetadata>, 'timestamp'>;

export interface DomainEvent<T extends EventType = EventType> {
  type: T;
  payload: EventPayload<T>;
  metadata: EventMetadata;
}

export type EventHandler<T extends EventType = EventType> = (
  event: DomainEvent<T>
) => void | Promise<void>;

export interface Subscription {
  eventType: EventType;
  handlerId: string;
  /** Idempotente: chamar mais de uma vez não lança erro. */
  unsubscribe: () => void;
  /** `false` depois de `unsubscribe()`. */
  readonly isActive: boolean;
}

/** Callback invocado quando um handler lança/rejeita. Nunca propaga. */
export type EventErrorReporter = (
  error: unknown,
  context: { eventType: EventType; handlerId: string }
) => void;

export interface EventBusOptions {
  /**
   * Limite de handlers por tipo de evento antes de emitir um aviso de possível
   * vazamento de listeners. `0` desliga o aviso.
   */
  maxListenersPerEvent?: number;
  onHandlerError?: EventErrorReporter;
}
