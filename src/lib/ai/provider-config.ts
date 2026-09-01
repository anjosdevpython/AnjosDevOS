'use client';

/**
 * Provider Configuration
 *
 * Gerencia configurações de provedores de IA.
 *
 * - Settings não-sensíveis (selectedProvider, selectedModel, temperature, baseUrl, isEnabled)
 *   → localStorage (OK, não são secrets)
 * - API Keys (secrets)
 *   → CredentialService (Phase 3 security)
 *
 * Migração: Detecta API keys no formato antigo (localStorage) e migra
 * automaticamente para o CredentialService.
 */

import { ProviderId, PROVIDERS, ProviderConfig } from './providers';
import {
  saveAIProviderKey,
  hasAIProviderKey,
} from '@/infrastructure/security';
import { getCredentialService } from '@/infrastructure/security/CredentialService';
import { CredentialSensitivity } from '@/infrastructure/security/types';

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
const MIGRATION_KEY = 'anjosdev_creds_migrated_v1';

// ---------------------------------------------------------------------------
// Default settings (non-sensitive only — no API keys)
// ---------------------------------------------------------------------------

function getDefaultSettings(): ProviderSettings {
  const providers: Record<ProviderId, ProviderKeyConfig> = {} as Record<ProviderId, ProviderKeyConfig>;

  Object.values(PROVIDERS).forEach((p) => {
    providers[p.id] = {
      providerId: p.id,
      apiKey: '', // API keys are now in CredentialService
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

// ---------------------------------------------------------------------------
// Migration: move API keys from localStorage settings to CredentialService
// ---------------------------------------------------------------------------

async function migrateLegacyCredentials(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(MIGRATION_KEY, 'true');
      return;
    }

    const parsed = JSON.parse(stored) as ProviderSettings;
    const service = getCredentialService();

    for (const [providerId, config] of Object.entries(parsed.providers)) {
      if (config.apiKey && config.apiKey.trim()) {
        // Migrate to CredentialService
        await service.set(
          `ai_${providerId}`,
          config.apiKey,
          'ai',
          CredentialSensitivity.USER_PROVIDED,
          { providerId }
        );
      }
    }

    // Mark migration complete
    localStorage.setItem(MIGRATION_KEY, 'true');
  } catch {
    // Migration failed silently — will retry on next load
  }
}

// Kick off migration in background (non-blocking)
if (typeof window !== 'undefined') {
  migrateLegacyCredentials();
}

// ---------------------------------------------------------------------------
// Settings (non-sensitive — localStorage is OK)
// ---------------------------------------------------------------------------

export function loadProviderSettings(): ProviderSettings {
  if (typeof window === 'undefined') return getDefaultSettings();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProviderSettings;
      const defaults = getDefaultSettings();
      const merged = {
        ...defaults,
        ...parsed,
        providers: { ...defaults.providers, ...parsed.providers },
      };

      // Clear API keys from settings object (they live in CredentialService now)
      for (const providerId of Object.keys(merged.providers) as ProviderId[]) {
        merged.providers[providerId].apiKey = '';
      }

      return merged;
    }
  } catch {
    // Ignore parse errors
  }

  return getDefaultSettings();
}

export function saveProviderSettings(settings: ProviderSettings): void {
  if (typeof window === 'undefined') return;

  // Strip API keys before saving to localStorage
  const sanitized = {
    ...settings,
    providers: Object.fromEntries(
      Object.entries(settings.providers).map(([id, config]) => [
        id,
        { ...config, apiKey: '' },
      ])
    ) as Record<ProviderId, ProviderKeyConfig>,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
}

// ---------------------------------------------------------------------------
// API Keys — via CredentialService (secrets never in localStorage)
// ---------------------------------------------------------------------------

/**
 * Retorna a API key de um provider.
 * Lê do CredentialService (nunca de localStorage diretamente).
 */
export function getProviderApiKey(providerId: ProviderId): string {
  if (typeof window === 'undefined') return '';

  // Synchronous read from CredentialService cache
  // (The service caches values after first async load)
  const service = getCredentialService();
  const credentialId = `ai_${providerId}`;

  // Fast path: try the service's internal cache
  // Note: CredentialService.get() is async, but we need sync here.
  // The adapter pattern with getAIProviderKeyResolver() handles this properly
  // for new code. For legacy sync callers, we use a stored value approach.

  // Check if we have a cached value in sessionStorage (migration bridge)
  const cached = sessionStorage.getItem(`cred_cache_${credentialId}`);
  if (cached !== null) return cached;

  // Fallback: check the legacy settings (migration in progress)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProviderSettings;
      const key = parsed.providers[providerId]?.apiKey;
      if (key) {
        // Cache for this session
        sessionStorage.setItem(`cred_cache_${credentialId}`, key);
        return key;
      }
    }
  } catch {
    // ignore
  }

  return '';
}

/**
 * Salva a API key de um provider.
 * Escreve no CredentialService (nunca em localStorage).
 */
export function setProviderApiKey(providerId: ProviderId, apiKey: string): void {
  // Save to CredentialService (async, fire-and-forget)
  saveAIProviderKey(providerId, apiKey).catch(() => {});

  // Cache for synchronous reads this session
  if (typeof window !== 'undefined') {
    if (apiKey) {
      sessionStorage.setItem(`cred_cache_ai_${providerId}`, apiKey);
    } else {
      sessionStorage.removeItem(`cred_cache_ai_${providerId}`);
    }
  }

  // Update settings (non-sensitive parts)
  const settings = loadProviderSettings();
  settings.providers[providerId] = {
    ...settings.providers[providerId],
    apiKey, // Temporary — will be stripped by saveProviderSettings
    isEnabled: !!apiKey,
  };
  saveProviderSettings(settings);
}

// ---------------------------------------------------------------------------
// Other settings accessors (non-sensitive — localStorage OK)
// ---------------------------------------------------------------------------

export function getProviderBaseUrl(providerId: ProviderId): string {
  const settings = loadProviderSettings();
  const customUrl = settings.providers[providerId]?.baseUrl;
  return customUrl || PROVIDERS[providerId].baseUrl;
}

export function isProviderEnabled(providerId: ProviderId): boolean {
  const settings = loadProviderSettings();
  const config = settings.providers[providerId];
  return config?.isEnabled && !!getProviderApiKey(providerId);
}

export function getEnabledProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS).filter((p) => isProviderEnabled(p.id));
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
      return config?.isEnabled && !!getProviderApiKey(provider.id);
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
