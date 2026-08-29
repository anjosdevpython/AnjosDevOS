/**
 * CoWork Agent Teams Integration
 * Multi-agent collaboration with shared checklists and coordinated runs
 * Based on CoWork-OS Agent Teams architecture
 */

export type AgentRole = 'coder' | 'reviewer' | 'researcher' | 'planner' | 'designer' | 'analyst' | 'devops' | 'writer';

export type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'completed';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  role: AgentRole;
  icon: string;
  color: string;
  model: string;
  systemPrompt: string;
  capabilities: string[];
  tools: string[];
  maxConcurrentTasks: number;
  createdAt: Date;
  isActive: boolean;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: AgentStatus;
  assignedAgentId?: string;
  teamId?: string;
  parentTaskId?: string;
  childTaskIds: string[];
  checklist: ChecklistItem[];
  outputs: TaskOutput[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
}

export interface TaskOutput {
  id: string;
  type: 'text' | 'file' | 'code' | 'image' | 'report';
  name: string;
  content: string;
  createdAt: Date;
}

export interface AgentTeam {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  agents: AgentDefinition[];
  tasks: AgentTask[];
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  lastActivity: Date;
  sharedContext: Record<string, unknown>;
}

export interface MixtureOfAgentsPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  advisors: { agentId: string; maxOutputTokens: number }[];
  aggregator: { agentId: string; model: string };
  concurrency: number;
  failover: boolean;
}

export const AGENT_ROLES: Record<AgentRole, { name: string; icon: string; color: string; description: string }> = {
  coder: { name: 'Coder', icon: '💻', color: '#3b82f6', description: 'Escreve e implementa código' },
  reviewer: { name: 'Reviewer', icon: '👁️', color: '#8b5cf6', description: 'Revisa código e qualidade' },
  researcher: { name: 'Researcher', icon: '🔍', color: '#10b981', description: 'Pesquisa e analisa informações' },
  planner: { name: 'Planner', icon: '📋', color: '#f59e0b', description: 'Planeja e organiza tarefas' },
  designer: { name: 'Designer', icon: '🎨', color: '#ec4899', description: 'Cria designs e interfaces' },
  analyst: { name: 'Analyst', icon: '📊', color: '#06b6d4', description: 'Analisa dados e métricas' },
  devops: { name: 'DevOps', icon: '🚀', color: '#ef4444', description: 'Gerencia infraestrutura e deploy' },
  writer: { name: 'Writer', icon: '✍️', color: '#7c3aed', description: 'Escreve documentação e conteúdo' },
};

export const DEFAULT_AGENTS: AgentDefinition[] = [
  {
    id: 'lead-coder',
    name: 'Lead Coder',
    description: 'Desenvolvedor principal',
    role: 'coder',
    icon: '💻',
    color: '#3b82f6',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'You are an expert software developer. Write clean, efficient, and well-documented code.',
    capabilities: ['typescript', 'python', 'react', 'nodejs', 'database'],
    tools: ['read_file', 'write_file', 'terminal', 'git'],
    maxConcurrentTasks: 3,
    createdAt: new Date(),
    isActive: true,
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Especialista em revisão de código',
    role: 'reviewer',
    icon: '👁️',
    color: '#8b5cf6',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'You are a senior code reviewer. Focus on bugs, security, performance, and best practices.',
    capabilities: ['code-review', 'security-audit', 'performance-analysis'],
    tools: ['read_file', 'search_code', 'git_diff'],
    maxConcurrentTasks: 5,
    createdAt: new Date(),
    isActive: true,
  },
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Pesquisador de tecnologia',
    role: 'researcher',
    icon: '🔍',
    color: '#10b981',
    model: 'gpt-4o',
    systemPrompt: 'You are a technical researcher. Find accurate information and provide well-sourced answers.',
    capabilities: ['web-search', 'documentation', 'analysis'],
    tools: ['web_search', 'read_url', 'search_code'],
    maxConcurrentTasks: 3,
    createdAt: new Date(),
    isActive: true,
  },
  {
    id: 'planner',
    name: 'Project Planner',
    description: 'Planejador de projetos',
    role: 'planner',
    icon: '📋',
    color: '#f59e0b',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'You are a project planner. Break down complex tasks into manageable steps with clear priorities.',
    capabilities: ['task-breakdown', 'estimation', 'prioritization'],
    tools: ['task_list_create', 'task_list_update'],
    maxConcurrentTasks: 10,
    createdAt: new Date(),
    isActive: true,
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    description: 'Engenheiro de DevOps',
    role: 'devops',
    icon: '🚀',
    color: '#ef4444',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'You are a DevOps expert. Handle deployments, CI/CD, infrastructure, and monitoring.',
    capabilities: ['docker', 'kubernetes', 'ci-cd', 'monitoring', 'aws', 'gcp'],
    tools: ['terminal', 'write_file', 'git'],
    maxConcurrentTasks: 2,
    createdAt: new Date(),
    isActive: true,
  },
];

