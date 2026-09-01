/**
 * Agents — ponto de entrada público
 * Camada: CORE
 */

// Types
export type {
  AgentDefinition,
  AgentCapability,
  AgentState,
  AgentContext,
  AgentRunResult,
  AgentExecutionPolicy,
  AgentDisplayStatus,
  RuntimePolicy,
} from './types';
export { DEFAULT_EXECUTION_POLICY, DEFAULT_RUNTIME_POLICY, VALID_TRANSITIONS, RESTRICTED_CAPABILITIES } from './types';

// Errors
export {
  AgentError,
  AgentConfigurationError,
  AgentExecutionError,
  AgentTimeoutError,
  AgentCancelledError,
  AgentStateError,
  AgentPolicyError,
} from './errors';

// Lifecycle
export { AgentLifecycle } from './lifecycle';
export type { StateTransition } from './lifecycle';

// Registry
export { AgentRegistry } from './registry';

// Executor
export { AgentExecutor } from './executor';
export type { AIRequestResolver, AgentExecutionResult } from './executor';

// Runtime
export { AgentRuntime } from './runtime';

// Adapters
export { adaptSwarmAgent, adaptSwarmAgents } from './adapters/LegacySwarmAdapter';
export { adaptOrchestratorAgent, adaptOrchestratorAgents } from './adapters/LegacyOrchestratorAdapter';
