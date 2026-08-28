import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, chatCompletionStream } from '@/lib/ai/api-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, messages, temperature = 0.7, stream = false } = body;

    if (!model || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'model e messages são obrigatórios' },
        { status: 400 }
      );
    }

    if (stream) {
      const streamResponse = await chatCompletionStream({
        model,
        messages,
        temperature,
        stream: true,
      });

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const result = await chatCompletion({
      model,
      messages,
      temperature,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
