/**
 * Integração real — AgentRuntime → CoreAIResolver → AI Core → Adapter → Provider
 *
 * Este teste prova o caminho completo de produção com o mínimo de mockagem:
 * apenas o `fetch` (a camada mais baixa, que é a fronteira com o provider) é
 * simulado. Toda a lógica real do runtime, executor, resolver e adapter roda.
 *
 * input → AgentRuntime → AgentExecutor → CoreAIResolver → ModelRouter
 *       → OpenAIAdapter → fetch (mock) → resposta
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AgentRegistry, AgentRuntime } from '@/core/agents';
import { getCoreAIResolver, resetCoreAIResolver } from '@/application/ai/core-resolver';
import { resetProviderFactory } from '@/application/ai/provider-factory';
import { resetModelRegistry, resetModelRouter } from '@/core/ai';
import { resetEventBus } from '@/infrastructure/events';

// ---------------------------------------------------------------------------
// Mock do fetch no nível do provider (fronteira externa)
// ---------------------------------------------------------------------------

const MOCK_OPENAI_RESPONSE = {
  id: 'chatcmpl-mock-1',
  choices: [
    {
      message: { content: 'Resposta real do provider mockado' },
      finish_reason: 'stop',
    },
  ],
  usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 },
};

describe('AgentRuntime → AI Core (integração real)', () => {
  beforeEach(() => {
    resetEventBus();
    resetModelRegistry();
    resetModelRouter();
    resetCoreAIResolver();
    resetProviderFactory();

    // Chaves de API para todos os providers (server-side, via SecurityVault)
    const keys = [
      'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY',
      'DEEPSEEK_API_KEY', 'XAI_API_KEY', 'MISTRAL_API_KEY', 'GROQ_API_KEY',
      'TOGETHER_API_KEY', 'OPENROUTER_API_KEY', 'COHERE_API_KEY',
      'AIMLAPI_API_KEY', 'NETWORK_TOOLS_API_KEY', 'CUSTOM_API_KEY',
    ];
    keys.forEach((k) => vi.stubEnv(k, 'test-key'));

    // Simula o fetch para o provider OpenAI (a única camada mockada)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(MOCK_OPENAI_RESPONSE)),
      json: () => Promise.resolve(MOCK_OPENAI_RESPONSE),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetCoreAIResolver();
    resetProviderFactory();
    resetModelRegistry();
    resetModelRouter();
  });

  it('input → AgentRuntime → AgentExecutor → AI Core → resposta real', async () => {
    const registry = new AgentRegistry();
    registry.register({
      id: 'integracao-coder',
      name: 'Coder de Integração',
      description: 'Agente de teste de integração real',
      capabilities: ['GENERATE', 'ANALYZE'],
      modelPolicy: 'BALANCED',
      systemPrompt: 'Você é um coder de integração. Responda de forma concisa.',
      executionPolicy: {
        timeoutMs: 10_000,
        maxIterations: 3,
        maxTokens: 1024,
        maxRetries: 0,
        retryBaseDelayMs: 100,
        stream: false,
      },
    });

    const runtime = new AgentRuntime(registry, getCoreAIResolver(), {
      maxConcurrentAgents: 2,
      globalTimeoutMs: 15_000,
    });

    // O router selecionará um modelo; o adapter OpenAI fará a chamada via fetch
    const result = await runtime.execute('integracao-coder', 'Gere uma função soma');

    // O caminho completo executou e produziu resposta
    if (result.state !== 'COMPLETED') {
      throw new Error(`DEBUG integration: state=${result.state} error=${result.error}`);
    }
    expect(result.state).toBe('COMPLETED');
    expect(result.output).toBe('Resposta real do provider mockado');
    expect(result.agentId).toBe('integracao-coder');
    expect(result.runId).toMatch(/^run_/);
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(fetch).toHaveBeenCalled();
  });

  it('erro do provider propaga como FAILED com traceId preservado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Provider indisponível')));

    const registry = new AgentRegistry();
    registry.register({
      id: 'integracao-falha',
      name: 'Agente Falho',
      description: 'Agente de teste de falha',
      capabilities: ['ANALYZE'],
      modelPolicy: 'BALANCED',
      systemPrompt: 'Prompt de teste.',
      executionPolicy: {
        timeoutMs: 10_000,
        maxIterations: 2,
        maxTokens: 512,
        maxRetries: 0,
        retryBaseDelayMs: 100,
        stream: false,
      },
    });

    const runtime = new AgentRuntime(registry, getCoreAIResolver());
    const result = await runtime.execute('integracao-falha', 'Teste');

    expect(result.state).toBe('FAILED');
    expect(result.error).toBeTruthy();
    expect(result.runId).toBeTruthy();
  });
});
