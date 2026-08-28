/**
 * Eclipse Theia IDE Integration
 * AI-Native Open-Source Cloud and Desktop IDE
 * https://theia-ide.org/
 */

export type TheiaExtensionCategory =
  | 'language'
  | 'theme'
  | 'debug'
  | 'git'
  | 'ai'
  | 'ui'
  | 'data'
  | 'testing'
  | 'container'
  | 'other';

export type TheiaExtensionStatus = 'installed' | 'available' | 'updating' | 'error';

export interface TheiaExtension {
  id: string;
  name: string;
  description: string;
  category: TheiaExtensionCategory;
  icon: string;
  color: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  status: TheiaExtensionStatus;
  extensionId?: string; // Open VSX ID
  tags: string[];
}

export interface TheiaWorkspace {
  id: string;
  name: string;
  path: string;
  lastOpened: Date;
  isActive: boolean;
}

export interface TheiaConfig {
  theme: 'dark' | 'light' | 'high-contrast';
  fontSize: number;
  tabSize: number;
  wordWrap: 'off' | 'on';
  minimap: boolean;
  autoSave: boolean;
  formatOnSave: boolean;
  aiEnabled: boolean;
  aiProvider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom';
  aiModel: string;
}

// ═══════════════════════════════════════════════════════════
// Theia Extensions
// ═══════════════════════════════════════════════════════════

export const THEIA_EXTENSIONS: TheiaExtension[] = [
  // ─── Language Support ───
  {
    id: 'theia-python',
    name: 'Python',
    description: 'Suporte completo a Python com IntelliSense, debugging e linting',
    category: 'language',
    icon: '🐍',
    color: '#3572A5',
    version: '2024.1.0',
    author: 'Microsoft',
    downloads: 15000000,
    rating: 4.8,
    status: 'installed',
    tags: ['python', 'language', 'intellisense'],
  },
  {
    id: 'theia-java',
    name: 'Java',
    description: 'Suporte a Java com Language Server Protocol',
    category: 'language',
    icon: '☕',
    color: '#b07219',
    version: '1.25.0',
    author: 'Red Hat',
    downloads: 8000000,
    rating: 4.7,
    status: 'installed',
    tags: ['java', 'language', 'lsp'],
  },
  {
    id: 'theia-go',
    name: 'Go',
    description: 'Suporte a Go com gopls',
    category: 'language',
    icon: '🔵',
    color: '#00ADD8',
    version: '0.41.0',
    author: 'Google',
    downloads: 5000000,
    rating: 4.9,
    status: 'installed',
    tags: ['go', 'language', 'gopls'],
  },
  {
    id: 'theia-rust',
    name: 'Rust',
    description: 'Suporte a Rust com rust-analyzer',
    category: 'language',
    icon: '🦀',
    color: '#dea584',
    version: '0.4.0',
    author: 'rust-lang',
    downloads: 2000000,
    rating: 4.8,
    status: 'installed',
    tags: ['rust', 'language', 'cargo'],
  },
  {
    id: 'theia-cpp',
    name: 'C/C++',
    description: 'Suporte a C e C++ com IntelliSense',
    category: 'language',
    icon: '⚡',
    color: '#f34b7d',
    version: '1.18.0',
    author: 'Microsoft',
    downloads: 12000000,
    rating: 4.6,
    status: 'installed',
    tags: ['cpp', 'c', 'language'],
  },

  // ─── AI Extensions ───
  {
    id: 'theia-ai-assistant',
    name: 'Theia AI Assistant',
    description: 'Assistente de IA integrado para código e chat',
    category: 'ai',
    icon: '🤖',
    color: '#8b5cf6',
    version: '1.0.0',
    author: 'Eclipse Theia',
    downloads: 3000000,
    rating: 4.7,
    status: 'installed',
    tags: ['ai', 'assistant', 'chat'],
  },
  {
    id: 'theia-copilot',
    name: 'AI Code Completion',
    description: 'Autocompletar de código com IA',
    category: 'ai',
    icon: '✨',
    color: '#10b981',
    version: '2.0.0',
    author: 'Community',
    downloads: 5000000,
    rating: 4.5,
    status: 'installed',
    tags: ['ai', 'completion', 'copilot'],
  },

  // ─── Theme Extensions ───
  {
    id: 'theia-one-dark',
    name: 'One Dark Pro',
    description: 'Tema dark popular inspirado no Atom',
    category: 'theme',
    icon: '🎨',
    color: '#1e1e1e',
    version: '3.0.0',
    author: 'Binaryify',
    downloads: 10000000,
    rating: 4.9,
    status: 'installed',
    tags: ['theme', 'dark'],
  },
  {
    id: 'theia-monokai',
    name: 'Monokai Pro',
    description: 'Tema Monokai Pro oficial',
    category: 'theme',
    icon: '🌈',
    color: '#fc9867',
    version: '2.0.0',
    author: 'Monokai',
    downloads: 4000000,
    rating: 4.8,
    status: 'available',
    tags: ['theme', 'colorful'],
  },

  // ─── Git Extensions ───
  {
    id: 'theia-gitlens',
    name: 'GitLens',
    description: 'Enriquece o Git com blame, visualização de commits e mais',
    category: 'git',
    icon: '🔀',
    color: '#f97316',
    version: '15.0.0',
    author: 'GitKraken',
    downloads: 20000000,
    rating: 4.9,
    status: 'installed',
    tags: ['git', 'blame', 'history'],
  },
  {
    id: 'theia-github-pr',
    name: 'GitHub Pull Requests',
    description: 'Gerencie Pull Requests diretamente no IDE',
    category: 'git',
    icon: '🐙',
    color: '#64748b',
    version: '0.80.0',
    author: 'Microsoft',
    downloads: 8000000,
    rating: 4.6,
    status: 'installed',
    tags: ['git', 'github', 'pr'],
  },

  // ─── Debug Extensions ───
  {
    id: 'theia-debug',
    name: 'Debugger for Node.js',
    description: 'Debug Node.js com breakpoints e inspeção',
    category: 'debug',
    icon: '🐛',
    color: '#22c55e',
    version: '1.0.0',
    author: 'Microsoft',
    downloads: 10000000,
    rating: 4.8,
    status: 'installed',
    tags: ['debug', 'node', 'javascript'],
  },

  // ─── UI Extensions ───
  {
    id: 'theia-icons',
    name: 'Material Icon Theme',
    description: 'Ícones de arquivo material design',
    category: 'ui',
    icon: '📁',
    color: '#3b82f6',
    version: '5.0.0',
    author: 'PKief',
    downloads: 12000000,
    rating: 4.9,
    status: 'installed',
    tags: ['theme', 'icons', 'ui'],
  },

  // ─── Container Extensions ───
  {
    id: 'theia-docker',
    name: 'Docker',
    description: 'Gerencie containers e imagens Docker',
    category: 'container',
    icon: '🐳',
    color: '#0ea5e9',
    version: '1.28.0',
    author: 'Microsoft',
    downloads: 7000000,
    rating: 4.7,
    status: 'installed',
    tags: ['docker', 'containers', 'devops'],
  },
];

