/**
 * Sanitização de secrets
 * Regra de segurança: API keys, GitHub PATs, senhas, tokens, secrets e headers
 * de autorização NUNCA podem chegar a um registro de log.
 *
 * Duas camadas de defesa:
 * 1. Por CHAVE  — qualquer campo cujo nome sugira segredo é redigido inteiro.
 * 2. Por VALOR  — padrões conhecidos (sk-…, ghp_…, Bearer …, chave=valor).
 *
 * Camada: INFRASTRUCTURE. Zero dependências externas.
 */

export const REDACTED = '[REDACTED]';

/**
 * Fragmentos que, presentes no nome normalizado da chave, marcam o campo como
 * secreto. A chave é normalizada removendo separadores e caixa:
 * `API_KEY` / `api-key` / `apiKey` -> `apikey`.
 */
const SENSITIVE_KEY_FRAGMENTS: readonly string[] = [
  'apikey',
  'accesskey',
  'secretkey',
  'privatekey',
  'publickey',
  'secret',
  'password',
  'passwd',
  'pwd',
  'passphrase',
  'token',
  'authorization',
  'credential',
  'bearer',
  'signature',
  'cookie',
  'sessionkey',
  'githubpat',
];

/** Nomes de chave curtos demais para busca por fragmento (evita falso positivo). */
const SENSITIVE_KEY_EXACT: ReadonlySet<string> = new Set(['pat', 'auth', 'jwt']);

/**
 * Padrões de valor que denunciam um segredo mesmo sob uma chave inocente.
 * A ordem importa: padrões mais específicos vêm primeiro para que o valor seja
 * redigido antes de um padrão genérico consumir apenas o rótulo.
 */
const SENSITIVE_VALUE_PATTERNS: readonly RegExp[] = [
  // Header Authorization: Bearer|Basic <token>
  /\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{10,}/gi,
  // JWT
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+/g,
  // Anthropic
  /\bsk-ant-[A-Za-z0-9_-]{10,}/g,
  // OpenAI e compatíveis
  /\bsk-[A-Za-z0-9_-]{8,}/g,
  // GitHub PAT (classic, oauth, user-to-server, server-to-server, refresh)
  /\bgh[pousr]_[A-Za-z0-9_]{16,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  // Slack
  /\bxox[abposr]-[A-Za-z0-9-]{8,}/g,
  // AWS access key id
  /\bAKIA[0-9A-Z]{16}\b/g,
  // Google API key
  /\bAIza[0-9A-Za-z_-]{30,}\b/g,
  // chave=valor / chave: valor embutidos em texto livre (genérico, por último)
  /\b(api[-_]?key|apikey|access[-_]?key|secret[-_]?key|client[-_]?secret|secret|password|passwd|pwd|passphrase|access[-_]?token|refresh[-_]?token|token|authorization|credentials?)\b\s*[:=]\s*["']?[^\s,;"'&}{]+["']?/gi,
];

/** Profundidade máxima ao percorrer objetos (protege contra estruturas fundas). */
const MAX_DEPTH = 8;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** `true` se o nome da chave indica um campo secreto. */
export function isSensitiveKey(key: string): boolean {
  const normalized = normalizeKey(key);
  if (SENSITIVE_KEY_EXACT.has(normalized)) return true;
  return SENSITIVE_KEY_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

/** Redige padrões de segredo dentro de uma string livre. */
export function sanitizeString(value: string): string {
  let result = value;
  for (const pattern of SENSITIVE_VALUE_PATTERNS) {
    // `lastIndex` é reiniciado porque os padrões são globais e reutilizados.
    pattern.lastIndex = 0;
    result = result.replace(pattern, REDACTED);
  }
  return result;
}

/**
 * Percorre qualquer valor redigindo segredos. Estruturas cíclicas são
 * detectadas e substituídas por `'[Circular]'`.
 */
export function sanitizeValue(value: unknown): unknown {
  return sanitizeInternal(value, 0, new WeakSet<object>());
}

/** Sanitiza um `LogContext` preservando o formato de objeto. */
export function sanitizeContext<T extends Record<string, unknown>>(context: T): T {
  return sanitizeInternal(context, 0, new WeakSet<object>()) as T;
}

function sanitizeInternal(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (typeof value === 'string') return sanitizeString(value);

  if (value === null || value === undefined) return value;

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return value;
  }

  if (typeof value === 'function' || typeof value === 'symbol') {
    return `[${typeof value}]`;
  }

  if (value instanceof Date) return value.toISOString();

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeString(value.message),
      stack: value.stack ? sanitizeString(value.stack) : undefined,
    };
  }

  if (depth >= MAX_DEPTH) return '[MaxDepth]';

  const asObject = value as object;
  if (seen.has(asObject)) return '[Circular]';
  seen.add(asObject);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeInternal(item, depth + 1, seen));
  }

  if (value instanceof Map) {
    const mapped: Record<string, unknown> = {};
    value.forEach((entryValue, entryKey) => {
      const key = String(entryKey);
      mapped[key] = isSensitiveKey(key)
        ? REDACTED
        : sanitizeInternal(entryValue, depth + 1, seen);
    });
    return mapped;
  }

  if (value instanceof Set) {
    return Array.from(value).map((item) => sanitizeInternal(item, depth + 1, seen));
  }

  const output: Record<string, unknown> = {};
  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    output[key] = isSensitiveKey(key)
      ? REDACTED
      : sanitizeInternal(entryValue, depth + 1, seen);
  }
  return output;
}
