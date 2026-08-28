/**
 * Developer Tools Registry
 * Comprehensive collection of AI coding assistants, IDEs, and developer utilities
 */

export type DevToolCategory =
  | 'ai-ide'
  | 'ai-agent'
  | 'ai-assistant'
  | 'terminal'
  | 'editor'
  | 'devops'
  | 'testing'
  | 'utilities';

export type DevToolStatus = 'installed' | 'available' | 'running' | 'error' | 'deprecated';

export interface DevTool {
  id: string;
  name: string;
  description: string;
  category: DevToolCategory;
  icon: string;
  color: string;
  version: string;
  author: string;
  repository: string;
  website: string;
  stars: number;
  downloads: string;
  license: string;
  status: DevToolStatus;
  features: string[];
  platforms: ('web' | 'desktop' | 'cli' | 'extension')[];
  models: string[]; // supported models
  tags: string[];
}

// ═══════════════════════════════════════════════════════════
// AI IDEs
// ═══════════════════════════════════════════════════════════

export const AI_IDES: DevTool[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'AI-first code editor built on VS Code with AI pair programming',
    category: 'ai-ide',
    icon: '⚡',
    color: '#7c3aed',
    version: '0.45',
    author: 'Anysphere',
    repository: 'https://github.com/getcursor/cursor',
    website: 'https://cursor.sh',
    stars: 25000,
    downloads: '10M+',
    license: 'Proprietary',
    status: 'available',
    features: ['AI Chat', 'Code Completion', 'Agent Mode', 'Multi-file Editing', 'Codebase Indexing'],
    platforms: ['desktop'],
    models: ['GPT-4', 'Claude', 'Gemini', 'Custom'],
    tags: ['ide', 'ai', 'vscode-fork'],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    description: 'AI-powered IDE with Cascade for flow-state coding',
    category: 'ai-ide',
    icon: '🏄',
    color: '#0ea5e9',
    version: '1.0',
    author: 'Codeium',
    repository: 'https://github.com/nicepkg/aide',
    website: 'https://windsurf.com',
    stars: 8000,
    downloads: '5M+',
    license: 'Proprietary',
    status: 'available',
    features: ['Cascade AI', 'Code Completion', 'Chat', 'Multi-file Edits', 'Terminal Integration'],
    platforms: ['desktop'],
    models: ['GPT-4', 'Claude', 'Gemini', 'Codeium'],
    tags: ['ide', 'ai', 'free'],
  },
  {
    id: 'zed',
    name: 'Zed',
    description: 'High-performance, multiplayer code editor with AI features',
    category: 'ai-ide',
    icon: '⚡',
    color: '#f97316',
    version: '0.150',
    author: 'Zed Industries',
    repository: 'https://github.com/zed-industries/zed',
    website: 'https://zed.dev',
    stars: 55000,
    downloads: '2M+',
    license: 'Apache-2.0',
    status: 'available',
    features: ['AI Assistant', 'Code Completion', 'Collaborative Editing', 'Terminal', 'Git Integration'],
    platforms: ['desktop'],
    models: ['Claude', 'GPT-4', 'Ollama'],
    tags: ['ide', 'rust', 'fast', 'collaborative'],
  },
  {
    id: 'theia-ide',
    name: 'Theia IDE',
    description: 'AI-native open-source cloud and desktop IDE',
    category: 'ai-ide',
    icon: '💎',
    color: '#0ea5e9',
    version: '1.55',
    author: 'Eclipse Foundation',
    repository: 'https://github.com/eclipse-theia/theia',
    website: 'https://theia-ide.org',
    stars: 20000,
    downloads: '1M+',
    license: 'EPL-2.0',
    status: 'installed',
    features: ['AI Assistant', 'LSP Support', 'VS Code Extensions', 'Cloud Deploy', 'Extensible'],
    platforms: ['desktop', 'web'],
    models: ['Any LLM'],
    tags: ['ide', 'open-source', 'extensible', 'cloud'],
  },
];

// ═══════════════════════════════════════════════════════════
// AI Agents
// ═══════════════════════════════════════════════════════════

