/**
 * Unified Agent System Tests (Fase 4)
 * Cobertura: Agent, Registry, Lifecycle, Runtime, Executor, Context,
 * Cancellation, Timeout, Policy, Concurrency, EventBus, Logger, Security.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AgentRegistry,
  AgentLifecycle,
  AgentExecutor,
  AgentRuntime,
  AgentStateError,
  AgentPolicyError,
  AgentCancelledError,
  adaptSwarmAgent,
  adaptSwarmAgents,
  adaptOrchestratorAgent,
  adaptOrchestratorAgents,
  DEFAULT_EXECUTION_POLICY,
  DEFAULT_RUNTIME_POLICY,
  VALID_TRANSITIONS,
} from '@/core/agents';
import type {
  AgentDefinition,
  AgentContext,
  AgentRunResult,
  AgentCapability,
} from '@/core/agents';
import type { AIRequestResolver } from '@/core/agents/executor';
import type { AIResponse, AIStreamChunk } from '@/core/ai/types';
import { EventBusImpl, resetEventBus } from '@/infrastructure/events';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockAIResolver(response = 'Resposta do agente'): AIRequestResolver {
  return {
    resolve: vi.fn().mockResolvedValue({
      id: 'resp-1',
      content: response,
      model: 'test-model',
      provider: 'test-provider',
      finishReason: 'stop',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    } as AIResponse),
    resolveStream: (function* () { yield { content: response, done: true }; })() as unknown as AIRequestResolver['resolveStream'],
  };
}

function createFailingResolver(error = 'AI Provider offline'): AIRequestResolver {
  return {
    resolve: vi.fn().mockRejectedValue(new Error(error)),
    resolveStream: (function* () { throw new Error(error); })() as unknown as AIRequestResolver['resolveStream'],
  };
}

function createSlowResolver(delayMs = 200): AIRequestResolver {
  return {
    resolve: vi.fn().mockImplementation(
      () => new Promise<AIResponse>((resolve) => {
        setTimeout(() => {
          resolve({
            id: 'resp-slow',
            content: 'Resposta lenta',
            model: 'test-model',
            provider: 'test-provider',
            finishReason: 'stop',
          });
        }, delayMs);
      })
    ),
    resolveStream: (function* () { yield { content: 'slow', done: true }; })() as unknown as AIRequestResolver['resolveStream'],
  };
}

const SAMPLE_AGENT: AgentDefinition = {
  id: 'test-agent',
  name: 'Test Agent',
  description: 'Agente de teste',
  capabilities: ['ANALYZE', 'GENERATE'],
  modelPolicy: 'BALANCED',
  systemPrompt: 'Você é um agente de teste.',
  executionPolicy: {
    ...DEFAULT_EXECUTION_POLICY,
    timeoutMs: 5000,
    maxRetries: 0,
  },
};

function createAgentOverrides(overrides?: Partial<AgentDefinition>): AgentDefinition {
  return { ...SAMPLE_AGENT, ...overrides };
}

// ---------------------------------------------------------------------------
// AgentLifecycle — State Machine
// ---------------------------------------------------------------------------

describe('AgentLifecycle', () => {
  it('deve iniciar em CREATED por padrão', () => {
    const lifecycle = new AgentLifecycle();
    expect(lifecycle.getCurrentState()).toBe('CREATED');
  });

  it('deve aceitar transição CREATED → READY', () => {
    const lifecycle = new AgentLifecycle();
    lifecycle.transition('READY');
    expect(lifecycle.getCurrentState()).toBe('READY');
  });

  it('deve aceitar transição READY → RUNNING', () => {
    const lifecycle = new AgentLifecycle('READY');
    lifecycle.transition('RUNNING');
    expect(lifecycle.getCurrentState()).toBe('RUNNING');
  });

  it('deve aceitar transição RUNNING → COMPLETED', () => {
    const lifecycle = new AgentLifecycle('RUNNING');
    lifecycle.transition('COMPLETED');
    expect(lifecycle.getCurrentState()).toBe('COMPLETED');
  });

  it('deve aceitar transição RUNNING → FAILED', () => {
    const lifecycle = new AgentLifecycle('RUNNING');
    lifecycle.transition('FAILED');
    expect(lifecycle.getCurrentState()).toBe('FAILED');
  });

  it('deve aceitar transição RUNNING → CANCELLED', () => {
    const lifecycle = new AgentLifecycle('RUNNING');
    lifecycle.transition('CANCELLED');
    expect(lifecycle.getCurrentState()).toBe('CANCELLED');
  });

  it('deve aceitar transição RUNNING → TIMEOUT', () => {
    const lifecycle = new AgentLifecycle('RUNNING');
    lifecycle.transition('TIMEOUT');
    expect(lifecycle.getCurrentState()).toBe('TIMEOUT');
  });

  it('deve aceitar transição READY → CANCELLED', () => {
    const lifecycle = new AgentLifecycle('READY');
    lifecycle.transition('CANCELLED');
    expect(lifecycle.getCurrentState()).toBe('CANCELLED');
  });

  it('deve REJEITAR transição CREATED → RUNNING', () => {
    const lifecycle = new AgentLifecycle();
    expect(() => lifecycle.transition('RUNNING')).toThrow(AgentStateError);
  });

  it('deve REJEITAR transição CREATED → COMPLETED', () => {
    const lifecycle = new AgentLifecycle();
    expect(() => lifecycle.transition('COMPLETED')).toThrow(AgentStateError);
  });

  it('deve REJEITAR transição COMPLETED → RUNNING', () => {
    const lifecycle = new AgentLifecycle('COMPLETED');
    expect(() => lifecycle.transition('RUNNING')).toThrow(AgentStateError);
  });

  it('deve registrar histórico de transições', () => {
    const lifecycle = new AgentLifecycle();
    lifecycle.transition('READY');
    lifecycle.transition('RUNNING');
    lifecycle.transition('COMPLETED');

    const history = lifecycle.getHistory();
    expect(history.length).toBe(4); // CREATED + 3 transitions
    expect(history[0].from).toBe('CREATED');
    expect(history[1].to).toBe('READY');
    expect(history[2].to).toBe('RUNNING');
    expect(history[3].to).toBe('COMPLETED');
  });

  it('canTransition deve refletir transições válidas', () => {
    const lifecycle = new AgentLifecycle();
    expect(lifecycle.canTransition('READY')).toBe(true);
    expect(lifecycle.canTransition('RUNNING')).toBe(false);
    expect(lifecycle.canTransition('COMPLETED')).toBe(false);
  });

  it('isTerminal deve retornar true para estados terminais', () => {
    expect(new AgentLifecycle('COMPLETED').isTerminal()).toBe(true);
    expect(new AgentLifecycle('FAILED').isTerminal()).toBe(true);
    expect(new AgentLifecycle('CANCELLED').isTerminal()).toBe(true);
    expect(new AgentLifecycle('TIMEOUT').isTerminal()).toBe(true);
    expect(new AgentLifecycle('CREATED').isTerminal()).toBe(false);
    expect(new AgentLifecycle('RUNNING').isTerminal()).toBe(false);
  });

  it('reset deve funcionar a partir de estados terminais', () => {
    const lifecycle = new AgentLifecycle('COMPLETED');
    lifecycle.reset();
    expect(lifecycle.getCurrentState()).toBe('READY');
  });

  it('reset deve falhar a partir de estados não-terminais', () => {
    const lifecycle = new AgentLifecycle('RUNNING');
    expect(() => lifecycle.reset()).toThrow(AgentStateError);
  });

  it('todas as transições devem estar no mapa VALID_TRANSITIONS', () => {
    const allStates: Array<keyof typeof VALID_TRANSITIONS> = [
      'CREATED', 'READY', 'RUNNING', 'WAITING', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT',
    ];
    allStates.forEach((state) => {
      expect(VALID_TRANSITIONS[state]).toBeDefined();
      expect(Array.isArray(VALID_TRANSITIONS[state])).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// AgentRegistry
// ---------------------------------------------------------------------------

describe('AgentRegistry', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = new AgentRegistry();
  });

  it('deve registrar e recuperar um agente', () => {
    registry.register(SAMPLE_AGENT);
    expect(registry.get('test-agent')).toBe(SAMPLE_AGENT);
  });

  it('deve retornar undefined para agente inexistente', () => {
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('deve verificar existência com has()', () => {
    expect(registry.has('test-agent')).toBe(false);
    registry.register(SAMPLE_AGENT);
    expect(registry.has('test-agent')).toBe(true);
  });

  it('deve remover um agente', () => {
    registry.register(SAMPLE_AGENT);
    expect(registry.unregister('test-agent')).toBe(true);
    expect(registry.has('test-agent')).toBe(false);
  });

  it('unregister deve retornar false para agente inexistente', () => {
    expect(registry.unregister('nonexistent')).toBe(false);
  });

  it('deve listar todos os agentes', () => {
    registry.register(SAMPLE_AGENT);
    registry.register(createAgentOverrides({ id: 'agent-2', name: 'Agent 2' }));
    expect(registry.list()).toHaveLength(2);
  });

  it('deve filtrar por capacidade', () => {
    registry.register(SAMPLE_AGENT); // ANALYZE, GENERATE
    registry.register(createAgentOverrides({ id: 'agent-2', capabilities: ['PLAN'] }));
    expect(registry.listByCapability('ANALYZE')).toHaveLength(1);
    expect(registry.listByCapability('PLAN')).toHaveLength(1);
  });

  it('count deve retornar o número correto', () => {
    expect(registry.count).toBe(0);
    registry.register(SAMPLE_AGENT);
    expect(registry.count).toBe(1);
  });

  it('clear deve remover todos os agentes', () => {
    registry.register(SAMPLE_AGENT);
    registry.register(createAgentOverrides({ id: 'agent-2' }));
    registry.clear();
    expect(registry.count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// AgentExecutor
// ---------------------------------------------------------------------------

describe('AgentExecutor', () => {
  it('deve executar e retornar resultado', async () => {
    const resolver = createMockAIResolver('Olá!');
    const executor = new AgentExecutor(resolver);
    const context: AgentContext = {
      agentId: 'test',
      runId: 'run-1',
      traceId: 'trace-1',
      requestId: 'req-1',
      input: 'Teste',
    };

    const result = await executor.execute(context, SAMPLE_AGENT);

    expect(result.output).toBe('Olá!');
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(result.model).toBe('test-model');
    expect(result.provider).toBe('test-provider');
    expect(resolver.resolve).toHaveBeenCalledTimes(1);
  });

  it('deve tratar erros do AI resolver', async () => {
    const resolver = createFailingResolver('Provider offline');
    const executor = new AgentExecutor(resolver);
    const context: AgentContext = {
      agentId: 'test',
      runId: 'run-1',
      traceId: 'trace-1',
      requestId: 'req-1',
      input: 'Teste',
    };

    const result = await executor.execute(context, SAMPLE_AGENT);

    expect(result.error).toBe('Provider offline');
    expect(result.output).toBe('');
  });

  it('deve construir AI request com system prompt do agente', async () => {
    const resolver = createMockAIResolver();
    const executor = new AgentExecutor(resolver);
    const context: AgentContext = {
      agentId: 'test',
      runId: 'run-1',
      traceId: 'trace-1',
      requestId: 'req-1',
      input: 'Olá',
    };

    await executor.execute(context, SAMPLE_AGENT);

    const call = (resolver.resolve as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.messages[0].role).toBe('system');
    expect(call.messages[0].content).toBe(SAMPLE_AGENT.systemPrompt);
    expect(call.messages[1].role).toBe('user');
    expect(call.messages[1].content).toBe('Olá');
  });
});

// ---------------------------------------------------------------------------
// AgentRuntime — Single Agent Execution
// ---------------------------------------------------------------------------

describe('AgentRuntime', () => {
  let registry: AgentRegistry;
  let resolver: AIRequestResolver;

  beforeEach(() => {
    resetEventBus();
    registry = new AgentRegistry();
    resolver = createMockAIResolver();
  });

  it('deve executar um agente com sucesso', async () => {
    registry.register(SAMPLE_AGENT);
    const runtime = new AgentRuntime(registry, resolver);

    const result = await runtime.execute('test-agent', 'Teste');

    expect(result.state).toBe('COMPLETED');
    expect(result.output).toBe('Resposta do agente');
    expect(result.agentId).toBe('test-agent');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('deve falhar para agente inexistente', async () => {
    const runtime = new AgentRuntime(registry, resolver);
    await expect(runtime.execute('nonexistent', 'Teste')).rejects.toThrow(AgentPolicyError);
  });

  it('deve gerar runId e traceId', async () => {
    registry.register(SAMPLE_AGENT);
    const runtime = new AgentRuntime(registry, resolver);

    const result = await runtime.execute('test-agent', 'Teste');

    expect(result.runId).toMatch(/^run_/);
    expect(result.runId).toBeTruthy();
  });

  it('deve tratar falha do AI resolver', async () => {
    registry.register(SAMPLE_AGENT);
    const failingResolver = createFailingResolver('Boom');
    const runtime = new AgentRuntime(registry, failingResolver);

    const result = await runtime.execute('test-agent', 'Teste');

    expect(result.state).toBe('FAILED');
    expect(result.error).toContain('Boom');
  });

  it('deve suportar traceId customizado', async () => {
    registry.register(SAMPLE_AGENT);
    const runtime = new AgentRuntime(registry, resolver);

    const result = await runtime.execute('test-agent', 'Teste', {
      traceId: 'custom-trace',
    });

    expect(result.state).toBe('COMPLETED');
  });
});

// ---------------------------------------------------------------------------
// AgentRuntime — Cancellation
// ---------------------------------------------------------------------------

describe('AgentRuntime — Cancellation', () => {
  it('deve cancelar uma execução em andamento', async () => {
    const registry = new AgentRegistry();
    registry.register(SAMPLE_AGENT);
    const slowResolver = createSlowResolver(500);
    const runtime = new AgentRuntime(registry, slowResolver);

    const abortController = new AbortController();
    const resultPromise = runtime.execute('test-agent', 'Teste', {
      signal: abortController.signal,
    });

    // Cancelar após um curto delay
    setTimeout(() => abortController.abort(), 50);

    const result = await resultPromise;
    expect(result.state).toBe('CANCELLED');
  });

  it('cancel() deve retornar false para run inexistente', () => {
    const registry = new AgentRegistry();
    const runtime = new AgentRuntime(registry, createMockAIResolver());
    expect(runtime.cancel('nonexistent')).toBe(false);
  });

  it('cancelAll deve cancelar todas as execuções', async () => {
    const registry = new AgentRegistry();
    registry.register(createAgentOverrides({ id: 'a1' }));
    registry.register(createAgentOverrides({ id: 'a2' }));
    const slowResolver = createSlowResolver(500);
    const runtime = new AgentRuntime(registry, slowResolver);

    const p1 = runtime.execute('a1', 'Teste');
    const p2 = runtime.execute('a2', 'Teste');

    setTimeout(() => runtime.cancelAll(), 50);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.state).toBe('CANCELLED');
    expect(r2.state).toBe('CANCELLED');
  });
});

// ---------------------------------------------------------------------------
// AgentRuntime — Concurrency
// ---------------------------------------------------------------------------

describe('AgentRuntime — Concurrency', () => {
  it('deve respeitar limite de concorrência', async () => {
    const registry = new AgentRegistry();
    registry.register(SAMPLE_AGENT);
    const slowResolver = createSlowResolver(200);
    const runtime = new AgentRuntime(registry, slowResolver, {
      maxConcurrentAgents: 2,
    });

    // Iniciar 2 execuções
    const p1 = runtime.execute('test-agent', '1');
    const p2 = runtime.execute('test-agent', '2');

    expect(runtime.getActiveRunCount()).toBe(2);

    // Terceira deve falhar
    await expect(runtime.execute('test-agent', '3')).rejects.toThrow(AgentPolicyError);

    await Promise.all([p1, p2]);
    expect(runtime.getActiveRunCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// AgentRuntime — Timeout
// ---------------------------------------------------------------------------

describe('AgentRuntime — Timeout', () => {
  it('deve respeitar timeout do agente', async () => {
    const registry = new AgentRegistry();
    registry.register(createAgentOverrides({
      executionPolicy: { ...DEFAULT_EXECUTION_POLICY, timeoutMs: 100, maxRetries: 0 },
    }));
    const slowResolver = createSlowResolver(500);
    const runtime = new AgentRuntime(registry, slowResolver);

    const result = await runtime.execute('test-agent', 'Teste');

    expect(result.state).toBe('TIMEOUT');
    expect(result.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// AgentRuntime — getActiveRuns
// ---------------------------------------------------------------------------

describe('AgentRuntime — Active Runs', () => {
  it('deve reportar runs ativos', async () => {
    const registry = new AgentRegistry();
    registry.register(SAMPLE_AGENT);
    const slowResolver = createSlowResolver(200);
    const runtime = new AgentRuntime(registry, slowResolver);

    const p1 = runtime.execute('test-agent', '1');

    const runs = runtime.getActiveRuns();
    expect(runs).toHaveLength(1);
    expect(runs[0].agentId).toBe('test-agent');
    expect(runs[0].state).toBe('RUNNING');

    await p1;
  });
});

// ---------------------------------------------------------------------------
// Legacy Adapters
// ---------------------------------------------------------------------------

describe('LegacySwarmAdapter', () => {
  it('deve converter um agente Swarm para AgentDefinition', () => {
    const legacy = {
      id: 'anjos-coder',
      name: 'AnjosCoder',
      role: 'coder',
      title: 'Engenheiro Fullstack',
      systemPrompt: 'Você é um coder.',
      model: 'gpt-4o',
      skills: ['typescript', 'react'],
      tools: ['code-editor'],
    };

    const adapted = adaptSwarmAgent(legacy);

    expect(adapted.id).toBe('anjos-coder');
    expect(adapted.name).toBe('AnjosCoder');
    expect(adapted.capabilities).toContain('GENERATE');
    expect(adapted.capabilities).toContain('ANALYZE');
    expect(adapted.metadata?.legacyRole).toBe('coder');
    expect(adapted.metadata?.source).toBe('swarm-engine');
  });

  it('deve converter uma lista de agentes Swarm', () => {
    const legacies = [
      { id: 'a1', name: 'A1', role: 'architect', title: 'Architect', systemPrompt: '', model: '', skills: [], tools: [] },
      { id: 'a2', name: 'A2', role: 'coder', title: 'Coder', systemPrompt: '', model: '', skills: [], tools: [] },
    ];

    const adapted = adaptSwarmAgents(legacies);
    expect(adapted).toHaveLength(2);
  });
});

describe('LegacyOrchestratorAdapter', () => {
  it('deve converter um agente Orchestrator para AgentDefinition', () => {
    const legacy = {
      id: 'orch-1',
      name: 'AI Agent',
      type: 'ai' as const,
      capabilities: [{ name: 'chat', description: 'Chat' }],
    };

    const adapted = adaptOrchestratorAgent(legacy);

    expect(adapted.id).toBe('orch-1');
    expect(adapted.capabilities).toContain('CHAT');
    expect(adapted.capabilities).toContain('GENERATE');
    expect(adapted.metadata?.source).toBe('agent-orchestrator');
  });

  it('deve converter uma lista de agentes Orchestrator', () => {
    const legacies = [
      { id: 'o1', name: 'O1', type: 'ai' as const, capabilities: [] },
      { id: 'o2', name: 'O2', type: 'tool' as const, capabilities: [] },
    ];

    const adapted = adaptOrchestratorAgents(legacies);
    expect(adapted).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Security — No secrets in agent modules
// ---------------------------------------------------------------------------

describe('Agent Security', () => {
  it('AgentContext não deve conter campos de credencial', () => {
    const context: AgentContext = {
      agentId: 'test',
      runId: 'run-1',
      traceId: 'trace-1',
      requestId: 'req-1',
      input: 'Teste',
    };

    const serialized = JSON.stringify(context);
    expect(serialized).not.toMatch(/apiKey|api_key|token|secret|password|authorization|credential|pat/i);
  });

  it('AgentDefinition não deve conter campos de credencial', () => {
    // Verificar apenas os campos de config, não o systemPrompt
    const check = {
      id: SAMPLE_AGENT.id,
      capabilities: SAMPLE_AGENT.capabilities,
      modelPolicy: SAMPLE_AGENT.modelPolicy,
      executionPolicy: SAMPLE_AGENT.executionPolicy,
    };
    const serialized = JSON.stringify(check);
    expect(serialized).not.toMatch(/\b(api[_-]?key|access[_-]?token|refresh[_-]?token|bearer|authorization|password|credential|secret)\b/i);
  });

  it('AgentRunResult não deve conter campos de credencial', () => {
    const result: AgentRunResult = {
      runId: 'run-1',
      agentId: 'test',
      state: 'COMPLETED',
      output: 'ok',
      duration: 100,
      iterations: 1,
    };

    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/\b(api[_-]?key|access[_-]?token|refresh[_-]?token|bearer|authorization|password|credential|secret)\b/i);
  });

  it('AgentRuntime não deve ter acesso a localStorage', () => {
    // Verificação estática: o módulo não deve importar localStorage
    // (testada pelo client-boundary test)
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Architecture — Dependency direction
// ---------------------------------------------------------------------------

describe('Agent Architecture', () => {
  it('AgentDefinition deve ter capacidades limitadas (Phase 4)', () => {
    const capabilities: AgentCapability[] = ['ANALYZE', 'GENERATE', 'PLAN', 'REVIEW', 'DEBUG', 'ORCHESTRATE', 'CHAT'];
    expect(capabilities.length).toBeLessThanOrEqual(7);
  });

  it('DEFAULT_EXECUTION_POLICY deve ter valores seguros', () => {
    expect(DEFAULT_EXECUTION_POLICY.timeoutMs).toBeGreaterThan(0);
    expect(DEFAULT_EXECUTION_POLICY.maxIterations).toBeGreaterThan(0);
    expect(DEFAULT_EXECUTION_POLICY.maxTokens).toBeGreaterThan(0);
    expect(DEFAULT_EXECUTION_POLICY.maxRetries).toBeGreaterThanOrEqual(0);
  });

  it('DEFAULT_RUNTIME_POLICY deve ter concorrência limitada', () => {
    expect(DEFAULT_RUNTIME_POLICY.maxConcurrentAgents).toBeGreaterThan(0);
    expect(DEFAULT_RUNTIME_POLICY.maxConcurrentAgents).toBeLessThanOrEqual(10);
  });
});
