'use client';

import { ProviderId, PROVIDERS, ProviderConfig } from './providers';

export interface ProviderKeyConfig {
  providerId: ProviderId;
  apiKey: string;
  baseUrl: string;
  isEnabled: boolean;
  customModels?: string[];
}

export interface ProviderSettings {
  providers: Record<ProviderId, ProviderKeyConfig>;
  selectedProvider: ProviderId;
  selectedModel: string;
  temperature: number;
}

const STORAGE_KEY = 'anjosdev_provider_settings';

function getDefaultSettings(): ProviderSettings {
  const providers: Record<ProviderId, ProviderKeyConfig> = {} as Record<ProviderId, ProviderKeyConfig>;

  Object.values(PROVIDERS).forEach((p) => {
    providers[p.id] = {
      providerId: p.id,
      apiKey:
        p.id === 'aimlapi'
          ? '4d551bf61623df07ae345d23afb78f44'
          : p.id === 'networktools'
          ? 'sk-default-networktools'
          : '',
      baseUrl: p.baseUrl,
      isEnabled: p.id === 'aimlapi' || p.id === 'networktools',
    };
  });

  return {
    providers,
    selectedProvider: 'aimlapi',
    selectedModel: 'openai/gpt-5-5',
    temperature: 0.7,
  };
}

export function loadProviderSettings(): ProviderSettings {
  if (typeof window === 'undefined') return getDefaultSettings();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProviderSettings;
      // Merge with defaults to handle new providers
      const defaults = getDefaultSettings();
      return {
        ...defaults,
        ...parsed,
        providers: { ...defaults.providers, ...parsed.providers },
      };
    }
  } catch {
    // Ignore parse errors
  }

  return getDefaultSettings();
}

export function saveProviderSettings(settings: ProviderSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getProviderApiKey(providerId: ProviderId): string {
  const settings = loadProviderSettings();
  return settings.providers[providerId]?.apiKey || '';
}

export function getProviderBaseUrl(providerId: ProviderId): string {
  const settings = loadProviderSettings();
  const customUrl = settings.providers[providerId]?.baseUrl;
  return customUrl || PROVIDERS[providerId].baseUrl;
}

export function isProviderEnabled(providerId: ProviderId): boolean {
  const settings = loadProviderSettings();
  const config = settings.providers[providerId];
  return config?.isEnabled && !!config?.apiKey;
}

export function getEnabledProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS).filter((p) => isProviderEnabled(p.id));
}

export function setProviderApiKey(providerId: ProviderId, apiKey: string): void {
  const settings = loadProviderSettings();
  settings.providers[providerId] = {
    ...settings.providers[providerId],
    apiKey,
    isEnabled: !!apiKey,
  };
  saveProviderSettings(settings);
}

export function setProviderBaseUrl(providerId: ProviderId, baseUrl: string): void {
  const settings = loadProviderSettings();
  settings.providers[providerId] = {
    ...settings.providers[providerId],
    baseUrl,
  };
  saveProviderSettings(settings);
}

export function setSelectedProvider(providerId: ProviderId, modelId: string): void {
  const settings = loadProviderSettings();
  settings.selectedProvider = providerId;
  settings.selectedModel = modelId;
  saveProviderSettings(settings);
}

export function setTemperature(temperature: number): void {
  const settings = loadProviderSettings();
  settings.temperature = temperature;
  saveProviderSettings(settings);
}

/**
 * Get all available models from enabled providers
 */
export function getAvailableModels() {
  const settings = loadProviderSettings();

  return Object.values(PROVIDERS)
    .filter((provider) => {
      const config = settings.providers[provider.id];
      return config?.isEnabled && !!config?.apiKey;
    })
    .flatMap((provider) =>
      provider.models.map((model) => ({
        ...model,
        providerId: provider.id,
        providerName: provider.name,
        providerColor: provider.color,
        providerIcon: provider.icon,
      }))
    );
}

/**
 * Get the current active provider config
 */
export function getActiveProvider(): { provider: ProviderConfig; model: string; temperature: number } {
  const settings = loadProviderSettings();
  const provider = PROVIDERS[settings.selectedProvider] || PROVIDERS.networktools;
  return {
    provider,
    model: settings.selectedModel,
    temperature: settings.temperature,
  };
}
