/**
 * GitHub Credentials
 * Gerencia GitHub PAT (Personal Access Token) via CredentialService.
 *
 * Camada: INFRASTRUCTURE.
 *
 * Substitui o acesso direto a `localStorage['gh_pat']` existente no projeto.
 *
 * Uso:
 *
 * ```typescript
 * import { getGitHubPAT, saveGitHubPAT } from '@/infrastructure/security';
 *
 * // Ler
 * const pat = await getGitHubPAT();
 *
 * // Salvar
 * await saveGitHubPAT('ghp_...');
 * ```
 */

import { getCredentialService } from './CredentialService';
import { CredentialSensitivity } from './types';
import type { CredentialProvider } from './types';

const GITHUB_CREDENTIAL_ID = 'github_pat';

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/**
 * Obtém o GitHub PAT armazenado.
 * Retorna null se não existe.
 */
export async function getGitHubPAT(): Promise<string | null> {
  const service = getCredentialService();
  return service.get(GITHUB_CREDENTIAL_ID);
}

/**
 * Salva o GitHub PAT.
 */
export async function saveGitHubPAT(token: string): Promise<void> {
  const service = getCredentialService();
  await service.set(
    GITHUB_CREDENTIAL_ID,
    token,
    'github' as CredentialProvider,
    CredentialSensitivity.SECRET,
    { type: 'personal_access_token', scopes: ['repo'] }
  );
}

/**
 * Remove o GitHub PAT.
 */
export async function deleteGitHubPAT(): Promise<void> {
  const service = getCredentialService();
  await service.delete(GITHUB_CREDENTIAL_ID);
}

/**
 * Verifica se um GitHub PAT está configurado.
 */
export async function hasGitHubPAT(): Promise<boolean> {
  const service = getCredentialService();
  return service.has(GITHUB_CREDENTIAL_ID);
}
