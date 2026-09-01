import { ProviderId } from '@/lib/ai/providers';

/**
 * Server-Side Security Vault
 * Gerencia credenciais de provedores no servidor com proteção contra vazamento client-side.
 *
 * As chaves são lidas de `process.env` de forma totalmente LAZY (a cada chamada),
 * para que alterações de ambiente sejam refletidas sem recarregar o módulo.
 */
export class SecurityVault {
  /** Mapa ProviderId → nome da env var (sem valores). */
  private static readonly ENV_VAR_BY_PROVIDER: Record<ProviderId, string> = {
    networktools: 'NETWORK_TOOLS_API_KEY',
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_AI_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    xai: 'XAI_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    groq: 'GROQ_API_KEY',
    together: 'TOGETHER_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    cohere: 'COHERE_API_KEY',
    aimlapi: 'AIMLAPI_API_KEY',
    custom: 'CUSTOM_API_KEY',
  };

  /**
   * Obtém a chave de API segura no servidor para o provedor solicitado.
   * Lazy: lê `process.env` no momento da chamada.
   */
  public static getApiKey(provider: ProviderId): string {
    const envName = this.ENV_VAR_BY_PROVIDER[provider];
    if (envName) {
      const value = process.env[envName];
      if (value) return value;
    }

    // Fallback para NetworkTools
    return process.env.NETWORK_TOOLS_API_KEY || '';
  }

  /**
   * Retorna apenas metadados públicos dos provedores disponíveis (sem expor segredos).
   */
  public static getPublicProviderStatus(): Record<ProviderId, boolean> {
    const status: Record<string, boolean> = {};
    for (const provider of Object.keys(this.ENV_VAR_BY_PROVIDER) as ProviderId[]) {
      status[provider] = Boolean(this.getApiKey(provider));
    }
    return status as Record<ProviderId, boolean>;
  }
}
