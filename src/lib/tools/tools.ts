/**
 * AI Tools & Skills Registry
 * Inspired by AI Hero skills, GSD framework, and MCP integrations
 */

export type SkillCategory = 'planning' | 'development' | 'review' | 'productivity' | 'mcp' | 'gsd';
export type SkillStatus = 'available' | 'running' | 'completed' | 'error';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  icon: string;
  color: string;
  command: string; // slash command
  inputs?: SkillInput[];
  outputs?: string[];
  model?: string; // recommended model
  tags: string[];
}

export interface SkillInput {
  name: string;
  type: 'text' | 'file' | 'select' | 'boolean';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface SkillExecution {
  id: string;
  skillId: string;
  status: SkillStatus;
  inputs: Record<string, string>;
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  server: string;
  schema: Record<string, unknown>;
  isEnabled: boolean;
}

// ═══════════════════════════════════════════════════════════
// SKILLS - Based on AI Hero methodology
// ═══════════════════════════════════════════════════════════

export const SKILLS: Skill[] = [
  // ─── Planning Skills ───
  {
    id: 'grill-with-docs',
    name: 'Grill with Docs',
    description: 'Entreviste sobre um plano e registre as decisões tomadas',
    category: 'planning',
    icon: '🎤',
    color: '#f59e0b',
    command: '/grill-with-docs',
    inputs: [
      { name: 'plano', type: 'text', placeholder: 'Descreva o plano ou ideia...', required: true },
      { name: 'docs', type: 'file', placeholder: 'Documentos de referência (opcional)' },
    ],
    outputs: ['Decisões documentadas', 'Requisitos claros'],
    model: 'claude-sonnet-4-20250514',
    tags: ['planejamento', 'entrevista', 'decisões'],
  },
  {
    id: 'to-spec',
    name: 'To Spec',
    description: 'Converta uma conversa acordada em uma especificação escrita',
    category: 'planning',
    icon: '📋',
    color: '#3b82f6',
    command: '/to-spec',
    inputs: [
      { name: 'conversa', type: 'text', placeholder: 'Resumo da conversa/decisões...', required: true },
      { name: 'formato', type: 'select', options: ['markdown', 'json', 'yaml'] },
    ],
    outputs: ['Especificação formal'],
    model: 'claude-sonnet-4-20250514',
    tags: ['especificação', 'documentação'],
  },
  {
    id: 'to-tickets',
    name: 'To Tickets',
    description: 'Divida uma spec em tickets pequenos que um agent pode construir',
    category: 'planning',
    icon: '🎫',
    color: '#8b5cf6',
    command: '/to-tickets',
    inputs: [
      { name: 'spec', type: 'text', placeholder: 'Especificação completa...', required: true },
      { name: 'tamanho', type: 'select', options: ['pequeno (1-2h)', 'médio (3-4h)', 'grande (1 dia)'] },
    ],
    outputs: ['Lista de tickets', 'Ordem de dependências'],
    model: 'claude-sonnet-4-20250514',
    tags: ['tickets', 'planejamento', 'sprint'],
  },
  {
    id: 'wayfinder',
    name: 'Wayfinder',
    description: 'Mapeie um esforço grande como mapa de decisões e resolva-as',
    category: 'planning',
    icon: '🗺️',
    color: '#10b981',
    command: '/wayfinder',
    inputs: [
      { name: 'escopo', type: 'text', placeholder: 'Escopo do projeto ou feature...', required: true },
    ],
    outputs: ['Mapa de decisões', 'Caminho recomendado'],
    model: 'claude-sonnet-4-20250514',
    tags: ['arquitetura', 'decisões', 'mapa'],
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Obtenha uma resposta citada, lida de fontes primárias',
    category: 'planning',
    icon: '🔍',
    color: '#06b6d4',
    command: '/research',
    inputs: [
      { name: 'pergunta', type: 'text', placeholder: 'O que pesquisar?', required: true },
      { name: 'fontes', type: 'select', options: ['web', 'documentação', 'código', 'todas'] },
    ],
    outputs: ['Resposta fundamentada', 'Fontes citadas'],
    model: 'gpt-4o',
    tags: ['pesquisa', 'documentação', 'análise'],
  },

  // ─── Development Skills ───
  {
    id: 'implement',
    name: 'Implement',
    description: 'Construa uma spec completa em código, com testes primeiro',
    category: 'development',
    icon: '⚡',
    color: '#22c55e',
    command: '/implement',
    inputs: [
      { name: 'spec', type: 'text', placeholder: 'Especificação a ser implementada...', required: true },
      { name: 'linguagem', type: 'select', options: ['TypeScript', 'Python', 'Rust', 'Go', 'auto'] },
      { name: 'testFirst', type: 'boolean', placeholder: 'Escrever testes primeiro?' },
    ],
    outputs: ['Código implementado', 'Testes', 'Documentação'],
    model: 'claude-sonnet-4-20250514',
    tags: ['implementação', 'código', 'TDD'],
  },
  {
    id: 'prototype',
    name: 'Prototype',
    description: 'Responda uma pergunta de design com código descartável',
    category: 'development',
    icon: '🧪',
    color: '#ec4899',
    command: '/prototype',
    inputs: [
      { name: 'pergunta', type: 'text', placeholder: 'Pergunta de design a responder...', required: true },
      { name: 'abordagem', type: 'text', placeholder: 'Abordagem a testar...' },
    ],
    outputs: ['Protótipo funcional', 'Conclusão'],
    model: 'gpt-4o',
    tags: ['protótipo', 'design', 'experimento'],
  },
  {
    id: 'tdd',
    name: 'TDD',
    description: 'Execute o ciclo red-green-refactor',
    category: 'development',
    icon: '🔄',
    color: '#ef4444',
    command: '/tdd',
    inputs: [
      { name: 'funcionalidade', type: 'text', placeholder: 'O que implementar com TDD...', required: true },
      { name: 'framework', type: 'select', options: ['Jest', 'Vitest', 'Pytest', 'Go test'] },
    ],
    outputs: ['Testes', 'Implementação', 'Refatoração'],
    model: 'claude-sonnet-4-20250514',
    tags: ['TDD', 'testes', 'qualidade'],
  },
  {
    id: 'diagnosing-bugs',
    name: 'Diagnosing Bugs',
    description: 'Diagnostique um bug difícil, começando de uma reprodução',
    category: 'development',
    icon: '🐛',
    color: '#f97316',
    command: '/diagnosing-bugs',
    inputs: [
      { name: 'reprodução', type: 'text', placeholder: 'Como reproduzir o bug...', required: true },
      { name: 'comportamento', type: 'text', placeholder: 'Comportamento esperado vs atual' },
    ],
    outputs: ['Diagnóstico', 'Plano de correção'],
    model: 'claude-sonnet-4-20250514',
    tags: ['debug', 'bugs', 'diagnóstico'],
  },
  {
    id: 'improve-codebase',
    name: 'Improve Codebase',
    description: 'Encontre módulos que valem a pena refatorar',
    category: 'development',
    icon: '🏗️',
    color: '#14b8a6',
    command: '/improve-codebase-architecture',
    inputs: [
      { name: 'escopo', type: 'text', placeholder: 'Diretório ou módulo a analisar...' },
    ],
    outputs: ['Relatório visual', 'Recomendações'],
    model: 'claude-sonnet-4-20250514',
    tags: ['refatoração', 'arquitetura', 'código'],
  },

  // ─── Review Skills ───
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Revise um diff contra seus padrões e a especificação',
    category: 'review',
    icon: '👁️',
    color: '#a855f7',
    command: '/code-review',
    inputs: [
      { name: 'diff', type: 'text', placeholder: 'Diff ou código a revisar...', required: true },
      { name: 'spec', type: 'text', placeholder: 'Especificação de referência' },
      { name: 'criterios', type: 'text', placeholder: 'Critérios específicos de review' },
    ],
    outputs: ['Feedback estruturado', 'Sugestões de melhoria'],
    model: 'claude-sonnet-4-20250514',
    tags: ['review', 'qualidade', 'padrões'],
  },
  {
    id: 'resolve-conflicts',
    name: 'Resolve Conflicts',
    description: 'Resolva conflitos de merge ou rebase, hunk por hunk',
    category: 'review',
    icon: '🔀',
    color: '#eab308',
    command: '/resolving-merge-conflicts',
    inputs: [
      { name: 'conflitos', type: 'text', placeholder: 'Arquivos com conflitos...', required: true },
    ],
    outputs: ['Conflitos resolvidos'],
    model: 'claude-sonnet-4-20250514',
    tags: ['git', 'merge', 'conflitos'],
  },
  {
    id: 'triage',
    name: 'Triage',
    description: 'Classifique issues cruas em trabalho que alguém pode assumir',
    category: 'review',
    icon: '📊',
    color: '#64748b',
    command: '/triage',
    inputs: [
      { name: 'issues', type: 'text', placeholder: 'Lista de issues...', required: true },
    ],
    outputs: ['Issues classificadas', 'Prioridades'],
    model: 'gpt-4o',
    tags: ['issues', 'classificação', 'gestão'],
  },

