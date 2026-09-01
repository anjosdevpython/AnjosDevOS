/**
 * Agent Orchestrator
 * Motor central de orquestração - gerencia agentes, roteia tarefas, permite comunicação inter-agentes
 */

import type {
  AgentMessage, OrchestratorAgent, TaskRequest, TaskResult,
  Workflow, WorkflowStep, TaskArtifact,
} from './types';
import { getAgentRuntime } from '@/application/agents';
import { adaptOrchestratorAgent } from '@/core/agents/adapters/LegacyOrchestratorAdapter';

type MessageHandler = (msg: AgentMessage) => void;
type TaskHandler = (task: TaskRequest) => Promise<TaskResult>;

class AgentOrchestratorImpl {
  private agents: Map<string, OrchestratorAgent> = new Map();
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private taskQueue: TaskRequest[] = [];
  private activeTasks: Map<string, { task: TaskRequest; agentId: string; startTime: number }> = new Map();
  private messageLog: AgentMessage[] = [];
  private workflows: Map<string, Workflow> = new Map();
  private taskHandlers: Map<string, TaskHandler> = new Map();
  private eventListeners: ((event: string, data: unknown) => void)[] = [];

  // ── Registro de Agentes ──

  registerAgent(agent: OrchestratorAgent): void {
    this.agents.set(agent.id, agent);
    this.emit('agent:registered', { agentId: agent.id, name: agent.name });
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.emit('agent:unregistered', { agentId });
  }

