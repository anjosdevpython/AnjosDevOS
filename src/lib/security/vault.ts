import { ProviderId } from '@/lib/ai/providers';

/**
 * Server-Side Security Vault
 * Gerencia credenciais de provedores no servidor com proteção contra vazamento client-side
 */
export class SecurityVault {
  private static keyMap: Record<ProviderId, string | undefined> = {
    networktools: process.env.NETWORK_TOOLS_API_KEY || process.env.NEXT_PUBLIC_NETWORK_TOOLS_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_AI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    xai: process.env.XAI_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    groq: process.env.GROQ_API_KEY,
    together: process.env.TOGETHER_API_KEY,
    custom: process.env.CUSTOM_API_KEY,
  };

  /**
   * Obtém a chave de API segura no servidor para o provedor solicitado
   */
  public static getApiKey(provider: ProviderId): string {
    const key = this.keyMap[provider];
    if (key) return key;

    // Fallback para NetworkTools
    return process.env.NETWORK_TOOLS_API_KEY || '';
  }

  /**
   * Retorna apenas metadados públicos dos provedores disponíveis (sem expor segredos)
   */
  public static getPublicProviderStatus(): Record<ProviderId, boolean> {
    const status: Record<string, boolean> = {};
    for (const [provider, key] of Object.entries(this.keyMap)) {
      status[provider] = Boolean(key && key.length > 0);
    }
    return status as Record<ProviderId, boolean>;
  }
}