  // ─── Productivity Skills ───
  {
    id: 'grill-me',
    name: 'Grill Me',
    description: 'Alinhe uma ideia antes de se comprometer com ela',
    category: 'productivity',
    icon: '💬',
    color: '#0ea5e9',
    command: '/grill-me',
    inputs: [
      { name: 'ideia', type: 'text', placeholder: 'Sua ideia...', required: true },
    ],
    outputs: ['Análise crítica', 'Recomendações'],
    model: 'claude-sonnet-4-20250514',
    tags: ['ideação', 'análise', 'decisão'],
  },
  {
    id: 'handoff',
    name: 'Handoff',
    description: 'Documente uma sessão longa para outro agent continuar',
    category: 'productivity',
    icon: '🤝',
    color: '#7c3aed',
    command: '/handoff',
    inputs: [
      { name: 'contexto', type: 'text', placeholder: 'Contexto da sessão...', required: true },
      { name: 'progresso', type: 'text', placeholder: 'O que foi feito...' },
      { name: 'proximo', type: 'text', placeholder: 'Próximos passos...' },
    ],
    outputs: ['Documento de handoff'],
    model: 'gpt-4o',
    tags: ['colaboração', 'contexto', 'continuidade'],
  },
  {
    id: 'teach',
    name: 'Teach',
    description: 'Aprenda um tópico em múltiplas sessões que se constroem',
    category: 'productivity',
    icon: '📚',
    color: '#0891b2',
    command: '/teach',
    inputs: [
      { name: 'topico', type: 'text', placeholder: 'O que aprender...', required: true },
      { name: 'nivel', type: 'select', options: ['iniciante', 'intermediário', 'avançado'] },
    ],
    outputs: ['Aula estruturada', 'Exercícios'],
    model: 'gpt-4o',
    tags: ['aprendizado', 'tutorial', 'educação'],
  },
  {
    id: 'wait-what',
    name: 'Wait What',
    description: 'Peça ao agent para explicar novamente em linguagem simples',
    category: 'productivity',
    icon: '❓',
    color: '#dc2626',
    command: '/wait-what',
    inputs: [
      { name: 'duvida', type: 'text', placeholder: 'O que não ficou claro...', required: true },
    ],
    outputs: ['Explicação simplificada'],
    model: 'gpt-4o',
    tags: ['clareza', 'explicação', 'simplificação'],
  },

