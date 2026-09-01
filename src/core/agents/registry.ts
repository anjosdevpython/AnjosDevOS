/**
 * Agent Registry
 * Registra e gerencia definições de agentes.
 *
 * Camada: CORE. Sem dependências externas.
 *
 * O Registry NÃO executa agentes — apenas mantém o catálogo.
 * Separação: Registry conhece agentes; Runtime executa agentes.
 */

import type { AgentDefinition } from './types';

// ---------------------------------------------------------------------------
// AgentRegistry
// ---------------------------------------------------------------------------

export class AgentRegistry {
  private agents = new Map<string, AgentDefinition>();

  /** Registra um agente. Sobrescreve se já existir com o mesmo ID. */
  register(definition: AgentDefinition): void {
    this.agents.set(definition.id, definition);
  }

  /** Remove um agente do registro. */
  unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  /** Obtém um agente por ID. */
  get(agentId: string): AgentDefinition | undefined {
    return this.agents.get(agentId);
  }

  /** Verifica se um agente está registrado. */
  has(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  /** Lista todos os agentes registrados. */
  list(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /** Lista agentes por capacidade. */
  listByCapability(capability: string): AgentDefinition[] {
    return this.list().filter((a) =>
      a.capabilities.includes(capability as never)
    );
  }

  /** Total de agentes registrados. */
  get count(): number {
    return this.agents.size;
  }

  /** Remove todos os agentes. */
  clear(): void {
    this.agents.clear();
  }
}
