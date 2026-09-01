/**
 * Google Gemini Provider Adapter
 * Adaptador para o formato de API do Google Generative Language.
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

export interface GoogleAdapterConfig {
  id: string;
  name: string;
  baseUrl: string;
  models: AIModel[];
  capabilities?: ProviderCapability[];
  apiKeyResolver: () => string;
  fetchFn?: typeof globalThis.fetch;
}

export class GoogleAdapter implements AIProvider {
  readonly id: string;
  readonly name: string;
  readonly capabilities: ProviderCapability[];

  private readonly baseUrl: string;
  private readonly models: AIModel[];
  private readonly apiKeyResolver: () => string;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(config: GoogleAdapterConfig) {
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
      const modelId = this.models[0]?.id ?? 'gemini-2.0-flash';
      const response = await this.fetchFn(
        `${this.baseUrl}/models/${modelId}?key=${apiKey}`
      );
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

    const { systemInstruction, contents } = toGoogleFormat(request.messages);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens ?? 4096,
      },
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await this.fetchFn(
      `${this.baseUrl}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw toAIError(new Error(`Google AI Error ${response.status}: ${text}`), {
        provider: this.id,
        model,
      });
    }

    const data = (await response.json()) as GoogleGenerateResponse;
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return {
      id: `gemini_${Date.now()}`,
      content,
      model,
      provider: this.id,
      finishReason: mapGoogleFinishReason(data.candidates?.[0]?.finishReason),
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount ?? 0,
            completionTokens: data.usageMetadata.candidatesTokenCount ?? 0,
            totalTokens: data.usageMetadata.totalTokenCount ?? 0,
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

    const { systemInstruction, contents } = toGoogleFormat(request.messages);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens ?? 4096,
      },
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await this.fetchFn(
      `${this.baseUrl}/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw toAIError(new Error(`Google AI Error ${response.status}: ${text}`), {
        provider: this.id,
        model,
      });
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let firstChunk = true;

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
            const data = JSON.parse(line.slice(6)) as GoogleStreamResponse;
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              yield {
                id: firstChunk ? `gemini_${Date.now()}` : undefined,
                content: text,
                model: firstChunk ? model : undefined,
                done: false,
              };
              firstChunk = false;
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

interface GoogleFormatResult {
  systemInstruction?: { parts: Array<{ text: string }> };
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
}

function toGoogleFormat(messages: AIMessage[]): GoogleFormatResult {
  let systemInstruction: { parts: Array<{ text: string }> } | undefined;
  const contents = messages
    .filter((m) => {
      if (m.role === 'system') {
        systemInstruction = { parts: [{ text: m.content }] };
        return false;
      }
      return true;
    })
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  return { systemInstruction, contents };
}

interface GoogleGenerateResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

interface GoogleStreamResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

function mapGoogleFinishReason(reason?: string): AIFinishReason {
  switch (reason) {
    case 'STOP':
      return 'stop';
    case 'MAX_TOKENS':
      return 'length';
    case 'SAFETY':
      return 'content_filter';
    default:
      return reason ? 'unknown' : 'stop';
  }
}
