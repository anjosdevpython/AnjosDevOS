/**
 * Config Types
 * Configuração centralizada, tipada e classificada por sensibilidade.
 *
 * Camada: INFRASTRUCTURE (mais baixa). Zero dependências externas.
 */

/**
 * Classificação de sensibilidade. Determina quem pode ler o valor.
 *
 * - PUBLIC        — pode ser embutido no bundle do cliente.
 * - PRIVATE       — apenas server-side (route handlers, server components).
 * - SECRET        — credencial. Nunca lida nem armazenada por este módulo.
 * - USER_PROVIDED — fornecida pelo usuário em runtime (ex.: chave própria).
 *                   Trafega apenas na sessão do usuário, nunca é logada.
 */
export enum ConfigType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  SECRET = 'SECRET',
  USER_PROVIDED = 'USER_PROVIDED',
}

export type Environment = 'development' | 'test' | 'staging' | 'production';

export const ENVIRONMENTS: readonly Environment[] = [
  'development',
  'test',
  'staging',
  'production',
] as const;

export interface AppConfig {
  name: string;
  version: string;
  environment: Environment;
  debug: boolean;
}

export interface AIConfig {
  defaultProvider: string;
  defaultModel: string;
  maxTokens: number;
  /** 0..2 */
  temperature: number;
  /** milissegundos */
  timeout: number;
  retryAttempts: number;
}

export interface SecurityConfig {
  rateLimitEnabled: boolean;
  rateLimitPerMinute: number;
  csrfEnabled: boolean;
  cspEnabled: boolean;
  auditLogEnabled: boolean;
}

export interface DatabaseConfig {
  provider: 'dexie' | 'indexeddb';
  maxWorkspaces: number;
  maxFlows: number;
  maxFlowRuns: number;
}

export interface RuntimeConfig {
  webContainersEnabled: boolean;
  terminalEnabled: boolean;
  vitestEnabled: boolean;
}

export interface FeatureFlags {
  newAgentSystem: boolean;
  unifiedMemory: boolean;
  toolPermissions: boolean;
  modelRouter: boolean;
}

export interface Config {
  app: AppConfig;
  ai: AIConfig;
  security: SecurityConfig;
  database: DatabaseConfig;
  runtime: RuntimeConfig;
  features: FeatureFlags;
}

export type ConfigSection = keyof Config;

/**
 * Classificação por seção. Seções PUBLIC podem ser serializadas para o cliente;
 * seções PRIVATE só são legíveis no servidor.
 *
 * Nenhuma seção é SECRET: este módulo deliberadamente não lê credenciais.
 * Chaves de provedores continuam fora da configuração central (ver README).
 */
export const CONFIG_CLASSIFICATION: Readonly<Record<ConfigSection, ConfigType>> = {
  app: ConfigType.PUBLIC,
  ai: ConfigType.PUBLIC,
  security: ConfigType.PRIVATE,
  database: ConfigType.PUBLIC,
  runtime: ConfigType.PUBLIC,
  features: ConfigType.PUBLIC,
};

/** Subconjunto seguro para enviar a componentes client-side. */
export type PublicConfig = Pick<Config, 'app' | 'ai' | 'database' | 'runtime' | 'features'>;

/** Fonte de variáveis de ambiente. Injetável para testes. */
export type EnvSource = Record<string, string | undefined>;

export interface ConfigManagerOptions {
  env?: EnvSource;
  /** Sobrescreve a detecção de servidor (`typeof window === 'undefined'`). */
  isServer?: boolean;
}

export interface ConfigIssue {
  path: string;
  message: string;
  received: string | undefined;
  /** Valor efetivamente aplicado depois da correção. */
  fallback: unknown;
}
