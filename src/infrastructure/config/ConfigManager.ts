/**
 * Config Manager
 * Ponto único de leitura de configuração. Substitui o acesso espalhado a
 * `process.env` / `localStorage` ao longo do projeto.
 *
 * Camada: INFRASTRUCTURE (mais baixa). Zero dependências externas.
 *
 * Regras de segurança:
 * - Nenhuma credencial é lida aqui. Chaves de provedores continuam fora da
 *   configuração central (ver README.md deste diretório).
 * - Seções classificadas como PRIVATE só podem ser lidas no servidor.
 * - `getPublicConfig()` devolve o único subconjunto seguro para o cliente.
 */

import {
  CONFIG_CLASSIFICATION,
  ConfigType,
  ENVIRONMENTS,
  type AIConfig,
  type AppConfig,
  type Config,
  type ConfigIssue,
  type ConfigManagerOptions,
  type ConfigSection,
  type DatabaseConfig,
  type EnvSource,
  type Environment,
  type FeatureFlags,
  type PublicConfig,
  type RuntimeConfig,
  type SecurityConfig,
} from './types';
import {
  ConfigAccessError,
  ConfigValidationError,
  IssueCollector,
  readBoolean,
  readEnum,
  readNumber,
  readString,
} from './validation';

const PUBLIC_SECTIONS: readonly ConfigSection[] = [
  'app',
  'ai',
  'database',
  'runtime',
  'features',
];

export class ConfigManagerImpl {
  private readonly env: EnvSource;
  private readonly isServerRuntime: boolean;
  private config: Config;
  private issues: readonly ConfigIssue[] = [];

  constructor(options: ConfigManagerOptions = {}) {
    this.env = options.env ?? (process.env as EnvSource);
    this.isServerRuntime = options.isServer ?? typeof window === 'undefined';
    this.config = this.loadConfig();
  }

  // -------------------------------------------------------------------------
  // Carregamento
  // -------------------------------------------------------------------------

  private loadConfig(): Config {
    const issues = new IssueCollector();

    const config: Config = {
      app: this.loadAppConfig(issues),
      ai: this.loadAIConfig(issues),
      security: this.loadSecurityConfig(issues),
      database: this.loadDatabaseConfig(issues),
      runtime: this.loadRuntimeConfig(issues),
      features: this.loadFeatureFlags(issues),
    };

    this.issues = issues.list();
    return config;
  }

  private resolveEnvironment(issues: IssueCollector): Environment {
    // Preferência: APP_ENV explícito; senão deriva de NODE_ENV.
    if (this.env.NEXT_PUBLIC_APP_ENV !== undefined) {
      return readEnum(
        this.env,
        'NEXT_PUBLIC_APP_ENV',
        ENVIRONMENTS,
        'development',
        issues
      );
    }

    const nodeEnv = this.env.NODE_ENV?.trim().toLowerCase();
    if (nodeEnv === 'production') return 'production';
    if (nodeEnv === 'test') return 'test';
    return 'development';
  }

  private loadAppConfig(issues: IssueCollector): AppConfig {
    const environment = this.resolveEnvironment(issues);
    return {
      name: 'AnjosDevOS',
      version: readString(this.env, 'NEXT_PUBLIC_APP_VERSION', '1.0.0', issues),
      environment,
      debug: readBoolean(
        this.env,
        'NEXT_PUBLIC_DEBUG',
        environment === 'development',
        issues
      ),
    };
  }

  private loadAIConfig(issues: IssueCollector): AIConfig {
    return {
      defaultProvider: readString(
        this.env,
        'NEXT_PUBLIC_DEFAULT_PROVIDER',
        'networktools',
        issues
      ),
      defaultModel: readString(
        this.env,
        'NEXT_PUBLIC_DEFAULT_MODEL',
        'openai/gpt-5-5',
        issues
      ),
      maxTokens: readNumber(this.env, 'AI_MAX_TOKENS', 4096, { min: 1, max: 1_000_000 }, issues),
      temperature: readNumber(
        this.env,
        'AI_TEMPERATURE',
        0.7,
        { min: 0, max: 2, integer: false },
        issues
      ),
      timeout: readNumber(this.env, 'AI_TIMEOUT', 30_000, { min: 1_000, max: 600_000 }, issues),
      retryAttempts: readNumber(this.env, 'AI_RETRY_ATTEMPTS', 3, { min: 0, max: 10 }, issues),
    };
  }

  private loadSecurityConfig(issues: IssueCollector): SecurityConfig {
    return {
      rateLimitEnabled: readBoolean(this.env, 'RATE_LIMIT_ENABLED', true, issues),
      rateLimitPerMinute: readNumber(
        this.env,
        'RATE_LIMIT_PER_MINUTE',
        60,
        { min: 1, max: 100_000 },
        issues
      ),
      csrfEnabled: readBoolean(this.env, 'CSRF_ENABLED', true, issues),
      cspEnabled: readBoolean(this.env, 'CSP_ENABLED', true, issues),
      auditLogEnabled: readBoolean(this.env, 'AUDIT_LOG_ENABLED', true, issues),
    };
  }

