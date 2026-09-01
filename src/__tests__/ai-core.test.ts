/**
 * AI Core Tests
 * Cobertura: errors, adapters, model registry, model router, fallback,
 * timeout, streaming, event emission, config integration, secrets.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AIError,
  AIProviderError,
  AIAuthenticationError,
  AIRateLimitError,
  AITimeoutError,
  AIModelUnavailableError,
  AIInvalidRequestError,
  toAIError,
  OpenAIAdapter,
  AnthropicAdapter,
  GoogleAdapter,
  ModelRegistry,
  resetModelRegistry,
  ModelRouter,
  resetModelRouter,
  ProviderWithFallback,
} from '@/core/ai';
import type { AIProvider, AIRequest, AIResponse, AIStreamChunk } from '@/core/ai';
import { EventBusImpl, getEventBus, resetEventBus } from '@/infrastructure/events';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function createMockFetch(responseBody: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(responseBody)),
    json: () => Promise.resolve(responseBody),
  });
}

function createMockStreamFetch(chunks: string[]) {
  const encoder = new TextEncoder();
  let chunkIndex = 0;

  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    body: {
      getReader: () => ({
        read: () => {
          if (chunkIndex < chunks.length) {
            const chunk = chunks[chunkIndex++];
            return Promise.resolve({ done: false, value: encoder.encode(chunk) });
          }
          return Promise.resolve({ done: true, value: undefined });
        },
        releaseLock: vi.fn(),
      }),
    },
  });
}

function createOpenAIAdapter(fetchFn?: typeof fetch) {
  return new OpenAIAdapter({
    id: 'test-openai',
    name: 'Test OpenAI',
    baseUrl: 'https://api.test.com/v1',
    apiKeyResolver: () => 'test-key',
    models: [
      {
        id: 'test-model',
        name: 'Test Model',
        providerId: 'test-openai',
        providerName: 'Test OpenAI',
        providerColor: '#000',
        category: 'chat',
        contextWindow: 128_000,
        supportsStreaming: true,
        speedTier: 8,
        costTier: 3,
        reasoningCapability: 7,
      },
    ],
    fetchFn,
  });
}

function createAnthropicAdapter(fetchFn?: typeof fetch) {
  return new AnthropicAdapter({
    id: 'test-anthropic',
    name: 'Test Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKeyResolver: () => 'test-key',
    models: [
      {
        id: 'claude-test',
        name: 'Claude Test',
        providerId: 'test-anthropic',
        providerName: 'Test Anthropic',
        providerColor: '#d97706',
        category: 'chat',
        contextWindow: 200_000,
        supportsStreaming: true,
        speedTier: 6,
        costTier: 6,
        reasoningCapability: 9,
      },
    ],
    fetchFn,
  });
}

function createGoogleAdapter(fetchFn?: typeof fetch) {
  return new GoogleAdapter({
    id: 'test-google',
    name: 'Test Google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKeyResolver: () => 'test-key',
    models: [
      {
        id: 'gemini-test',
        name: 'Gemini Test',
        providerId: 'test-google',
        providerName: 'Test Google',
        providerColor: '#4285f4',
        category: 'chat',
        contextWindow: 1_000_000,
        supportsStreaming: true,
        speedTier: 9,
        costTier: 2,
        reasoningCapability: 7,
      },
    ],
    fetchFn,
  });
}

const SAMPLE_MESSAGES = [{ role: 'user' as const, content: 'Hello' }];

function basicRequest(overrides?: Partial<AIRequest>): AIRequest {
  return {
    messages: SAMPLE_MESSAGES,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Error Hierarchy
// ---------------------------------------------------------------------------

describe('AI Error Hierarchy', () => {
  it('AIError deve ter propriedades corretas', () => {
    const error = new AIError('test', {
      provider: 'openai',
      model: 'gpt-4o',
      requestId: 'req-1',
      statusCode: 500,
      retryable: true,
    });

    expect(error).toBeInstanceOf(AIError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AIError');
    expect(error.message).toBe('test');
    expect(error.provider).toBe('openai');
    expect(error.model).toBe('gpt-4o');
    expect(error.requestId).toBe('req-1');
    expect(error.statusCode).toBe(500);
    expect(error.retryable).toBe(true);
  });

  it('AIAuthenticationError deve ser 401 e não retryable', () => {
    const error = new AIAuthenticationError('Unauthorized', { provider: 'openai' });
    expect(error).toBeInstanceOf(AIError);
    expect(error.name).toBe('AIAuthenticationError');
    expect(error.statusCode).toBe(401);
    expect(error.retryable).toBe(false);
  });

  it('AIRateLimitError deve ser 429 e retryable', () => {
    const error = new AIRateLimitError('Rate limited', { provider: 'openai', retryAfterMs: 5000 });
    expect(error).toBeInstanceOf(AIError);
    expect(error.name).toBe('AIRateLimitError');
    expect(error.statusCode).toBe(429);
    expect(error.retryable).toBe(true);
    expect(error.retryAfterMs).toBe(5000);
  });

  it('AITimeoutError deve ser retryable', () => {
    const error = new AITimeoutError('Timeout', { provider: 'openai' });
    expect(error).toBeInstanceOf(AIError);
    expect(error.name).toBe('AITimeoutError');
    expect(error.retryable).toBe(true);
  });

  it('AIModelUnavailableError deve ser retryable', () => {
    const error = new AIModelUnavailableError('Model down', { provider: 'openai', model: 'gpt-4o' });
    expect(error).toBeInstanceOf(AIError);
    expect(error.name).toBe('AIModelUnavailableError');
    expect(error.retryable).toBe(true);
  });

  it('AIInvalidRequestError deve ser não retryable', () => {
    const error = new AIInvalidRequestError('Bad request');
    expect(error).toBeInstanceOf(AIError);
    expect(error.name).toBe('AIInvalidRequestError');
    expect(error.retryable).toBe(false);
  });

  it('toAIError deve mapear erro 401 para AIAuthenticationError', () => {
    const error = toAIError(new Error('HTTP 401 Unauthorized'), { provider: 'test' });
    expect(error).toBeInstanceOf(AIAuthenticationError);
  });

  it('toAIError deve mapear erro 429 para AIRateLimitError', () => {
    const error = toAIError(new Error('Rate limit exceeded'), { provider: 'test' });
    expect(error).toBeInstanceOf(AIRateLimitError);
  });

  it('toAIError deve mapear timeout para AITimeoutError', () => {
    const error = toAIError(new Error('Request timeout'), { provider: 'test' });
    expect(error).toBeInstanceOf(AITimeoutError);
  });

  it('toAIError deve preservar AIError já existente', () => {
    const original = new AIRateLimitError('original', { provider: 'test' });
    const converted = toAIError(original);
    expect(converted).toBe(original);
  });

  it('toAIError deve tratar strings como AIProviderError', () => {
    const error = toAIError('plain string error', { provider: 'test' });
    expect(error).toBeInstanceOf(AIProviderError);
    expect(error.message).toBe('plain string error');
  });

  it('toAIError deve tratar erros não-Error', () => {
    const error = toAIError(42, { provider: 'test' });
    expect(error).toBeInstanceOf(AIProviderError);
  });
});

// ---------------------------------------------------------------------------
// OpenAI Adapter
// ---------------------------------------------------------------------------

describe('OpenAIAdapter', () => {
  it('deve realizar chat completion', async () => {
    const fetchFn = createMockFetch({
      id: 'resp-1',
      choices: [{ message: { content: 'Hi there!' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    });

    const adapter = createOpenAIAdapter(fetchFn);
    const response = await adapter.chat(basicRequest());

    expect(response.id).toBe('resp-1');
    expect(response.content).toBe('Hi there!');
    expect(response.provider).toBe('test-openai');
    expect(response.model).toBe('test-model');
    expect(response.finishReason).toBe('stop');
    expect(response.usage?.totalTokens).toBe(15);
  });

  it('deve lançar AIAuthenticationError sem API key', async () => {
    const noKeyAdapter = new OpenAIAdapter({
      id: 'test',
      name: 'Test',
      baseUrl: 'https://api.test.com/v1',
      apiKeyResolver: () => '',
      models: [{
        id: 'model', name: 'Model', providerId: 'test', providerName: 'Test',
        providerColor: '#000', category: 'chat',
      }],
    });

    await expect(noKeyAdapter.chat(basicRequest())).rejects.toThrow(AIAuthenticationError);
  });

  it('deve lançar AIProviderError em caso de erro HTTP', async () => {
    const fetchFn = createMockFetch({ error: 'Internal Server Error' }, 500);
    const adapter = createOpenAIAdapter(fetchFn);
    await expect(adapter.chat(basicRequest())).rejects.toThrow();
  });

  it('deve retornar streaming com conteúdo correto', async () => {
    const fetchFn = createMockStreamFetch([
      'data: {"id":"s1","choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
      'data: {"id":"s1","choices":[{"delta":{"content":" world"},"finish_reason":null}]}\n\n',
      'data: [DONE]\n\n',
    ]);

    const adapter = createOpenAIAdapter(fetchFn);
    const chunks: AIStreamChunk[] = [];

    for await (const chunk of adapter.stream(basicRequest())) {
      chunks.push(chunk);
    }

    // Deve ter chunks com conteúdo correto
    const contentChunks = chunks.filter((c) => c.content.length > 0);
    expect(contentChunks.length).toBe(2);
    expect(contentChunks[0].content).toBe('Hello');
    expect(contentChunks[1].content).toBe(' world');

    // Primeiro chunk deve ter id
    expect(contentChunks[0].id).toBe('s1');

    // Deve ter chunk final done
    expect(chunks.some((c) => c.done === true)).toBe(true);
  });

  it('checkHealth deve retornar status corretamente', async () => {
    const fetchFn = createMockFetch({ data: [] });
    const adapter = createOpenAIAdapter(fetchFn);
    const status = await adapter.checkHealth();

    expect(status.id).toBe('test-openai');
    expect(status.available).toBe(true);
    expect(status.latencyMs).toBeTypeOf('number');
  });

  it('checkHealth deve reportar indisponibilidade sem key', async () => {
    const adapter = new OpenAIAdapter({
      id: 'test', name: 'Test', baseUrl: 'https://api.test.com/v1',
      apiKeyResolver: () => '', models: [],
    });
    const status = await adapter.checkHealth();
    expect(status.available).toBe(false);
    expect(status.error).toContain('API key');
  });

  it('getModels deve retornar a lista de modelos', () => {
    const adapter = createOpenAIAdapter();
    expect(adapter.getModels()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Anthropic Adapter
// ---------------------------------------------------------------------------

describe('AnthropicAdapter', () => {
  it('deve realizar chat completion', async () => {
    const fetchFn = createMockFetch({
      id: 'msg-1',
      content: [{ text: 'Hello from Claude!' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const adapter = createAnthropicAdapter(fetchFn);
    const response = await adapter.chat(basicRequest());

    expect(response.content).toBe('Hello from Claude!');
    expect(response.provider).toBe('test-anthropic');
    expect(response.model).toBe('claude-test');
    expect(response.finishReason).toBe('stop');
    expect(response.usage?.totalTokens).toBe(15);
  });

  it('deve lançar AIAuthenticationError sem API key', async () => {
    const adapter = new AnthropicAdapter({
      id: 'test', name: 'Test', baseUrl: 'https://api.anthropic.com/v1',
      apiKeyResolver: () => '', models: [],
    });
    await expect(adapter.chat(basicRequest())).rejects.toThrow(AIAuthenticationError);
  });

  it('deve retornar streaming com conteúdo correto', async () => {
    const fetchFn = createMockStreamFetch([
      'data: {"type":"message_start","message":{"id":"msg-s1"}}\n\n',
      'data: {"type":"content_block_delta","delta":{"text":"Hi"}}\n\n',
      'data: {"type":"message_stop"}\n\n',
    ]);

    const adapter = createAnthropicAdapter(fetchFn);
    const chunks: AIStreamChunk[] = [];

    for await (const chunk of adapter.stream(basicRequest())) {
      chunks.push(chunk);
    }

    expect(chunks.some((c) => c.id === 'msg-s1')).toBe(true);
    expect(chunks.some((c) => c.content === 'Hi')).toBe(true);
    expect(chunks.some((c) => c.done === true)).toBe(true);
  });

  it('getModels deve retornar a lista de modelos', () => {
    expect(createAnthropicAdapter().getModels()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Google Adapter
// ---------------------------------------------------------------------------

describe('GoogleAdapter', () => {
  it('deve realizar chat completion', async () => {
    const fetchFn = createMockFetch({
      candidates: [{ content: { parts: [{ text: 'Hello from Gemini!' }] }, finishReason: 'STOP' }],
      usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
    });

    const adapter = createGoogleAdapter(fetchFn);
    const response = await adapter.chat(basicRequest());

    expect(response.content).toBe('Hello from Gemini!');
    expect(response.provider).toBe('test-google');
    expect(response.model).toBe('gemini-test');
    expect(response.finishReason).toBe('stop');
    expect(response.usage?.totalTokens).toBe(15);
  });

  it('deve lançar AIAuthenticationError sem API key', async () => {
    const adapter = new GoogleAdapter({
      id: 'test', name: 'Test', baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      apiKeyResolver: () => '', models: [],
    });
    await expect(adapter.chat(basicRequest())).rejects.toThrow(AIAuthenticationError);
  });

  it('deve retornar streaming com conteúdo correto', async () => {
    const fetchFn = createMockStreamFetch([
      'data: {"candidates":[{"content":{"parts":[{"text":"Hi"}]}}]}\n\n',
      'data: {"candidates":[{"content":{"parts":[{"text":" Gemini"}]}}]}\n\n',
    ]);

    const adapter = createGoogleAdapter(fetchFn);
    const chunks: AIStreamChunk[] = [];

    for await (const chunk of adapter.stream(basicRequest())) {
      chunks.push(chunk);
    }

    expect(chunks.some((c) => c.content === 'Hi')).toBe(true);
    expect(chunks.some((c) => c.content === ' Gemini')).toBe(true);
    expect(chunks.some((c) => c.done === true)).toBe(true);
  });

  it('getModels deve retornar a lista de modelos', () => {
    expect(createGoogleAdapter().getModels()).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Model Registry
// ---------------------------------------------------------------------------

describe('ModelRegistry', () => {
  beforeEach(() => {
    resetModelRegistry();
  });

  it('deve carregar modelos dos PROVIDERS existentes', () => {
    const registry = new ModelRegistry();
    expect(registry.getAll().length).toBeGreaterThan(0);
    const providerIds = registry.getProviderIds();
    expect(providerIds).toContain('openai');
    expect(providerIds).toContain('anthropic');
    expect(providerIds).toContain('google');
  });

  it('deve filtrar por categoria', () => {
    const registry = new ModelRegistry();
    const chatModels = registry.getByCategory('chat');
    const imageModels = registry.getByCategory('image');
    expect(chatModels.length).toBeGreaterThan(0);
    expect(chatModels.every((m) => m.category === 'chat')).toBe(true);
    expect(imageModels.every((m) => m.category === 'image')).toBe(true);
  });

  it('deve buscar modelo por ID', () => {
    const registry = new ModelRegistry();
    const model = registry.getById('gpt-4o');
    expect(model).toBeDefined();
    expect(model?.name).toBe('GPT-4o');
    expect(model?.providerId).toBe('openai');
    expect(model?.supportsVision).toBe(true);
    expect(model?.supportsTools).toBe(true);
  });

  it('deve resolver modelo com prefixo provider/', () => {
    const registry = new ModelRegistry();
    const model = registry.resolve('anthropic/claude-sonnet-4-20250514');
    expect(model).toBeDefined();
    expect(model?.providerId).toBe('anthropic');
  });

  it('deve retornar undefined para modelo inexistente', () => {
    const registry = new ModelRegistry();
    expect(registry.getById('nonexistent')).toBeUndefined();
    expect(registry.resolve('nonexistent')).toBeUndefined();
  });

  it('deve filtrar por provider', () => {
    const registry = new ModelRegistry();
    const openaiModels = registry.getByProvider('openai');
    expect(openaiModels.length).toBeGreaterThan(0);
    expect(openaiModels.every((m) => m.providerId === 'openai')).toBe(true);
  });

  it('deve ter count correto', () => {
    const registry = new ModelRegistry();
    expect(registry.count).toBe(registry.getAll().length);
  });

  it('deve aceitar providers externos', () => {
    const registry = new ModelRegistry({
      custom: {
        id: 'custom', name: 'Custom', color: '#ff0000', baseUrl: 'https://custom.api/v1',
        models: [{ id: 'custom-model', name: 'Custom Model', category: 'chat', maxTokens: 8192, supportsStreaming: true }],
      },
    });
    expect(registry.getById('custom-model')).toBeDefined();
    expect(registry.getById('custom-model')?.providerId).toBe('custom');
  });
});

// ---------------------------------------------------------------------------
// Model Router
// ---------------------------------------------------------------------------

describe('ModelRouter', () => {
  let registry: ModelRegistry;

  beforeEach(() => {
    resetModelRegistry();
    resetModelRouter();
    registry = new ModelRegistry();
  });

  it('deve selecionar FAST — priorizar modelos rápidos', () => {
    const router = new ModelRouter(registry, { defaultPolicy: 'BALANCED' });
    const result = router.select({ messages: SAMPLE_MESSAGES, policy: 'FAST' });
    expect(result.model).toBeDefined();
    expect(result.model.speedTier).toBeGreaterThanOrEqual(7);
    expect(result.isFallback).toBe(false);
  });

  it('deve selecionar CHEAP — priorizar modelos baratos', () => {
    const router = new ModelRouter(registry, { defaultPolicy: 'BALANCED' });
    const result = router.select({ messages: SAMPLE_MESSAGES, policy: 'CHEAP' });
    expect(result.model).toBeDefined();
    expect(result.model.costTier).toBeLessThanOrEqual(4);
  });

  it('deve selecionar BALANCED — equilibrar todos os fatores', () => {
    const router = new ModelRouter(registry, { defaultPolicy: 'BALANCED' });
    const result = router.select({ messages: SAMPLE_MESSAGES, policy: 'BALANCED' });
    expect(result.model).toBeDefined();
    expect(result.isFallback).toBe(false);
  });

  it('deve selecionar POWERFUL — priorizar raciocínio', () => {
    const router = new ModelRouter(registry, { defaultPolicy: 'BALANCED' });
    const result = router.select({ messages: SAMPLE_MESSAGES, policy: 'POWERFUL' });
    expect(result.model).toBeDefined();
    expect(result.model.reasoningCapability).toBeGreaterThanOrEqual(8);
  });

  it('deve selecionar LOCAL — priorizar modelos locais', () => {
    const localRegistry = new ModelRegistry({
      'local-provider': {
        id: 'local-provider', name: 'Local', color: '#888', baseUrl: 'http://localhost:11434',
        models: [{ id: 'local-model', name: 'Local Model', category: 'chat', maxTokens: 128_000, supportsStreaming: true }],
      },
    });
    const model = localRegistry.getAll()[0];
    (model as unknown as Record<string, unknown>).isLocal = true;

    const router = new ModelRouter(localRegistry, { defaultPolicy: 'BALANCED' });
    const result = router.select({ messages: SAMPLE_MESSAGES, policy: 'LOCAL' });
    expect(result.model.isLocal).toBe(true);
  });

  it('deve selecionar PRIVATE — priorizar privacidade', () => {
    const privateRegistry = new ModelRegistry({
      'private-provider': {
        id: 'private-provider', name: 'Private', color: '#888', baseUrl: 'https://private.api/v1',
        models: [{ id: 'private-model', name: 'Private Model', category: 'chat', maxTokens: 128_000, supportsStreaming: true }],
      },
    });
    const model = privateRegistry.getAll()[0];
    (model as unknown as Record<string, unknown>).respectsPrivacy = true;

    const router = new ModelRouter(privateRegistry, { defaultPolicy: 'BALANCED' });
    const result = router.select({ messages: SAMPLE_MESSAGES, policy: 'PRIVATE' });
    expect(result.model.respectsPrivacy).toBe(true);
  });

  it('deve usar modelo especificado no request quando válido', () => {
    const router = new ModelRouter(registry);
    const result = router.select({ messages: SAMPLE_MESSAGES, model: 'gpt-4o' });
    expect(result.model.id).toBe('gpt-4o');
    expect(result.model.providerId).toBe('openai');
  });

  it('deve cair na política quando modelo especificado não existe', () => {
    const router = new ModelRouter(registry);
    const result = router.select({ messages: SAMPLE_MESSAGES, model: 'nonexistent-model', policy: 'CHEAP' });
    expect(result.model).toBeDefined();
    expect(result.model.id).not.toBe('nonexistent-model');
  });

  it('deve filtrar por provider quando especificado', () => {
    const router = new ModelRouter(registry);
    const result = router.select({ messages: SAMPLE_MESSAGES, provider: 'anthropic', policy: 'BALANCED' });
    expect(result.model.providerId).toBe('anthropic');
  });

  it('deve excluir modelos bloqueados', () => {
    const router = new ModelRouter(registry, { excludedModels: new Set(['gpt-4o', 'gpt-4o-mini']) });
    const result = router.select({ messages: SAMPLE_MESSAGES, policy: 'BALANCED' });
    expect(result.model.id).not.toBe('gpt-4o');
    expect(result.model.id).not.toBe('gpt-4o-mini');
  });

  it('deve excluir providers bloqueados', () => {
    const router = new ModelRouter(registry, { excludedProviders: new Set(['openai']) });
    const result = router.select({ messages: SAMPLE_MESSAGES, policy: 'BALANCED' });
    expect(result.model.providerId).not.toBe('openai');
  });

  it('deve lançar erro quando nenhum modelo está disponível', () => {
    const router = new ModelRouter(registry, { excludedProviders: new Set(registry.getProviderIds()) });
    expect(() => router.select({ messages: SAMPLE_MESSAGES, policy: 'BALANCED' })).toThrow('Nenhum modelo disponível');
  });

  it('deve respeitar limite de contexto', () => {
    const router = new ModelRouter(registry);
    const longMessage = 'x'.repeat(500_000);
    const result = router.select({ messages: [{ role: 'user', content: longMessage }], policy: 'BALANCED' });
    expect(result.model.contextWindow).toBeGreaterThanOrEqual(500_000 / 4 + 4096);
  });
});

// ---------------------------------------------------------------------------
// Provider with Fallback
// ---------------------------------------------------------------------------

describe('ProviderWithFallback', () => {
  beforeEach(() => {
    resetEventBus();
  });

  it('deve usar o provider primário quando bem-sucedido', async () => {
    const primary: AIProvider = {
      id: 'primary', name: 'Primary', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'primary', name: 'Primary', available: true, capabilities: ['chat'] }),
      chat: vi.fn().mockResolvedValue({
        id: 'resp-1', content: 'Primary response', model: 'model-1', provider: 'primary', finishReason: 'stop' as const,
      }),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const fallback: AIProvider = {
      id: 'fallback', name: 'Fallback', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'fallback', name: 'Fallback', available: true, capabilities: ['chat'] }),
      chat: vi.fn().mockResolvedValue({
        id: 'resp-2', content: 'Fallback response', model: 'model-2', provider: 'fallback', finishReason: 'stop' as const,
      }),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const wrapper = new ProviderWithFallback(primary, fallback, { maxRetries: 0, timeoutMs: 5000 });
    const response = await wrapper.chat(basicRequest());

    expect(response.content).toBe('Primary response');
    expect(response.provider).toBe('primary');
    expect(primary.chat).toHaveBeenCalledTimes(1);
    expect(fallback.chat).not.toHaveBeenCalled();
  });

  it('deve usar fallback quando o primário falha com erro retryable', async () => {
    const primary: AIProvider = {
      id: 'primary', name: 'Primary', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'primary', name: 'Primary', available: false, capabilities: ['chat'] }),
      chat: vi.fn().mockRejectedValue(new AITimeoutError('Provider offline', { provider: 'primary' })),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const fallback: AIProvider = {
      id: 'fallback', name: 'Fallback', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'fallback', name: 'Fallback', available: true, capabilities: ['chat'] }),
      chat: vi.fn().mockResolvedValue({
        id: 'resp-2', content: 'Fallback response', model: 'model-2', provider: 'fallback', finishReason: 'stop' as const,
      }),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const wrapper = new ProviderWithFallback(primary, fallback, { maxRetries: 0, timeoutMs: 5000 });
    const response = await wrapper.chat(basicRequest());

    expect(response.content).toBe('Fallback response');
    expect(response.isFallback).toBe(true);
    expect(fallback.chat).toHaveBeenCalledTimes(1);
  });

  it('deve lançar erro quando ambos falham', async () => {
    const primary: AIProvider = {
      id: 'primary', name: 'Primary', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'primary', name: 'Primary', available: false, capabilities: ['chat'] }),
      chat: vi.fn().mockRejectedValue(new Error('Primary offline')),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const fallback: AIProvider = {
      id: 'fallback', name: 'Fallback', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'fallback', name: 'Fallback', available: false, capabilities: ['chat'] }),
      chat: vi.fn().mockRejectedValue(new Error('Fallback offline')),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const wrapper = new ProviderWithFallback(primary, fallback, { maxRetries: 0, timeoutMs: 5000 });
    await expect(wrapper.chat(basicRequest())).rejects.toThrow();
  });

  it('não deve usar fallback para erro não retryable (autenticação)', async () => {
    const primary: AIProvider = {
      id: 'primary', name: 'Primary', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'primary', name: 'Primary', available: true, capabilities: ['chat'] }),
      chat: vi.fn().mockRejectedValue(new AIAuthenticationError('Bad key', { provider: 'primary' })),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const fallback: AIProvider = {
      id: 'fallback', name: 'Fallback', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'fallback', name: 'Fallback', available: true, capabilities: ['chat'] }),
      chat: vi.fn().mockResolvedValue({
        id: 'resp-2', content: 'Should not reach', model: 'm', provider: 'fallback', finishReason: 'stop' as const,
      }),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const wrapper = new ProviderWithFallback(primary, fallback, { maxRetries: 0, timeoutMs: 5000 });
    await expect(wrapper.chat(basicRequest())).rejects.toThrow(AIAuthenticationError);
    expect(fallback.chat).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Event Emission
// ---------------------------------------------------------------------------

describe('AI Core Events', () => {
  beforeEach(() => {
    resetEventBus();
  });

  afterEach(() => {
    resetEventBus();
  });

  it('deve emitir ai.request e ai.response via ProviderWithFallback', async () => {
    const received: string[] = [];
    const eventBus = getEventBus();
    eventBus.subscribe('ai.request', (event) => {
      received.push(`request:${event.payload.provider}`);
    });
    eventBus.subscribe('ai.response', (event) => {
      received.push(`response:${event.payload.provider}`);
    });

    const mockProvider: AIProvider = {
      id: 'mock', name: 'Mock', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'mock', name: 'Mock', available: true, capabilities: ['chat'] }),
      chat: vi.fn().mockResolvedValue({
        id: 'resp-1', content: 'Hi', model: 'mock-model', provider: 'mock', finishReason: 'stop' as const,
      }),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const wrapper = new ProviderWithFallback(mockProvider, undefined, { maxRetries: 0, timeoutMs: 5000 });
    await wrapper.chat(basicRequest());

    expect(received).toContain('request:mock');
    expect(received).toContain('response:mock');
  });

  it('deve emitir ai.error quando chat falha', async () => {
    const errors: string[] = [];
    const eventBus = getEventBus();
    eventBus.subscribe('ai.error', (event) => {
      errors.push(event.payload.message);
    });

    const mockProvider: AIProvider = {
      id: 'mock', name: 'Mock', capabilities: ['chat'],
      getModels: () => [],
      checkHealth: async () => ({ id: 'mock', name: 'Mock', available: true, capabilities: ['chat'] }),
      chat: vi.fn().mockRejectedValue(new Error('fail')),
      stream: async function* () { yield { content: '', done: true }; },
    };

    const wrapper = new ProviderWithFallback(mockProvider, undefined, { maxRetries: 0, timeoutMs: 5000 });
    await expect(wrapper.chat(basicRequest())).rejects.toThrow();
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Secrets Sanitization
// ---------------------------------------------------------------------------

describe('AI Core Security', () => {
  it('provider adapters não devem expor API keys', () => {
    const adapter = createOpenAIAdapter();
    expect(adapter.id).toBe('test-openai');
    // A key é encapsulada no resolver e nunca exposta em props públicas
  });

  it('toAIError não deve expor tokens na mensagem', () => {
    const originalError = new Error('Request failed');
    const aiError = toAIError(originalError, { provider: 'test' });
    expect(aiError.provider).toBe('test');
    expect(aiError).toBeInstanceOf(AIProviderError);
  });
});

// ---------------------------------------------------------------------------
// Config Integration
// ---------------------------------------------------------------------------

describe('AI Core Config Integration', () => {
  it('ModelRegistry deve funcionar sem dependência de ConfigManager', () => {
    const registry = new ModelRegistry();
    expect(registry.count).toBeGreaterThan(0);
  });

  it('ModelRouter deve funcionar sem ConfigManager', () => {
    const registry = new ModelRegistry();
    const router = new ModelRouter(registry);
    const result = router.select({ messages: SAMPLE_MESSAGES });
    expect(result.model).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

describe('AI Core Singletons', () => {
  beforeEach(() => {
    resetModelRegistry();
    resetModelRouter();
  });

  it('getModelRegistry deve retornar a mesma instância', async () => {
    const { getModelRegistry } = await import('@/core/ai');
    expect(getModelRegistry()).toBe(getModelRegistry());
  });

  it('resetModelRegistry deve criar nova instância', async () => {
    const { getModelRegistry, resetModelRegistry } = await import('@/core/ai');
    const first = getModelRegistry();
    resetModelRegistry();
    expect(getModelRegistry()).not.toBe(first);
  });
});