export const AI_AGENTS: DevTool[] = [
  {
    id: 'openhands',
    name: 'OpenHands',
    description: 'AI-Driven Development - Agent Canvas for coding agents',
    category: 'ai-agent',
    icon: '🙌',
    color: '#f97316',
    version: '1.16',
    author: 'OpenHands',
    repository: 'https://github.com/OpenHands/OpenHands',
    website: 'https://openhands.ai',
    stars: 50000,
    downloads: '1M+',
    license: 'MIT',
    status: 'installed',
    features: ['Agent Canvas', 'Multi-agent', 'Sandbox', 'Automations', 'Slack/GitHub Integration'],
    platforms: ['web', 'cli'],
    models: ['GPT-4', 'Claude', 'Gemini', 'Any LLM'],
    tags: ['agent', 'automation', 'self-hosted'],
  },
  {
    id: 'deepseek-harness',
    name: 'DeepSeek Harness',
    description: 'Everything is a Plugin - Open-source agent harness',
    category: 'ai-agent',
    icon: '🔮',
    color: '#0ea5e9',
    version: '0.1',
    author: 'DeepSeek',
    repository: 'https://github.com/deepseek-ai/deepseek-harness',
    website: 'https://deepseek.com/harness',
    stars: 15000,
    downloads: '100K+',
    license: 'MIT',
    status: 'installed',
    features: ['Plugin System', 'Cordis Architecture', 'Multi-model', 'Sessions', 'Sandboxes'],
    platforms: ['web', 'cli'],
    models: ['DeepSeek', 'GPT-4', 'Claude', 'Gemini'],
    tags: ['agent', 'plugin-system', 'extensible'],
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Agentic coding tool from Anthropic for terminal-based development',
    category: 'ai-agent',
    icon: '🧠',
    color: '#d97706',
    version: '1.0',
    author: 'Anthropic',
    repository: 'https://github.com/anthropics/claude-code',
    website: 'https://docs.anthropic.com/en/docs/claude-code',
    stars: 30000,
    downloads: '2M+',
    license: 'Proprietary',
    status: 'available',
    features: ['Terminal Agent', 'Code Editing', 'Git Integration', 'Multi-file', 'Context-aware'],
    platforms: ['cli'],
    models: ['Claude'],
    tags: ['agent', 'terminal', 'anthropic'],
  },
  {
    id: 'cline',
    name: 'Cline',
    description: 'Autonomous coding agent with Plan/Act modes and MCP integration',
    category: 'ai-agent',
    icon: '🤖',
    color: '#22c55e',
    version: '3.0',
    author: 'Cline',
    repository: 'https://github.com/cline/cline',
    website: 'https://cline.bot',
    stars: 35000,
    downloads: '8M+',
    license: 'Apache-2.0',
    status: 'available',
    features: ['Plan/Act Modes', 'MCP Integration', 'Terminal', 'Browser', 'Human-in-the-loop'],
    platforms: ['extension'],
    models: ['GPT-4', 'Claude', 'Gemini', 'Ollama'],
    tags: ['agent', 'vscode', 'mcp', 'autonomous'],
  },
  {
    id: 'aider',
    name: 'Aider',
    description: 'AI pair programming in your terminal',
    category: 'ai-agent',
    icon: '🤝',
    color: '#ef4444',
    version: '0.60',
    author: 'Aider AI',
    repository: 'https://github.com/Aider-AI/aider',
    website: 'https://aider.chat',
    stars: 42000,
    downloads: '5M+',
    license: 'Apache-2.0',
    status: 'available',
    features: ['Terminal Pair Programming', 'Git Integration', 'Multi-file Editing', 'Repo Map', 'Voice'],
    platforms: ['cli'],
    models: ['GPT-4', 'Claude', 'Gemini', 'DeepSeek', 'Ollama'],
    tags: ['terminal', 'pair-programming', 'git'],
  },
  {
    id: 'roo-code',
    name: 'Roo Code',
    description: 'AI coding agent with customizable modes and MCP support',
    category: 'ai-agent',
    icon: '🦘',
    color: '#a855f7',
    version: '3.0',
    author: 'Roo Code',
    repository: 'https://github.com/RooVetGit/Roo-Code',
    website: 'https://roocode.com',
    stars: 20000,
    downloads: '3M+',
    license: 'Apache-2.0',
    status: 'available',
    features: ['Custom Modes', 'MCP Support', 'Terminal', 'Browser', 'Multi-model'],
    platforms: ['extension'],
    models: ['GPT-4', 'Claude', 'Gemini', 'Ollama'],
    tags: ['agent', 'vscode', 'customizable'],
  },
  {
    id: 'void',
    name: 'Void',
    description: 'Open-source AI coding editor with full control',
    category: 'ai-agent',
    icon: '🕳️',
    color: '#06b6d4',
    version: '1.0',
    author: 'Void',
    repository: 'https://github.com/voideditor/void',
    website: 'https://voideditor.com',
    stars: 15000,
    downloads: '500K+',
    license: 'AGPL-3.0',
    status: 'available',
    features: ['AI Chat', 'Code Completion', 'Agent Mode', 'Self-hosted', 'Privacy-first'],
    platforms: ['desktop'],
    models: ['GPT-4', 'Claude', 'Ollama', 'Custom'],
    tags: ['editor', 'privacy', 'open-source'],
  },
];

