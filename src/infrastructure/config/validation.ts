/**
 * Config Validation
 * Parsers tolerantes: valor inválido nunca derruba o boot — cai no default e
 * registra um `ConfigIssue` inspecionável.
 *
 * Camada: INFRASTRUCTURE. Zero dependências externas (sem Zod nesta fase).
 */

import type { ConfigIssue, EnvSource } from './types';

export class ConfigValidationError extends Error {
  readonly issues: readonly ConfigIssue[];

  constructor(issues: readonly ConfigIssue[]) {
    const details = issues.map((i) => `${i.path}: ${i.message}`).join('; ');
    super(`Configuração inválida — ${details}`);
    this.name = 'ConfigValidationError';
    this.issues = issues;
  }
}

/** Lançado ao tentar ler configuração PRIVATE/SECRET fora do servidor. */
export class ConfigAccessError extends Error {
  constructor(section: string) {
    super(
      `Acesso negado à configuração "${section}": seção não-pública não pode ser ` +
        `lida em código client-side. Use getPublicConfig() no cliente.`
    );
    this.name = 'ConfigAccessError';
  }
}

/** Coletor de problemas encontrados durante o carregamento. */
export class IssueCollector {
  private readonly issues: ConfigIssue[] = [];

  add(issue: ConfigIssue): void {
    this.issues.push(issue);
  }

  list(): readonly ConfigIssue[] {
    return [...this.issues];
  }

  get hasIssues(): boolean {
    return this.issues.length > 0;
  }
}

export interface NumberRule {
  min?: number;
  max?: number;
  integer?: boolean;
}

export function readString(
  env: EnvSource,
  key: string,
  fallback: string,
  issues: IssueCollector
): string {
  const raw = env[key];
  if (raw === undefined) return fallback;

  const value = raw.trim();
  if (value.length === 0) {
    issues.add({ path: key, message: 'string vazia', received: raw, fallback });
    return fallback;
  }
  return value;
}

export function readNumber(
  env: EnvSource,
  key: string,
  fallback: number,
  rule: NumberRule,
  issues: IssueCollector
): number {
  const raw = env[key];
  if (raw === undefined) return fallback;

  const parsed = rule.integer === false ? Number.parseFloat(raw) : Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed)) {
    issues.add({ path: key, message: 'não é um número válido', received: raw, fallback });
    return fallback;
  }

  if (rule.min !== undefined && parsed < rule.min) {
    issues.add({
      path: key,
      message: `abaixo do mínimo (${rule.min})`,
      received: raw,
      fallback,
    });
    return fallback;
  }

  if (rule.max !== undefined && parsed > rule.max) {
    issues.add({
      path: key,
      message: `acima do máximo (${rule.max})`,
      received: raw,
      fallback,
    });
    return fallback;
  }

  return parsed;
}

const TRUTHY = new Set(['true', '1', 'yes', 'on', 'enabled']);
const FALSY = new Set(['false', '0', 'no', 'off', 'disabled']);

export function readBoolean(
  env: EnvSource,
  key: string,
  fallback: boolean,
  issues: IssueCollector
): boolean {
  const raw = env[key];
  if (raw === undefined) return fallback;

  const value = raw.trim().toLowerCase();
  if (TRUTHY.has(value)) return true;
  if (FALSY.has(value)) return false;

  issues.add({ path: key, message: 'não é um booleano válido', received: raw, fallback });
  return fallback;
}

export function readEnum<T extends string>(
  env: EnvSource,
  key: string,
  allowed: readonly T[],
  fallback: T,
  issues: IssueCollector
): T {
  const raw = env[key];
  if (raw === undefined) return fallback;

  const value = raw.trim().toLowerCase() as T;
  if (allowed.includes(value)) return value;

  issues.add({
    path: key,
    message: `valor fora do conjunto permitido (${allowed.join(', ')})`,
    received: raw,
    fallback,
  });
  return fallback;
}
