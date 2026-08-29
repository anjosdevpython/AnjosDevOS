/**
 * Multi-Provider AI System
 * Supports: OpenAI, Anthropic, Google, DeepSeek, xAI, Mistral, Groq, Together, OpenRouter, Cohere, NetworkTools, and Custom providers
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
  | 'openrouter'
  | 'cohere'
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
      { id: 'gpt-4o', name: 'GPT-4o', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Modelo multimodal de alta performance' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Rápido, econômico e eficiente' },
      { id: 'gpt-4o-2024-08-06', name: 'GPT-4o (Aug 2024)', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'o1', name: 'o1', category: 'chat', maxTokens: 200000, supportsStreaming: true, description: 'Raciocínio profundo e complexo' },
      { id: 'o1-mini', name: 'o1 Mini', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'o3-mini', name: 'o3 Mini', category: 'chat', maxTokens: 200000, supportsStreaming: true, description: 'Raciocínio de última geração' },
      { id: 'o4-mini', name: 'o4 Mini', category: 'chat', maxTokens: 200000, supportsStreaming: true, description: 'Nova geração ultra rápida' },
      { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gpt-4', name: 'GPT-4', category: 'chat', maxTokens: 8192, supportsStreaming: true },
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
      { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus', category: 'chat', maxTokens: 200000, supportsStreaming: true, description: 'Modelo mais capaz e profundo da Anthropic' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude 4 Sonnet', category: 'chat', maxTokens: 200000, supportsStreaming: true, description: 'Excelente em código e raciocínio técnico' },
      { id: 'claude-haiku-4-20250514', name: 'Claude 4 Haiku', category: 'chat', maxTokens: 200000, supportsStreaming: true, description: 'Ultrarrápido e eficiente' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', category: 'chat', maxTokens: 200000, supportsStreaming: true, description: 'Padrão ouro para desenvolvimento' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', category: 'chat', maxTokens: 200000, supportsStreaming: true },
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
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', category: 'chat', maxTokens: 1000000, supportsStreaming: true, description: 'Raciocínio avançado com 1M tokens de contexto' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', category: 'chat', maxTokens: 1000000, supportsStreaming: true, description: 'Velocidade e raciocínio equilibrados' },
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
      { id: 'deepseek-chat', name: 'DeepSeek V3', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Modelo geral open-weights state-of-the-art' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Raciocínio profundo via CoT explícito' },
      { id: 'deepseek-coder-v2', name: 'DeepSeek Coder', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Especialista em geração e debug de código' },
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
    maxTokens: 131072,
    apiFormat: 'openai',
    models: [
      { id: 'grok-4-0709', name: 'Grok 4', category: 'chat', maxTokens: 131072, supportsStreaming: true, description: 'Última geração Grok com raciocínio potente' },
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
      { id: 'mistral-large-latest', name: 'Mistral Large', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Capacidade de raciocínio de topo' },
      { id: 'codestral-latest', name: 'Codestral', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Geração de código rápida' },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'mistral-small-latest', name: 'Mistral Small', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'open-mixtral-8x22b', name: 'Mixtral 8x22B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
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
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Ultra rápido na infraestrutura LPU Groq' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
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
      { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', name: 'Llama 3.1 405B', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Maior modelo open-weights existente' },
      { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', name: 'Llama 3.1 70B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B', category: 'chat', maxTokens: 128000, supportsStreaming: true },
    ],
  },

  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🔀',
    color: '#6366f1',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    apiKeyPlaceholder: 'sk-or-...',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 200000,
    apiFormat: 'openai',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (OR)', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'openai/gpt-4o', name: 'GPT-4o (OR)', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro (OR)', category: 'chat', maxTokens: 1000000, supportsStreaming: true },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (OR)', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (OR)', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B (OR)', category: 'chat', maxTokens: 128000, supportsStreaming: true },
    ],
  },

  cohere: {
    id: 'cohere',
    name: 'Cohere',
    icon: '🪄',
    color: '#39d353',
    baseUrl: 'https://api.cohere.ai/compatibility/v1',
    apiKeyEnv: 'COHERE_API_KEY',
    apiKeyPlaceholder: '',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 128000,
    apiFormat: 'openai',
    models: [
      { id: 'command-r-plus-08-2024', name: 'Command R+', category: 'chat', maxTokens: 128000, supportsStreaming: true, description: 'Especialista em RAG e tool use avançado' },
      { id: 'command-r-08-2024', name: 'Command R', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'command-light', name: 'Command Light', category: 'chat', maxTokens: 4096, supportsStreaming: true },
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
      { id: 'gpt-5.6', name: 'GPT-5.6', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gpt-5.4', name: 'GPT-5.4', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'claude-4-opus', name: 'Claude 4 Opus', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', category: 'chat', maxTokens: 200000, supportsStreaming: true },
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'grok-4', name: 'Grok 4', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', category: 'chat', maxTokens: 128000, supportsStreaming: true },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', category: 'chat', maxTokens: 1000000, supportsStreaming: true },
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