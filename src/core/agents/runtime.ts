/**
 * Agent Runtime
 * Orquestra o ciclo de vida e execução de agentes.
 *
 * Camada: CORE. Depende de interfaces (AgentRegistry, AgentExecutor, AgentLifecycle).
 *
 * O Runtime controla:
 * - Criação de runs
 * - Execução com timeout
 * - Cancelamento via AbortSignal
 * - Limite de concorrência
 * - Transições de estado
 *
 * O Runtime NÃO conhece:
 * - Credenciais (via AIProvider abstração)
 * - Storage (via AgentContext)
 * - UI
 */

import type { AgentContext, AgentDefinition, AgentRunResult, AgentState, RuntimePolicy } from './types';
import { DEFAULT_RUNTIME_POLICY } from './types';
import { AgentRegistry } from './registry';
import { AgentLifecycle } from './lifecycle';
import { AgentExecutor, type AIRequestResolver } from './executor';
import { AgentCancelledError, AgentExecutionError, AgentTimeoutError, AgentPolicyError } from './errors';

// ---------------------------------------------------------------------------
// Run Instance
// ---------------------------------------------------------------------------

interface AgentRun {
  runId: string;
  agentId: string;
  lifecycle: AgentLifecycle;
  context: AgentContext;
  abortController: AbortController;
  startedAt: number;
}

// ---------------------------------------------------------------------------
// AgentRuntime
// ---------------------------------------------------------------------------

export class AgentRuntime {
  private readonly registry: AgentRegistry;
  private readonly executor: AgentExecutor;
  private readonly policy: RuntimePolicy;
  private readonly activeRuns = new Map<string, AgentRun>();

  constructor(
    registry: AgentRegistry,
    aiResolver: AIRequestResolver,
    policy?: Partial<RuntimePolicy>
  ) {
    this.registry = registry;
    this.executor = new AgentExecutor(aiResolver);
    this.policy = { ...DEFAULT_RUNTIME_POLICY, ...policy };
  }