// ═══════════════════════════════════════════════════════════
// AI Assistants
// ═══════════════════════════════════════════════════════════

export const AI_ASSISTANTS: DevTool[] = [
  {
    id: 'continue',
    name: 'Continue',
    description: 'Open-source AI code assistant for VS Code and JetBrains',
    category: 'ai-assistant',
    icon: '▶️',
    color: '#0066ff',
    version: '1.0',
    author: 'Continue (Cursor)',
    repository: 'https://github.com/continuedev/continue',
    website: 'https://continue.dev',
    stars: 20000,
    downloads: '3M+',
    license: 'Apache-2.0',
    status: 'available',
    features: ['Chat', 'Autocomplete', 'Edit', 'Codebase Awareness', 'Custom Agents'],
    platforms: ['extension', 'cli'],
    models: ['GPT-4', 'Claude', 'Gemini', 'Ollama', 'Any LLM'],
    tags: ['assistant', 'vscode', 'jetbrains', 'open-source'],
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    description: 'AI pair programmer powered by OpenAI',
    category: 'ai-assistant',
    icon: '🐙',
    color: '#64748b',
    version: '1.0',
    author: 'GitHub',
    repository: 'https://github.com/features/copilot',
    website: 'https://github.com/features/copilot',
    stars: 0,
    downloads: '50M+',
    license: 'Proprietary',
    status: 'available',
    features: ['Code Completion', 'Chat', 'CLI', 'Pull Request Summaries', 'Code Review'],
    platforms: ['extension', 'cli', 'web'],
    models: ['GPT-4', 'Claude', 'Gemini'],
    tags: ['assistant', 'github', 'popular'],
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    description: 'Personal AI assistant that runs on your devices',
    category: 'ai-assistant',
    icon: '🦞',
    color: '#ef4444',
    version: '2.0',
    author: 'OpenClaw',
    repository: 'https://github.com/openclaw/openclaw',
    website: 'https://openclaw.ai',
    stars: 25000,
    downloads: '500K+',
    license: 'MIT',
    status: 'available',
    features: ['Multi-platform', 'Chat Integration', 'GitHub', 'Custom Assistants', 'Self-hosted'],
    platforms: ['desktop', 'web'],
    models: ['GPT-4', 'Claude', 'Gemini', 'Ollama'],
    tags: ['assistant', 'personal', 'self-hosted', 'chat'],
  },
  {
    id: 'tabnine',
    name: 'Tabnine',
    description: 'AI code assistant with privacy-first approach',
    category: 'ai-assistant',
    icon: '✨',
    color: '#ec4899',
    version: '1.0',
    author: 'Tabnine',
    repository: 'https://github.com/codota/tabnine-vscode',
    website: 'https://tabnine.com',
    stars: 5000,
    downloads: '10M+',
    license: 'Proprietary',
    status: 'available',
    features: ['Code Completion', 'Chat', 'Code Review', 'Private Model', 'Enterprise'],
    platforms: ['extension'],
    models: ['Tabnine', 'GPT-4', 'Claude'],
    tags: ['assistant', 'privacy', 'enterprise'],
  },
];

