/**
 * Config — ponto de entrada público
 * Camada: INFRASTRUCTURE
 */

export {
  ConfigManagerImpl,
  PUBLIC_SECTIONS,
  getConfigManager,
  resetConfigManager,
} from './ConfigManager';
export {
  ConfigAccessError,
  ConfigValidationError,
  IssueCollector,
  readBoolean,
  readEnum,
  readNumber,
  readString,
} from './validation';
export { CONFIG_CLASSIFICATION, ConfigType, ENVIRONMENTS } from './types';
export type {
  AIConfig,
  AppConfig,
  Config,
  ConfigIssue,
  ConfigManagerOptions,
  ConfigSection,
  DatabaseConfig,
  EnvSource,
  Environment,
  FeatureFlags,
  PublicConfig,
  RuntimeConfig,
  SecurityConfig,
} from './types';
