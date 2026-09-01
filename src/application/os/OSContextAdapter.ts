/**
 * OSContext Adapter
 * Integra o window manager existente (`src/components/os/OSContext.tsx`) ao
 * Event Bus SEM reescrevê-lo e SEM breaking changes.
 *
 *     OSContext  →  OSContextAdapter  →  EventBus
 *
 * O adapter envelopa os callbacks originais: o comportamento existente é sempre
 * executado; os eventos são um efeito colateral adicional e isolado.
 *
 * Camada: APPLICATION. Depende de CORE e INFRASTRUCTURE. Não importa React nem
 * `src/components` — a compatibilidade com o OSContext é estrutural, via
 * `OSContextPort`.
 */

import { createTraceId } from '@/core';
import type { EventPublisher, EventSubscriber } from '@/core';
import { getEventBus } from '@/infrastructure/events';
import type {
  EventHandler,
  EventPayload,
  EventType,
  Subscription,
} from '@/infrastructure/events';
import { getLogger } from '@/infrastructure/observability/logger';
import type { LogContext } from '@/infrastructure/observability/logger';
import type { LoggerPort } from '@/core';

/**
 * Superfície mínima do OSContext que o adapter envelopa.
 * `OSContextType` (UI) satisfaz este contrato estruturalmente.
 */
export interface OSContextPort {
  openApp: (appId: string) => void;
  closeWindow: (windowId: string) => void;
  setBooted: (booted: boolean) => void;
}

export interface OSContextAdapterOptions {
  eventBus?: EventPublisher & EventSubscriber;
  logger?: LoggerPort;
  /** Origem registrada na metadata dos eventos. */
  source?: string;
}

const DEFAULT_SOURCE = 'OSContextAdapter';

export class OSContextAdapter {
  private readonly eventBus: EventPublisher & EventSubscriber;
  private readonly logger: LoggerPort;
  private readonly source: string;

  constructor(options: OSContextAdapterOptions = {}) {
    this.eventBus = options.eventBus ?? getEventBus();
    this.logger = options.logger ?? getLogger();
    this.source = options.source ?? DEFAULT_SOURCE;
  }

  /**
   * Envelopa `openApp`. Publica `os.app.launched` DEPOIS da ação original, para
   * que o evento reflita um lançamento efetivamente executado.
   */
  wrapOpenApp(originalOpenApp: OSContextPort['openApp']): OSContextPort['openApp'] {
    return (appId: string) => {
      originalOpenApp(appId);
      this.emit('os.app.launched', { appId }, 'App lançado', { appId });
    };
  }

  /** Envelopa `closeWindow`. Publica `os.window.closed` após o fechamento. */
  wrapCloseWindow(originalCloseWindow: OSContextPort['closeWindow']): OSContextPort['closeWindow'] {
    return (windowId: string) => {
      originalCloseWindow(windowId);
      this.emit('os.window.closed', { windowId }, 'Janela fechada', { windowId });
    };
  }

  /** Envelopa `setBooted`. Publica `os.booted` apenas na transição para `true`. */
  wrapSetBooted(originalSetBooted: OSContextPort['setBooted']): OSContextPort['setBooted'] {
    return (booted: boolean) => {
      originalSetBooted(booted);
      if (!booted) return;
      this.emit('os.booted', { booted: true }, 'OS inicializado');
    };
  }

  /**
   * Devolve uma cópia do contexto com os callbacks de baixo risco envelopados.
   * Todas as demais propriedades são preservadas por identidade.
   *
   * Genérico: aceita o `OSContextType` completo sem que esta camada precise
   * conhecê-lo.
   */
  adaptOSContext<T extends OSContextPort>(originalContext: T): T {
    return {
      ...originalContext,
      openApp: this.wrapOpenApp(originalContext.openApp),
      closeWindow: this.wrapCloseWindow(originalContext.closeWindow),
      setBooted: this.wrapSetBooted(originalContext.setBooted),
    };
  }

  /** Assina eventos do OS publicados por este adapter. */
  subscribeToOSEvents<T extends EventType>(
    eventType: T,
    handler: EventHandler<T>
  ): Subscription {
    return this.eventBus.subscribe(eventType, handler);
  }

  /**
   * Publica o evento e registra o log correspondente.
   * Nunca propaga erro: uma falha de observabilidade não pode quebrar o OS.
   */
  private emit<T extends EventType>(
    type: T,
    payload: EventPayload<T>,
    logMessage: string,
    logContext: LogContext = {}
  ): void {
    try {
      const traceId = createTraceId();
      this.eventBus.publish(type, payload, { traceId, source: this.source });
      this.logger.debug(logMessage, { traceId, ...logContext });
    } catch (error: unknown) {
      this.logger.warn('Falha ao publicar evento do OSContext', { eventType: type }, error);
    }
  }
}

let osContextAdapterInstance: OSContextAdapter | null = null;

/** Instância singleton compartilhada pela aplicação. */
export function getOSContextAdapter(): OSContextAdapter {
  if (!osContextAdapterInstance) {
    osContextAdapterInstance = new OSContextAdapter();
  }
  return osContextAdapterInstance;
}

/** Reseta o singleton. Uso exclusivo de testes. */
export function resetOSContextAdapter(): void {
  osContextAdapterInstance = null;
}
