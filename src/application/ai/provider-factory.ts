/**
 * Provider Factory
 * Constrói o adapter correto (OpenAI/Anthropic/Google) para cada provider,
 * ligando o AI Core ao catálogo PROVIDERS existente e à resolução de API keys.
 *
 * Camada: APPLICATION/INFRAESTRUTURA boundary.
 *
 * Resolução de chave:
 * - Server (`typeof window === 'undefined'`): SecurityVault (env vars).
 * - Client: provider-config (CredentialService / sessionStorage cache).
 *
 * Isto garante que o AI Core passe a ser o caminho real de execução de IA,
 * substituindo o transporte legado (`api-client.ts`) na camada de aplicação.
 */

import { PROVIDERS, type ProviderId } from '@/lib/ai/providers';
import {
  getModelRegistry,
  OpenAIAdapter,
  AnthropicAdapter,
  GoogleAdapter,
  type AIProvider,
} from '@/core/ai';
import { getProviderApiKey } from '@/lib/ai/provider-config';
import { SecurityVault } from '@/lib/security/vault';

const CACHE = new Map<string, AIProvider>();

/**
 * Resolve a API key de um provider no contexto atual (server vs client).
 */
function resolveApiKey(providerId: ProviderId): string {
  if (typeof window === 'undefined') {
    return SecurityVault.getApiKey(providerId);
  }
  return getProviderApiKey(providerId);
}

/**
 * Constrói (ou recupera do cache) o adapter de um provider.
 */
export function createProvider(providerId: ProviderId): AIProvider {
  const cached = CACHE.get(providerId);
  if (cached) return cached;

  const config = PROVIDERS[providerId];
  if (!config) {
    throw new Error(`Provider desconhecido: ${providerId}`);
  }

  const models = getModelRegistry().getByProvider(providerId);
  const apiKeyResolver = (): string => resolveApiKey(providerId);

  let adapter: AIProvider;
  switch (config.apiFormat) {
    case 'anthropic':
      adapter = new AnthropicAdapter({
        id: config.id,
        name: config.name,
        baseUrl: config.baseUrl,
        models,
        apiKeyResolver,
      });
      break;
    case 'google':
      adapter = new GoogleAdapter({
        id: config.id,
        name: config.name,
        baseUrl: config.baseUrl,
        models,
        apiKeyResolver,
      });
      break;
    default:
      adapter = new OpenAIAdapter({
        id: config.id,
        name: config.name,
        baseUrl: config.baseUrl,
        models,
        apiKeyResolver,
      });
  }

  CACHE.set(providerId, adapter);
  return adapter;
}

/** Limpa o cache de adapters (uso em testes). */
export function resetProviderFactory(): void {
  CACHE.clear();
}
