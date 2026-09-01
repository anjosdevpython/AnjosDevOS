/**
 * Config Manager Tests
 * Cobertura: carregamento por seção, validação, classificação de sensibilidade
 * e bloqueio de leitura de configuração não-pública em código client-side.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CONFIG_CLASSIFICATION,
  ConfigAccessError,
  ConfigManagerImpl,
  ConfigType,
  ConfigValidationError,
  getConfigManager,
  resetConfigManager,
} from '@/infrastructure/config';
import type { EnvSource } from '@/infrastructure/config';

/** Manager server-side com ambiente controlado (não depende de process.env). */
function createManager(env: EnvSource = {}): ConfigManagerImpl {
  return new ConfigManagerImpl({ env, isServer: true });
}

describe('ConfigManager', () => {
  beforeEach(() => {
    resetConfigManager();
  });

  describe('carregamento', () => {
    it('deve carregar todas as seções', () => {
      const config = createManager().getAll();

      expect(config.app).toBeDefined();
      expect(config.ai).toBeDefined();
      expect(config.security).toBeDefined();
      expect(config.database).toBeDefined();
      expect(config.runtime).toBeDefined();
      expect(config.features).toBeDefined();
    });

    it('deve aplicar defaults quando o ambiente está vazio', () => {
      const config = createManager().getAll();

      expect(config.app.name).toBe('AnjosDevOS');
      expect(config.app.version).toBe('1.0.0');
      expect(config.app.environment).toBe('development');
      expect(config.ai.defaultProvider).toBe('networktools');
      expect(config.ai.maxTokens).toBe(4096);
      expect(config.ai.temperature).toBe(0.7);
      expect(config.security.rateLimitPerMinute).toBe(60);
      expect(config.database.provider).toBe('dexie');
      expect(config.runtime.webContainersEnabled).toBe(true);
      expect(config.features.newAgentSystem).toBe(false);
    });

    it('deve ler valores do ambiente quando presentes', () => {
      const manager = createManager({
        NEXT_PUBLIC_APP_VERSION: '2.3.4',
        NEXT_PUBLIC_DEFAULT_PROVIDER: 'anthropic',
        AI_MAX_TOKENS: '8192',
        AI_TEMPERATURE: '0.2',
        RATE_LIMIT_PER_MINUTE: '120',
        NEXT_PUBLIC_FEATURE_MODEL_ROUTER: 'true',
      });

      expect(manager.getApp().version).toBe('2.3.4');
      expect(manager.getAI().defaultProvider).toBe('anthropic');
      expect(manager.getAI().maxTokens).toBe(8192);
      expect(manager.getAI().temperature).toBe(0.2);
      expect(manager.getSecurity().rateLimitPerMinute).toBe(120);
      expect(manager.getFeatures().modelRouter).toBe(true);
    });

    it('deve resolver o ambiente a partir de NODE_ENV', () => {
      expect(createManager({ NODE_ENV: 'production' }).getApp().environment).toBe('production');
      expect(createManager({ NODE_ENV: 'test' }).getApp().environment).toBe('test');
      expect(createManager({ NODE_ENV: 'development' }).getApp().environment).toBe('development');
    });

    it('NEXT_PUBLIC_APP_ENV deve ter precedência sobre NODE_ENV', () => {
      const manager = createManager({ NODE_ENV: 'production', NEXT_PUBLIC_APP_ENV: 'staging' });
      expect(manager.getApp().environment).toBe('staging');
    });
  });

  describe('validação', () => {
    it('não deve reportar problemas com ambiente válido', () => {
      const manager = createManager({ AI_MAX_TOKENS: '2048' });

      expect(manager.getIssues()).toHaveLength(0);
      expect(() => manager.assertValid()).not.toThrow();
    });

    it('deve rejeitar número inválido e cair no default', () => {
      const manager = createManager({ AI_MAX_TOKENS: 'não-é-número' });

      expect(manager.getAI().maxTokens).toBe(4096);
      expect(manager.getIssues()).toHaveLength(1);
      expect(manager.getIssues()[0].path).toBe('AI_MAX_TOKENS');
    });

    it('deve rejeitar número fora do intervalo permitido', () => {
      const manager = createManager({ AI_TEMPERATURE: '9' });

      expect(manager.getAI().temperature).toBe(0.7);
      expect(manager.getIssues()[0].message).toContain('máximo');
    });

    it('deve rejeitar booleano inválido', () => {
      const manager = createManager({ CSRF_ENABLED: 'talvez' });

      expect(manager.getSecurity().csrfEnabled).toBe(true);
      expect(manager.getIssues()[0].path).toBe('CSRF_ENABLED');
    });

    it('deve aceitar as variações comuns de booleano', () => {
      expect(createManager({ CSRF_ENABLED: 'false' }).getSecurity().csrfEnabled).toBe(false);
      expect(createManager({ CSRF_ENABLED: '0' }).getSecurity().csrfEnabled).toBe(false);
      expect(createManager({ CSRF_ENABLED: 'no' }).getSecurity().csrfEnabled).toBe(false);
      expect(createManager({ CSRF_ENABLED: 'TRUE' }).getSecurity().csrfEnabled).toBe(true);
      expect(createManager({ CSRF_ENABLED: '1' }).getSecurity().csrfEnabled).toBe(true);
    });

    it('deve rejeitar enum fora do conjunto permitido', () => {
      const manager = createManager({ DATABASE_PROVIDER: 'mongodb' });

      expect(manager.getDatabase().provider).toBe('dexie');
      expect(manager.getIssues()[0].path).toBe('DATABASE_PROVIDER');
    });

    it('assertValid deve lançar ConfigValidationError agregando os problemas', () => {
      const manager = createManager({ AI_MAX_TOKENS: 'x', CSRF_ENABLED: 'y' });

      expect(() => manager.assertValid()).toThrow(ConfigValidationError);
      expect(manager.getIssues()).toHaveLength(2);
    });

    it('reload deve reavaliar o ambiente', () => {
      const env: EnvSource = { AI_MAX_TOKENS: '1024' };
      const manager = new ConfigManagerImpl({ env, isServer: true });
      expect(manager.getAI().maxTokens).toBe(1024);

      env.AI_MAX_TOKENS = '2048';
      manager.reload();

      expect(manager.getAI().maxTokens).toBe(2048);
    });
  });

  describe('segurança e classificação', () => {
    it('deve classificar cada seção', () => {
      expect(CONFIG_CLASSIFICATION.app).toBe(ConfigType.PUBLIC);
      expect(CONFIG_CLASSIFICATION.ai).toBe(ConfigType.PUBLIC);
      expect(CONFIG_CLASSIFICATION.database).toBe(ConfigType.PUBLIC);
      expect(CONFIG_CLASSIFICATION.runtime).toBe(ConfigType.PUBLIC);
      expect(CONFIG_CLASSIFICATION.features).toBe(ConfigType.PUBLIC);
      expect(CONFIG_CLASSIFICATION.security).toBe(ConfigType.PRIVATE);
    });

    it('deve expor os quatro níveis de sensibilidade', () => {
      expect(Object.values(ConfigType)).toEqual([
        'PUBLIC',
        'PRIVATE',
        'SECRET',
        'USER_PROVIDED',
      ]);
    });

    it('deve bloquear leitura de seção PRIVATE em contexto client-side', () => {
      const clientManager = new ConfigManagerImpl({ env: {}, isServer: false });

      expect(() => clientManager.getSecurity()).toThrow(ConfigAccessError);
      expect(() => clientManager.getAll()).toThrow(ConfigAccessError);
    });

    it('deve permitir leitura de seções PUBLIC em contexto client-side', () => {
      const clientManager = new ConfigManagerImpl({ env: {}, isServer: false });

      expect(clientManager.getApp().name).toBe('AnjosDevOS');
      expect(clientManager.getAI().defaultProvider).toBe('networktools');
      expect(clientManager.getRuntime().terminalEnabled).toBe(true);
      expect(clientManager.getFeatures().modelRouter).toBe(false);
    });

    it('getPublicConfig nunca deve conter seções não-públicas', () => {
      const clientManager = new ConfigManagerImpl({ env: {}, isServer: false });
      const publicConfig = clientManager.getPublicConfig();

      expect(Object.keys(publicConfig).sort()).toEqual([
        'ai',
        'app',
        'database',
        'features',
        'runtime',
      ]);
      expect('security' in publicConfig).toBe(false);
    });

    it('não deve carregar nenhuma credencial do ambiente', () => {
      const manager = createManager({
        OPENAI_API_KEY: 'sk-nao-deve-aparecer',
        GITHUB_TOKEN: 'ghp_nao-deve-aparecer',
        ANTHROPIC_API_KEY: 'sk-ant-nao-deve-aparecer',
      });

      const serialized = JSON.stringify(manager.getAll());

      expect(serialized).not.toContain('nao-deve-aparecer');
      expect(serialized).not.toContain('sk-');
      expect(serialized).not.toContain('ghp_');
    });

    it('isPublicSection deve refletir a classificação', () => {
      const manager = createManager();

      expect(manager.isPublicSection('app')).toBe(true);
      expect(manager.isPublicSection('security')).toBe(false);
      expect(manager.getClassification('security')).toBe(ConfigType.PRIVATE);
    });
  });

  describe('acesso tipado', () => {
    it('get() deve devolver a seção tipada', () => {
      const manager = createManager();

      const app = manager.get('app');
      const ai = manager.get('ai');

      expect(app.name).toBe('AnjosDevOS');
      expect(ai.defaultProvider).toBeTypeOf('string');
      expect(ai.maxTokens).toBeTypeOf('number');
    });

    it('deve devolver os tipos primitivos corretos', () => {
      const config = createManager().getAll();

      expect(typeof config.app.name).toBe('string');
      expect(typeof config.app.debug).toBe('boolean');
      expect(typeof config.ai.maxTokens).toBe('number');
      expect(typeof config.security.rateLimitEnabled).toBe('boolean');
      expect(typeof config.database.provider).toBe('string');
      expect(typeof config.runtime.webContainersEnabled).toBe('boolean');
      expect(typeof config.features.newAgentSystem).toBe('boolean');
    });
  });

  describe('helpers de ambiente', () => {
    it('deve identificar o ambiente corretamente', () => {
      const dev = createManager({ NODE_ENV: 'development' });
      const prod = createManager({ NODE_ENV: 'production' });
      const test = createManager({ NODE_ENV: 'test' });

      expect(dev.isDevelopment()).toBe(true);
      expect(dev.isProduction()).toBe(false);
      expect(prod.isProduction()).toBe(true);
      expect(prod.isDevelopment()).toBe(false);
      expect(test.isTest()).toBe(true);
    });

    it('debug deve seguir o ambiente por padrão', () => {
      expect(createManager({ NODE_ENV: 'development' }).getApp().debug).toBe(true);
      expect(createManager({ NODE_ENV: 'production' }).getApp().debug).toBe(false);
    });

    it('isServer deve refletir a opção injetada', () => {
      expect(new ConfigManagerImpl({ env: {}, isServer: true }).isServer()).toBe(true);
      expect(new ConfigManagerImpl({ env: {}, isServer: false }).isServer()).toBe(false);
    });
  });

  describe('singleton', () => {
    it('deve retornar a mesma instância', () => {
      expect(getConfigManager()).toBe(getConfigManager());
    });

    it('resetConfigManager deve criar uma nova instância', () => {
      const first = getConfigManager();
      resetConfigManager();
      expect(getConfigManager()).not.toBe(first);
    });

    it('instâncias isoladas são independentes', () => {
      expect(createManager()).not.toBe(createManager());
    });
  });
});
