/**
 * Freebuff Integration
 * https://github.com/CodebuffAI/freebuff
 * 
 * Freebuff is a free AI coding agent by Codebuff AI.
 * Five free AI products for coding, building, and research.
 * No subscription, credits, or API key required.
 * Built on Codebuff, the open multi-agent framework.
 */

export interface FreebuffProduct {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'available' | 'coming-soon';
  url: string;
  features: string[];
}

export interface FreebuffModel {
  id: string;
  name: string;
  provider: string;
  access: 'full' | 'limited' | 'earned';
  bestFor: string;
  contextWindow?: string;
  dailyLimit?: string;
  icon: string;
}

export interface FreebuffAgent {
  id: string;
  name: string;
  role: string;
  icon: string;
  description: string;
  capabilities: string[];
}

export const FREEBUFF_PRODUCTS: FreebuffProduct[] = [
  {
    id: 'desktop',
    name: 'Freebuff Desktop',
    icon: '🖥️',
    description: 'Execute agentes paralelos localmente',
    status: 'available',
    url: 'https://desktop.freebuff.com',
    features: [
      'Agentes paralelos isolados',
      'Trabalho local em workspaces separados',
      'Claude Code e Codex integrados',
      'Multi-modelo suportado',
      'macOS, Windows, Linux',
    ],
  },
  {
    id: 'cli',
    name: 'Freebuff CLI',
    icon: '⌨️',
    description: 'Code do seu terminal',
    status: 'available',
    url: 'https://cli.freebuff.com',
    features: [
      'Instalação via npm',
      'Agentes especializados',
      'Encontrador de arquivos',
      'Edição e revisão',
      'Ferramentas de projeto',
    ],
  },
  {
    id: 'web',
    name: 'Freebuff Web',
    icon: '🌐',
    description: 'Construa e publique apps full-stack',
    status: 'available',
    url: 'https://web.freebuff.com',
    features: [
      'Sandboxes hospedados',
      'Previews ao vivo',
      'Terminais integrados',
      'Deploy automático',
      'Colaboração em tempo real',
    ],
  },
  {
    id: 'cloud',
    name: 'Freebuff Cloud',
    icon: '☁️',
    description: 'Execute agentes em qualquer repositório GitHub',
    status: 'available',
    url: 'https://cloud.freebuff.com',
    features: [
      'Integração com GitHub',
      'PR automático',
      'CI/CD integrado',
      'Revisão de código IA',
      'Issues e comentários',
    ],
  },
  {
    id: 'chat',
    name: 'Freebuff Chat',
    icon: '💬',
    description: 'Pesquise e pense com IA',
    status: 'available',
    url: 'https://chat.freebuff.com',
    features: [
      'Raciocínio profundo',
      'Pesquisa com IA',
      'Múltiplos modelos',
      'Contexto de projeto',
      'Histórico de conversas',
    ],
  },
];

export const FREEBUFF_MODELS: FreebuffModel[] = [
  {
    id: 'gpt-5.6-luna',
    name: 'GPT-5.6 Luna',
    provider: 'OpenAI',
    access: 'full',
    bestFor: 'Modelo padrão; imagens nativas',
    icon: '🤖',
  },
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash 07/31',
    provider: 'DeepSeek',
    access: 'full',
    bestFor: 'Código rápido e uso de ferramentas',
    icon: '🔮',
  },
  {
    id: 'mimo-2.5',
    name: 'MiMo 2.5',
    provider: 'Xiaomi',
    access: 'limited',
    bestFor: 'Padrão no modo limitado; suporte a imagens',
    icon: '🧠',
  },
  {
    id: 'solar-pro-4',
    name: 'Solar Pro 4',
    provider: 'Upstage',
    access: 'full',
    bestFor: 'Trial temporário; 524K contexto',
    contextWindow: '524K',
    icon: '☀️',
  },
  {
    id: 'glm-5.3-flash',
    name: 'GLM 5.3 Flash',
    provider: 'Zhipu AI',
    access: 'full',
    bestFor: 'Raciocínio profundo; 2 sessões/dia',
    dailyLimit: '2 sessões/dia',
    icon: '⚡',
  },
  {
    id: 'glm-5.2',
    name: 'GLM 5.2',
    provider: 'Zhipu AI',
    access: 'earned',
    bestFor: 'Disponível por sessões conquistadas',
    icon: '🏆',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'Google',
    access: 'limited',
    bestFor: 'Tarefas especializadas (busca, pesquisa)',
    icon: '💎',
  },
];

export const FREEBUFF_AGENTS: FreebuffAgent[] = [
  {
    id: 'context',
    name: 'Agente de Contexto',
    icon: '🔍',
    role: 'Mapeamento de Código',
    description: 'Mapeia as partes relevantes de um projeto antes de editar',
    capabilities: [
      'Encontrador de arquivos',
      'Análise de dependências',
      'Mapeamento de estrutura',
      'Indexação de código',
    ],
  },
  {
    id: 'implementation',
    name: 'Agente de Implementação',
    icon: '⚡',
    role: 'Edição e Construção',
    description: ' Divide trabalho, faz alterações, roda comandos e inspeciona resultados',
    capabilities: [
      'Edição de código',
      'Execução de comandos',
      'Criação de arquivos',
      'Refatoração',
    ],
  },
  {
    id: 'review',
    name: 'Agente de Revisão',
    icon: '🔎',
    role: 'Quality Assurance',
    description: 'Revisa alterações e verifica qualidade do código',
    capabilities: [
      'Code review',
      'Verificação de testes',
      'Análise de lint',
      'Sugestões de melhoria',
    ],
  },
  {
    id: 'research',
    name: 'Agente de Pesquisa',
    icon: '📚',
    role: 'Pesquisa e Documentação',
    description: 'Investiga documentação e testa aplicações em navegador real',
    capabilities: [
      'Pesquisa web',
      'Documentação de APIs',
      'Testes em navegador',
      'Análise de dependências',
    ],
  },
  {
    id: 'browser',
    name: 'Agente de Navegador',
    icon: '🌐',
    role: 'Automação Web',
    description: 'Interage com aplicações web em um navegador real',
    capabilities: [
      'Automação de browser',
      'Capturas de tela',
      'Testes E2E',
      'Scraping inteligente',
    ],
  },
];

export function getFreebuffSetupInstructions(): string {
  return `# Instalação do Freebuff CLI

## Via npm (recomendado)
npm install -g freebuff

## Iniciar em um projeto
cd ~/meu-projeto
freebuff

## Descreva o que você quer
O Freebuff encontra os arquivos relevantes, faz alterações
e roda os checks importantes do seu projeto.

## Produtos disponíveis
- Freebuff Desktop: Agentes paralelos locais
- Freebuff CLI: Código do terminal
- Freebuff Web: Apps full-stack
- Freebuff Cloud: Agentes no GitHub
- Freebuff Chat: Pesquisa com IA`;
}

export function getFreebuffModelCatalog(): string {
  return FREEBUFF_MODELS.map(m =>
    `${m.icon} ${m.name} (${m.provider}) — ${m.access.toUpperCase()}\n   ${m.bestFor}${m.contextWindow ? `\n   Contexto: ${m.contextWindow}` : ''}${m.dailyLimit ? `\n   Limite: ${m.dailyLimit}` : ''}`
  ).join('\n\n');
}
