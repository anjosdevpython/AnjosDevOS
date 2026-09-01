/**
 * Anthropic Provider Adapter
 * Adaptador para o formato de API da Anthropic (Claude).
 *
 * Camada: CORE/INFRASTRUCTURE boundary. Recebe dependências injetadas.
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

export interface AnthropicAdapterConfig {
  id: string;
  name: string;
  baseUrl: string;
  models: AIModel[];
  capabilities?: ProviderCapability[];
  apiKeyResolver: () => string;
  fetchFn?: typeof globalThis.fetch;
}

export class AnthropicAdapter implements AIProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: ProviderCapability[];

  private readonly baseUrl: string;
  private readonly models: AIModel[];
  private readonly apiKeyResolver: () => string;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(config: AnthropicAdapterConfig) {
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
      // Anthropic não tem endpoint de modelos; fazemos uma chamada leve
      const response = await this.fetchFn(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.models[0]?.id ?? 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
      const latencyMs = Date.now() - start;

      // 401 = key inválida, mas o endpoint existe
      if (response.status === 401) {
        return {
          id: this.id,
          name: this.name,
          available: false,
          capabilities: this.capabilities,
          latencyMs,
          error: 'API key inválida',
        };
      }

      return {
        id: this.id,
        name: this.name,
        available: response.ok || response.status === 400,
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

    const { system, messages } = toAnthropicFormat(request.messages);

    const body: Record<string, unknown> = {
      model,
      max_tokens: request.maxTokens ?? 4096,
      messages,
    };
    if (system) body.system = system;
    if (request.temperature !== undefined) body.temperature = request.temperature;

    const response = await this.fetchFn(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw toAIError(new Error(`Anthropic API Error ${response.status}: ${text}`), {
        provider: this.id,
        model,
      });
    }

    const data = (await response.json()) as AnthropicMessageResponse;

    return {
      id: data.id ?? `resp_${Date.now()}`,
      content: data.content?.[0]?.text ?? '',
      model,
      provider: this.id,
      finishReason: mapAnthropicStopReason(data.stop_reason),
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
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

    const { system, messages } = toAnthropicFormat(request.messages);

    const body: Record<string, unknown> = {
      model,
      max_tokens: request.maxTokens ?? 4096,
      messages,
      stream: true,
    };
    if (system) body.system = system;
    if (request.temperature !== undefined) body.temperature = request.temperature;

    const response = await this.fetchFn(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw toAIError(new Error(`Anthropic API Error ${response.status}: ${text}`), {
        provider: this.id,
        model,
      });
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6)) as AnthropicStreamEvent;

            if (data.type === 'content_block_delta' && data.delta?.text) {
              yield {
                content: data.delta.text,
                done: false,
              };
            } else if (data.type === 'message_start' && data.message?.id) {
              yield {
                id: data.message.id,
                content: '',
                model,
                done: false,
              };
            } else if (data.type === 'message_stop') {
              yield { content: '', done: true };
              return;
            }
          } catch {
            // Skip invalid JSON
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
// Helpers
// ---------------------------------------------------------------------------

interface AnthropicFormatResult {
  system?: string;
  messages: Array<{ role: string; content: string }>;
}

function toAnthropicFormat(messages: AIMessage[]): AnthropicFormatResult {
  let system = '';
  const filtered = messages.filter((m) => {
    if (m.role === 'system') {
      system = m.content;
      return false;
    }
    return true;
  });

  return {
    system: system || undefined,
    messages: filtered.map((m) => ({ role: m.role, content: m.content })),
  };
}

interface AnthropicMessageResponse {
  id?: string;
  content?: Array<{ text?: string }>;
  stop_reason?: string;
  usage?: { input_tokens: number; output_tokens: number };
}

interface AnthropicStreamEvent {
  type: string;
  message?: { id?: string };
  delta?: { text?: string };
}

function mapAnthropicStopReason(reason?: string): AIFinishReason {
  switch (reason) {
    case 'end_turn':
      return 'stop';
    case 'max_tokens':
      return 'length';
    case 'tool_use':
      return 'tool_call';
    default:
      return reason ? 'unknown' : 'stop';
  }
}