  // ─── GSD Workflow Skills ───
  {
    id: 'gsd-plan',
    name: 'GSD: Plan',
    description: 'Fase 1 do GSD: Planeje o que construir com especificação detalhada',
    category: 'gsd',
    icon: '📝',
    color: '#3b82f6',
    command: '/gsd-plan',
    inputs: [
      { name: 'objetivo', type: 'text', placeholder: 'O que você quer construir...', required: true },
      { name: 'restricoes', type: 'text', placeholder: 'Restrições ou requisitos...' },
    ],
    outputs: ['Spec detalhada', 'Lista de tarefas', 'Estimativas'],
    model: 'claude-sonnet-4-20250514',
    tags: ['GSD', 'planejamento', 'spec'],
  },
  {
    id: 'gsd-execute',
    name: 'GSD: Execute',
    description: 'Fase 2 do GSD: Execute o plano com código e testes',
    category: 'gsd',
    icon: '🚀',
    color: '#22c55e',
    command: '/gsd-execute',
    inputs: [
      { name: 'spec', type: 'text', placeholder: 'Especificação a executar...', required: true },
      { name: 'modo', type: 'select', options: ['tdd', 'pair-programming', 'solo'] },
    ],
    outputs: ['Código implementado', 'Testes passando'],
    model: 'claude-sonnet-4-20250514',
    tags: ['GSD', 'implementação', 'execução'],
  },
  {
    id: 'gsd-verify',
    name: 'GSD: Verify',
    description: 'Fase 3 do GSD: Verifique se tudo funciona e está completo',
    category: 'gsd',
    icon: '✅',
    color: '#10b981',
    command: '/gsd-verify',
    inputs: [
      { name: 'criterios', type: 'text', placeholder: 'Critérios de aceitação...', required: true },
    ],
    outputs: ['Relatório de verificação', 'Issues encontradas'],
    model: 'claude-sonnet-4-20250514',
    tags: ['GSD', 'verificação', 'qualidade'],
  },
];

