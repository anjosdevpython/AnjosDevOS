/**
 * OpenHands Integration
 * AI-Driven Development - Agent Canvas
 * https://github.com/OpenHands/OpenHands
 */

export type AgentBackend = 'local' | 'docker' | 'remote' | 'cloud';
export type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'stopped';
export type AutomationStatus = 'active' | 'paused' | 'error' | 'disabled';

export interface AgentServer {
  id: string;
  name: string;
  description: string;
  backend: AgentBackend;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  agents: string[];
  createdAt: Date;
}

export interface OpenHandsAgent {
  id: string;
  name: string;
  description: string;
  serverId: string;
  model: string;
  status: AgentStatus;
  capabilities: string[];
  config: AgentConfig;
  createdAt: Date;
  lastActive?: Date;
}

export interface AgentConfig {
  sandboxEnabled: boolean;
  sandboxImage?: string;
  maxTokens?: number;
  temperature?: number;
  tools: string[];
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  status: AutomationStatus;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
}

export interface AutomationTrigger {
  type: 'schedule' | 'webhook' | 'event' | 'manual';
  config: Record<string, unknown>;
}

export interface AutomationAction {
  type: 'agent' | 'notification' | 'webhook' | 'transform';
  config: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  agentId: string;
  title: string;
  messages: Message[];
  status: 'active' | 'archived';
  createdAt: Date;
  lastMessageAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════
// Pre-configured Agent Servers
// ═══════════════════════════════════════════════════════════

export const AGENT_SERVERS: AgentServer[] = [
  {
    id: 'local',
    name: 'Local Server',
    description: 'Servidor local com acesso total ao filesystem',
    backend: 'local',
    url: 'http://localhost:8000',
    status: 'disconnected',
    agents: ['openhands', 'claude-code'],
    createdAt: new Date(),
  },
  {
    id: 'docker',
    name: 'Docker Sandbox',
    description: 'Ambiente isolado via Docker containers',
    backend: 'docker',
    url: 'http://localhost:8000',
    status: 'disconnected',
    agents: ['openhands'],
    createdAt: new Date(),
  },
  {
    id: 'cloud',
    name: 'OpenHands Cloud',
    description: 'Infraestrutura gerenciada na nuvem',
    backend: 'cloud',
    url: 'https://cloud.openhands.ai',
    status: 'disconnected',
    agents: ['openhands', 'claude-code', 'codex'],
    createdAt: new Date(),
  },
];

// ═══════════════════════════════════════════════════════════
// Pre-configured Agents
// ═══════════════════════════════════════════════════════════

export const OPENHANDS_AGENTS: OpenHandsAgent[] = [
  {
    id: 'openhands-default',
    name: 'OpenHands Agent',
    description: 'Agente padrão do OpenHands para desenvolvimento de código',
    serverId: 'local',
    model: 'gpt-4o',
    status: 'idle',
    capabilities: ['code-generation', 'code-review', 'debugging', 'refactoring'],
    config: {
      sandboxEnabled: true,
      sandboxImage: 'ghcr.io/openhands/app:latest',
      maxTokens: 4096,
      temperature: 0.7,
      tools: ['terminal', 'browser', 'file-editor', 'code-search'],
    },
    createdAt: new Date(),
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Agente Claude Code para coding avançado',
    serverId: 'local',
    model: 'claude-sonnet-4-20250514',
    status: 'idle',
    capabilities: ['code-generation', 'agentic-coding', 'multi-file-editing'],
    config: {
      sandboxEnabled: false,
      maxTokens: 8192,
      temperature: 0.5,
      tools: ['terminal', 'file-editor', 'code-search'],
    },
    createdAt: new Date(),
  },
  {
    id: 'codex-agent',
    name: 'Codex Agent',
    description: 'Agente Codex da OpenAI',
    serverId: 'cloud',
    model: 'o3',
    status: 'idle',
    capabilities: ['code-generation', 'task-execution', 'automation'],
    config: {
      sandboxEnabled: true,
      maxTokens: 16384,
      temperature: 0.3,
      tools: ['terminal', 'file-editor'],
    },
    createdAt: new Date(),
  },
  {
    id: 'gemini-agent',
    name: 'Gemini Agent',
    description: 'Agente Gemini do Google',
    serverId: 'cloud',
    model: 'gemini-2.5-pro',
    status: 'idle',
    capabilities: ['code-generation', 'multimodal', 'long-context'],
    config: {
      sandboxEnabled: true,
      maxTokens: 8192,
      temperature: 0.5,
      tools: ['terminal', 'file-editor', 'browser'],
    },
    createdAt: new Date(),
  },
];

// ═══════════════════════════════════════════════════════════
// Pre-configured Automations
// ═══════════════════════════════════════════════════════════

export const AUTOMATIONS: Automation[] = [
  {
    id: 'daily-report',
    name: 'Relatório Diário',
    description: 'Gera relatório de atividades e publica no Slack',
    trigger: { type: 'schedule', config: { cron: '0 18 * * 1-5' } },
    actions: [
      { type: 'agent', config: { agentId: 'openhands-default', task: 'generate-daily-report' } },
      { type: 'notification', config: { channel: 'slack', target: '#engineering' } },
    ],
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: 'issue-decomposer',
    name: 'Decomissor de Issues',
    description: 'Decompõe issues do GitHub em tarefas menores',
    trigger: { type: 'event', config: { source: 'github', event: 'issues.opened' } },
    actions: [
      { type: 'agent', config: { agentId: 'openhands-default', task: 'decompose-issue' } },
      { type: 'webhook', config: { url: 'https://api.github.com/repos/{owner}/{repo}/issues' } },
    ],
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: 'pr-reviewer',
    name: 'Reviewer de PRs',
    description: 'Revisa automaticamente Pull Requests',
    trigger: { type: 'event', config: { source: 'github', event: 'pull_request.opened' } },
    actions: [
      { type: 'agent', config: { agentId: 'claude-code', task: 'review-pr' } },
      { type: 'notification', config: { channel: 'github', target: 'pr-comment' } },
    ],
    status: 'paused',
    createdAt: new Date(),
  },
  {
    id: 'dependency-updater',
    name: 'Atualizador de Dependências',
    description: 'Atualiza dependências automaticamente uma vez por semana',
    trigger: { type: 'schedule', config: { cron: '0 9 * * 1' } },
    actions: [
      { type: 'agent', config: { agentId: 'openhands-default', task: 'update-dependencies' } },
      { type: 'webhook', config: { url: 'https://api.github.com/repos/{owner}/{repo}/pulls' } },
    ],
    status: 'active',
    createdAt: new Date(),
  },
];

// ═══════════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════════

export function getAgentsByServer(serverId: string): OpenHandsAgent[] {
  return OPENHANDS_AGENTS.filter((a) => a.serverId === serverId);
}

export function getRunningAgents(): OpenHandsAgent[] {
  return OPENHANDS_AGENTS.filter((a) => a.status === 'running');
}

export function getActiveAutomations(): Automation[] {
  return AUTOMATIONS.filter((a) => a.status === 'active');
}

export const BACKEND_LABELS: Record<AgentBackend, string> = {
  local: '🏠 Local',
  docker: '🐳 Docker',
  remote: '🌐 Remote',
  cloud: '☁️ Cloud',
};

export const BACKEND_COLORS: Record<AgentBackend, string> = {
  local: '#22c55e',
  docker: '#0ea5e9',
  remote: '#f59e0b',
  cloud: '#8b5cf6',
};