  /**
   * Cria e executa um agente.
   *
   * Retorna o resultado quando o agente termina.
   */
  async execute(
    agentId: string,
    input: string,
    options?: {
      traceId?: string;
      requestId?: string;
      metadata?: Record<string, unknown>;
      signal?: AbortSignal;
    }
  ): Promise<AgentRunResult> {
    // 1. Verificar se o agente existe
    const definition = this.registry.get(agentId);
    if (!definition) {
      throw new AgentPolicyError(`Agente não encontrado: ${agentId}`);
    }

    // 2. Verificar limite de concorrência
    if (this.activeRuns.size >= this.policy.maxConcurrentAgents) {
      throw new AgentPolicyError(
        `Limite de concorrência atingido: ${this.activeRuns.size}/${this.policy.maxConcurrentAgents}`
      );
    }

    // 3. Criar run
    const runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const traceId = options?.traceId ?? `trace_${runId}`;
    const requestId = options?.requestId ?? `req_${runId}`;

    const lifecycle = new AgentLifecycle('CREATED');
    const abortController = new AbortController();

    const context: AgentContext = {
      agentId,
      runId,
      traceId,
      requestId,
      input,
      metadata: options?.metadata,
      signal: abortController.signal,
    };

    const run: AgentRun = {
      runId,
      agentId,
      lifecycle,
      context,
      abortController,
      startedAt: Date.now(),
    };

    this.activeRuns.set(runId, run);

    // 4. Compor signal externo (se fornecido) com signal interno
    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        abortController.abort();
      }, { once: true });
    }

    try {
      // CREATED → READY
      lifecycle.transition('READY', 'agent configured');

      // READY → RUNNING
      lifecycle.transition('RUNNING', 'execution started');

      // 5. Executar com timeout
      const result = await this.executeWithTimeout(run, definition);

      // RUNNING → COMPLETED (ou FAILED/TIMEOUT/CANCELLED)
      if (lifecycle.getCurrentState() === 'RUNNING') {
        if (run.abortController.signal.aborted) {
          // Verificar se foi cancelamento externo ou timeout
          const timeoutMs = definition.executionPolicy.timeoutMs || this.policy.globalTimeoutMs;
          const elapsed = Date.now() - run.startedAt;
          if (elapsed >= timeoutMs - 100) {
            lifecycle.transition('TIMEOUT', 'timeout excedido');
          } else {
            lifecycle.transition('CANCELLED', 'cancelado pelo usuário');
          }
        } else if (result.error) {
          lifecycle.transition('FAILED', result.error);
        } else {
          lifecycle.transition('COMPLETED', 'execution finished');
        }
      }

      return {
        runId,
        agentId,
        state: lifecycle.getCurrentState(),
        output: result.output,
        duration: result.duration,
        iterations: result.iterations,
        model: result.model,
        provider: result.provider,
        usage: result.usage,
        error: result.error,
        isFallback: result.isFallback,
      };
    } catch (error: unknown) {
      // Tratar cancelamento
      if (error instanceof AgentCancelledError) {
        if (lifecycle.getCurrentState() === 'RUNNING' || lifecycle.getCurrentState() === 'WAITING') {
          lifecycle.transition('CANCELLED', error.message);
        }
        return {
          runId,
          agentId,
          state: lifecycle.getCurrentState(),
          output: '',
          duration: Date.now() - run.startedAt,
          iterations: 0,
          error: error.message,
        };
      }

      // Tratar timeout
      if (error instanceof AgentTimeoutError) {
        if (lifecycle.getCurrentState() === 'RUNNING') {
          lifecycle.transition('TIMEOUT', error.message);
        }
        return {
          runId,
          agentId,
          state: lifecycle.getCurrentState(),
          output: '',
          duration: Date.now() - run.startedAt,
          iterations: 0,
          error: error.message,
        };
      }

      // Erro genérico
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      if (lifecycle.getCurrentState() === 'RUNNING') {
        lifecycle.transition('FAILED', message);
      }
      return {
        runId,
        agentId,
        state: lifecycle.getCurrentState(),
        output: '',
        duration: Date.now() - run.startedAt,
        iterations: 0,
        error: message,
      };
    } finally {
      this.activeRuns.delete(runId);
    }
  }

  /**
   * Cancela uma execução em andamento.
   */
  cancel(runId: string): boolean {
    const run = this.activeRuns.get(runId);
    if (!run) return false;

    if (run.lifecycle.getCurrentState() === 'RUNNING' || run.lifecycle.getCurrentState() === 'WAITING') {
      run.abortController.abort();
      return true;
    }

    return false;
  }

  /**
   * Cancela todas as execuções ativas.
   */
  cancelAll(): void {
    for (const run of this.activeRuns.values()) {
      if (run.lifecycle.getCurrentState() === 'RUNNING' || run.lifecycle.getCurrentState() === 'WAITING') {
        run.abortController.abort();
      }
    }
  }

  /**
   * Retorna o número de runs ativos.
   */
  getActiveRunCount(): number {
    return this.activeRuns.size;
  }

  /**
   * Retorna informações sobre runs ativos.
   */
  getActiveRuns(): Array<{ runId: string; agentId: string; state: AgentState; startedAt: number }> {
    return Array.from(this.activeRuns.values()).map((run) => ({
      runId: run.runId,
      agentId: run.agentId,
      state: run.lifecycle.getCurrentState(),
      startedAt: run.startedAt,
    }));
  }

  /**
   * Retorna o registry de agentes (para registrar novos agentes).
   */
  getRegistry(): AgentRegistry {
    return this.registry;
  }

  // -------------------------------------------------------------------------
  // Interno
  // -------------------------------------------------------------------------

  private async executeWithTimeout(
    run: AgentRun,
    definition: AgentDefinition
  ): Promise<{
    output: string;
    duration: number;
    iterations: number;
    model?: string;
    provider?: string;
    usage?: AgentRunResult['usage'];
    error?: string;
    isFallback?: boolean;
  }> {
    const timeoutMs = definition.executionPolicy.timeoutMs || this.policy.globalTimeoutMs;

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        run.abortController.abort();
        resolve({
          output: '',
          duration: Date.now() - run.startedAt,
          iterations: 0,
          error: `Timeout de ${timeoutMs}ms excedido`,
        });
      }, timeoutMs);

      // Verificar cancelamento
      run.context.signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        resolve({
          output: '',
          duration: Date.now() - run.startedAt,
          iterations: 0,
          error: 'Execução cancelada',
        });
      }, { once: true });

      this.executor.execute(run.context, definition)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error: unknown) => {
          clearTimeout(timer);
          resolve({
            output: '',
            duration: Date.now() - run.startedAt,
            iterations: 0,
            error: error instanceof Error ? error.message : 'Erro na execução',
          });
        });
    });
  }
}