  getAgent(agentId: string): OrchestratorAgent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): OrchestratorAgent[] {
    return Array.from(this.agents.values());
  }

  getAgentsByCapability(capability: string): OrchestratorAgent[] {
    return this.getAllAgents().filter(a =>
      a.status !== 'offline' &&
      a.capabilities.some(c => c.name === capability)
    );
  }

  getAvailableAgents(): OrchestratorAgent[] {
    return this.getAllAgents().filter(a =>
      a.status === 'idle' &&
      a.currentTasks.length < a.maxConcurrentTasks
    );
  }

  // ── Comunicação entre Agentes ──

  sendMessage(msg: Omit<AgentMessage, 'id' | 'timestamp'>): AgentMessage {
    const fullMsg: AgentMessage = {
      ...msg,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.messageLog.push(fullMsg);

    // Entregar ao destinatário
    if (msg.to === '*') {
      // Broadcast
      this.messageHandlers.forEach((handlers, agentId) => {
        if (agentId !== msg.from) {
          handlers.forEach(h => h(fullMsg));
        }
      });
    } else {
      const handlers = this.messageHandlers.get(msg.to);
      if (handlers) {
        handlers.forEach(h => h(fullMsg));
      }
    }

    this.emit('message:sent', { from: msg.from, to: msg.to, type: msg.type });
    return fullMsg;
  }

  onMessage(agentId: string, handler: MessageHandler): () => void {
    const handlers = this.messageHandlers.get(agentId) || [];
    handlers.push(handler);
    this.messageHandlers.set(agentId, handlers);

    return () => {
      const current = this.messageHandlers.get(agentId) || [];
      this.messageHandlers.set(agentId, current.filter(h => h !== handler));
    };
  }

  // ── Execução de Tarefas ──

  registerTaskHandler(agentId: string, handler: TaskHandler): void {
    this.taskHandlers.set(agentId, handler);
  }

  async submitTask(task: TaskRequest): Promise<TaskResult> {
    const agent = this.findBestAgent(task);
    if (!agent) {
      return {
        taskId: task.id,
        agentId: '',
        status: 'failed',
        output: {},
        error: 'Nenhum agente disponível com as capacidades solicitadas',
        duration: 0,
        stepsExecuted: 0,
      };
    }

    // Marcar agente como ocupado
    agent.status = 'busy';
    agent.currentTasks.push(task.id);
    this.agents.set(agent.id, agent);

    const startTime = Date.now();
    this.activeTasks.set(task.id, { task, agentId: agent.id, startTime });

    this.emit('task:started', { taskId: task.id, agentId: agent.id });

    try {
      const handler = this.taskHandlers.get(agent.id);
      let result: TaskResult;

      if (handler) {
        result = await handler(task);
      } else {
        // Execução real via AgentRuntime (AI Core) — sem simulação
        result = await this.executeTaskViaRuntime(task, agent);
      }

      result.duration = Date.now() - startTime;
      this.emit('task:completed', { taskId: task.id, result });

      return result;
    } catch (error) {
      const result: TaskResult = {
        taskId: task.id,
        agentId: agent.id,
        status: 'failed',
        output: {},
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        duration: Date.now() - startTime,
        stepsExecuted: 0,
      };

      this.emit('task:failed', { taskId: task.id, error: result.error });
      return result;
    } finally {
      agent.currentTasks = agent.currentTasks.filter(id => id !== task.id);
      agent.status = agent.currentTasks.length === 0 ? 'idle' : 'busy';
      this.agents.set(agent.id, agent);
      this.activeTasks.delete(task.id);
    }
  }

  private findBestAgent(task: TaskRequest): OrchestratorAgent | null {
    let candidates = this.getAvailableAgents();

    // Filtrar por capacidades necessárias
    candidates = candidates.filter(agent =>
      task.requiredCapabilities.every(cap =>
        agent.capabilities.some(c => c.name === cap)
      )
    );

    if (candidates.length === 0) return null;

    // Se há preferência, usar
    if (task.preferredAgent) {
      const preferred = candidates.find(a => a.id === task.preferredAgent);
      if (preferred) return preferred;
    }

    // Ordenar por menor carga
    return candidates.sort((a, b) => a.currentTasks.length - b.currentTasks.length)[0];
  }

  private async executeTaskViaRuntime(task: TaskRequest, agent: OrchestratorAgent): Promise<TaskResult> {
    const runtime = getAgentRuntime();

    // Registra o agente do Orchestrator no runtime como AgentDefinition
    // (idempotente — registra/atualiza por id)
    const definition = adaptOrchestratorAgent({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      capabilities: agent.capabilities.map((c) => ({ name: c.name, description: c.description })),
    });
    runtime.getRegistry().register(definition);

    // Monta o input da tarefa como descrição + payload
    const input = task.description
      + (task.input && Object.keys(task.input).length > 0
        ? `\n\nDados de entrada:\n${JSON.stringify(task.input, null, 2)}`
        : '');

    const result = await runtime.execute(agent.id, input);

    if (result.state === 'COMPLETED') {
      return {
        taskId: task.id,
        agentId: agent.id,
        status: 'completed',
        output: {
          message: result.output,
          agentName: agent.name,
          model: result.model,
          provider: result.provider,
        },
        duration: result.duration,
        stepsExecuted: result.iterations,
      };
    }

    return {
      taskId: task.id,
      agentId: agent.id,
      status: 'failed',
      output: {},
      error: result.error ?? 'Falha na execução do agente',
      duration: result.duration,
      stepsExecuted: result.iterations,
    };
  }

  // ── Workflows ──

  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  async executeWorkflow(workflowId: string): Promise<TaskResult[]> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow não encontrado: ${workflowId}`);

    const results: TaskResult[] = [];
    const completedSteps = new Set<string>();

    // Executar passos em ordem de dependência
    const executeStep = async (step: WorkflowStep): Promise<void> => {
      // Verificar dependências
      if (step.dependsOn?.some(dep => !completedSteps.has(dep))) {
        return; // Aguardar dependências
      }

      const task: TaskRequest = {
        id: `${workflowId}-${step.id}`,
        description: `Workflow ${workflow.name} - ${step.capability}`,
        requiredCapabilities: [step.capability],
        preferredAgent: step.agentId,
        input: step.input,
        timeout: 30000,
      };

      const result = await this.submitTask(task);
      results.push(result);
      completedSteps.add(step.id);

      if (result.status === 'completed') {
        this.emit('workflow:step-completed', { workflowId, stepId: step.id });
      }
    };

    // Executar passos sem dependências primeiro
    const independentSteps = workflow.steps.filter(s => !s.dependsOn || s.dependsOn.length === 0);
    await Promise.all(independentSteps.map(executeStep));

    // Executar passos dependentes
    const dependentSteps = workflow.steps.filter(s => s.dependsOn && s.dependsOn.length > 0);
    for (const step of dependentSteps) {
      await executeStep(step);
    }

    workflow.runs++;
    workflow.lastRun = new Date();
    this.workflows.set(workflowId, workflow);

    return results;
  }

  // ── Eventos ──

  on(listener: (event: string, data: unknown) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }

  private emit(event: string, data: unknown): void {
    this.eventListeners.forEach(l => l(event, data));
  }

  // ── Utilidades ──

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  getMessageLog(limit = 100): AgentMessage[] {
    return this.messageLog.slice(-limit);
  }

  getActiveTaskCount(): number {
    return this.activeTasks.size;
  }

  getStats(): {
    totalAgents: number;
    availableAgents: number;
    activeTasks: number;
    totalMessages: number;
    totalWorkflows: number;
  } {
    return {
      totalAgents: this.agents.size,
      availableAgents: this.getAvailableAgents().length,
      activeTasks: this.activeTasks.size,
      totalMessages: this.messageLog.length,
      totalWorkflows: this.workflows.size,
    };
  }
}

// Singleton
let instance: AgentOrchestratorImpl | null = null;

export function getOrchestrator(): AgentOrchestratorImpl {
  if (!instance) {
    instance = new AgentOrchestratorImpl();
  }
  return instance;
}

export { AgentOrchestratorImpl as AgentOrchestrator };
