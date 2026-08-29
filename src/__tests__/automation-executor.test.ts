import { describe, it, expect } from 'vitest';
import { FlowExecutor } from '@/lib/automation/flowExecutor';
import type { Flow } from '@/lib/automation/types';

describe('Automation Flow Executor (Topological DAG)', () => {
  const sampleFlow: Flow = {
    id: 'test-flow',
    name: 'Fluxo de Teste',
    description: 'Teste do executor',
    triggerType: 'manual',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nodes: [
      { id: 'n1', name: 'Trigger', type: 'trigger', x: 0, y: 0, config: {} },
      { id: 'n2', name: 'Step 1', type: 'action', x: 100, y: 0, config: { message: 'Ação 1' } },
      { id: 'n3', name: 'Step 2', type: 'action', x: 200, y: 0, config: { message: 'Ação 2' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
    ],
  };

  it('deve ordenar os nós em ordem topológica correta (Kahn algorithm)', () => {
    const ordered = FlowExecutor.getTopologicalOrder(sampleFlow);
    expect(ordered.length).toBe(3);
    expect(ordered[0].id).toBe('n1');
    expect(ordered[1].id).toBe('n2');
    expect(ordered[2].id).toBe('n3');
  });

  it('deve executar o fluxo e retornar FlowRun com status success e logs', async () => {
    const run = await FlowExecutor.executeFlow(sampleFlow);
    expect(run.status).toBe('success');
    expect(run.flowId).toBe('test-flow');
    expect(run.logs.length).toBeGreaterThan(0);
  });
});
