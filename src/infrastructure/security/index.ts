/**
 * Security — ponto de entrada público
 * Camada: INFRASTRUCTURE
 */

// Types
export { CredentialSensitivity } from './types';
export type { CredentialProvider, CredentialOperationResult, StoredCredential } from './types';

// Credential Service
export {
  CredentialService,
  EncryptedBrowserStorage,
  InMemoryStorage,
  getCredentialService,
  resetCredentialService,
} from './CredentialService';
export type { StorageBackend } from './CredentialService';

// AI Provider Credentials
export {
  AI_CREDENTIAL_IDS,
  getAIProviderKeyResolver,
  saveAIProviderKey,
  deleteAIProviderKey,
  hasAIProviderKey,
  getConfiguredProviders,
} from './providers';

// GitHub Credentials
export {
  getGitHubPAT,
  saveGitHubPAT,
  deleteGitHubPAT,
  hasGitHubPAT,
} from './github';
