/**
 * AI Provider Credentials
 * Helper que conecta o CredentialService ao padrão `apiKeyResolver` do AI Core.
 *
 * Camada: INFRASTRUCTURE. Depende apenas de CredentialService (mais baixo).
 *
 * Uso:
 *
 * ```typescript
 * import { getAIProviderKeyResolver } from '@/infrastructure/security';
 *
 * const adapter = new OpenAIAdapter({
 *   apiKeyResolver: getAIProviderKeyResolver('openai'),
 *   ...
 * });
 * ```
 */

import { getCredentialService } from './CredentialService';
import { CredentialSensitivity } from './types';
import type { CredentialProvider } from './types';

// ---------------------------------------------------------------------------
// Provider credential IDs
// ---------------------------------------------------------------------------

/** IDs padronizados para credenciais de provedores AI. */
export const AI_CREDENTIAL_IDS: Readonly<Record<string, string>> = {
  openai: 'ai_openai',
  anthropic: 'ai_anthropic',
  google: 'ai_google',
  deepseek: 'ai_deepseek',
  xai: 'ai_xai',
  mistral: 'ai_mistral',
  groq: 'ai_groq',
  together: 'ai_together',
  openrouter: 'ai_openrouter',
  cohere: 'ai_cohere',
  aimlapi: 'ai_aimlapi',
  networktools: 'ai_networktools',
  custom: 'ai_custom',
};

/**
 * Retorna um `apiKeyResolver` para um dado provider.
 * Pode ser injetado diretamente no adapter.
 */
export function getAIProviderKeyResolver(providerId: string): () => string {
  const credentialId = AI_CREDENTIAL_IDS[providerId] ?? `ai_${providerId}`;
  const service = getCredentialService();

  // Cache síncrono para performance (providers são chamados frequentemente)
  let cachedKey: string | undefined;
  let cachePromise: Promise<string | null> | null = null;

  return (): string => {
    // Sincronizar via Promise (o serviço é async mas a key precisa ser sync)
    if (cachedKey !== undefined) return cachedKey;

    if (!cachePromise) {
      cachePromise = service.get(credentialId).then((key) => {
        cachedKey = key ?? '';
        return cachedKey;
      });
    }

    // Se já temos o valor, retorna; senão, retorna string vazia
    // (o adapter lançará AIAuthenticationError)
    return cachedKey ?? '';
  };
}

/**
 * Salva a API key de um provedor AI.
 */
export async function saveAIProviderKey(
  providerId: string,
  apiKey: string
): Promise<void> {
  const credentialId = AI_CREDENTIAL_IDS[providerId] ?? `ai_${providerId}`;
  const service = getCredentialService();

  await service.set(
    credentialId,
    apiKey,
    'ai' as CredentialProvider,
    CredentialSensitivity.USER_PROVIDED,
    { providerId }
  );
}

/**
 * Remove a API key de um provedor AI.
 */
export async function deleteAIProviderKey(providerId: string): Promise<void> {
  const credentialId = AI_CREDENTIAL_IDS[providerId] ?? `ai_${providerId}`;
  const service = getCredentialService();
  await service.delete(credentialId);
}

/**
 * Verifica se um provedor tem API key configurada.
 */
export async function hasAIProviderKey(providerId: string): Promise<boolean> {
  const credentialId = AI_CREDENTIAL_IDS[providerId] ?? `ai_${providerId}`;
  const service = getCredentialService();
  return service.has(credentialId);
}

/**
 * Retorna a lista de providers com keys configuradas.
 */
export async function getConfiguredProviders(): Promise<string[]> {
  const service = getCredentialService();
  const allIds = Object.values(AI_CREDENTIAL_IDS);
  const configured: string[] = [];

  for (const id of allIds) {
    if (await service.has(id)) {
      configured.push(id.replace('ai_', ''));
    }
  }

  return configured;
}
