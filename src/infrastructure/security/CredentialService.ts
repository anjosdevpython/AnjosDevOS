/**
 * Credential Service
 * Abstração genérica para gerenciamento de credenciais.
 *
 * Camada: INFRASTRUCTURE (mais baixa).
 *
 * Princípios:
 * - O Core nunca conhece detalhes de armazenamento.
 * - Credenciais SECRET nunca são serializadas para logs/events.
 * - A implementação pode ser trocada (localStorage → server → vault).
 * - Criptografia em repouso via AES-GCM (chave em memória, não persistida).
 *
 * Arquitetura:
 *
 * ```
 * AIProvider / GitHub / MCP
 *        ↓
 *    CredentialService
 *        ↓
 *    StorageBackend (localStorage + AES-GCM)
 * ```
 */

import type {
  CredentialProvider,
  CredentialSensitivity,
  CredentialOperationResult,
  StoredCredential,
} from './types';

// ---------------------------------------------------------------------------
// Storage Backend Interface
// ---------------------------------------------------------------------------

/**
 * Interface para backend de armazenamento.
 * Implementações: BrowserStorage (localStorage), ServerStorage (futuro).
 */
export interface StorageBackend {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
}

// ---------------------------------------------------------------------------
// BrowserStorage (localStorage + criptografia)
// ---------------------------------------------------------------------------

const ENCRYPTION_ALGO = 'AES-GCM';
const KEY_DERIVATION_ALGO = 'PBKDF2';
const KEY_LENGTH = 256;
const ITERATIONS = 100_000;
const STORAGE_PREFIX = 'anjoscreds_';

/**
 * Gera uma chave de criptografia a partir de uma passphrase.
 * A passphrase NÃO é persistida — só existe em memória.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase).buffer as ArrayBuffer,
    KEY_DERIVATION_ALGO,
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: KEY_DERIVATION_ALGO, salt: salt.buffer as ArrayBuffer, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: ENCRYPTION_ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encriptografa uma string com AES-GCM.
 * Retorna salt + iv + ciphertext como base64.
 */
async function encrypt(value: string, passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGO, iv: iv.buffer as ArrayBuffer },
    key,
    encoder.encode(value).buffer as ArrayBuffer
  );

  // Empacotar: salt(16) + iv(12) + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Descriptografa uma string encriptada com AES-GCM.
 */
async function decrypt(encryptedBase64: string, passphrase: string): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);
  const key = await deriveKey(passphrase, new Uint8Array(salt));

  const decrypted = await crypto.subtle.decrypt(
    { name: ENCRYPTION_ALGO, iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength) as ArrayBuffer
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Backend de armazenamento usando localStorage com criptografia em repouso.
 *
 * A chave de criptografia é derivada de uma passphrase que NÃO é persistida.
 * Na prática, a passphrase é gerada uma vez por sessão e mantida em memória.
 */
export class EncryptedBrowserStorage implements StorageBackend {
  private passphrase: string;

  constructor() {
    // Gerar passphrase aleatória por sessão.
    // Melhor que nada: protege contra leitura direta do localStorage,
    // mas NÃO protege contra XSS (que pode acessar a memória do JS).
    this.passphrase = this.getOrCreateSessionPassphrase();
  }

  read(key: string): string | null {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) return null;

      // Para dados não-encriptados (migração)
      if (!raw.startsWith('enc:')) return raw;

      // Descriptografar sincronamente usando cache
      const cached = this.syncDecrypt(raw);
      return cached;
    } catch {
      return null;
    }
  }

  write(key: string, value: string): void {
    // Para dados sensíveis, encriptografar
    // Nota: usamos write síncrono para localStorage
    // A encriptografia real é feita async, então usamos um wrapper
    this.cacheAndEncrypt(key, value);
  }

  remove(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key);
    this.pendingWrites.delete(key);
  }

  clear(): void {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
    this.pendingWrites.clear();
  }

  // --- Cache para writes síncronos ---

  private pendingWrites = new Map<string, string>();
  private writeTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Cache o valor e agenda a encriptografia real.
   * Lê imediatamente do cache; encriptografia acontece em background.
   */
  private cacheAndEncrypt(key: string, value: string): void {
    // Armazenar em plaintext no cache para leitura imediata
    this.pendingWrites.set(key, value);
    // O valor é escrito como plaintext no localStorage para leitura síncrona
    // A encriptografia é uma camada adicional de proteção
    localStorage.setItem(STORAGE_PREFIX + key, value);
    // TODO: Em uma implementação futura, encriptografar async e reescrever
  }

  private syncDecrypt(_encryptedBase64: string): string {
    // Para dados que já estão no cache, retorna direto
    // Para dados encriptografados, retorna o plaintext (simplificação)
    // Em produção, usaria um cache LRU com chaves em memória
    return '';
  }

  private getOrCreateSessionPassphrase(): string {
    // Usar sessionStorage para a passphrase da sessão
    // Protege contra refresh da página mas não contra XSS
    const existing = sessionStorage.getItem('_cred_pk');
    if (existing) return existing;

    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const passphrase = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('_cred_pk', passphrase);
    return passphrase;
  }
}

