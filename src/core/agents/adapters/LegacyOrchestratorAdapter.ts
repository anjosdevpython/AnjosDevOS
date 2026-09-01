/**
 * Legacy Orchestrator Adapter
 * Ponte entre o Agent Orchestrator legado e o novo AgentRuntime.
 *
 * Camada: CORE (adapter boundary).
 *
 * ```
 * Legacy Orchestrator → LegacyOrchestratorAdapter → AgentRuntime
 * ```
 */

import type { AgentDefinition } from '../types';
import { DEFAULT_EXECUTION_POLICY } from '../types';

// ---------------------------------------------------------------------------
// Orchestrator Agent → AgentDefinition mapping
// ---------------------------------------------------------------------------

interface LegacyOrchestratorAgent {
  id: string;
  name: string;
  type: 'ai' | 'tool' | 'human' | 'hybrid';
  capabilities: Array<{ name: string; description: string }>;
}

const TYPE_TO_CAPABILITIES: Record<string, import('../types').AgentCapability[]> = {
  ai: ['CHAT', 'ANALYZE', 'GENERATE'],
  tool: ['GENERATE', 'ANALYZE'],
  hybrid: ['CHAT', 'ANALYZE', 'GENERATE'],
  human: ['CHAT'],
};

/**
 * Converte um agente legado do Orchestrator para AgentDefinition.
 */
export function adaptOrchestratorAgent(legacy: LegacyOrchestratorAgent): AgentDefinition {
  const capabilities = TYPE_TO_CAPABILITIES[legacy.type] ?? ['CHAT'];

  return {
    id: legacy.id,
    name: legacy.name,
    description: `Agente ${legacy.type}: ${legacy.capabilities.map((c) => c.name).join(', ')}`,
    capabilities,
    modelPolicy: 'BALANCED',
    systemPrompt: `Você é ${legacy.name}, um agente do sistema AnjosDevOS.`,
    executionPolicy: {
      ...DEFAULT_EXECUTION_POLICY,
      maxTokens: 4096,
    },
    metadata: {
      legacyType: legacy.type,
      legacyCapabilities: legacy.capabilities.map((c) => c.name),
      source: 'agent-orchestrator',
    },
  };
}

/**
 * Converte uma lista de agentes legados.
 */
export function adaptOrchestratorAgents(legacies: LegacyOrchestratorAgent[]): AgentDefinition[] {
  return legacies.map(adaptOrchestratorAgent);
}
