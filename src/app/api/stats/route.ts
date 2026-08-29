import { NextResponse } from 'next/server';

// In-memory session stats (resets on server restart — IndexedDB holds persistent data on client)
// This endpoint aggregates telemetry written by other API routes via global counters
declare global {
  var _anjosStats: {
    totalRequests: number;
    totalTokensIn: number;
    totalTokensOut: number;
    byModel: Record<string, { requests: number; tokensIn: number; tokensOut: number }>;
    byProvider: Record<string, { requests: number }>;
    recentCalls: Array<{ ts: number; model: string; provider: string; tokensIn: number; tokensOut: number; latencyMs: number }>;
    errors: number;
    auditRuns: number;
    flowRuns: number;
  } | undefined;
}

if (!global._anjosStats) {
  global._anjosStats = {
    totalRequests: 0,
    totalTokensIn: 0,
    totalTokensOut: 0,
    byModel: {},
    byProvider: {},
    recentCalls: [],
    errors: 0,
    auditRuns: 0,
    flowRuns: 0,
  };
}

export function recordCall(model: string, provider: string, tokensIn: number, tokensOut: number, latencyMs: number) {
  const s = global._anjosStats!;
  s.totalRequests++;
  s.totalTokensIn += tokensIn;
  s.totalTokensOut += tokensOut;

  if (!s.byModel[model]) s.byModel[model] = { requests: 0, tokensIn: 0, tokensOut: 0 };
  s.byModel[model].requests++;
  s.byModel[model].tokensIn += tokensIn;
  s.byModel[model].tokensOut += tokensOut;

  if (!s.byProvider[provider]) s.byProvider[provider] = { requests: 0 };
  s.byProvider[provider].requests++;

  s.recentCalls.unshift({ ts: Date.now(), model, provider, tokensIn, tokensOut, latencyMs });
  if (s.recentCalls.length > 50) s.recentCalls.pop();
}

export function recordAudit() { global._anjosStats!.auditRuns++; }
export function recordFlowRun() { global._anjosStats!.flowRuns++; }
export function recordError() { global._anjosStats!.errors++; }

export async function GET() {
  const s = global._anjosStats!;
  return NextResponse.json({ ok: true, stats: s, uptime: process.uptime() });
}