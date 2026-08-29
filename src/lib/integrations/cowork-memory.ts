/**
 * CoWork Memory System Integration
 * Persistent memory, knowledge graph, and research vaults
 * Based on CoWork-OS Memory and Knowledge Graph architecture
 */

export type MemoryType = 'hot' | 'warm' | 'cold' | 'archive';

export interface MemoryEntry {
  id: string;
  content: string;
  type: MemoryType;
  category: string;
  tags: string[];
  source?: string;
  confidence: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  relatedIds: string[];
  metadata: Record<string, unknown>;
}

export interface KnowledgeGraphNode {
  id: string;
  name: string;
  type: 'concept' | 'person' | 'project' | 'tool' | 'file' | 'task' | 'note';
  properties: Record<string, unknown>;
  createdAt: Date;
}

export interface KnowledgeGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  weight: number;
  createdAt: Date;
}

export interface ResearchVault {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sources: ResearchSource[];
  findings: ResearchFinding[];
  tags: string[];
  createdAt: Date;
  lastUpdated: Date;
  health: 'healthy' | 'stale' | 'incomplete';
}

export interface ResearchSource {
  id: string;
  url: string;
  title: string;
  content: string;
  fetchedAt: Date;
  reliability: number;
}

export interface ResearchFinding {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  confidence: number;
  createdAt: Date;
}

export interface TopicPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  memories: string[];
  autoCapture: boolean;
  keywords: string[];
}

export const DEFAULT_TOPIC_PACKS: TopicPack[] = [
  {
    id: 'tech-stack',
    name: 'Tech Stack',
    description: 'Memórias sobre tecnologias e ferramentas',
    icon: '🛠️',
    color: '#3b82f6',
    memories: [],
    autoCapture: true,
    keywords: ['react', 'nextjs', 'typescript', 'nodejs', 'python', 'rust', 'docker', 'kubernetes'],
  },
  {
    id: 'project-decisions',
    name: 'Project Decisions',
    description: 'Decisões de arquitetura e design',
    icon: '🏗️',
    color: '#8b5cf6',
    memories: [],
    autoCapture: true,
    keywords: ['decided', 'chosen', 'architecture', 'design', 'pattern', 'approach'],
  },
  {
    id: 'bugs-and-fixes',
    name: 'Bugs & Fixes',
    description: 'Problemas encontrados e soluções',
    icon: '🐛',
    color: '#ef4444',
    memories: [],
    autoCapture: true,
    keywords: ['bug', 'error', 'fix', 'issue', 'problem', 'resolved'],
  },
  {
    id: 'research-notes',
    name: 'Research Notes',
    description: 'Notas de pesquisa e análise',
    icon: '📚',
    color: '#10b981',
    memories: [],
    autoCapture: false,
    keywords: ['research', 'analysis', 'findings', 'study', 'investigation'],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Notas de reuniões e discussões',
    icon: '📝',
    color: '#f59e0b',
    memories: [],
    autoCapture: false,
    keywords: ['meeting', 'discussed', 'agreed', 'action items', 'follow up'],
  },
  {
    id: 'code-patterns',
    name: 'Code Patterns',
    description: 'Padrões de código e boas práticas',
    icon: '🧩',
    color: '#06b6d4',
    memories: [],
    autoCapture: true,
    keywords: ['pattern', 'best practice', 'convention', 'approach', 'implementation'],
  },
];

export const DEFAULT_RESEARCH_VAULTS: ResearchVault[] = [
  {
    id: 'ai-tools',
    name: 'AI Tools Research',
    description: 'Pesquisa sobre ferramentas de IA',
    icon: '🤖',
    color: '#3b82f6',
    sources: [],
    findings: [],
    tags: ['ai', 'tools', 'llm'],
    createdAt: new Date(),
    lastUpdated: new Date(),
    health: 'healthy',
  },
  {
    id: 'web-frameworks',
    name: 'Web Frameworks',
    description: 'Pesquisa sobre frameworks web',
    icon: '🌐',
    color: '#10b981',
    sources: [],
    findings: [],
    tags: ['web', 'framework', 'react', 'nextjs'],
    createdAt: new Date(),
    lastUpdated: new Date(),
    health: 'healthy',
  },
  {
    id: 'devops-practices',
    name: 'DevOps Practices',
    description: 'Práticas de DevOps e infraestrutura',
    icon: '🚀',
    color: '#f59e0b',
    sources: [],
    findings: [],
    tags: ['devops', 'ci-cd', 'docker', 'kubernetes'],
    createdAt: new Date(),
    lastUpdated: new Date(),
    health: 'healthy',
  },
];

export function createMemory(content: string, category: string, tags: string[] = []): MemoryEntry {
  return {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    type: 'hot',
    category,
    tags,
    confidence: 1.0,
    createdAt: new Date(),
    lastAccessed: new Date(),
    accessCount: 0,
    relatedIds: [],
    metadata: {},
  };
}

export function createKnowledgeNode(name: string, type: KnowledgeGraphNode['type']): KnowledgeGraphNode {
  return {
    id: `kg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    type,
    properties: {},
    createdAt: new Date(),
  };
}

export function createKnowledgeEdge(sourceId: string, targetId: string, relationship: string): KnowledgeGraphEdge {
  return {
    id: `kge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourceId,
    targetId,
    relationship,
    weight: 1.0,
    createdAt: new Date(),
  };
}

export function createResearchVault(name: string, description: string): ResearchVault {
  return {
    id: `vault-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    description,
    icon: '📁',
    color: '#6b7280',
    sources: [],
    findings: [],
    tags: [],
    createdAt: new Date(),
    lastUpdated: new Date(),
    health: 'healthy',
  };
}

export function searchMemories(memories: MemoryEntry[], query: string): MemoryEntry[] {
  const lower = query.toLowerCase();
  return memories.filter(
    m => m.content.toLowerCase().includes(lower) ||
         m.category.toLowerCase().includes(lower) ||
         m.tags.some(t => t.toLowerCase().includes(lower))
  );
}

export function getMemoriesByType(memories: MemoryEntry[], type: MemoryType): MemoryEntry[] {
  return memories.filter(m => m.type === type);
}

export function getMemoriesByCategory(memories: MemoryEntry[], category: string): MemoryEntry[] {
  return memories.filter(m => m.category === category);
}