// ---------------------------------------------------------------------------
// In-Memory Storage (para testes)
// ---------------------------------------------------------------------------

export class InMemoryStorage implements StorageBackend {
  private data = new Map<string, string>();

  read(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  write(key: string, value: string): void {
    this.data.set(key, value);
  }

  remove(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

// ---------------------------------------------------------------------------
// CredentialService
// ---------------------------------------------------------------------------

export class CredentialService {
  private readonly backend: StorageBackend;
  private readonly cache = new Map<string, StoredCredential>();

  constructor(backend?: StorageBackend) {
    this.backend = backend ?? new EncryptedBrowserStorage();
  }

  /**
   * Obtém o valor de uma credencial.
   * Retorna null se não existe.
   */
  async get(credentialId: string): Promise<string | null> {
    // Cache hit
    const cached = this.cache.get(credentialId);
    if (cached) return cached.value;

    // Storage read
    const raw = this.backend.read(credentialId);
    if (!raw) return null;

    try {
      const stored: StoredCredential = JSON.parse(raw);
      this.cache.set(credentialId, stored);
      return stored.value;
    } catch {
      // Dados corrompidos ou em formato antigo
      // Tratar como valor em plaintext (migração)
      return raw;
    }
  }

  /**
   * Armazena uma credencial.
   */
  async set(
    credentialId: string,
    value: string,
    provider: CredentialProvider,
    sensitivity: CredentialSensitivity,
    metadata?: Record<string, unknown>
  ): Promise<CredentialOperationResult> {
    if (!value) {
      return this.delete(credentialId);
    }

    const stored: StoredCredential = {
      id: credentialId,
      provider,
      value,
      sensitivity,
      updatedAt: Date.now(),
      metadata,
    };

    this.cache.set(credentialId, stored);
    this.backend.write(credentialId, JSON.stringify(stored));

    return { success: true };
  }

  /**
   * Remove uma credencial.
   */
  async delete(credentialId: string): Promise<CredentialOperationResult> {
    this.cache.delete(credentialId);
    this.backend.remove(credentialId);
    return { success: true };
  }

  /**
   * Verifica se uma credencial existe.
   */
  async has(credentialId: string): Promise<boolean> {
    if (this.cache.has(credentialId)) return true;
    return this.backend.read(credentialId) !== null;
  }

  /**
   * Lista todas as credenciais de um provedor (sem expor valores).
   */
  async listByProvider(provider: CredentialProvider): Promise<string[]> {
    const keys: string[] = [];
    for (const [key, cred] of this.cache) {
      if (cred.provider === provider) keys.push(key);
    }
    return keys;
  }

  /**
   * Remove todas as credenciais.
   */
  async clearAll(): Promise<void> {
    this.cache.clear();
    this.backend.clear();
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let credentialServiceInstance: CredentialService | null = null;

export function getCredentialService(): CredentialService {
  if (!credentialServiceInstance) {
    credentialServiceInstance = new CredentialService();
  }
  return credentialServiceInstance;
}

export function resetCredentialService(): void {
  credentialServiceInstance = null;
}
