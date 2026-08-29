import { db } from '@/lib/workspaces/db';
import type { Flow, FlowRun } from './types';

const DEFAULT_STARTER_FLOWS: Flow[] = [
  {
    id: 'flow-audit-pipeline',
    name: '🛡️ Pipeline de Auditoria OWASP & CI/CD',
    description: 'Executa auditoria estática de segurança, compilação de código e notificação em tempo real.',
    triggerType: 'git_push',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    nodes: [
      {
        id: 'node-1',
        name: 'Git Commit Trigger',
        type: 'trigger',
        x: 60,
        y: 120,
        config: { message: 'Novo commit na branch main' },
        status: 'idle',
      },
      {
        id: 'node-2',
        name: 'AnjosReviewer (OWASP)',
        type: 'llm',
        x: 320,
        y: 120,
        config: {
          prompt: 'Auditar segurança estática do commit para vulnerabilidades OWASP Top 10.',
          model: 'gpt-4o',
        },
        status: 'idle',
      },
      {
        id: 'node-3',
        name: 'Validação de Score >= 90',
        type: 'condition',
        x: 590,
        y: 120,
        config: { conditionExpression: 'output.score >= 90' },
        status: 'idle',
      },
      {
        id: 'node-4',
        name: 'Deploy Automático',
        type: 'action',
        x: 850,
        y: 80,
        config: { message: 'Disparar deploy de produção via WebContainer' },
        status: 'idle',
      },
      {
        id: 'node-5',
        name: 'Alerta de Segurança',
        type: 'notification',
        x: 850,
        y: 200,
        config: { channel: 'discord', message: 'Vulnerabilidade detectada no commit!' },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2' },
      { id: 'e2-3', source: 'node-2', target: 'node-3' },
      { id: 'e3-4', source: 'node-3', target: 'node-4', conditionValue: true },
      { id: 'e3-5', source: 'node-3', target: 'node-5', conditionValue: false },
    ],
  },
  {
    id: 'flow-ai-scraper',
    name: '🌐 Web Scraping & Síntese de Conteúdo',
    description: 'Extrai dados de páginas web e gera resumos estruturados com IA.',
    triggerType: 'cron',
    cronSchedule: '0 */6 * * *',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    nodes: [
      {
        id: 'node-1',
        name: 'Cron Trigger (6h)',
        type: 'trigger',
        x: 80,
        y: 140,
        config: { cronExpression: '0 */6 * * *' },
        status: 'idle',
      },
      {
        id: 'node-2',
        name: 'HTTP Fetch Feed',
        type: 'http',
        x: 340,
        y: 140,
        config: { url: 'https://news.ycombinator.com', method: 'GET' },
        status: 'idle',
      },
      {
        id: 'node-3',
        name: 'AnjosAutoPilot (Síntese)',
        type: 'llm',
        x: 600,
        y: 140,
        config: {
          prompt: 'Resuma os 5 principais tópicos de inteligência artificial das últimas 24h.',
          model: 'claude-3-5-sonnet',
        },
        status: 'idle',
      },
      {
        id: 'node-4',
        name: 'Gravar no Workspace',
        type: 'action',
        x: 860,
        y: 140,
        config: { message: 'Salvar relatório em docs/ai-news.md' },
        status: 'idle',
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2' },
      { id: 'e2-3', source: 'node-2', target: 'node-3' },
      { id: 'e3-4', source: 'node-3', target: 'node-4' },
    ],
  },
];

export class FlowRepository {
  static async getAllFlows(): Promise<Flow[]> {
    try {
      const flows = await db.flows.orderBy('updatedAt').reverse().toArray();
      if (flows.length === 0) {
        for (const defaultFlow of DEFAULT_STARTER_FLOWS) {
          await db.flows.put(defaultFlow);
        }
        return DEFAULT_STARTER_FLOWS;
      }
      return flows;
    } catch (e) {
      console.warn('Erro ao carregar flows de Dexie:', e);
      return DEFAULT_STARTER_FLOWS;
    }
  }

  static async getFlow(id: string): Promise<Flow | null> {
    try {
      const flow = await db.flows.get(id);
      return flow || null;
    } catch (e) {
      console.error(`Erro ao buscar flow ${id}:`, e);
      return null;
    }
  }

  static async saveFlow(flow: Flow): Promise<void> {
    try {
      await db.flows.put({
        ...flow,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.error(`Erro ao salvar flow ${flow.id}:`, e);
    }
  }

  static async deleteFlow(id: string): Promise<void> {
    try {
      await db.flows.delete(id);
    } catch (e) {
      console.error(`Erro ao deletar flow ${id}:`, e);
    }
  }

  static async saveFlowRun(run: FlowRun): Promise<void> {
    try {
      await db.flowRuns.put(run);
      // Atualiza o lastRunAt no flow
      await db.flows.update(run.flowId, {
        lastRunAt: run.startedAt,
        lastRunStatus: run.status,
      });
    } catch (e) {
      console.error('Erro ao registrar execução do flow:', e);
    }
  }

  static async getFlowRuns(flowId: string, limit = 20): Promise<FlowRun[]> {
    try {
      return await db.flowRuns.where('flowId').equals(flowId).reverse().limit(limit).toArray();
    } catch (e) {
      console.error('Erro ao buscar histórico de execuções:', e);
      return [];
    }
  }
}
