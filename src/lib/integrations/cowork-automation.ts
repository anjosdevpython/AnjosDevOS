/**
 * CoWork Automation Studio Integration
 * Visual flow builder with variables, branches, approvals, and durable activity
 * Based on CoWork-OS Automation Studio architecture
 */

export type FlowNodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'approval' | 'loop' | 'parallel' | 'output';

export type FlowStatus = 'draft' | 'active' | 'paused' | 'error' | 'completed';

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  name: string;
  description: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  inputs: string[];
  outputs: string[];
  enabled: boolean;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: unknown;
  description?: string;
}

export interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: FlowStatus;
  version: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  runCount: number;
  tags: string[];
}

export interface FlowExecution {
  id: string;
  flowId: string;
  status: 'running' | 'completed' | 'failed' | 'waiting_approval';
  startedAt: Date;
  completedAt?: Date;
  currentNodeId?: string;
  outputs: Record<string, unknown>;
  error?: string;
  approvals: FlowApproval[];
}

export interface FlowApproval {
  id: string;
  nodeId: string;
  message: string;
  options: string[];
  status: 'pending' | 'approved' | 'rejected';
  respondedAt?: Date;
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'notification' | 'data' | 'integration' | 'schedule' | 'agent';
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];
  tags: string[];
}

export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: 'daily-report',
    name: 'Daily Report',
    description: 'Gere relatório diário automaticamente',
    icon: '📊',
    color: '#3b82f6',
    category: 'schedule',
    nodes: [
      { id: 'trigger', type: 'trigger', name: 'Schedule', description: 'Executa todo dia às 18:00', config: { cron: '0 18 * * *' }, position: { x: 0, y: 0 }, inputs: [], outputs: ['collect'], enabled: true },
      { id: 'collect', type: 'action', name: 'Collect Data', description: 'Coleta dados do dia', config: { source: 'tasks' }, position: { x: 200, y: 0 }, inputs: ['trigger'], outputs: ['generate'], enabled: true },
      { id: 'generate', type: 'action', name: 'Generate Report', description: 'Gera relatório', config: { template: 'daily' }, position: { x: 400, y: 0 }, inputs: ['collect'], outputs: ['send'], enabled: true },
      { id: 'send', type: 'action', name: 'Send Report', description: 'Envia por email/Slack', config: { channel: 'email' }, position: { x: 600, y: 0 }, inputs: ['generate'], outputs: [], enabled: true },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'collect' },
      { id: 'e2', source: 'collect', target: 'generate' },
      { id: 'e3', source: 'generate', target: 'send' },
    ],
    variables: [{ name: 'reportDate', type: 'string', description: 'Data do relatório' }],
    tags: ['schedule', 'report', 'email'],
  },
  {
    id: 'code-review',
    name: 'Code Review Bot',
    description: 'Revise PRs automaticamente',
    icon: '🔍',
    color: '#8b5cf6',
    category: 'agent',
    nodes: [
      { id: 'trigger', type: 'trigger', name: 'PR Created', description: 'Quando um PR é criado', config: { event: 'pr.created' }, position: { x: 0, y: 0 }, inputs: [], outputs: ['analyze'], enabled: true },
      { id: 'analyze', type: 'action', name: 'Analyze Code', description: 'Analisa o código do PR', config: { model: 'claude-sonnet-4-20250514' }, position: { x: 200, y: 0 }, inputs: ['trigger'], outputs: ['check'], enabled: true },
      { id: 'check', type: 'condition', name: 'Has Issues?', description: 'Verifica se há problemas', config: { field: 'issues', operator: 'gt', value: 0 }, position: { x: 400, y: 0 }, inputs: ['analyze'], outputs: ['comment', 'approve'], enabled: true },
      { id: 'comment', type: 'action', name: 'Post Comment', description: 'Posta comentário no PR', config: { action: 'comment' }, position: { x: 600, y: -100 }, inputs: ['check'], outputs: [], enabled: true },
      { id: 'approve', type: 'action', name: 'Approve PR', description: 'Aprova o PR', config: { action: 'approve' }, position: { x: 600, y: 100 }, inputs: ['check'], outputs: [], enabled: true },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'analyze' },
      { id: 'e2', source: 'analyze', target: 'check' },
      { id: 'e3', source: 'check', target: 'comment', label: 'Yes' },
      { id: 'e4', source: 'check', target: 'approve', label: 'No' },
    ],
    variables: [{ name: 'prNumber', type: 'number', description: 'Número do PR' }],
    tags: ['github', 'code-review', 'agent'],
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'Pipeline de processamento de dados',
    icon: '🔄',
    color: '#10b981',
    category: 'data',
    nodes: [
      { id: 'trigger', type: 'trigger', name: 'Data Received', description: 'Quando dados chegam', config: { event: 'webhook' }, position: { x: 0, y: 0 }, inputs: [], outputs: ['validate'], enabled: true },
      { id: 'validate', type: 'action', name: 'Validate', description: 'Valida os dados', config: { schema: 'auto' }, position: { x: 200, y: 0 }, inputs: ['trigger'], outputs: ['transform'], enabled: true },
      { id: 'transform', type: 'action', name: 'Transform', description: 'Transforma os dados', config: { operations: [] }, position: { x: 400, y: 0 }, inputs: ['validate'], outputs: ['store'], enabled: true },
      { id: 'store', type: 'action', name: 'Store', description: 'Armazena no banco', config: { target: 'database' }, position: { x: 600, y: 0 }, inputs: ['transform'], outputs: ['notify'], enabled: true },
      { id: 'notify', type: 'action', name: 'Notify', description: 'Envia notificação', config: { channel: 'slack' }, position: { x: 800, y: 0 }, inputs: ['store'], outputs: [], enabled: true },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'validate' },
      { id: 'e2', source: 'validate', target: 'transform' },
      { id: 'e3', source: 'transform', target: 'store' },
      { id: 'e4', source: 'store', target: 'notify' },
    ],
    variables: [
      { name: 'dataSource', type: 'string', description: 'Fonte dos dados' },
      { name: 'targetTable', type: 'string', description: 'Tabela de destino' },
    ],
    tags: ['data', 'pipeline', 'etl'],
  },
  {
    id: 'monitoring',
    name: 'Uptime Monitor',
    description: 'Monitore sites e serviços',
    icon: '🛡️',
    color: '#ef4444',
    category: 'notification',
    nodes: [
      { id: 'trigger', type: 'trigger', name: 'Schedule', description: 'A cada 5 minutos', config: { cron: '*/5 * * * *' }, position: { x: 0, y: 0 }, inputs: [], outputs: ['check'], enabled: true },
      { id: 'check', type: 'action', name: 'Health Check', description: 'Verifica o endpoint', config: { method: 'GET', timeout: 10000 }, position: { x: 200, y: 0 }, inputs: ['trigger'], outputs: ['condition'], enabled: true },
      { id: 'condition', type: 'condition', name: 'Is Up?', description: 'Verifica status', config: { field: 'statusCode', operator: 'eq', value: 200 }, position: { x: 400, y: 0 }, inputs: ['check'], outputs: ['ok', 'alert'], enabled: true },
      { id: 'ok', type: 'action', name: 'Log Success', description: 'Registra sucesso', config: { action: 'log' }, position: { x: 600, y: -100 }, inputs: ['condition'], outputs: [], enabled: true },
      { id: 'alert', type: 'action', name: 'Send Alert', description: 'Envia alerta', config: { channel: 'all', priority: 'high' }, position: { x: 600, y: 100 }, inputs: ['condition'], outputs: [], enabled: true },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check' },
      { id: 'e2', source: 'check', target: 'condition' },
      { id: 'e3', source: 'condition', target: 'ok', label: 'Yes' },
      { id: 'e4', source: 'condition', target: 'alert', label: 'No' },
    ],
    variables: [
      { name: 'url', type: 'string', description: 'URL para monitorar' },
      { name: 'expectedStatus', type: 'number', defaultValue: 200, description: 'Status esperado' },
    ],
    tags: ['monitoring', 'uptime', 'alerts'],
  },
  {
    id: 'deploy',
    name: 'Deploy Pipeline',
    description: 'Pipeline de deploy automatizado',
    icon: '🚀',
    color: '#f59e0b',
    category: 'integration',
    nodes: [
      { id: 'trigger', type: 'trigger', name: 'Push to Main', description: 'Quando code é pushado para main', config: { event: 'push', branch: 'main' }, position: { x: 0, y: 0 }, inputs: [], outputs: ['test'], enabled: true },
      { id: 'test', type: 'action', name: 'Run Tests', description: 'Executa testes', config: { command: 'npm test' }, position: { x: 200, y: 0 }, inputs: ['trigger'], outputs: ['check'], enabled: true },
      { id: 'check', type: 'condition', name: 'Tests Pass?', description: 'Verifica se testes passaram', config: { field: 'exitCode', operator: 'eq', value: 0 }, position: { x: 400, y: 0 }, inputs: ['test'], outputs: ['build', 'fail'], enabled: true },
      { id: 'build', type: 'action', name: 'Build', description: 'Build do projeto', config: { command: 'npm run build' }, position: { x: 600, y: -100 }, inputs: ['check'], outputs: ['approve'], enabled: true },
      { id: 'fail', type: 'action', name: 'Notify Failure', description: 'Notifica falha', config: { channel: 'slack' }, position: { x: 600, y: 100 }, inputs: ['check'], outputs: [], enabled: true },
      { id: 'approve', type: 'approval', name: 'Manual Approval', description: 'Aprovação manual antes de deploy', config: { approvers: ['admin'] }, position: { x: 800, y: -100 }, inputs: ['build'], outputs: ['deploy'], enabled: true },
      { id: 'deploy', type: 'action', name: 'Deploy', description: 'Faz deploy', config: { target: 'production' }, position: { x: 1000, y: -100 }, inputs: ['approve'], outputs: [], enabled: true },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'test' },
      { id: 'e2', source: 'test', target: 'check' },
      { id: 'e3', source: 'check', target: 'build', label: 'Pass' },
      { id: 'e4', source: 'check', target: 'fail', label: 'Fail' },
      { id: 'e5', source: 'build', target: 'approve' },
      { id: 'e6', source: 'approve', target: 'deploy' },
    ],
    variables: [
      { name: 'branch', type: 'string', description: 'Branch de deploy' },
      { name: 'environment', type: 'string', description: 'Ambiente de destino' },
    ],
    tags: ['deploy', 'ci-cd', 'automation'],
  },
];

export function createFlow(name: string, description: string, templateId?: string): AutomationFlow {
  const template = templateId ? FLOW_TEMPLATES.find(t => t.id === templateId) : null;
  
  return {
    id: `flow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    icon: template?.icon || '⚡',
    color: template?.color || '#6b7280',
    status: 'draft',
    version: 1,
    nodes: template?.nodes || [],
    edges: template?.edges || [],
    variables: template?.variables || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    runCount: 0,
    tags: template?.tags || [],
  };
}

export function getFlowsByCategory(category: FlowTemplate['category']): FlowTemplate[] {
  return FLOW_TEMPLATES.filter(t => t.category === category);
}

export function searchFlows(query: string): FlowTemplate[] {
  const lower = query.toLowerCase();
  return FLOW_TEMPLATES.filter(
    t => t.name.toLowerCase().includes(lower) ||
         t.description.toLowerCase().includes(lower) ||
         t.tags.some(tag => tag.toLowerCase().includes(lower))
  );
}
