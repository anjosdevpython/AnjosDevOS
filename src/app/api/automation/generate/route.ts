import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai/api-client';
import { Flow } from '@/lib/automation/types';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = 'gpt-4o' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 });
    }

    const systemPrompt = `Você é o arquiteto de automações do AnjosDevOS. Converta a descrição de automação do usuário em um grafo de fluxo (Flow) estruturado em JSON com nós e conexões.
Formato de saída estritamente JSON:
{
  "id": "flow-gerado-${Date.now()}",
  "name": "Nome conciso do Fluxo com emoji",
  "description": "Descrição do fluxo",
  "triggerType": "manual | cron | webhook | git_push",
  "nodes": [
    {
      "id": "node-1",
      "name": "Nome do Nó",
      "type": "trigger | llm | code | http | condition | action | notification",
      "x": 60,
      "y": 120,
      "config": {
        "prompt": "instruções para IA",
        "url": "url se for http",
        "method": "GET | POST",
        "message": "mensagem da ação"
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node-1", "target": "node-2" }
  ]
}`;

    try {
      const response = await chatCompletion({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices?.[0]?.message?.content?.trim() || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const flowData: Flow = JSON.parse(jsonMatch[0]);
        flowData.createdAt = Date.now();
        flowData.updatedAt = Date.now();
        return NextResponse.json({ success: true, flow: flowData });
      }
    } catch (llmErr) {
      console.warn('Fallback local para geração de fluxo:', llmErr);
    }

    // Fallback estruturado inteligente
    const generatedFlow: Flow = {
      id: `flow-gen-${Date.now()}`,
      name: `⚡ Automação: ${prompt.slice(0, 30)}...`,
      description: prompt,
      triggerType: 'manual',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      nodes: [
        {
          id: 'node-1',
          name: 'Início Manual',
          type: 'trigger',
          x: 60,
          y: 140,
          config: { message: 'Início do fluxo' },
          status: 'idle',
        },
        {
          id: 'node-2',
          name: 'Processamento com IA',
          type: 'llm',
          x: 340,
          y: 140,
          config: { prompt, model: 'gpt-4o' },
          status: 'idle',
        },
        {
          id: 'node-3',
          name: 'Gravação de Resultados',
          type: 'action',
          x: 640,
          y: 140,
          config: { message: 'Registrar saída no workspace' },
          status: 'idle',
        },
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2' },
        { id: 'e2-3', source: 'node-2', target: 'node-3' },
      ],
    };

    return NextResponse.json({ success: true, flow: generatedFlow });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
