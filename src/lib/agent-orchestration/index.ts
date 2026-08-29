/**
 * Agent Orchestration Engine
 * Sistema de comunicação e coordenação entre agentes
 * Permite que agentes se acionem mutuamente
 */

export { AgentOrchestrator, getOrchestrator } from './orchestrator';
export type { AgentMessage, AgentCapability, OrchestratorAgent, TaskRequest, TaskResult } from './types';