  private loadDatabaseConfig(issues: IssueCollector): DatabaseConfig {
    return {
      provider: readEnum(
        this.env,
        'DATABASE_PROVIDER',
        ['dexie', 'indexeddb'] as const,
        'dexie',
        issues
      ),
      maxWorkspaces: readNumber(this.env, 'MAX_WORKSPACES', 50, { min: 1, max: 10_000 }, issues),
      maxFlows: readNumber(this.env, 'MAX_FLOWS', 100, { min: 1, max: 100_000 }, issues),
      maxFlowRuns: readNumber(this.env, 'MAX_FLOW_RUNS', 1_000, { min: 1, max: 1_000_000 }, issues),
    };
  }

  private loadRuntimeConfig(issues: IssueCollector): RuntimeConfig {
    return {
      webContainersEnabled: readBoolean(
        this.env,
        'NEXT_PUBLIC_WEBCONTAINERS_ENABLED',
        true,
        issues
      ),
      terminalEnabled: readBoolean(this.env, 'NEXT_PUBLIC_TERMINAL_ENABLED', true, issues),
      vitestEnabled: readBoolean(this.env, 'NEXT_PUBLIC_VITEST_ENABLED', true, issues),
    };
  }

  private loadFeatureFlags(issues: IssueCollector): FeatureFlags {
    return {
      newAgentSystem: readBoolean(this.env, 'NEXT_PUBLIC_FEATURE_NEW_AGENT_SYSTEM', false, issues),
      unifiedMemory: readBoolean(this.env, 'NEXT_PUBLIC_FEATURE_UNIFIED_MEMORY', false, issues),
      toolPermissions: readBoolean(this.env, 'NEXT_PUBLIC_FEATURE_TOOL_PERMISSIONS', false, issues),
      modelRouter: readBoolean(this.env, 'NEXT_PUBLIC_FEATURE_MODEL_ROUTER', false, issues),
    };
  }

  // -------------------------------------------------------------------------
  // Leitura
  // -------------------------------------------------------------------------

  /** Configuração completa. Server-only (contém a seção PRIVATE `security`). */
  getAll(): Config {
    this.assertReadable('security');
    return this.config;
  }

  getApp(): AppConfig {
    return this.getSection('app');
  }

  getAI(): AIConfig {
    return this.getSection('ai');
  }

  getSecurity(): SecurityConfig {
    return this.getSection('security');
  }

  getDatabase(): DatabaseConfig {
    return this.getSection('database');
  }

  getRuntime(): RuntimeConfig {
    return this.getSection('runtime');
  }

  getFeatures(): FeatureFlags {
    return this.getSection('features');
  }

  /** Leitura genérica e tipada por seção, respeitando a classificação. */
  get<S extends ConfigSection>(section: S): Config[S] {
    return this.getSection(section);
  }

  /**
   * Subconjunto seguro para componentes client-side.
   * Nunca inclui seções PRIVATE/SECRET.
   */
  getPublicConfig(): PublicConfig {
    return {
      app: this.config.app,
      ai: this.config.ai,
      database: this.config.database,
      runtime: this.config.runtime,
      features: this.config.features,
    };
  }

  /** Classificação de sensibilidade de uma seção. */
  getClassification(section: ConfigSection): ConfigType {
    return CONFIG_CLASSIFICATION[section];
  }

  isPublicSection(section: ConfigSection): boolean {
    return CONFIG_CLASSIFICATION[section] === ConfigType.PUBLIC;
  }

  // -------------------------------------------------------------------------
  // Validação e ambiente
  // -------------------------------------------------------------------------

  /** Problemas encontrados no carregamento (valores inválidos → default). */
  getIssues(): readonly ConfigIssue[] {
    return this.issues;
  }

  /** Lança `ConfigValidationError` se algum valor de ambiente for inválido. */
  assertValid(): void {
    if (this.issues.length > 0) {
      throw new ConfigValidationError(this.issues);
    }
  }

  isServer(): boolean {
    return this.isServerRuntime;
  }

  isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  isTest(): boolean {
    return this.config.app.environment === 'test';
  }

  isProduction(): boolean {
    return this.config.app.environment === 'production';
  }

  /** Recarrega a partir da fonte de ambiente. */
  reload(): void {
    this.config = this.loadConfig();
  }

  private getSection<S extends ConfigSection>(section: S): Config[S] {
    this.assertReadable(section);
    return this.config[section];
  }

  private assertReadable(section: ConfigSection): void {
    if (CONFIG_CLASSIFICATION[section] === ConfigType.PUBLIC) return;
    if (this.isServerRuntime) return;
    throw new ConfigAccessError(section);
  }
}

let configManagerInstance: ConfigManagerImpl | null = null;

/** Instância singleton compartilhada pela aplicação. */
export function getConfigManager(): ConfigManagerImpl {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManagerImpl();
  }
  return configManagerInstance;
}

/** Reseta o singleton. Uso exclusivo de testes. */
export function resetConfigManager(): void {
  configManagerInstance = null;
}

export { PUBLIC_SECTIONS };
