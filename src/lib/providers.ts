/**
 * Multi-Provider AI System
 * Supports: OpenAI, Anthropic, Google, DeepSeek, xAI, Mistral, Groq, Together, and custom providers
 */

export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'deepseek'
  | 'xai'
  | 'mistral'
  | 'groq'
  | 'together'
  | 'networktools'
  | 'custom';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  icon: string;
  color: string;
  baseUrl: string;
  apiKeyEnv: string; // env variable name
  apiKeyPlaceholder: string;
  models: ProviderModel[];
  // Provider-specific settings
  supportsStreaming: boolean;
  supportsImages: boolean;
  maxTokens?: number;
  // API format
  apiFormat: 'openai' | 'anthropic' | 'google';
}

export interface ProviderModel {
  id: string;
  name: string;
  category: 'chat' | 'image' | 'video' | 'music' | 'tts' | 'audio';
  maxTokens?: number;
  supportsStreaming?: boolean;
  supportsImages?: boolean;
  description?: string;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    color: '#10a37f',
    baseUrl: 'https://api.openai.com/v1',
    apiKeyEnv: 'OPENAI_API_KEY',
    apiKeyPlaceholder: 'sk-...',
    supportsStreaming: true,
    supportsImages: true,
    maxTokens: 128000,
    apiFormat: 'openai',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gpt-4', name: 'GPT-4', category: 'chat', maxTokens: 8192, supportsStreaming: true },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', category: 'chat', maxTokens: 16385, supportsStreaming: true },
      { id: 'o1', name: 'o1', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'o1-mini', name: 'o1 Mini', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'o3', name: 'o3', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'o3-mini', name: 'o3 Mini', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'dall-e-3', name: 'DALL-E 3', category: 'image', supportsImages: true },
      { id: 'dall-e-2', name: 'DALL-E 2', category: 'image', supportsImages: true },
      { id: 'tts-1', name: 'TTS-1', category: 'tts' },
      { id: 'tts-1-hd', name: 'TTS-1 HD', category: 'tts' },
      { id: 'whisper-1', name: 'Whisper', category: 'audio' },
    ],
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🧠',
    color: '#d97706',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    apiKeyPlaceholder: 'sk-ant-...',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 200000,
    apiFormat: 'anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', category: 'chat', maxTokens: 200000, supportsStreaming: true },
    ],
  },

  google: {
    id: 'google',
    name: 'Google AI',
    icon: '💎',
    color: '#4285f4',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKeyEnv: 'GOOGLE_AI_API_KEY',
    apiKeyPlaceholder: 'AIza...',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 1000000,
    apiFormat: 'google',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', category: 'chat', maxTokens: 1000000, supportsStreaming: true },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', category: 'chat', maxTokens: 1000000, supportsStreaming: true },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', category: 'chat', maxTokens: 1000000, supportsStreaming: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', category: 'chat', maxTokens: 2000000, supportsStreaming: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', category: 'chat', maxTokens: 1000000, supportsStreaming: true },
      { id: 'imagen-3', name: 'Imagen 3', category: 'image', supportsImages: true },
    ],
  },

  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔮',
    color: '#0ea5e9',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    apiKeyPlaceholder: 'sk-...',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 128000,
    apiFormat: 'openai',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', category: 'chat', maxTokens: 128000, supportsStreaming: true },
    ],
  },

  xai: {
    id: 'xai',
    name: 'xAI (Grok)',
    icon: '⚡',
    color: '#8b5cf6',
    baseUrl: 'https://api.x.ai/v1',
    apiKeyEnv: 'XAI_API_KEY',
    apiKeyPlaceholder: 'xai-...',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 128000,
    apiFormat: 'openai',
    models: [
      { id: 'grok-3', name: 'Grok 3', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'grok-2', name: 'Grok 2', category: 'chat', maxTokens: 128000, supportsStreaming: true },
    ],
  },

  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '🌊',
    color: '#f97316',
    baseUrl: 'https://api.mistral.ai/v1',
    apiKeyEnv: 'MISTRAL_API_KEY',
    apiKeyPlaceholder: '',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 128000,
    apiFormat: 'openai',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'mistral-small-latest', name: 'Mistral Small', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'open-mixtral-8x22b', name: 'Mixtral 8x22B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'open-mixtral-8x7b', name: 'Mixtral 8x7B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'codestral-latest', name: 'Codestral', category: 'chat', maxTokens: 128000, supportsStreaming: true },
    ],
  },

  groq: {
    id: 'groq',
    name: 'Groq',
    icon: '🚀',
    color: '#f59e0b',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKeyEnv: 'GROQ_API_KEY',
    apiKeyPlaceholder: 'gsk_...',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 128000,
    apiFormat: 'openai',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', category: 'chat', maxTokens: 32768, supportsStreaming: true },
    ],
  },

  together: {
    id: 'together',
    name: 'Together AI',
    icon: '🤝',
    color: '#06b6d4',
    baseUrl: 'https://api.together.xyz/v1',
    apiKeyEnv: 'TOGETHER_API_KEY',
    apiKeyPlaceholder: '',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 128000,
    apiFormat: 'openai',
    models: [
      { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', name: 'Llama 3.1 405B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', name: 'Llama 3.1 70B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', name: 'Llama 3.1 8B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'mistralai/Mixtral-8x22B-Instruct-v0.1', name: 'Mixtral 8x22B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
    ],
  },

  networktools: {
    id: 'networktools',
    name: 'NetworkTools',
    icon: '🌐',
    color: '#22c55e',
    baseUrl: 'https://yellowfire.ru/v1',
    apiKeyEnv: 'NETWORK_TOOLS_API_KEY',
    apiKeyPlaceholder: 'sk-...',
    supportsStreaming: true,
    supportsImages: true,
    maxTokens: 128000,
    apiFormat: 'openai',
    models: [
      { id: 'gpt-5', name: 'GPT-5', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gpt-5.5', name: 'GPT-5.5', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'claude-5-opus', name: 'Claude 5 Opus', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'claude-5-sonnet', name: 'Claude 5 Sonnet', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'deepseek-v4', name: 'DeepSeek V4', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'grok-4', name: 'Grok 4', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', category: 'chat', maxTokens: 1000000, supportsStreaming: true },
      { id: 'dall-e-3', name: 'DALL-E 3', category: 'image', supportsImages: true },
      { id: 'flux', name: 'Flux', category: 'image', supportsImages: true },
      { id: 'suno-v5', name: 'Suno V5', category: 'music' },
      { id: 'kling-3', name: 'Kling 3', category: 'video' },
    ],
  },

  custom: {
    id: 'custom',
    name: 'Personalizado',
    icon: '🔧',
    color: '#6b7280',
    baseUrl: '',
    apiKeyEnv: 'CUSTOM_API_KEY',
    apiKeyPlaceholder: '',
    supportsStreaming: true,
    supportsImages: false,
    apiFormat: 'openai',
    models: [],
  },
};

// Get all models flattened with provider info
export function getAllModels(): (ProviderModel & { providerId: ProviderId; providerName: string; providerColor: string })[] {
  return Object.values(PROVIDERS).flatMap((provider) =>
    provider.models.map((model) => ({
      ...model,
      providerId: provider.id,
      providerName: provider.name,
      providerColor: provider.color,
    }))
  );
}

// Get models by category
export function getModelsByCategory(category: ProviderModel['category']) {
  return getAllModels().filter((m) => m.category === category);
}

// Find provider by model ID (searches all providers)
export function findProviderByModel(modelId: string): ProviderConfig | undefined {
  return Object.values(PROVIDERS).find((p) => p.models.some((m) => m.id === modelId));
}

// Get model full info
export function getModelInfo(modelId: string): (ProviderModel & { providerId: ProviderId; providerName: string; providerColor: string }) | undefined {
  return getAllModels().find((m) => m.id === modelId);
}
