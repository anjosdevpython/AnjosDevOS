/**
 * Logger Tests
 * Cobertura: níveis, contexto, metadata, erros e sanitização de secrets.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LogLevel,
  LoggerImpl,
  NoopTransport,
  getLogger,
  isSensitiveKey,
  resetLogger,
  sanitizeString,
  sanitizeValue,
} from '@/infrastructure/observability/logger';
import type { LogEntry, LogTransport } from '@/infrastructure/observability/logger';

/** Transport de teste: captura registros sem tocar no console. */
class MemoryTransport implements LogTransport {
  readonly written: LogEntry[] = [];

  write(entry: LogEntry): void {
    this.written.push(entry);
  }

  get lines(): string[] {
    return this.written.map((entry) => JSON.stringify(entry));
  }

  clear(): void {
    this.written.length = 0;
  }
}

function createLogger(minLevel: LogLevel = LogLevel.DEBUG): {
  logger: LoggerImpl;
  transport: MemoryTransport;
} {
  const transport = new MemoryTransport();
  return { logger: new LoggerImpl({ minLevel, transport }), transport };
}

describe('Logger', () => {
  beforeEach(() => {
    resetLogger();
  });

  describe('níveis', () => {
    it('deve expor os cinco níveis', () => {
      expect(Object.values(LogLevel)).toEqual([
        'DEBUG',
        'INFO',
        'WARN',
        'ERROR',
        'FATAL',
      ]);
    });

    it('deve registrar todos os níveis quando o mínimo é DEBUG', () => {
      const { logger, transport } = createLogger(LogLevel.DEBUG);

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      logger.fatal('fatal');

      expect(transport.written.map((entry) => entry.level)).toEqual([
        LogLevel.DEBUG,
        LogLevel.INFO,
        LogLevel.WARN,
        LogLevel.ERROR,
        LogLevel.FATAL,
      ]);
    });

    it('deve descartar registros abaixo do nível mínimo', () => {
      const { logger, transport } = createLogger(LogLevel.WARN);

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(transport.written.map((entry) => entry.level)).toEqual([
        LogLevel.WARN,
        LogLevel.ERROR,
      ]);
    });

    it('isLevelEnabled deve refletir o nível mínimo', () => {
      const { logger } = createLogger(LogLevel.ERROR);

      expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(false);
      expect(logger.isLevelEnabled(LogLevel.WARN)).toBe(false);
      expect(logger.isLevelEnabled(LogLevel.ERROR)).toBe(true);
      expect(logger.isLevelEnabled(LogLevel.FATAL)).toBe(true);
    });

    it('setMinLevel deve alterar o filtro em runtime', () => {
      const { logger, transport } = createLogger(LogLevel.ERROR);

      logger.info('descartado');
      logger.setMinLevel(LogLevel.INFO);
      logger.info('mantido');

      expect(transport.written).toHaveLength(1);
      expect(transport.written[0].message).toBe('mantido');
      expect(logger.getMinLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('contexto', () => {
    it('deve preservar os campos de correlação', () => {
      const { logger, transport } = createLogger();

      logger.info('Agente iniciado', {
        traceId: 'trace-abc',
        requestId: 'req-1',
        taskId: 'task-123',
        agentId: 'agent-1',
        toolId: 'tool-1',
        provider: 'networktools',
        model: 'openai/gpt-5-5',
        duration: 1234,
      });

      expect(transport.written[0].context).toEqual({
        traceId: 'trace-abc',
        requestId: 'req-1',
        taskId: 'task-123',
        agentId: 'agent-1',
        toolId: 'tool-1',
        provider: 'networktools',
        model: 'openai/gpt-5-5',
        duration: 1234,
      });
    });

    it('deve omitir contexto quando não informado', () => {
      const { logger, transport } = createLogger();

      logger.info('Sem contexto');

      expect(transport.written[0].context).toBeUndefined();
    });

    it('child() deve mesclar o contexto base', () => {
      const transport = new MemoryTransport();
      const parent = new LoggerImpl({ minLevel: LogLevel.DEBUG, transport });
      const child = parent.child({ traceId: 'trace-fixo' });

      child.info('Mensagem do filho', { taskId: 'task-9' });

      expect(transport.written[0].context).toEqual({
        traceId: 'trace-fixo',
        taskId: 'task-9',
      });
    });

    it('o contexto da chamada deve sobrescrever o contexto base', () => {
      const transport = new MemoryTransport();
      const child = new LoggerImpl({
        minLevel: LogLevel.DEBUG,
        transport,
        baseContext: { traceId: 'base' },
      });

      child.info('msg', { traceId: 'especifico' });

      expect(transport.written[0].context?.traceId).toBe('especifico');
    });
  });

  describe('metadata', () => {
    it('deve incluir timestamp numérico e ISO em toda entrada', () => {
      const { logger, transport } = createLogger();
      const before = Date.now();

      logger.info('Test message');

      const entry = transport.written[0];
      expect(entry.timestamp).toBeTypeOf('number');
      expect(entry.timestamp).toBeGreaterThanOrEqual(before);
      expect(entry.time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('deve manter histórico no buffer em memória', () => {
      const { logger } = createLogger();

      logger.info('Primeira');
      logger.info('Segunda');
      logger.info('Terceira');

      expect(logger.getEntries().map((entry) => entry.message)).toEqual([
        'Primeira',
        'Segunda',
        'Terceira',
      ]);
    });

    it('deve respeitar o buffer circular configurado', () => {
      const logger = new LoggerImpl({
        minLevel: LogLevel.DEBUG,
        maxEntries: 5,
        transport: new NoopTransport(),
      });

      for (let index = 0; index < 10; index++) {
        logger.info(`Mensagem ${index}`);
      }

      const entries = logger.getEntries();
      expect(entries).toHaveLength(5);
      expect(entries[0].message).toBe('Mensagem 5');
      expect(entries[4].message).toBe('Mensagem 9');
    });

    it('clear() deve esvaziar o buffer', () => {
      const { logger } = createLogger();

      logger.info('a');
      logger.info('b');
      expect(logger.getEntries()).toHaveLength(2);

      logger.clear();
      expect(logger.getEntries()).toHaveLength(0);
    });
  });

  describe('erros', () => {
    it('deve serializar Error com nome, mensagem e stack', () => {
      const { logger, transport } = createLogger();

      logger.error('Falha na operação', { taskId: 't1' }, new Error('Test error'));

      const entry = transport.written[0];
      expect(entry.level).toBe(LogLevel.ERROR);
      expect(entry.message).toBe('Falha na operação');
      expect(entry.error?.name).toBe('Error');
      expect(entry.error?.message).toBe('Test error');
      expect(entry.error?.stack).toContain('Test error');
    });

    it('deve aceitar erro sem contexto', () => {
      const { logger, transport } = createLogger();

      logger.error('Erro ocorrido', undefined, new Error('boom'));

      expect(transport.written).toHaveLength(1);
      expect(transport.written[0].error?.message).toBe('boom');
    });

    it('deve serializar valores lançados que não são Error', () => {
      const { logger, transport } = createLogger();

      logger.fatal('Falha fatal', undefined, 'string lançada');

      expect(transport.written[0].error).toEqual({
        name: 'UnknownError',
        message: 'string lançada',
      });
    });

    it('uma falha do transport não pode derrubar o caller', () => {
      const brokenTransport: LogTransport = {
        write() {
          throw new Error('transport offline');
        },
      };
      const logger = new LoggerImpl({ minLevel: LogLevel.DEBUG, transport: brokenTransport });

      expect(() => logger.info('mensagem')).not.toThrow();
      expect(logger.getEntries()).toHaveLength(1);
    });
  });

  describe('sanitização de secrets', () => {
    it('deve redigir API keys por nome de chave', () => {
      const { logger, transport } = createLogger();

      logger.info('Config carregada', { apiKey: 'sk-1234567890abcdefghijklmnopqrst' });

      expect(transport.written[0].context?.apiKey).toBe('[REDACTED]');
      expect(transport.lines[0]).not.toContain('sk-1234567890abcdefghijklmnopqrst');
    });

    it('deve redigir GitHub PATs', () => {
      const { logger, transport } = createLogger();

      logger.info('Auth GitHub', { token: 'ghp_1234567890abcdefghijklmnopqrstuvwxyz12' });

      expect(transport.written[0].context?.token).toBe('[REDACTED]');
      expect(transport.lines[0]).not.toContain('ghp_1234567890');
    });

    it('deve redigir variações de nome de chave (case e separadores)', () => {
      const { logger, transport } = createLogger();

      logger.info('Credenciais', {
        API_KEY: 'a',
        'api-key': 'b',
        apiKey: 'c',
        clientSecret: 'd',
        password: 'e',
        authorization: 'f',
        githubPat: 'g',
        accessToken: 'h',
      });

      const context = transport.written[0].context ?? {};
      Object.values(context).forEach((value) => expect(value).toBe('[REDACTED]'));
    });

    it('deve redigir secrets embutidos em strings livres', () => {
      const { logger, transport } = createLogger();

      logger.info('Config carregada', {
        config: 'apiKey=sk-1234567890, password=secret123, token=xyz',
      });

      const value = transport.written[0].context?.config;
      expect(value).toContain('[REDACTED]');
      expect(value).not.toContain('sk-1234567890');
      expect(value).not.toContain('secret123');
    });

    it('deve redigir recursivamente objetos aninhados', () => {
      const { logger, transport } = createLogger();

      logger.info('Objeto profundo', {
        nested: { apiKey: 'sk-1234567890', inner: { password: 'secret123' } },
      });

      expect(transport.lines[0]).not.toContain('sk-1234567890');
      expect(transport.lines[0]).not.toContain('secret123');
      expect(transport.lines[0]).toContain('[REDACTED]');
    });

    it('deve redigir dentro de arrays', () => {
      const { logger, transport } = createLogger();

      logger.info('Lista de configs', {
        configs: [{ apiKey: 'sk-123' }, { apiKey: 'sk-456' }],
      });

      expect(transport.lines[0]).not.toContain('sk-123');
      expect(transport.lines[0]).not.toContain('sk-456');
    });

    it('deve redigir secrets na própria mensagem', () => {
      const { logger, transport } = createLogger();

      logger.info('Falha ao autenticar com Authorization: Bearer abcdef1234567890xyz');

      expect(transport.written[0].message).toContain('[REDACTED]');
      expect(transport.written[0].message).not.toContain('abcdef1234567890xyz');
    });

    it('deve redigir secrets dentro da mensagem de erro', () => {
      const { logger, transport } = createLogger();

      logger.error('Falha', undefined, new Error('token=ghp_abcdefghijklmnopqrstuvwx'));

      expect(transport.written[0].error?.message).not.toContain('ghp_abcdefghijklmnopqrstuvwx');
      expect(transport.written[0].error?.message).toContain('[REDACTED]');
    });

    it('NÃO deve redigir campos legítimos de correlação', () => {
      const { logger, transport } = createLogger();

      logger.info('Requisição', {
        traceId: 'trace-1',
        requestId: 'req-1',
        taskId: 'task-1',
        agentId: 'agent-1',
        toolId: 'tool-1',
        provider: 'openai',
        model: 'gpt-4',
        duration: 10,
        authorName: 'Allan',
      });

      const context = transport.written[0].context ?? {};
      expect(context.traceId).toBe('trace-1');
      expect(context.provider).toBe('openai');
      expect(context.authorName).toBe('Allan');
    });

    it('deve tratar referências circulares sem estourar a pilha', () => {
      const circular: Record<string, unknown> = { name: 'root' };
      circular.self = circular;

      expect(() => sanitizeValue(circular)).not.toThrow();
      expect(sanitizeValue(circular)).toEqual({ name: 'root', self: '[Circular]' });
    });

    it('isSensitiveKey deve classificar corretamente', () => {
      expect(isSensitiveKey('apiKey')).toBe(true);
      expect(isSensitiveKey('GITHUB_TOKEN')).toBe(true);
      expect(isSensitiveKey('Authorization')).toBe(true);
      expect(isSensitiveKey('traceId')).toBe(false);
      expect(isSensitiveKey('duration')).toBe(false);
    });

    it('sanitizeString deve redigir padrões conhecidos', () => {
      expect(sanitizeString('use sk-abcdefghijk agora')).toContain('[REDACTED]');
      expect(sanitizeString('AKIAIOSFODNN7EXAMPLE')).toContain('[REDACTED]');
      expect(sanitizeString('mensagem comum sem segredo')).toBe(
        'mensagem comum sem segredo'
      );
    });
  });

  describe('singleton', () => {
    it('deve retornar a mesma instância', () => {
      expect(getLogger()).toBe(getLogger());
    });

    it('resetLogger deve criar uma nova instância', () => {
      const first = getLogger();
      resetLogger();
      expect(getLogger()).not.toBe(first);
    });

    it('instâncias isoladas são independentes', () => {
      const a = new LoggerImpl({ minLevel: LogLevel.DEBUG, transport: new NoopTransport() });
      const b = new LoggerImpl({ minLevel: LogLevel.WARN, transport: new NoopTransport() });

      expect(a).not.toBe(b);
      expect(a.getMinLevel()).not.toBe(b.getMinLevel());
    });
  });
});
