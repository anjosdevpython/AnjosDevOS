/**
 * DeepSeek Harness (DSH) Integration
 * Everything is a Plugin architecture
 * https://github.com/deepseek-ai/deepseek-harness
 */

export type DSHPluginCategory =
  | 'model'
  | 'tool'
  | 'skill'
  | 'session'
  | 'sandbox'
  | 'storage'
  | 'loop'
  | 'scheduling'
  | 'ui'
  | 'integration';

export type DSHPluginStatus = 'installed' | 'available' | 'running' | 'error' | 'disabled';

export interface DSHPlugin {
  id: string;
  name: string;
  description: string;
  category: DSHPluginCategory;
  icon: string;
  color: string;
  version: string;
  author: string;
  repository?: string;
  status: DSHPluginStatus;
  dependencies?: string[];
  config?: Record<string, DSHPluginConfig>;
  tags: string[];
}

export interface DSHPluginConfig {
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  description?: string;
  default?: string | number | boolean;
  options?: string[];
  required?: boolean;
}

export interface DSHAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  plugins: string[];
  status: 'idle' | 'running' | 'paused' | 'error';
  createdAt: Date;
  lastActive?: Date;
  tasks: DSHTask[];
}

export interface DSHTask {
  id: string;
  agentId: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: string;
  output?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface DSHProfile {
  id: string;
  name: string;
  description: string;
  plugins: string[];
  config: Record<string, unknown>;
  isDefault: boolean;
}

// ═══════════════════════════════════════════════════════════
// DSH Plugins - Core capabilities
// ═══════════════════════════════════════════════════════════

export const DSH_PLUGINS: DSHPlugin[] = [
  // ─── Model Plugins ───
  {
    id: 'dsh-model-deepseek',
    name: 'DeepSeek Model',
    description: 'Integração com modelos DeepSeek (V3, R1, Coder)',
    category: 'model',
    icon: '🔮',
    color: '#0ea5e9',
    version: '1.0.0',
    author: 'DeepSeek',
    repository: 'https://github.com/deepseek-ai/deepseek-harness',
    status: 'installed',
    tags: ['model', 'deepseek', 'chat'],
  },
  {
    id: 'dsh-model-openai',
    name: 'OpenAI Model',
    description: 'Suporte a modelos GPT-4o, GPT-4, o1, o3',
    category: 'model',
    icon: '🤖',
    color: '#10a37f',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['model', 'openai', 'gpt'],
  },
  {
    id: 'dsh-model-anthropic',
    name: 'Anthropic Model',
    description: 'Suporte a modelos Claude (Opus, Sonnet, Haiku)',
    category: 'model',
    icon: '🧠',
    color: '#d97706',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['model', 'anthropic', 'claude'],
  },
  {
    id: 'dsh-model-google',
    name: 'Google Model',
    description: 'Suporte a modelos Gemini',
    category: 'model',
    icon: '💎',
    color: '#4285f4',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['model', 'google', 'gemini'],
  },

  // ─── Tool Plugins ───
  {
    id: 'dsh-tool-filesystem',
    name: 'Filesystem Tool',
    description: 'Leitura, escrita e gerenciamento de arquivos',
    category: 'tool',
    icon: '📁',
    color: '#f59e0b',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['tool', 'filesystem', 'files'],
  },
  {
    id: 'dsh-tool-terminal',
    name: 'Terminal Tool',
    description: 'Execução de comandos no terminal',
    category: 'tool',
    icon: '💻',
    color: '#22c55e',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['tool', 'terminal', 'shell'],
  },
  {
    id: 'dsh-tool-browser',
    name: 'Browser Tool',
    description: 'Navegação e interação com páginas web',
    category: 'tool',
    icon: '🌐',
    color: '#3b82f6',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['tool', 'browser', 'web'],
  },
  {
    id: 'dsh-tool-git',
    name: 'Git Tool',
    description: 'Operações Git: commit, branch, diff, log',
    category: 'tool',
    icon: '🔀',
    color: '#f97316',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['tool', 'git', 'version-control'],
  },
  {
    id: 'dsh-tool-code-search',
    name: 'Code Search Tool',
    description: 'Busca semântica no código-fonte',
    category: 'tool',
    icon: '🔎',
    color: '#10b981',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['tool', 'search', 'code'],
  },

  // ─── Skill Plugins ───
  {
    id: 'dsh-skill-planning',
    name: 'Planning Skill',
    description: 'Planejamento e criação de specs',
    category: 'skill',
    icon: '📋',
    color: '#8b5cf6',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['skill', 'planning', 'spec'],
  },
  {
    id: 'dsh-skill-coding',
    name: 'Coding Skill',
    description: 'Implementação de código com TDD',
    category: 'skill',
    icon: '⚡',
    color: '#ef4444',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['skill', 'coding', 'tdd'],
  },
  {
    id: 'dsh-skill-review',
    name: 'Review Skill',
    description: 'Code review automatizado',
    category: 'skill',
    icon: '👁️',
    color: '#a855f7',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['skill', 'review', 'quality'],
  },
  {
    id: 'dsh-skill-debug',
    name: 'Debug Skill',
    description: 'Diagnóstico e correção de bugs',
    category: 'skill',
    icon: '🐛',
    color: '#f97316',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['skill', 'debug', 'bugs'],
  },

  // ─── Session Plugins ───
  {
    id: 'dsh-session-chat',
    name: 'Chat Session',
    description: 'Sessão de chat interativo com streaming',
    category: 'session',
    icon: '💬',
    color: '#06b6d4',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['session', 'chat', 'interactive'],
  },
  {
    id: 'dsh-session-agent',
    name: 'Agent Session',
    description: 'Sessão autônoma de agente com tool use',
    category: 'session',
    icon: '🤖',
    color: '#10b981',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['session', 'agent', 'autonomous'],
  },

  // ─── Sandbox Plugins ───
  {
    id: 'dsh-sandbox-node',
    name: 'Node.js Sandbox',
    description: 'Execução segura de código Node.js',
    category: 'sandbox',
    icon: '📦',
    color: '#22c55e',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['sandbox', 'node', 'javascript'],
  },
  {
    id: 'dsh-sandbox-python',
    name: 'Python Sandbox',
    description: 'Execução segura de código Python',
    category: 'sandbox',
    icon: '🐍',
    color: '#3b82f6',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['sandbox', 'python'],
  },
  {
    id: 'dsh-sandbox-docker',
    name: 'Docker Sandbox',
    description: 'Isolamento via containers Docker',
    category: 'sandbox',
    icon: '🐳',
    color: '#0ea5e9',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'available',
    tags: ['sandbox', 'docker', 'containers'],
  },

  // ─── Storage Plugins ───
  {
    id: 'dsh-storage-memory',
    name: 'Memory Storage',
    description: 'Armazenamento em memória para sessões',
    category: 'storage',
    icon: '🧠',
    color: '#8b5cf6',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['storage', 'memory', 'ephemeral'],
  },
  {
    id: 'dsh-storage-file',
    name: 'File Storage',
    description: 'Persistência em disco',
    category: 'storage',
    icon: '💾',
    color: '#64748b',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['storage', 'file', 'persistent'],
  },

  // ─── Integration Plugins ───
  {
    id: 'dsh-int-github',
    name: 'GitHub Integration',
    description: 'Integração com GitHub API (repos, PRs, issues)',
    category: 'integration',
    icon: '🐙',
    color: '#64748b',
    version: '1.0.0',
    author: 'Community',
    status: 'available',
    tags: ['integration', 'github', 'git'],
  },
  {
    id: 'dsh-int-slack',
    name: 'Slack Integration',
    description: 'Notificações e comandos via Slack',
    category: 'integration',
    icon: '📢',
    color: '#e01e5a',
    version: '1.0.0',
    author: 'Community',
    status: 'available',
    tags: ['integration', 'slack', 'notifications'],
  },
  {
    id: 'dsh-int-mcp',
    name: 'MCP Bridge',
    description: 'Bridge para Model Context Protocol servers',
    category: 'integration',
    icon: '🔌',
    color: '#06b6d4',
    version: '1.0.0',
    author: 'DeepSeek',
    status: 'installed',
    tags: ['integration', 'mcp', 'bridge'],
  },
];

// ═══════════════════════════════════════════════════════════
// DSH Profiles
// ═══════════════════════════════════════════════════════════

export const DSH_PROFILES: DSHProfile[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Perfil padrão com plugins essenciais',
    plugins: [
      'dsh-model-deepseek',
      'dsh-tool-filesystem',
      'dsh-tool-terminal',
      'dsh-tool-git',
      'dsh-skill-coding',
      'dsh-session-chat',
      'dsh-sandbox-node',
      'dsh-storage-memory',
    ],
    config: {},
    isDefault: true,
  },
  {
    id: 'full-stack',
    name: 'Full Stack',
    description: 'Perfil completo para desenvolvimento full stack',
    plugins: [
      'dsh-model-deepseek',
      'dsh-model-openai',
      'dsh-tool-filesystem',
      'dsh-tool-terminal',
      'dsh-tool-browser',
      'dsh-tool-git',
      'dsh-tool-code-search',
      'dsh-skill-planning',
      'dsh-skill-coding',
      'dsh-skill-review',
      'dsh-skill-debug',
      'dsh-session-agent',
      'dsh-sandbox-node',
      'dsh-sandbox-python',
      'dsh-storage-memory',
      'dsh-storage-file',
      'dsh-int-github',
      'dsh-int-mcp',
    ],
    config: {},
    isDefault: false,
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Perfil para pesquisa e análise de código',
    plugins: [
      'dsh-model-deepseek',
      'dsh-model-anthropic',
      'dsh-tool-filesystem',
      'dsh-tool-code-search',
      'dsh-tool-browser',
      'dsh-skill-planning',
      'dsh-skill-review',
      'dsh-session-chat',
      'dsh-storage-memory',
      'dsh-int-mcp',
    ],
    config: {},
    isDefault: false,
  },
];

