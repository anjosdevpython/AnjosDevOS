import { describe, it, expect } from 'vitest';
import { rateLimiter } from '@/lib/security/rateLimiter';
import { SecurityVault } from '@/lib/security/vault';

describe('Security Vault & Rate Limiter', () => {
  it('deve permitir requisições dentro do limite e decrementar o bucket', () => {
    const testIp = `192.168.10.${Math.floor(Math.random() * 200)}`;
    const result1 = rateLimiter.checkRateLimit(testIp);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(59);

    const result2 = rateLimiter.checkRateLimit(testIp);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(58);
  });

  it('deve registrar e recuperar logs de auditoria de requisições', () => {
    rateLimiter.logAudit({
      ip: '127.0.0.1',
      endpoint: '/api/chat',
      method: 'POST',
      status: 200,
      durationMs: 145,
      model: 'gpt-4o',
    });

    const logs = rateLimiter.getAuditLogs(10);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].endpoint).toBe('/api/chat');
    expect(logs[0].model).toBe('gpt-4o');
  });

  it('deve expor apenas booleanos de status no getPublicProviderStatus sem vazar chaves', () => {
    const status = SecurityVault.getPublicProviderStatus();
    expect(typeof status.openai).toBe('boolean');
    expect(typeof status.anthropic).toBe('boolean');
    expect(typeof status.google).toBe('boolean');
  });
});
