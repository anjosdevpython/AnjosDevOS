import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/application/ai';
import { rateLimiter } from '@/lib/security/rateLimiter';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Rate Limiting Check
  const rateLimit = rateLimiter.checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Limite de requisições excedido. Tente novamente em alguns segundos.',
        resetTime: rateLimit.resetTime,
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { model, messages, temperature = 0.7, stream = false, provider } = body;

    if (!model || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'model e messages são obrigatórios' },
        { status: 400 }
      );
    }

    if (stream) {
      const ai = getAIService();
      const streamResponse = await ai.chatStream({
        model,
        messages,
        temperature,
        stream: true,
        provider,
      });

      rateLimiter.logAudit({
        ip,
        endpoint: '/api/chat',
        method: 'POST',
        status: 200,
        durationMs: Date.now() - startTime,
        model,
      });

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const ai = getAIService();
    const result = await ai.chat({
      model,
      messages,
      temperature,
      provider,
    });

    rateLimiter.logAudit({
      ip,
      endpoint: '/api/chat',
      method: 'POST',
      status: 200,
      durationMs: Date.now() - startTime,
      model,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    rateLimiter.logAudit({
      ip,
      endpoint: '/api/chat',
      method: 'POST',
      status: 500,
      durationMs: Date.now() - startTime,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