// ═══════════════════════════════════════════════════════════
// Terminal Tools
// ═══════════════════════════════════════════════════════════

export const TERMINAL_TOOLS: DevTool[] = [
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    description: 'Google Gemini in your terminal',
    category: 'terminal',
    icon: '💎',
    color: '#4285f4',
    version: '1.0',
    author: 'Google',
    repository: 'https://github.com/google-gemini/gemini-cli',
    website: 'https://ai.google.dev/gemini-api/docs/gemini-cli',
    stars: 50000,
    downloads: '2M+',
    license: 'Apache-2.0',
    status: 'available',
    features: ['Terminal Chat', 'Code Generation', 'File Operations', 'Extension System'],
    platforms: ['cli'],
    models: ['Gemini'],
    tags: ['terminal', 'google', 'free'],
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    description: 'OpenAI Codex in your terminal',
    category: 'terminal',
    icon: '⚡',
    color: '#10a37f',
    version: '1.0',
    author: 'OpenAI',
    repository: 'https://github.com/openai/codex',
    website: 'https://github.com/openai/codex',
    stars: 20000,
    downloads: '1M+',
    license: 'Apache-2.0',
    status: 'available',
    features: ['Terminal Agent', 'Code Generation', 'File Operations', 'Sandbox'],
    platforms: ['cli'],
    models: ['o3', 'o4-mini', 'GPT-4'],
    tags: ['terminal', 'openai', 'agent'],
  },
  {
    id: 'grok-cli',
    name: 'Grok CLI',
    description: 'xAI Grok in your terminal',
    category: 'terminal',
    icon: '⚡',
    color: '#8b5cf6',
    version: '1.0',
    author: 'xAI',
    repository: 'https://github.com/xai-org/grok-cli',
    website: 'https://grok.x.ai',
    stars: 10000,
    downloads: '500K+',
    license: 'Apache-2.0',
    status: 'available',
    features: ['Terminal Chat', 'Code Generation', 'File Operations'],
    platforms: ['cli'],
    models: ['Grok'],
    tags: ['terminal', 'xai'],
  },
];

// ═══════════════════════════════════════════════════════════
// All tools combined
// ═══════════════════════════════════════════════════════════

export const ALL_DEVTOOLS: DevTool[] = [
  ...AI_IDES,
  ...AI_AGENTS,
  ...AI_ASSISTANTS,
  ...TERMINAL_TOOLS,
];

// ═══════════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════════

export function getDevToolsByCategory(category: DevToolCategory): DevTool[] {
  return ALL_DEVTOOLS.filter((t) => t.category === category);
}

export function getInstalledDevTools(): DevTool[] {
  return ALL_DEVTOOLS.filter((t) => t.status === 'installed');
}

export function searchDevTools(query: string): DevTool[] {
  const lower = query.toLowerCase();
  return ALL_DEVTOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lower))
  );
}

export function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export const DEVTOOL_CATEGORY_LABELS: Record<DevToolCategory, string> = {
  'ai-ide': '⚡ AI IDEs',
  'ai-agent': '🤖 AI Agents',
  'ai-assistant': '✨ AI Assistants',
  'terminal': '💻 Terminal Tools',
  'editor': '📝 Editors',
  'devops': '🚀 DevOps',
  'testing': '🧪 Testing',
  'utilities': '🔧 Utilities',
};

export const DEVTOOL_CATEGORY_COLORS: Record<DevToolCategory, string> = {
  'ai-ide': '#7c3aed',
  'ai-agent': '#f97316',
  'ai-assistant': '#10b981',
  'terminal': '#22c55e',
  'editor': '#3b82f6',
  'devops': '#0ea5e9',
  'testing': '#ef4444',
  'utilities': '#64748b',
};
