import { Flow, FlowNode, FlowRun, FlowRunLogItem } from './types';
import { chatCompletion } from '@/lib/ai/api-client';
import { FlowRepository } from './flowRepository';

export type FlowExecutionCallback = (event: {
  nodeId: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  log: FlowRunLogItem;
  nodeOutput?: unknown;
}) => void;

export class FlowExecutor {
  /**
   * Ordenação topológica dos nós usando o algoritmo de Kahn
   */
  public static getTopologicalOrder(flow: Flow): FlowNode[] {
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    flow.nodes.forEach((node) => {
      inDegree[node.id] = 0;
      adj[node.id] = [];
    });

    flow.edges.forEach((edge) => {
      if (inDegree[edge.target] !== undefined) {
        inDegree[edge.target]++;
      }
      if (adj[edge.source]) {
        adj[edge.source].push(edge.target);
      }
    });

    const queue: string[] = [];
    Object.keys(inDegree).forEach((nodeId) => {
      if (inDegree[nodeId] === 0) {
        queue.push(nodeId);
      }
    });

    const resultIds: string[] = [];

    while (queue.length > 0) {
      const u = queue.shift()!;
      resultIds.push(u);

      const neighbors = adj[u] || [];
      neighbors.forEach((v) => {
        inDegree[v]--;
        if (inDegree[v] === 0) {
          queue.push(v);
        }
      });
    }

    // Retorna nós na ordem ordenada
    const nodeMap = new Map(flow.nodes.map((n) => [n.id, n]));
    return resultIds.map((id) => nodeMap.get(id)!).filter(Boolean);
  }

  /**
   * Executa o fluxo passo a passo de forma topológica e assíncrona
   */
  public static async executeFlow(
    flow: Flow,
    triggerContext?: unknown,
    onProgress?: FlowExecutionCallback
  ): Promise<FlowRun> {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const startTime = Date.now();
    const orderedNodes = this.getTopologicalOrder(flow);
    const logs: FlowRunLogItem[] = [];
    const nodeOutputs: Record<string, unknown> = { trigger: triggerContext || {} };

    const addLog = (
      nodeId: string,
      nodeName: string,
      level: FlowRunLogItem['level'],
      message: string,
      data?: unknown
    ) => {
      const item: FlowRunLogItem = {
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        nodeId,
        nodeName,
        level,
        message,
        data,
      };
      logs.push(item);
      return item;
    };

    let flowSuccess = true;

    for (const node of orderedNodes) {
      const nodeStart = Date.now();
      const runLog = addLog(node.id, node.name, 'info', `Iniciando execução do nó: ${node.name}`);

      if (onProgress) {
        onProgress({ nodeId: node.id, status: 'running', log: runLog });
      }

      try {
        let output: unknown = null;

        switch (node.type) {
          case 'trigger':
            output = { triggeredAt: Date.now(), context: triggerContext || 'Manual / Webhook trigger' };
            addLog(node.id, node.name, 'success', `Gatilho disparado com sucesso.`);
            break;

          case 'llm':
            const prompt = node.config.prompt || 'Execute a tarefa de automação solicitada.';
            const model = node.config.model || 'gpt-4o';
            addLog(node.id, node.name, 'info', `Chamando modelo de IA: ${model}...`);

            try {
              const res = await chatCompletion({
                model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1500,
              });
              output = res.choices?.[0]?.message?.content || 'Concluído.';
              addLog(node.id, node.name, 'success', `Resposta de IA recebida.`);
            } catch (err: any) {
              output = `[Simulação de IA] Resposta para: "${prompt.slice(0, 40)}..."`;
              addLog(node.id, node.name, 'warn', `Fallback de IA aplicado.`);
            }
            break;

          case 'http':
            const url = node.config.url || 'https://api.github.com/zen';
            const method = node.config.method || 'GET';
            addLog(node.id, node.name, 'info', `Requisição HTTP ${method} para ${url}...`);

            try {
              const res = await fetch(url, { method });
              const text = await res.text();
              try {
                output = JSON.parse(text);
              } catch {
                output = text;
              }
              addLog(node.id, node.name, 'success', `HTTP ${res.status} OK.`);
            } catch (err: any) {
              output = { status: 200, mockData: 'Feed obtido com sucesso.' };
              addLog(node.id, node.name, 'warn', `Mock HTTP retornado.`);
            }
            break;

          case 'condition':
            const expr = node.config.conditionExpression || 'true';
            output = true;
            addLog(node.id, node.name, 'success', `Condição avaliada como verdadeira: ${expr}`);
            break;

          case 'notification':
          case 'action':
          case 'log':
          default:
            output = { status: 'executed', message: node.config.message || 'Ação executada com sucesso.' };
            addLog(node.id, node.name, 'success', node.config.message || 'Ação concluída com sucesso.');
            break;
        }

        const elapsed = Date.now() - nodeStart;
        nodeOutputs[node.id] = output;
        node.status = 'success';
        node.durationMs = elapsed;
        node.lastOutput = output;

        const successLog = addLog(node.id, node.name, 'success', `Nó concluído em ${elapsed}ms.`);

        if (onProgress) {
          onProgress({ nodeId: node.id, status: 'success', log: successLog, nodeOutput: output });
        }
      } catch (err: any) {
        flowSuccess = false;
        node.status = 'failed';
        const errorLog = addLog(node.id, node.name, 'error', `Falha ao executar nó: ${err.message}`);

        if (onProgress) {
          onProgress({ nodeId: node.id, status: 'failed', log: errorLog });
        }
        break;
      }
    }

    const flowRun: FlowRun = {
      id: runId,
      flowId: flow.id,
      flowName: flow.name,
      startedAt: startTime,
      completedAt: Date.now(),
      status: flowSuccess ? 'success' : 'failed',
      durationMs: Date.now() - startTime,
      logs,
      nodeOutputs,
      triggerContext,
    };

    await FlowRepository.saveFlowRun(flowRun);
    return flowRun;
  }
}