export const DEFAULT_MOA_PRESETS: MixtureOfAgentsPreset[] = [
  {
    id: 'full-review',
    name: 'Full Code Review',
    description: 'Revisão completa com múltiplos perspectivas',
    icon: '🔍',
    color: '#8b5cf6',
    advisors: [
      { agentId: 'lead-coder', maxOutputTokens: 2000 },
      { agentId: 'code-reviewer', maxOutputTokens: 2000 },
      { agentId: 'researcher', maxOutputTokens: 1000 },
    ],
    aggregator: { agentId: 'planner', model: 'claude-sonnet-4-20250514' },
    concurrency: 3,
    failover: true,
  },
  {
    id: 'feature-development',
    name: 'Feature Development',
    description: 'Desenvolvimento de feature completo',
    icon: '⚡',
    color: '#3b82f6',
    advisors: [
      { agentId: 'planner', maxOutputTokens: 1500 },
      { agentId: 'lead-coder', maxOutputTokens: 3000 },
    ],
    aggregator: { agentId: 'code-reviewer', model: 'claude-sonnet-4-20250514' },
    concurrency: 2,
    failover: true,
  },
  {
    id: 'research-and-implement',
    name: 'Research & Implement',
    description: 'Pesquisa seguida de implementação',
    icon: '🔬',
    color: '#10b981',
    advisors: [
      { agentId: 'researcher', maxOutputTokens: 2000 },
      { agentId: 'lead-coder', maxOutputTokens: 3000 },
    ],
    aggregator: { agentId: 'planner', model: 'gpt-4o' },
    concurrency: 2,
    failover: false,
  },
];

export function createAgent(role: AgentRole, name: string): AgentDefinition {
  const roleInfo = AGENT_ROLES[role];
  return {
    id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    description: roleInfo.description,
    role,
    icon: roleInfo.icon,
    color: roleInfo.color,
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `You are a ${roleInfo.name}. ${roleInfo.description}.`,
    capabilities: [],
    tools: [],
    maxConcurrentTasks: 3,
    createdAt: new Date(),
    isActive: true,
  };
}

export function createTeam(name: string, description: string, agentIds: string[]): AgentTeam {
  const agents = DEFAULT_AGENTS.filter(a => agentIds.includes(a.id));
  return {
    id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    icon: '👥',
    color: '#3b82f6',
    agents,
    tasks: [],
    status: 'active',
    createdAt: new Date(),
    lastActivity: new Date(),
    sharedContext: {},
  };
}

export function createTask(title: string, description: string, priority: AgentTask['priority'] = 'medium'): AgentTask {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    description,
    status: 'idle',
    childTaskIds: [],
    checklist: [],
    outputs: [],
    priority,
  };
}

export function getAgentsByRole(role: AgentRole): AgentDefinition[] {
  return DEFAULT_AGENTS.filter(a => a.role === role);
}
