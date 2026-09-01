/**
 * Agent Runtime — Consumidor de produção
 * Camada: APPLICATION.
 *
 * Registra os especialistas reais do Swarm no AgentRuntime e o conecta ao
 * AI Core via CoreAIResolver, dando ao AgentRuntime um consumidor real.
 *
 * Arquitetura:
 * ```
 * UI / Agentes
 *   ↓
 * getAgentRuntime()
 *   ↓
 * AgentRuntime → AgentExecutor
 *   ↓
 * CoreAIResolver → ModelRouter → Provider Adapter → Provider API
 * ```
 */

import {
  AgentRegistry,
  AgentRuntime,
  adaptSwarmAgents,
  DEFAULT_RUNTIME_POLICY,
} from '@/core/agents';
import { SWARM_SPECIALISTS } from '@/lib/agent-swarm/agent-specialists';
import { getCoreAIResolver } from '@/application/ai/core-resolver';

// ---------------------------------------------------------------------------
// Registry de produção
// ---------------------------------------------------------------------------

function buildProductionRegistry(): AgentRegistry {
  const registry = new AgentRegistry();

  // Converte os especialistas do Swarm (anjos-*) em AgentDefinitions reais.
  // Estes agentes executam LLM real via AgentExecutor → CoreAIResolver.
  const definitions = adaptSwarmAgents(
    SWARM_SPECIALISTS as unknown as Array<{
      id: string;
      name: string;
      role: string;
      title: string;
      systemPrompt: string;
      model: string;
      skills: string[];
      tools: string[];
    }>
  );

  for (const definition of definitions) {
    registry.register(definition);
  }

  return registry;
}

// ---------------------------------------------------------------------------
// Runtime singleton
// ---------------------------------------------------------------------------

let runtimeInstance: AgentRuntime | null = null;

/**
 * Instância compartilhada do AgentRuntime de produção.
 *
 * - Registry: especialistas reais do Swarm (7 agentes).
 * - Resolver: CoreAIResolver (AI Core + ModelRouter + adapters).
 * - Política: padrão (maxConcurrentAgents: 5, globalTimeoutMs: 300_000).
 */
export function getAgentRuntime(): AgentRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new AgentRuntime(
      buildProductionRegistry(),
      getCoreAIResolver(),
      DEFAULT_RUNTIME_POLICY
    );
  }
  return runtimeInstance;
}

/** Reseta o singleton. Uso exclusivo de testes. */
export function resetAgentRuntime(): void {
  runtimeInstance = null;
}
