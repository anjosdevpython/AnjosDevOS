/**
 * Event Bus
 * Pub/Sub tipado, síncrono e in-process para comunicação desacoplada.
 *
 * Camada: INFRASTRUCTURE (mais baixa). Zero dependências externas.
 *
 * Garantias:
 * - Um handler que lança nunca derruba o `publish()` nem os demais handlers.
 * - `unsubscribe()` é idempotente e remove a entrada do mapa (evita leak).
 * - Handlers são iterados sobre um snapshot: sub/unsub durante o publish é seguro.
 */

import type {
  DomainEvent,
  EventBusOptions,
  EventErrorReporter,
  EventHandler,
  EventMetadata,
  EventPayload,
  EventType,
  PublishMetadata,
  Subscription,
} from './types';

/**
 * Assinatura interna usada para armazenar handlers de qualquer tipo de evento
 * no mesmo mapa. O estreitamento correto é garantido pelas assinaturas públicas
 * de `subscribe()` / `publish()`.
 */
type StoredHandler = (event: DomainEvent<EventType>) => void | Promise<void>;

const DEFAULT_MAX_LISTENERS_PER_EVENT = 100;

const defaultErrorReporter: EventErrorReporter = (error, context) => {
  console.error(
    `[EventBus] handler "${context.handlerId}" falhou no evento "${context.eventType}"`,
    error
  );
};

export class EventBusImpl {
  private readonly listeners = new Map<EventType, Map<string, StoredHandler>>();
  private readonly maxListenersPerEvent: number;
  private readonly onHandlerError: EventErrorReporter;
  private readonly warnedEventTypes = new Set<EventType>();
  private handlerIdCounter = 0;

  constructor(options: EventBusOptions = {}) {
    this.maxListenersPerEvent =
      options.maxListenersPerEvent ?? DEFAULT_MAX_LISTENERS_PER_EVENT;
    this.onHandlerError = options.onHandlerError ?? defaultErrorReporter;
  }

  /**
   * Publica um evento para todos os subscribers do tipo.
   * Nunca lança: erros de handler são isolados e reportados.
   */
  publish<T extends EventType>(
    type: T,
    payload: EventPayload<T>,
    metadata: PublishMetadata = {}
  ): DomainEvent<T> {
    const resolvedMetadata: EventMetadata = {
      ...metadata,
      timestamp: Date.now(),
    };

    const event: DomainEvent<T> = { type, payload, metadata: resolvedMetadata };

    const handlers = this.listeners.get(type);
    if (!handlers || handlers.size === 0) return event;

    // Snapshot: permite que handlers façam subscribe/unsubscribe com segurança.
    const snapshot = Array.from(handlers.entries());

    for (const [handlerId, handler] of snapshot) {
      this.invokeHandler(handler, event as unknown as DomainEvent<EventType>, type, handlerId);
    }

    return event;
  }

  /** Inscreve um handler tipado para um tipo de evento. */
  subscribe<T extends EventType>(eventType: T, handler: EventHandler<T>): Subscription {
    let handlers = this.listeners.get(eventType);
    if (!handlers) {
      handlers = new Map<string, StoredHandler>();
      this.listeners.set(eventType, handlers);
    }

    const handlerId = `handler_${this.handlerIdCounter++}`;
    handlers.set(handlerId, handler as unknown as StoredHandler);

    this.warnOnPossibleLeak(eventType, handlers.size);

    let active = true;
    const subscription: Subscription = {
      eventType,
      handlerId,
      unsubscribe: () => {
        if (!active) return;
        active = false;
        this.removeHandler(eventType, handlerId);
      },
      get isActive() {
        return active;
      },
    };

    return subscription;
  }

  /**
   * Inscreve um handler que é removido automaticamente após a primeira entrega.
   * Útil para aguardar um evento pontual sem risco de vazar listener.
   */
  once<T extends EventType>(eventType: T, handler: EventHandler<T>): Subscription {
    const subscription = this.subscribe<T>(eventType, (event) => {
      subscription.unsubscribe();
      return handler(event);
    });
    return subscription;
  }

  /** Remove todos os handlers de um tipo de evento. */
  unsubscribeAll(eventType: EventType): void {
    this.listeners.delete(eventType);
    this.warnedEventTypes.delete(eventType);
  }

  /** Quantidade de subscribers ativos para um tipo de evento. */
  getSubscriberCount(eventType: EventType): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }

  /** Tipos de evento que possuem ao menos um subscriber ativo. */
  getActiveEventTypes(): EventType[] {
    return Array.from(this.listeners.keys());
  }

  /** Total de handlers registrados no bus (diagnóstico de leak). */
  getTotalSubscriberCount(): number {
    let total = 0;
    this.listeners.forEach((handlers) => {
      total += handlers.size;
    });
    return total;
  }

  /** Remove todos os listeners. Usado em testes e no teardown. */
  clear(): void {
    this.listeners.clear();
    this.warnedEventTypes.clear();
  }

  private invokeHandler(
    handler: StoredHandler,
    event: DomainEvent<EventType>,
    eventType: EventType,
    handlerId: string
  ): void {
    try {
      const result = handler(event);
      if (result instanceof Promise) {
        // Fire-and-forget: erros assíncronos são reportados, não propagados.
        result.catch((error: unknown) => {
          this.onHandlerError(error, { eventType, handlerId });
        });
      }
    } catch (error: unknown) {
      this.onHandlerError(error, { eventType, handlerId });
    }
  }

  private removeHandler(eventType: EventType, handlerId: string): void {
    const handlers = this.listeners.get(eventType);
    if (!handlers) return;

    handlers.delete(handlerId);

    // Libera o mapa vazio para não acumular chaves indefinidamente.
    if (handlers.size === 0) {
      this.listeners.delete(eventType);
      this.warnedEventTypes.delete(eventType);
    }
  }

  private warnOnPossibleLeak(eventType: EventType, count: number): void {
    if (this.maxListenersPerEvent <= 0) return;
    if (count <= this.maxListenersPerEvent) return;
    if (this.warnedEventTypes.has(eventType)) return;

    this.warnedEventTypes.add(eventType);
    console.warn(
      `[EventBus] possível vazamento de listeners: ${count} handlers em "${eventType}" ` +
        `(limite ${this.maxListenersPerEvent}). Verifique se unsubscribe() está sendo chamado.`
    );
  }
}

let eventBusInstance: EventBusImpl | null = null;

/** Instância singleton compartilhada pela aplicação. */
export function getEventBus(): EventBusImpl {
  if (!eventBusInstance) {
    eventBusInstance = new EventBusImpl();
  }
  return eventBusInstance;
}

/** Reseta o singleton. Uso exclusivo de testes. */
export function resetEventBus(): void {
  eventBusInstance?.clear();
  eventBusInstance = null;
}
