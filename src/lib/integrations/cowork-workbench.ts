/**
 * CoWork Everything Workbench Integration
 * Documents, Spreadsheets, Presentations, Web Pages, PDFs
 * Based on CoWork-OS Everything Workbench architecture
 */

export type ArtifactType = 'document' | 'spreadsheet' | 'presentation' | 'webpage' | 'pdf' | 'code' | 'image' | 'video' | 'audio';

export interface Artifact {
  id: string;
  name: string;
  type: ArtifactType;
  format: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  taskId?: string;
  content?: string;
  metadata: ArtifactMetadata;
  preview?: string;
}

export interface ArtifactMetadata {
  author?: string;
  pages?: number;
  rows?: number;
  columns?: number;
  slides?: number;
  duration?: number;
  dimensions?: { width: number; height: number };
  language?: string;
  wordCount?: number;
  charCount?: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: ArtifactType;
  icon: string;
  color: string;
  category: 'business' | 'creative' | 'technical' | 'personal';
  format: string;
  scaffolding: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  // Documents
  {
    id: 'resume',
    name: 'Resume / CV',
    description: 'Curriculum vitae profissional',
    type: 'document',
    icon: '📄',
    color: '#3b82f6',
    category: 'personal',
    format: 'docx',
    scaffolding: 'Professional resume with sections: Contact, Summary, Experience, Education, Skills',
  },
  {
    id: 'whitepaper',
    name: 'White Paper',
    description: 'Documento técnico detalhado',
    type: 'document',
    icon: '📑',
    color: '#1e40af',
    category: 'business',
    format: 'docx',
    scaffolding: 'Technical white paper with: Executive Summary, Problem, Solution, Implementation, Conclusion',
  },
  {
    id: 'proposal',
    name: 'Business Proposal',
    description: 'Proposta comercial',
    type: 'document',
    icon: '💼',
    color: '#059669',
    category: 'business',
    format: 'docx',
    scaffolding: 'Business proposal with: Cover, Executive Summary, Scope, Timeline, Pricing, Terms',
  },
  {
    id: 'letter',
    name: 'Formal Letter',
    description: 'Carta formal ou ofício',
    type: 'document',
    icon: '✉️',
    color: '#7c3aed',
    category: 'business',
    format: 'docx',
    scaffolding: 'Formal letter with: Header, Date, Recipient, Body, Closing, Signature',
  },
  {
    id: 'report',
    name: 'Report',
    description: 'Relatório estruturado',
    type: 'document',
    icon: '📊',
    color: '#dc2626',
    category: 'business',
    format: 'docx',
    scaffolding: 'Report with: Title Page, TOC, Executive Summary, Findings, Analysis, Recommendations',
  },

  // Spreadsheets
  {
    id: 'budget',
    name: 'Budget Tracker',
    description: 'Planilha de orçamento',
    type: 'spreadsheet',
    icon: '💰',
    color: '#10b981',
    category: 'business',
    format: 'xlsx',
    scaffolding: 'Budget spreadsheet with: Income, Expenses, Categories, Monthly Totals, Charts',
  },
  {
    id: 'inventory',
    name: 'Inventory Manager',
    description: 'Gerenciamento de estoque',
    type: 'spreadsheet',
    icon: '📦',
    color: '#f59e0b',
    category: 'business',
    format: 'xlsx',
    scaffolding: 'Inventory with: Item, SKU, Quantity, Price, Supplier, Reorder Level',
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Cronograma de projeto',
    type: 'spreadsheet',
    icon: '📅',
    color: '#8b5cf6',
    category: 'technical',
    format: 'xlsx',
    scaffolding: 'Project plan with: Task, Owner, Start, End, Duration, Dependencies, Status',
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Dashboard de métricas',
    type: 'spreadsheet',
    icon: '📈',
    color: '#06b6d4',
    category: 'business',
    format: 'xlsx',
    scaffolding: 'Analytics with: Metrics, KPIs, Trends, Comparisons, Charts',
  },

  // Presentations
  {
    id: 'pitch-deck',
    name: 'Pitch Deck',
    description: 'Apresentação de pitch',
    type: 'presentation',
    icon: '🎯',
    color: '#ef4444',
    category: 'business',
    format: 'pptx',
    scaffolding: 'Pitch deck: Title, Problem, Solution, Market, Traction, Team, Ask',
  },
  {
    id: 'quarterly-review',
    name: 'Quarterly Review',
    description: 'Revisão trimestral',
    type: 'presentation',
    icon: '📋',
    color: '#3b82f6',
    category: 'business',
    format: 'pptx',
    scaffolding: 'Quarterly review: Summary, KPIs, Achievements, Challenges, Next Quarter',
  },
  {
    id: 'training',
    name: 'Training Deck',
    description: 'Apresentação de treinamento',
    type: 'presentation',
    icon: '🎓',
    color: '#8b5cf6',
    category: 'creative',
    format: 'pptx',
    scaffolding: 'Training: Welcome, Objectives, Content Sections, Exercises, Summary, Q&A',
  },

  // Web Pages
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Página de conversão',
    type: 'webpage',
    icon: '🌐',
    color: '#0ea5e9',
    category: 'creative',
    format: 'html',
    scaffolding: 'Landing page: Hero, Features, Testimonials, CTA, Footer',
  },
  {
    id: 'portfolio',
    name: 'Portfolio Page',
    description: 'Página de portfólio',
    type: 'webpage',
    icon: '🎨',
    color: '#ec4899',
    category: 'creative',
    format: 'html',
    scaffolding: 'Portfolio: Header, About, Projects Grid, Skills, Contact',
  },
  {
    id: 'documentation',
    name: 'Documentation Site',
    description: 'Site de documentação',
    type: 'webpage',
    icon: '📚',
    color: '#14b8a6',
    category: 'technical',
    format: 'html',
    scaffolding: 'Docs site: Sidebar Nav, Content Area, Search, Code Blocks, API Reference',
  },

  // Code
  {
    id: 'react-component',
    name: 'React Component',
    description: 'Componente React',
    type: 'code',
    icon: '⚛️',
    color: '#61dafb',
    category: 'technical',
    format: 'tsx',
    scaffolding: 'React component with: Props interface, State, JSX, Styles, Tests',
  },
  {
    id: 'api-endpoint',
    name: 'API Endpoint',
    description: 'Endpoint de API',
    type: 'code',
    icon: '🔌',
    color: '#22c55e',
    category: 'technical',
    format: 'ts',
    scaffolding: 'API endpoint with: Request/Response types, Handler, Validation, Error handling',
  },
];

export function createArtifact(type: ArtifactType, name: string, content?: string): Artifact {
  const template = DOCUMENT_TEMPLATES.find(t => t.type === type && t.name.toLowerCase().includes(name.toLowerCase()));
  
  return {
    id: `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    type,
    format: template?.format || 'txt',
    size: content?.length || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    content,
    metadata: {},
    preview: content?.slice(0, 200),
  };
}

export function getTemplatesByType(type: ArtifactType): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(t => t.type === type);
}

export function getTemplatesByCategory(category: DocumentTemplate['category']): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter(t => t.category === category);
}

export function searchTemplates(query: string): DocumentTemplate[] {
  const lower = query.toLowerCase();
  return DOCUMENT_TEMPLATES.filter(
    t => t.name.toLowerCase().includes(lower) ||
         t.description.toLowerCase().includes(lower) ||
         t.category.toLowerCase().includes(lower)
  );
}
