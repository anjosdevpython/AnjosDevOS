import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ flowId: string }> }
) {
  try {
    const { flowId } = await context.params;
    const body = await req.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      message: `Webhook recebido para o fluxo ${flowId}`,
      flowId,
      triggerPayload: body,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
