import { NextResponse } from 'next/server';
import { getAIService } from '@/application/ai';

export async function GET() {
  try {
    const ai = getAIService();
    const result = await ai.getModels();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
