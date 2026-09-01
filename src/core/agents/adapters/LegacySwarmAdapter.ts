/**
 * Legacy Swarm Adapter
 * Ponte entre o Swarm Engine legado e o novo AgentRuntime.
 *
 * Camada: CORE (adapter boundary).
 *
 * Permite migração gradual: o Swarm continua funcionando como antes,
 * mas pode ser chamado através da interface unificada do Runtime.
 *
 * ```
 * Legacy Swarm → LegacySwarmAdapter → AgentRuntime
 * ```
 */

import type { AgentDefinition } from '../types';
import { DEFAULT_EXECUTION_POLICY } from '../types';

// ---------------------------------------------------------------------------
// Swarm Specialist → AgentDefinition mapping
// ---------------------------------------------------------------------------

interface LegacySwarmAgent {
  id: string;
  name: string;
  role: string;
  title: string;
  systemPrompt: string;
  model: string;
  skills: string[];
  tools: string[];
}

const ROLE_TO_CAPABILITIES: Record<string, import('../types').AgentCapability[]> = {
  architect: ['PLAN', 'ANALYZE'],
  coder: ['GENERATE', 'ANALYZE'],
  reviewer: ['REVIEW', 'ANALYZE'],
  debugger: ['DEBUG', 'ANALYZE'],
  autopilot: ['GENERATE', 'ORCHESTRATE'],
  devops: ['GENERATE', 'ANALYZE'],
  docs: ['GENERATE', 'ANALYZE'],
};

/**
 * Converte um agente legado do Swarm para AgentDefinition.
 */
export function adaptSwarmAgent(legacy: LegacySwarmAgent): AgentDefinition {
  const capabilities = ROLE_TO_CAPABILITIES[legacy.role] ?? ['CHAT'];

  return {
    id: legacy.id,
    name: legacy.name,
    description: legacy.title,
    capabilities,
    modelPolicy: 'BALANCED',
    systemPrompt: legacy.systemPrompt,
    executionPolicy: {
      ...DEFAULT_EXECUTION_POLICY,
      maxTokens: 4096,
    },
    metadata: {
      legacyRole: legacy.role,
      legacySkills: legacy.skills,
      legacyTools: legacy.tools,
      source: 'swarm-engine',
    },
  };
}

/**
 * Converte uma lista de agentes legados.
 */
export function adaptSwarmAgents(legacies: LegacySwarmAgent[]): AgentDefinition[] {
  return legacies.map(adaptSwarmAgent);
}
