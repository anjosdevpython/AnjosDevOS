'use client';

import { ProviderId, PROVIDERS } from './providers';
import { getProviderApiKey, getProviderBaseUrl } from './provider-config';

// Legacy NetworkTools config (fallback)
const LEGACY_BASE_URL = process.env.NEXT_PUBLIC_NETWORK_TOOLS_BASE_URL || 'https://yellowfire.ru/v1';
const LEGACY_API_KEY = process.env.NEXT_PUBLIC_NETWORK_TOOLS_API_KEY || '';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  provider?: ProviderId;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  provider?: ProviderId;
}

export interface ImageGenerationResponse {
  created: number;
  data: {
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }[];
}

/**
 * Get API config for a specific provider
 */
function getProviderApiConfig(providerId?: ProviderId): { baseUrl: string; apiKey: string; apiFormat: string } {
  const provider = providerId ? PROVIDERS[providerId] : null;

  if (provider) {
    const apiKey = getProviderApiKey(providerId!);
    const baseUrl = getProviderBaseUrl(providerId!);

    return {
      baseUrl,
      apiKey,
      apiFormat: provider.apiFormat,
    };
  }

  // Fallback to legacy NetworkTools
  return {
    baseUrl: LEGACY_BASE_URL,
    apiKey: LEGACY_API_KEY,
    apiFormat: 'openai',
  };
}

/**
 * Convert messages to Anthropic format
 */
function toAnthropicMessages(messages: ChatMessage[]): { system?: string; messages: { role: string; content: string }[] } {
  let system = '';
  const filteredMessages = messages.filter((m) => {
    if (m.role === 'system') {
      system = m.content;
      return false;
    }
    return true;
  });

  return {
    system: system || undefined,
    messages: filteredMessages.map((m) => ({ role: m.role, content: m.content })),
  };
}

/**
 * Convert messages to Google Gemini format
 */
function toGoogleMessages(messages: ChatMessage[]): { systemInstruction?: { parts: { text: string }[] }; contents: { role: string; parts: { text: string }[] }[] } {
  let systemInstruction: { parts: { text: string }[] } | undefined;
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

  return {
    systemInstruction,
    contents,
  };
}

/**
 * Chat completion with multi-provider support
 */
export async function chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  const { baseUrl, apiKey, apiFormat } = getProviderApiConfig(request.provider);

  if (!apiKey) {
    throw new Error('API key não configurada para este provider. Vá em Configurações para adicionar.');
  }

  // Anthropic API format
  if (apiFormat === 'anthropic') {
    const { system, messages } = toAnthropicMessages(request.messages);

    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: request.max_tokens || 4096,
      messages,
    };

    if (system) body.system = system;
    if (request.temperature !== undefined) body.temperature = request.temperature;

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API Error ${response.status}: ${error}`);
    }

    const data = await response.json();

    // Convert to OpenAI-compatible format
    return {
      id: data.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: data.content?.[0]?.text || '',
          },
          finish_reason: data.stop_reason || 'stop',
        },
      ],
      usage: data.usage
        ? {
            prompt_tokens: data.usage.input_tokens,
            completion_tokens: data.usage.output_tokens,
            total_tokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
    };
  }

  // Google Gemini API format
  if (apiFormat === 'google') {
    const { systemInstruction, contents } = toGoogleMessages(request.messages);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.max_tokens || 4096,
      },
    };

    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await fetch(
      `${baseUrl}/models/${request.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI Error ${response.status}: ${error}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      id: `gemini-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: text },
          finish_reason: 'stop',
        },
      ],
      usage: data.usageMetadata
        ? {
            prompt_tokens: data.usageMetadata.promptTokenCount || 0,
            completion_tokens: data.usageMetadata.candidatesTokenCount || 0,
            total_tokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    };
  }

  // OpenAI-compatible format (default for most providers)
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json();
}

/**
 * Streaming chat completion with multi-provider support
 */
export async function chatCompletionStream(request: ChatCompletionRequest): Promise<ReadableStream> {
  const { baseUrl, apiKey, apiFormat } = getProviderApiConfig(request.provider);

  if (!apiKey) {
    throw new Error('API key não configurada para este provider. Vá em Configurações para adicionar.');
  }

  // Anthropic streaming
  if (apiFormat === 'anthropic') {
    const { system, messages } = toAnthropicMessages(request.messages);

    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: request.max_tokens || 4096,
      messages,
      stream: true,
    };

    if (system) body.system = system;
    if (request.temperature !== undefined) body.temperature = request.temperature;

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API Error ${response.status}: ${error}`);
    }

    // Convert Anthropic SSE to OpenAI-compatible SSE
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'content_block_delta' && data.delta?.text) {
                    const sseChunk = `data: ${JSON.stringify({
                      choices: [{ delta: { content: data.delta.text }, finish_reason: null }],
                    })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(sseChunk));
                  } else if (data.type === 'message_stop') {
                    controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });
  }

  // Google Gemini streaming
  if (apiFormat === 'google') {
    const { systemInstruction, contents } = toGoogleMessages(request.messages);

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.max_tokens || 4096,
      },
    };

    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await fetch(
      `${baseUrl}/models/${request.model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI Error ${response.status}: ${error}`);
    }

    // Google SSE is already in a format we can stream
    return response.body!;
  }

  // OpenAI-compatible streaming
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.body!;
}

/**
 * Image generation with multi-provider support
 */
export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  const { baseUrl, apiKey, apiFormat } = getProviderApiConfig(request.provider);

  if (!apiKey) {
    throw new Error('API key não configurada para este provider. Vá em Configurações para adicionar.');
  }

  // Only OpenAI format supports image generation for now
  if (apiFormat !== 'openai') {
    throw new Error('Geração de imagens ainda não suportada para este provider');
  }

  const response = await fetch(`${baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      prompt: request.prompt,
      n: request.n || 1,
      size: request.size || '1024x1024',
      quality: request.quality || 'standard',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json();
}

/**
 * Get available models from a provider
 */
export async function getModels(providerId?: ProviderId): Promise<{ data: { id: string; object: string }[] }> {
  const { baseUrl, apiKey, apiFormat } = getProviderApiConfig(providerId);

  if (!apiKey) {
    // Return local models list
    const provider = providerId ? PROVIDERS[providerId] : null;
    if (provider) {
      return {
        data: provider.models.map((m) => ({ id: m.id, object: 'model' })),
      };
    }
    return { data: [] };
  }

  if (apiFormat !== 'openai') {
    // For non-OpenAI providers, return local list
    const provider = providerId ? PROVIDERS[providerId] : null;
    if (provider) {
      return {
        data: provider.models.map((m) => ({ id: m.id, object: 'model' })),
      };
    }
    return { data: [] };
  }

  const response = await fetch(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json();
}
