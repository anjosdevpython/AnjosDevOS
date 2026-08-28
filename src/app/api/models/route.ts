import { NextResponse } from 'next/server';
import { getModels } from '@/lib/ai/api-client';

export async function GET() {
  try {
    const result = await getModels();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