// ═══════════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════════

export function getExtensionsByCategory(category: TheiaExtensionCategory): TheiaExtension[] {
  return THEIA_EXTENSIONS.filter((e) => e.category === category);
}

export function getInstalledExtensions(): TheiaExtension[] {
  return THEIA_EXTENSIONS.filter((e) => e.status === 'installed');
}

export function searchExtensions(query: string): TheiaExtension[] {
  const lower = query.toLowerCase();
  return THEIA_EXTENSIONS.filter(
    (e) =>
      e.name.toLowerCase().includes(lower) ||
      e.description.toLowerCase().includes(lower) ||
      e.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

export function formatDownloads(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export const THEIA_CATEGORY_LABELS: Record<TheiaExtensionCategory, string> = {
  language: '💻 Languages',
  theme: '🎨 Themes',
  debug: '🐛 Debug',
  git: '🔀 Git',
  ai: '🤖 AI',
  ui: '🖼️ UI',
  data: '📊 Data',
  testing: '🧪 Testing',
  container: '🐳 Containers',
  other: '📦 Other',
};

export const THEIA_CATEGORY_COLORS: Record<TheiaExtensionCategory, string> = {
  language: '#3572A5',
  theme: '#8b5cf6',
  debug: '#22c55e',
  git: '#f97316',
  ai: '#10b981',
  ui: '#3b82f6',
  data: '#06b6d4',
  testing: '#ef4444',
  container: '#0ea5e9',
  other: '#64748b',
};
