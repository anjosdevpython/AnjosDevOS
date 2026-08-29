import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/security/rateLimiter';
import { SecurityVault } from '@/lib/security/vault';

export async function GET(req: NextRequest) {
  const logs = rateLimiter.getAuditLogs(50);
  const providers = SecurityVault.getPublicProviderStatus();

  return NextResponse.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    providers,
    auditLogs: logs,
  });
}
