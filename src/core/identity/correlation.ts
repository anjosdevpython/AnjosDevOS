/**
 * Correlation IDs
 * Identificadores usados para correlacionar eventos e logs de um mesmo fluxo.
 *
 * Camada: CORE. Sem dependências.
 */

/**
 * Gera um identificador de correlação com prefixo.
 * Usa `crypto.randomUUID()` quando disponível; senão, um fallback determinístico
 * em formato compatível (ambientes antigos e jsdom).
 */
export function createCorrelationId(prefix: string): string {
  return `${prefix}_${randomSuffix()}`;
}

/** Atalho para o identificador de trace ponta a ponta. */
export function createTraceId(): string {
  return createCorrelationId('trace');
}

function randomSuffix(): string {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return cryptoRef.randomUUID();
  }

  if (cryptoRef && typeof cryptoRef.getRandomValues === 'function') {
    const bytes = cryptoRef.getRandomValues(new Uint8Array(8));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 11)}`;
}
