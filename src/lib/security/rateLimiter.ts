export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  ip: string;
  endpoint: string;
  method: string;
  status: number;
  durationMs: number;
  provider?: string;
  model?: string;
}

class SecurityRateLimiter {
  private requestBuckets: Map<string, { count: number; resetAt: number }> = new Map();
  private auditLogs: SecurityAuditLog[] = [];
  private readonly MAX_REQUESTS_PER_MINUTE = 60;

  /**
   * Valida rate limit por IP (60 requisições por minuto)
   */
  public checkRateLimit(ip: string): RateLimitResult {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const bucket = this.requestBuckets.get(ip);

    if (!bucket || now > bucket.resetAt) {
      this.requestBuckets.set(ip, { count: 1, resetAt: now + windowMs });
      return {
        allowed: true,
        remaining: this.MAX_REQUESTS_PER_MINUTE - 1,
        resetTime: now + windowMs,
      };
    }

    if (bucket.count >= this.MAX_REQUESTS_PER_MINUTE) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: bucket.resetAt,
      };
    }

    bucket.count++;
    return {
      allowed: true,
      remaining: this.MAX_REQUESTS_PER_MINUTE - bucket.count,
      resetTime: bucket.resetAt,
    };
  }

  /**
   * Grava log de auditoria de requisição de IA
   */
  public logAudit(log: Omit<SecurityAuditLog, 'id' | 'timestamp'>): void {
    const entry: SecurityAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
  }

  public getAuditLogs(limit = 50): SecurityAuditLog[] {
    return this.auditLogs.slice(0, limit);
  }
}

export const rateLimiter = new SecurityRateLimiter();
