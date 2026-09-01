/**
 * OSContext Adapter Tests
 * Cobertura: preservação do comportamento original (sem breaking changes),
 * publicação de eventos no Event Bus, isolamento de falhas e compatibilidade
 * estrutural com o `OSContextType` real da UI.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  OSContextAdapter,
  getOSContextAdapter,
  resetOSContextAdapter,
} from '@/application/os';
import { EventBusImpl, resetEventBus } from '@/infrastructure/events';
import type { DomainEvent } from '@/infrastructure/events';
import { LogLevel, LoggerImpl, NoopTransport } from '@/infrastructure/observability/logger';
import type { OSContextType } from '@/components/os/OSContext';

function createHarness() {
  const eventBus = new EventBusImpl();
  const logger = new LoggerImpl({ minLevel: LogLevel.DEBUG, transport: new NoopTransport() });
  const adapter = new OSContextAdapter({ eventBus, logger, source: 'test' });
  return { adapter, eventBus, logger };
}

function createMockOSContext(): OSContextType {
  return {
    windows: [],
    activeWindowId: null,
    isStartMenuOpen: false,
    isBooted: false,
    openApp: vi.fn(),
    closeWindow: vi.fn(),
    minimizeWindow: vi.fn(),
    toggleMaximize: vi.fn(),
    focusWindow: vi.fn(),
    moveWindow: vi.fn(),
    resizeWindow: vi.fn(),
    setStartMenuOpen: vi.fn(),
    setBooted: vi.fn(),
    getAppDef: vi.fn(),
  };
}

describe('OSContextAdapter', () => {
  beforeEach(() => {
    resetOSContextAdapter();
    resetEventBus();
  });

  describe('compatibilidade — o comportamento original é preservado', () => {
    it('wrapOpenApp deve executar o openApp original', () => {
      const { adapter } = createHarness();
      const context = createMockOSContext();

      adapter.wrapOpenApp(context.openApp)('test-app');

      expect(context.openApp).toHaveBeenCalledTimes(1);
      expect(context.openApp).toHaveBeenCalledWith('test-app');
    });

    it('wrapCloseWindow deve executar o closeWindow original', () => {
      const { adapter } = createHarness();
      const context = createMockOSContext();

      adapter.wrapCloseWindow(context.closeWindow)('window-123');

      expect(context.closeWindow).toHaveBeenCalledWith('window-123');
    });

    it('wrapSetBooted deve executar o setBooted original nos dois valores', () => {
      const { adapter } = createHarness();
      const context = createMockOSContext();
      const wrapped = adapter.wrapSetBooted(context.setBooted);

      wrapped(true);
      wrapped(false);

      expect(context.setBooted).toHaveBeenNthCalledWith(1, true);
      expect(context.setBooted).toHaveBeenNthCalledWith(2, false);
    });

    it('adaptOSContext deve preservar toda a API do OSContext', () => {
      const { adapter } = createHarness();
      const context = createMockOSContext();

      const adapted = adapter.adaptOSContext(context);

      const methods = [
        'openApp',
        'closeWindow',
        'minimizeWindow',
        'toggleMaximize',
        'focusWindow',
        'moveWindow',
        'resizeWindow',
        'setStartMenuOpen',
        'setBooted',
        'getAppDef',
      ] as const;
      methods.forEach((method) => expect(typeof adapted[method]).toBe('function'));
    });

    it('adaptOSContext deve envelopar apenas os callbacks de baixo risco', () => {
      const { adapter } = createHarness();
      const context = createMockOSContext();

      const adapted = adapter.adaptOSContext(context);

      expect(adapted.openApp).not.toBe(context.openApp);
      expect(adapted.closeWindow).not.toBe(context.closeWindow);
      expect(adapted.setBooted).not.toBe(context.setBooted);

      expect(adapted.minimizeWindow).toBe(context.minimizeWindow);
      expect(adapted.toggleMaximize).toBe(context.toggleMaximize);
      expect(adapted.focusWindow).toBe(context.focusWindow);
      expect(adapted.moveWindow).toBe(context.moveWindow);
      expect(adapted.resizeWindow).toBe(context.resizeWindow);
      expect(adapted.setStartMenuOpen).toBe(context.setStartMenuOpen);
      expect(adapted.getAppDef).toBe(context.getAppDef);
    });

    it('adaptOSContext deve preservar o estado do contexto', () => {
      const { adapter } = createHarness();
      const context = createMockOSContext();

      const adapted = adapter.adaptOSContext(context);

      expect(adapted.windows).toBe(context.windows);
      expect(adapted.activeWindowId).toBe(context.activeWindowId);
      expect(adapted.isStartMenuOpen).toBe(context.isStartMenuOpen);
      expect(adapted.isBooted).toBe(context.isBooted);
    });

    it('não deve mutar o contexto original', () => {
      const { adapter } = createHarness();
      const context = createMockOSContext();
      const originalOpenApp = context.openApp;

      adapter.adaptOSContext(context);

      expect(context.openApp).toBe(originalOpenApp);
    });
  });

  describe('publicação de eventos', () => {
    it('deve publicar os.app.launched ao abrir um app', () => {
      const { adapter, eventBus } = createHarness();
      const received: Array<DomainEvent<'os.app.launched'>> = [];
      eventBus.subscribe('os.app.launched', (event) => void received.push(event));

      adapter.wrapOpenApp(vi.fn())('chat');

      expect(received).toHaveLength(1);
      expect(received[0].payload).toEqual({ appId: 'chat' });
      expect(received[0].metadata.traceId).toBeTypeOf('string');
      expect(received[0].metadata.source).toBe('test');
      expect(received[0].metadata.timestamp).toBeTypeOf('number');
    });

    it('deve publicar os.window.closed ao fechar uma janela', () => {
      const { adapter, eventBus } = createHarness();
      const received: Array<DomainEvent<'os.window.closed'>> = [];
      eventBus.subscribe('os.window.closed', (event) => void received.push(event));

      adapter.wrapCloseWindow(vi.fn())('window-123');

      expect(received).toHaveLength(1);
      expect(received[0].payload).toEqual({ windowId: 'window-123' });
    });

    it('deve publicar os.booted apenas na transição para true', () => {
      const { adapter, eventBus } = createHarness();
      const received: Array<DomainEvent<'os.booted'>> = [];
      eventBus.subscribe('os.booted', (event) => void received.push(event));
      const wrapped = adapter.wrapSetBooted(vi.fn());

      wrapped(false);
      expect(received).toHaveLength(0);

      wrapped(true);
      expect(received).toHaveLength(1);
      expect(received[0].payload).toEqual({ booted: true });
    });

    it('deve emitir o evento depois de executar a ação original', () => {
      const { adapter, eventBus } = createHarness();
      const order: string[] = [];
      eventBus.subscribe('os.app.launched', () => void order.push('evento'));

      adapter.wrapOpenApp(() => void order.push('acao'))('chat');

      expect(order).toEqual(['acao', 'evento']);
    });

    it('cada evento deve receber um traceId distinto', () => {
      const { adapter, eventBus } = createHarness();
      const traceIds: Array<string | undefined> = [];
      eventBus.subscribe('os.app.launched', (event) => void traceIds.push(event.metadata.traceId));

      const wrapped = adapter.wrapOpenApp(vi.fn());
      wrapped('chat');
      wrapped('editor');

      expect(traceIds).toHaveLength(2);
      expect(traceIds[0]).not.toBe(traceIds[1]);
    });

    it('deve registrar log de correlação para o evento', () => {
      const eventBus = new EventBusImpl();
      const logger = new LoggerImpl({ minLevel: LogLevel.DEBUG, transport: new NoopTransport() });
      const adapter = new OSContextAdapter({ eventBus, logger });

      adapter.wrapOpenApp(vi.fn())('chat');

      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe(LogLevel.DEBUG);
      expect(entries[0].context?.appId).toBe('chat');
      expect(entries[0].context?.traceId).toBeTypeOf('string');
    });
  });

  describe('isolamento de falhas', () => {
    it('uma falha no Event Bus não pode quebrar a ação do OS', () => {
      const logger = new LoggerImpl({ minLevel: LogLevel.DEBUG, transport: new NoopTransport() });
      const brokenBus = {
        publish: vi.fn(() => {
          throw new Error('bus offline');
        }),
        subscribe: vi.fn(),
      };
      const adapter = new OSContextAdapter({
        eventBus: brokenBus as unknown as EventBusImpl,
        logger,
      });
      const originalOpenApp = vi.fn();

      expect(() => adapter.wrapOpenApp(originalOpenApp)('chat')).not.toThrow();
      expect(originalOpenApp).toHaveBeenCalledWith('chat');
      expect(logger.getEntries().some((entry) => entry.level === LogLevel.WARN)).toBe(true);
    });

    it('um subscriber defeituoso não pode quebrar a ação do OS', () => {
      const { adapter, eventBus } = createHarness();
      eventBus.subscribe('os.app.launched', () => {
        throw new Error('subscriber quebrado');
      });
      const originalOpenApp = vi.fn();

      expect(() => adapter.wrapOpenApp(originalOpenApp)('chat')).not.toThrow();
      expect(originalOpenApp).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeToOSEvents', () => {
    it('deve entregar eventos ao callback e permitir unsubscribe', () => {
      const { adapter } = createHarness();
      const handler = vi.fn();

      const subscription = adapter.subscribeToOSEvents('os.app.launched', handler);
      adapter.wrapOpenApp(vi.fn())('chat');
      expect(handler).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
      adapter.wrapOpenApp(vi.fn())('editor');
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('singleton', () => {
    it('deve retornar a mesma instância', () => {
      expect(getOSContextAdapter()).toBe(getOSContextAdapter());
    });

    it('resetOSContextAdapter deve criar uma nova instância', () => {
      const first = getOSContextAdapter();
      resetOSContextAdapter();
      expect(getOSContextAdapter()).not.toBe(first);
    });
  });
});
