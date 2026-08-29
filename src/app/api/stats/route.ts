import { NextResponse } from 'next/server';
import { getStats } from '@/lib/stats';

export async function GET() {
  const s = getStats();
  return NextResponse.json({ ok: true, stats: s, uptime: process.uptime() });
}