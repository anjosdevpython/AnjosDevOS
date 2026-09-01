/**
 * Event Bus Tests
 * Cobertura: publish, subscribe, unsubscribe, múltiplos subscribers, eventos
 * tipados, metadata, erro em handler e isolamento entre eventos.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBusImpl, getEventBus, resetEventBus } from '@/infrastructure/events';
import type { DomainEvent } from '@/infrastructure/events';

describe('EventBus', () => {
  let eventBus: EventBusImpl;
  let handlerErrors: Array<{ eventType: string; handlerId: string }>;

  beforeEach(() => {
    handlerErrors = [];
    eventBus = new EventBusImpl({
      onHandlerError: (_error, context) => {
        handlerErrors.push({ ...context });
      },
    });
  });

  afterEach(() => {
    eventBus.clear();
    resetEventBus();
  });

  describe('publish', () => {
    it('deve entregar o evento ao subscriber', () => {
      const handler = vi.fn();
      eventBus.subscribe('task.created', handler);

      eventBus.publish('task.created', { taskId: '123' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'task.created',
          payload: { taskId: '123' },
          metadata: expect.objectContaining({ timestamp: expect.any(Number) }),
        })
      );
    });

    it('deve retornar o evento publicado', () => {
      const event = eventBus.publish('task.started', { taskId: 'abc' });

      expect(event.type).toBe('task.started');
      expect(event.payload).toEqual({ taskId: 'abc' });
      expect(event.metadata.timestamp).toBeTypeOf('number');
    });

    it('não deve falhar ao publicar sem subscribers', () => {
      expect(() => eventBus.publish('task.failed', { taskId: 'x' })).not.toThrow();
    });

    it('deve entregar na ordem de inscrição', () => {
      const order: string[] = [];
      eventBus.subscribe('tool.called', () => void order.push('primeiro'));
      eventBus.subscribe('tool.called', () => void order.push('segundo'));
      eventBus.subscribe('tool.called', () => void order.push('terceiro'));

      eventBus.publish('tool.called', { toolId: 'grep' });

      expect(order).toEqual(['primeiro', 'segundo', 'terceiro']);
    });
  });

  describe('subscribe', () => {
    it('deve registrar o subscriber e reportar contagem', () => {
      expect(eventBus.getSubscriberCount('task.created')).toBe(0);

      const subscription = eventBus.subscribe('task.created', vi.fn());

      expect(eventBus.getSubscriberCount('task.created')).toBe(1);
      expect(subscription.eventType).toBe('task.created');
      expect(subscription.isActive).toBe(true);
    });

    it('once() deve entregar apenas uma vez', () => {
      const handler = vi.fn();
      eventBus.once('agent.started', handler);

      eventBus.publish('agent.started', { agentId: 'a1' });
      eventBus.publish('agent.started', { agentId: 'a1' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(eventBus.getSubscriberCount('agent.started')).toBe(0);
    });

    it('deve permitir subscribe durante um publish sem afetar a entrega atual', () => {
      const late = vi.fn();
      eventBus.subscribe('task.created', () => {
        eventBus.subscribe('task.created', late);
      });

      eventBus.publish('task.created', { taskId: '1' });
      expect(late).not.toHaveBeenCalled();

      eventBus.publish('task.created', { taskId: '2' });
      expect(late).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribe', () => {
    it('deve parar de receber eventos após unsubscribe', () => {
      const handler = vi.fn();
      const subscription = eventBus.subscribe('task.created', handler);

      eventBus.publish('task.created', { taskId: '123' });
      expect(handler).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
      eventBus.publish('task.created', { taskId: '456' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(subscription.isActive).toBe(false);
    });

    it('deve ser idempotente', () => {
      const subscription = eventBus.subscribe('task.created', vi.fn());

      subscription.unsubscribe();
      expect(() => subscription.unsubscribe()).not.toThrow();

      expect(eventBus.getSubscriberCount('task.created')).toBe(0);
    });

    it('deve remover o tipo do mapa quando não restam handlers (anti-leak)', () => {
      const subscription = eventBus.subscribe('task.created', vi.fn());
      expect(eventBus.getActiveEventTypes()).toContain('task.created');

      subscription.unsubscribe();

      expect(eventBus.getActiveEventTypes()).not.toContain('task.created');
      expect(eventBus.getTotalSubscriberCount()).toBe(0);
    });

    it('unsubscribe de um handler não deve afetar os demais', () => {
      const kept = vi.fn();
      const removed = vi.fn();

      eventBus.subscribe('task.created', kept);
      const removedSub = eventBus.subscribe('task.created', removed);
      removedSub.unsubscribe();

      eventBus.publish('task.created', { taskId: '1' });

      expect(kept).toHaveBeenCalledTimes(1);
      expect(removed).not.toHaveBeenCalled();
    });

    it('unsubscribeAll deve limpar um único tipo', () => {
      eventBus.subscribe('task.created', vi.fn());
      eventBus.subscribe('agent.started', vi.fn());

      eventBus.unsubscribeAll('task.created');

      expect(eventBus.getSubscriberCount('task.created')).toBe(0);
      expect(eventBus.getSubscriberCount('agent.started')).toBe(1);
    });

    it('clear deve remover todos os listeners', () => {
      eventBus.subscribe('task.created', vi.fn());
      eventBus.subscribe('agent.started', vi.fn());

      eventBus.clear();

      expect(eventBus.getActiveEventTypes()).toEqual([]);
      expect(eventBus.getTotalSubscriberCount()).toBe(0);
    });
  });

  describe('múltiplos subscribers', () => {
    it('deve notificar todos os subscribers do mesmo evento', () => {
      const handlers = [vi.fn(), vi.fn(), vi.fn()];
      handlers.forEach((handler) => eventBus.subscribe('task.created', handler));

      eventBus.publish('task.created', { taskId: '123' });

      handlers.forEach((handler) => expect(handler).toHaveBeenCalledTimes(1));
      expect(eventBus.getSubscriberCount('task.created')).toBe(3);
    });

    it('deve avisar sobre possível vazamento acima do limite', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const limitedBus = new EventBusImpl({ maxListenersPerEvent: 2 });

      limitedBus.subscribe('task.created', vi.fn());
      limitedBus.subscribe('task.created', vi.fn());
      expect(warnSpy).not.toHaveBeenCalled();

      limitedBus.subscribe('task.created', vi.fn());
      expect(warnSpy).toHaveBeenCalledTimes(1);

      // Avisa uma única vez por tipo, sem poluir o console.
      limitedBus.subscribe('task.created', vi.fn());
      expect(warnSpy).toHaveBeenCalledTimes(1);

      limitedBus.clear();
      warnSpy.mockRestore();
    });
  });

  describe('eventos tipados', () => {
    it('deve preservar o formato do payload por tipo de evento', () => {
      const received: Array<DomainEvent<'ai.response'>> = [];
      eventBus.subscribe('ai.response', (event) => {
        received.push(event);
      });

      eventBus.publish('ai.response', {
        provider: 'networktools',
        model: 'openai/gpt-5-5',
        tokensIn: 100,
        tokensOut: 250,
      });

      expect(received).toHaveLength(1);
      expect(received[0].payload.provider).toBe('networktools');
      expect(received[0].payload.tokensOut).toBe(250);
    });

    it('deve suportar todos os grupos de eventos iniciais', () => {
      const seen: string[] = [];
      const types = [
        'task.created',
        'agent.started',
        'tool.called',
        'memory.created',
        'ai.request',
        'system.error',
      ] as const;

      types.forEach((type) => {
        eventBus.subscribe(type, (event) => void seen.push(event.type));
      });

      eventBus.publish('task.created', { taskId: 't' });
      eventBus.publish('agent.started', { agentId: 'a' });
      eventBus.publish('tool.called', { toolId: 'to' });
      eventBus.publish('memory.created', { memoryId: 'm' });
      eventBus.publish('ai.request', { provider: 'p', model: 'm' });
      eventBus.publish('system.error', { message: 'boom' });

      expect(seen).toEqual([...types]);
    });
  });

  describe('metadata', () => {
    it('deve preencher timestamp automaticamente', () => {
      const before = Date.now();
      const event = eventBus.publish('task.created', { taskId: '1' });

      expect(event.metadata.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.metadata.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('deve propagar traceId, requestId, taskId e agentId', () => {
      const handler = vi.fn();
      eventBus.subscribe('agent.completed', handler);

      eventBus.publish(
        'agent.completed',
        { agentId: 'agent-1' },
        {
          traceId: 'trace-123',
          requestId: 'req-123',
          taskId: 'task-123',
          agentId: 'agent-1',
          duration: 42,
          source: 'test',
        }
      );

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            traceId: 'trace-123',
            requestId: 'req-123',
            taskId: 'task-123',
            agentId: 'agent-1',
            duration: 42,
            source: 'test',
            timestamp: expect.any(Number),
          }),
        })
      );
    });

    it('o timestamp do bus não pode ser sobrescrito pelo publisher', () => {
      const event = eventBus.publish('task.created', { taskId: '1' }, { traceId: 't' });
      expect(event.metadata.timestamp).toBeGreaterThan(0);
      expect(event.metadata.traceId).toBe('t');
    });
  });

  describe('erro em handler', () => {
    it('não deve propagar erro síncrono nem impedir os demais handlers', () => {
      const failing = vi.fn(() => {
        throw new Error('Handler error');
      });
      const healthy = vi.fn();

      eventBus.subscribe('task.created', failing);
      eventBus.subscribe('task.created', healthy);

      expect(() => eventBus.publish('task.created', { taskId: '123' })).not.toThrow();

      expect(failing).toHaveBeenCalledTimes(1);
      expect(healthy).toHaveBeenCalledTimes(1);
      expect(handlerErrors).toHaveLength(1);
      expect(handlerErrors[0].eventType).toBe('task.created');
    });

    it('deve capturar rejeição de handler assíncrono', async () => {
      const failing = vi.fn(async () => {
        throw new Error('Async handler error');
      });
      const healthy = vi.fn();

      eventBus.subscribe('task.created', failing);
      eventBus.subscribe('task.created', healthy);

      eventBus.publish('task.created', { taskId: '123' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(failing).toHaveBeenCalledTimes(1);
      expect(healthy).toHaveBeenCalledTimes(1);
      expect(handlerErrors).toHaveLength(1);
    });

    it('deve usar console.error como reporter padrão', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const defaultBus = new EventBusImpl();

      defaultBus.subscribe('task.created', () => {
        throw new Error('boom');
      });
      defaultBus.publish('task.created', { taskId: '1' });

      expect(errorSpy).toHaveBeenCalledTimes(1);

      defaultBus.clear();
      errorSpy.mockRestore();
    });
  });

  describe('isolamento entre eventos', () => {
    it('não deve entregar evento a subscribers de outro tipo', () => {
      const taskHandler = vi.fn();
      const agentHandler = vi.fn();

      eventBus.subscribe('task.created', taskHandler);
      eventBus.subscribe('agent.started', agentHandler);

      eventBus.publish('task.created', { taskId: '123' });

      expect(taskHandler).toHaveBeenCalledTimes(1);
      expect(agentHandler).not.toHaveBeenCalled();
    });

    it('deve isolar eventos do mesmo grupo mas de tipos diferentes', () => {
      const created = vi.fn();
      const completed = vi.fn();

      eventBus.subscribe('task.created', created);
      eventBus.subscribe('task.completed', completed);

      eventBus.publish('task.completed', { taskId: '123' });

      expect(created).not.toHaveBeenCalled();
      expect(completed).toHaveBeenCalledTimes(1);
    });

    it('instâncias distintas do bus não compartilham listeners', () => {
      const handlerA = vi.fn();
      const busB = new EventBusImpl();

      eventBus.subscribe('task.created', handlerA);
      busB.publish('task.created', { taskId: '1' });

      expect(handlerA).not.toHaveBeenCalled();
      busB.clear();
    });
  });

  describe('singleton', () => {
    it('deve retornar a mesma instância', () => {
      expect(getEventBus()).toBe(getEventBus());
    });

    it('resetEventBus deve criar uma instância limpa', () => {
      const first = getEventBus();
      first.subscribe('task.created', vi.fn());

      resetEventBus();
      const second = getEventBus();

      expect(second).not.toBe(first);
      expect(second.getTotalSubscriberCount()).toBe(0);
    });
  });
});
