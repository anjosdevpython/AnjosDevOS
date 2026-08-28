/**
 * Models configuration
 * Now re-exports from the providers system for backward compatibility
 */

import { PROVIDERS, ProviderId, getAllModels, getModelsByCategory } from './providers';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  category: 'chat' | 'image' | 'image-edit' | 'video' | 'music' | 'tts' | 'audio';
  description?: string;
  icon?: string;
}

// Legacy exports for backward compatibility
export const CHAT_MODELS: ModelInfo[] = getAllModels()
  .filter((m) => m.category === 'chat')
  .map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.providerName,
    category: m.category,
    description: m.description,
  }));

export const IMAGE_MODELS: ModelInfo[] = getAllModels()
  .filter((m) => m.category === 'image')
  .map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.providerName,
    category: m.category,
    description: m.description,
  }));

export const IMAGE_EDIT_MODELS: ModelInfo[] = [
  { id: 'remove_background', name: 'Remover Fundo', provider: 'System', category: 'image-edit' },
  { id: 'inpaint', name: 'Inpainting', provider: 'System', category: 'image-edit' },
  { id: 'upscale', name: 'Upscale', provider: 'System', category: 'image-edit' },
];

export const VIDEO_MODELS: ModelInfo[] = getAllModels()
  .filter((m) => m.category === 'video')
  .map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.providerName,
    category: m.category,
    description: m.description,
  }));

export const MUSIC_MODELS: ModelInfo[] = getAllModels()
  .filter((m) => m.category === 'music')
  .map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.providerName,
    category: m.category,
    description: m.description,
  }));

export const TTS_MODELS: ModelInfo[] = getAllModels()
  .filter((m) => m.category === 'tts')
  .map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.providerName,
    category: m.category,
    description: m.description,
  }));

export const AUDIO_MODELS: ModelInfo[] = getAllModels()
  .filter((m) => m.category === 'audio')
  .map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.providerName,
    category: m.category,
    description: m.description,
  }));

export const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1 (Quadrado)' },
  { id: '16:9', name: '16:9 (Paisagem)' },
  { id: '9:16', name: '9:16 (Retrato)' },
  { id: '4:3', name: '4:3 (Clássico)' },
  { id: '3:4', name: '3:4 (Retrato Clássico)' },
];

export const PROVIDER_COLORS: Record<string, string> = Object.values(PROVIDERS).reduce(
  (acc, provider) => ({
    ...acc,
    [provider.name]: provider.color,
  }),
  {} as Record<string, string>
);