// ═══════════════════════════════════════════════════════════
// MCP TOOLS - Model Context Protocol integrations
// ═══════════════════════════════════════════════════════════

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'error';
  config?: Record<string, string>;
}

export const MCP_SERVERS: MCPServer[] = [
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Leia, escreva e gerencie arquivos no sistema',
    icon: '📁',
    color: '#f59e0b',
    status: 'connected',
    tools: [
      {
        id: 'read_file',
        name: 'Read File',
        description: 'Leia o conteúdo de um arquivo',
        server: 'filesystem',
        schema: { path: 'string' },
        isEnabled: true,
      },
      {
        id: 'write_file',
        name: 'Write File',
        description: 'Escreva conteúdo em um arquivo',
        server: 'filesystem',
        schema: { path: 'string', content: 'string' },
        isEnabled: true,
      },
      {
        id: 'list_directory',
        name: 'List Directory',
        description: 'Liste arquivos em um diretório',
        server: 'filesystem',
        schema: { path: 'string' },
        isEnabled: true,
      },
      {
        id: 'search_files',
        name: 'Search Files',
        description: 'Busque arquivos por padrão',
        server: 'filesystem',
        schema: { pattern: 'string', path: 'string' },
        isEnabled: true,
      },
    ],
  },
  {
    id: 'git',
    name: 'Git',
    description: 'Operações Git: commit, branch, diff, log',
    icon: '🔀',
    color: '#f97316',
    status: 'connected',
    tools: [
      {
        id: 'git_status',
        name: 'Git Status',
        description: 'Veja o status do repositório',
        server: 'git',
        schema: {},
        isEnabled: true,
      },
      {
        id: 'git_diff',
        name: 'Git Diff',
        description: 'Veja as mudanças pendentes',
        server: 'git',
        schema: { staged: 'boolean' },
        isEnabled: true,
      },
      {
        id: 'git_log',
        name: 'Git Log',
        description: 'Veja o histórico de commits',
        server: 'git',
        schema: { limit: 'number' },
        isEnabled: true,
      },
      {
        id: 'git_commit',
        name: 'Git Commit',
        description: 'Crie um commit',
        server: 'git',
        schema: { message: 'string', files: 'string[]' },
        isEnabled: true,
      },
    ],
  },
  {
    id: 'browser',
    name: 'Browser',
    description: 'Navegue e interaja com páginas web',
    icon: '🌐',
    color: '#3b82f6',
    status: 'disconnected',
    tools: [
      {
        id: 'navigate',
        name: 'Navigate',
        description: 'Navegue para uma URL',
        server: 'browser',
        schema: { url: 'string' },
        isEnabled: false,
      },
      {
        id: 'screenshot',
        name: 'Screenshot',
        description: 'Capture uma captura de tela',
        server: 'browser',
        schema: {},
        isEnabled: false,
      },
      {
        id: 'click',
        name: 'Click',
        description: 'Clique em um elemento',
        server: 'browser',
        schema: { selector: 'string' },
        isEnabled: false,
      },
      {
        id: 'type_text',
        name: 'Type Text',
        description: 'Digite texto em um campo',
        server: 'browser',
        schema: { selector: 'string', text: 'string' },
        isEnabled: false,
      },
    ],
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Consultas e gerenciamento de banco de dados',
    icon: '🗄️',
    color: '#8b5cf6',
    status: 'disconnected',
    tools: [
      {
        id: 'query',
        name: 'Query',
        description: 'Execute uma consulta SQL',
        server: 'database',
        schema: { sql: 'string' },
        isEnabled: false,
      },
      {
        id: 'list_tables',
        name: 'List Tables',
        description: 'Liste todas as tabelas',
        server: 'database',
        schema: {},
        isEnabled: false,
      },
      {
        id: 'describe_table',
        name: 'Describe Table',
        description: 'Veja a estrutura de uma tabela',
        server: 'database',
        schema: { table: 'string' },
        isEnabled: false,
      },
    ],
  },
  {
    id: 'api',
    name: 'API Tester',
    description: 'Teste APIs REST e GraphQL',
    icon: '🔌',
    color: '#06b6d4',
    status: 'connected',
    tools: [
      {
        id: 'http_request',
        name: 'HTTP Request',
        description: 'Faça uma requisição HTTP',
        server: 'api',
        schema: { method: 'string', url: 'string', body: 'object' },
        isEnabled: true,
      },
      {
        id: 'graphql',
        name: 'GraphQL',
        description: 'Execute uma query GraphQL',
        server: 'api',
        schema: { endpoint: 'string', query: 'string' },
        isEnabled: true,
      },
    ],
  },
  {
    id: 'code-search',
    name: 'Code Search',
    description: 'Busca semântica no código-fonte',
    icon: '🔎',
    color: '#10b981',
    status: 'connected',
    tools: [
      {
        id: 'search_code',
        name: 'Search Code',
        description: 'Busque por padrões no código',
        server: 'code-search',
        schema: { pattern: 'string', language: 'string' },
        isEnabled: true,
      },
      {
        id: 'find_definitions',
        name: 'Find Definitions',
        description: 'Encontre definições de funções/classes',
        server: 'code-search',
        schema: { name: 'string' },
        isEnabled: true,
      },
      {
        id: 'find_references',
        name: 'Find References',
        description: 'Encontre referências a um símbolo',
        server: 'code-search',
        schema: { symbol: 'string' },
        isEnabled: true,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════════

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return SKILLS.filter((s) => s.category === category);
}

export function getSkillByCommand(command: string): Skill | undefined {
  return SKILLS.find((s) => s.command === command);
}

export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function searchSkills(query: string): Skill[] {
  const lower = query.toLowerCase();
  return SKILLS.filter(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

export function getConnectedMCPServers(): MCPServer[] {
  return MCP_SERVERS.filter((s) => s.status === 'connected');
}

export function getEnabledMCPTools(): MCPTool[] {
  return MCP_SERVERS.flatMap((s) => s.tools.filter((t) => t.isEnabled));
}

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  planning: '📋 Planejamento',
  development: '⚡ Desenvolvimento',
  review: '👁️ Revisão',
  productivity: '🚀 Produtividade',
  gsd: '🎯 GSD Workflow',
  mcp: '🔌 MCP Tools',
};

export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  planning: '#f59e0b',
  development: '#22c55e',
  review: '#a855f7',
  productivity: '#3b82f6',
  gsd: '#ef4444',
  mcp: '#06b6d4',
};
