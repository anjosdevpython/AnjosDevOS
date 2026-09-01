/**
 * OpenAI-Compatible Provider Adapter
 * Adaptador para provedores que usam formato OpenAI (a maioria).
 *
 * Provedores cobertos: OpenAI, DeepSeek, xAI, Mistral, Groq, Together,
 * OpenRouter, Cohere, AIML API, NetworkTools.
 *
 * Camada: CORE/INFRASTRUCTURE boundary. Recebe dependências injetadas
 * (fetch, apiKeyResolver) para manter o Core testável sem browser.
 */

import type {
  AIModel,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIFinishReason,
  AIMessage,
  ProviderCapability,
  ProviderStatus,
} from '../../types';
import { toAIError, AIAuthenticationError } from '../../errors';
import type { AIProvider } from '../AIProvider';

// ---------------------------------------------------------------------------
// Configuração do Adapter
// ---------------------------------------------------------------------------

export interface OpenAIAdapterConfig {
  id: string;
  name: string;
  baseUrl: string;
  models: AIModel[];
  capabilities?: ProviderCapability[];
  /** Resolve a API key do provedor em runtime. */
  apiKeyResolver: () => string;
  /** Fetch function (injetável para testes). */
  fetchFn?: typeof globalThis.fetch;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export class OpenAIAdapter implements AIProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: ProviderCapability[];

  private readonly baseUrl: string;
  private readonly models: AIModel[];
  private readonly apiKeyResolver: () => string;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(config: OpenAIAdapterConfig) {
    this.id = config.id;
    this.name = config.name;
    this.baseUrl = config.baseUrl;
    this.models = config.models;
    this.apiKeyResolver = config.apiKeyResolver;
    this.fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);
    this.capabilities = config.capabilities ?? ['chat', 'stream'];
  }

  getModels(): AIModel[] {
    return this.models;
  }

  async checkHealth(): Promise<ProviderStatus> {
    const apiKey = this.apiKeyResolver();
    if (!apiKey) {
      return {
        id: this.id,
        name: this.name,
        available: false,
        capabilities: this.capabilities,
        error: 'API key não configurada',
      };
    }

    try {
      const start = Date.now();
      const response = await this.fetchFn(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const latencyMs = Date.now() - start;

      return {
        id: this.id,
        name: this.name,
        available: response.ok,
        capabilities: this.capabilities,
        latencyMs,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error: unknown) {
      return {
        id: this.id,
        name: this.name,
        available: false,
        capabilities: this.capabilities,
        error: error instanceof Error ? error.message : 'Falha de conexão',
      };
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const apiKey = this.apiKeyResolver();
    this.assertApiKey(apiKey);

    const model = request.model ?? this.models[0]?.id;
    if (!model) {
      throw new Error(`Nenhum modelo disponível para o provider ${this.id}`);
    }

    const body: Record<string, unknown> = {
      model,
      messages: toLegacyMessages(request.messages),
      stream: false,
    };
    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.maxTokens !== undefined) body.max_tokens = request.maxTokens;

    const response = await this.fetchFn(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw toAIError(new Error(`API Error ${response.status}: ${text}`), {
        provider: this.id,
        model,
      });
    }

    const data = (await response.json()) as OpenAIChatCompletionResponse;

    return {
      id: data.id ?? `resp_${Date.now()}`,
      content: data.choices?.[0]?.message?.content ?? '',
      model,
      provider: this.id,
      finishReason: mapFinishReason(data.choices?.[0]?.finish_reason),
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *stream(request: AIRequest): AsyncIterable<AIStreamChunk> {
    const apiKey = this.apiKeyResolver();
    this.assertApiKey(apiKey);

    const model = request.model ?? this.models[0]?.id;
    if (!model) {
      throw new Error(`Nenhum modelo disponível para o provider ${this.id}`);
    }

    const body: Record<string, unknown> = {
      model,
      messages: toLegacyMessages(request.messages),
      stream: true,
    };
    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.maxTokens !== undefined) body.max_tokens = request.maxTokens;

    const response = await this.fetchFn(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw toAIError(new Error(`API Error ${response.status}: ${text}`), {
        provider: this.id,
        model,
      });
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let yieldedFirst = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            yield { content: '', done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data) as OpenAIStreamResponse;
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              const isFirst = !yieldedFirst;
              yieldedFirst = true;
              yield {
                id: isFirst ? parsed.id : undefined,
                content: delta,
                model: isFirst ? model : undefined,
                done: false,
              };
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { content: '', done: true };
  }

  private assertApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new AIAuthenticationError(
        `API key não configurada para o provider ${this.id}. Vá em Configurações para adicionar.`,
        { provider: this.id }
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Legacy format conversion
// ---------------------------------------------------------------------------

type LegacyChatMessage = { role: string; content: string };

function toLegacyMessages(messages: AIMessage[]): LegacyChatMessage[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

// ---------------------------------------------------------------------------
// Response format types (for JSON parsing)
// ---------------------------------------------------------------------------

interface OpenAIChatCompletionResponse {
  id?: string;
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamResponse {
  id?: string;
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// Finish reason mapping
// ---------------------------------------------------------------------------

function mapFinishReason(reason?: string): AIFinishReason {
  switch (reason) {
    case 'stop':
      return 'stop';
    case 'length':
    case 'max_tokens':
      return 'length';
    case 'tool_calls':
      return 'tool_call';
    case 'content_filter':
      return 'content_filter';
    default:
      return reason ? 'unknown' : 'stop';
  }
}
