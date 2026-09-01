import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/application/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt, size = '1024x1024', n = 1 } = body;

    if (!model || !prompt) {
      return NextResponse.json(
        { error: 'model e prompt são obrigatórios' },
        { status: 400 }
      );
    }

    const ai = getAIService();
    const result = await ai.generateImage({ model, prompt, size, n });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
