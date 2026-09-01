/**
 * Security Types
 * Tipos para o sistema de gerenciamento de credenciais.
 *
 * Camada: INFRASTRUCTURE (mais baixa). Zero dependências externas.
 */

// ---------------------------------------------------------------------------
// Sensibilidade
// ---------------------------------------------------------------------------

/**
 * Classificação de sensibilidade de uma credencial.
 *
 * - SECRET        — Credencial de serviço (API key, PAT). Nunca exposta ao client.
 * - USER_PROVIDED — Fornecida pelo usuário. Pode ser exibida na UI com confirmação.
 * - PRIVATE       — Dados internos do sistema. Não exposta externamente.
 */
export enum CredentialSensitivity {
  SECRET = 'SECRET',
  USER_PROVIDED = 'USER_PROVIDED',
  PRIVATE = 'PRIVATE',
}

// ---------------------------------------------------------------------------
// Provider de credenciais
// ---------------------------------------------------------------------------

/** Identifica um provedor de credenciais. */
export type CredentialProvider =
  | 'ai'         // API keys de provedores de IA
  | 'github'     // GitHub PAT
  | 'mcp'        // MCP server tokens
  | 'custom';    // Credenciais customizadas

// ---------------------------------------------------------------------------
// Credencial armazenada
// ---------------------------------------------------------------------------

export interface StoredCredential {
  /** ID único da credencial (ex.: 'openai', 'github_pat'). */
  id: string;
  /** Provedor ao qual pertence. */
  provider: CredentialProvider;
  /** O valor da credencial (nunca serializado para logs). */
  value: string;
  /** Classificação de sensibilidade. */
  sensitivity: CredentialSensitivity;
  /** Timestamp de criação/atualização. */
  updatedAt: number;
  /** Metadados livres (não incluem o valor). */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Resultado de operação
// ---------------------------------------------------------------------------

export interface CredentialOperationResult {
  success: boolean;
  error?: string;
}