// ═══════════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════════

export function getPluginsByCategory(category: DSHPluginCategory): DSHPlugin[] {
  return DSH_PLUGINS.filter((p) => p.category === category);
}

export function getInstalledPlugins(): DSHPlugin[] {
  return DSH_PLUGINS.filter((p) => p.status === 'installed');
}

export function getAvailablePlugins(): DSHPlugin[] {
  return DSH_PLUGINS.filter((p) => p.status === 'available');
}

export function searchPlugins(query: string): DSHPlugin[] {
  const lower = query.toLowerCase();
  return DSH_PLUGINS.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

export function getProfilePlugins(profileId: string): DSHPlugin[] {
  const profile = DSH_PROFILES.find((p) => p.id === profileId);
  if (!profile) return [];
  return DSH_PLUGINS.filter((p) => profile.plugins.includes(p.id));
}

export const DSH_CATEGORY_LABELS: Record<DSHPluginCategory, string> = {
  model: '🤖 Modelos',
  tool: '🔧 Ferramentas',
  skill: '⚡ Skills',
  session: '💬 Sessões',
  sandbox: '📦 Sandboxes',
  storage: '💾 Armazenamento',
  loop: '🔄 Loops',
  scheduling: '📅 Agendamento',
  ui: '🖥️ Interface',
  integration: '🔌 Integrações',
};

export const DSH_CATEGORY_COLORS: Record<DSHPluginCategory, string> = {
  model: '#0ea5e9',
  tool: '#f59e0b',
  skill: '#8b5cf6',
  session: '#06b6d4',
  sandbox: '#22c55e',
  storage: '#64748b',
  loop: '#ef4444',
  scheduling: '#f97316',
  ui: '#3b82f6',
  integration: '#10b981',
};
