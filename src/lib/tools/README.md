# 🛠️ Tools Module

> Sistema de skills, MCP servers e ferramentas de desenvolvimento.

## Visão Geral

O módulo Tools contém:
- **21 Skills** inspiradas no AI Hero
- **6 MCP Servers** com integrações
- **18+ DevTools** para desenvolvedores

## Arquivos

### `tools.ts`

Registry principal de skills e MCP servers.

```typescript
import { 
  SKILLS, 
  MCP_SERVERS, 
  searchSkills, 
  getSkillsByCategory,
  getConnectedMCPServers 
} from '@/lib/tools/tools';

// Buscar skills
const planningSkills = getSkillsByCategory('planning');

// Buscar por texto
const results = searchSkills('implement');

// Obter MCP servers conectados
const connected = getConnectedMCPServers();
```

### `devtools.ts`

Registry de ferramentas de desenvolvimento.

```typescript
import { DEVTOOLS, getDevToolsByCategory } from '@/lib/tools/devtools';

// Obter tools por categoria
const aiIDEs = getDevToolsByCategory('ai-ide');
const aiAgents = getDevToolsByCategory('ai-agent');
```

## Skills Disponíveis

### 📋 Planejamento (5)

| Skill | Comando | Modelo Recomendado |
|-------|---------|-------------------|
| Grill with Docs | `/grill-with-docs` | Claude Sonnet 4 |
| To Spec | `/to-spec` | Claude Sonnet 4 |
| To Tickets | `/to-tickets` | Claude Sonnet 4 |
| Wayfinder | `/wayfinder` | Claude Sonnet 4 |
| Research | `/research` | GPT-4o |

### ⚡ Desenvolvimento (5)

| Skill | Comando | Modelo Recomendado |
|-------|---------|-------------------|
| Implement | `/implement` | Claude Sonnet 4 |
| Prototype | `/prototype` | GPT-4o |
| TDD | `/tdd` | Claude Sonnet 4 |
| Diagnosing Bugs | `/diagnosing-bugs` | Claude Sonnet 4 |
| Improve Codebase | `/improve-codebase-architecture` | Claude Sonnet 4 |

### 👁️ Revisão (3)

| Skill | Comando | Modelo Recomendado |
|-------|---------|-------------------|
| Code Review | `/code-review` | Claude Sonnet 4 |
| Resolve Conflicts | `/resolving-merge-conflicts` | Claude Sonnet 4 |
| Triage | `/triage` | GPT-4o |

### 🚀 Produtividade (4)

| Skill | Comando | Modelo Recomendado |
|-------|---------|-------------------|
| Grill Me | `/grill-me` | Claude Sonnet 4 |
| Handoff | `/handoff` | GPT-4o |
| Teach | `/teach` | GPT-4o |
| Wait What | `/wait-what` | GPT-4o |

### 🎯 GSD Workflow (3)

| Skill | Comando | Descrição |
|-------|---------|-----------|
| GSD: Plan | `/gsd-plan` | Fase 1: Planeje |
| GSD: Execute | `/gsd-execute` | Fase 2: Execute |
| GSD: Verify | `/gsd-verify` | Fase 3: Verifique |

## MCP Servers

### 📁 Filesystem (✅ Conectado)

| Tool | Descrição |
|------|-----------|
| `read_file` | Leia conteúdo de arquivo |
| `write_file` | Escreva em arquivo |
| `list_directory` | Liste diretório |
| `search_files` | Busque arquivos |

### 🔀 Git (✅ Conectado)

| Tool | Descrição |
|------|-----------|
| `git_status` | Status do repositório |
| `git_diff` | Mudanças pendentes |
| `git_log` | Histórico de commits |
| `git_commit` | Criar commit |

### 🌐 Browser (⏸️ Desconectado)

| Tool | Descrição |
|------|-----------|
| `navigate` | Navegue para URL |
| `screenshot` | Capture tela |
| `click` | Clique em elemento |
| `type_text` | Digite texto |

### 🗄️ Database (⏸️ Desconectado)

| Tool | Descrição |
|------|-----------|
| `query` | Execute SQL |
| `list_tables` | Liste tabelas |
| `describe_table` | Estrutura da tabela |

### 🔌 API Tester (✅ Conectado)

| Tool | Descrição |
|------|-----------|
| `http_request` | Requisição HTTP |
| `graphql` | Query GraphQL |

### 🔎 Code Search (✅ Conectado)

| Tool | Descrição |
|------|-----------|
| `search_code` | Busque no código |
| `find_definitions` | Encontre definições |
| `find_references` | Encontre referências |

## Adicionar Nova Skill

```typescript
// Em tools.ts, adicione ao array SKILLS
{
  id: 'my-skill',
  name: 'My Skill',
  description: 'Descrição da skill',
  category: 'development', // 'planning' | 'development' | 'review' | 'productivity' | 'gsd'
  icon: '🆕',
  color: '#ff0000',
  command: '/my-skill',
  inputs: [
    { 
      name: 'input1', 
      type: 'text', 
      placeholder: 'Digite algo...', 
      required: true 
    },
    {
      name: 'select1',
      type: 'select',
      options: ['opção 1', 'opção 2']
    }
  ],
  outputs: ['Output esperado'],
  model: 'claude-sonnet-4-20250514',
  tags: ['tag1', 'tag2']
}
```

## Adicionar Novo MCP Server

```typescript
// Em tools.ts, adicione ao array MCP_SERVERS
{
  id: 'my-server',
  name: 'My Server',
  description: 'Descrição do server',
  icon: '🆕',
  color: '#ff0000',
  status: 'connected', // 'connected' | 'disconnected' | 'error'
  tools: [
    {
      id: 'my_tool',
      name: 'My Tool',
      description: 'Descrição da tool',
      server: 'my-server',
      schema: { param1: 'string', param2: 'number' },
      isEnabled: true
    }
  ]
}
```

## GSD Workflow

O GSD (Get Stuff Done) é um framework de 3 fases:

### Fase 1: Plan (`/gsd-plan`)

1. Define o objetivo
2. Identifica restrições
3. Cria especificação detalhada
4. Lista tarefas com estimativas

### Fase 2: Execute (`/gsd-execute`)

1. Recebe a spec da Fase 1
2. Implementa com código
3. Escreve testes
4. Garante que tudo funciona

### Fase 3: Verify (`/gsd-verify`)

1. Recebe critérios de aceitação
2. Verifica cada critério
3. Lista issues encontradas
4. Gera relatório final

## Helper Functions

```typescript
// Buscar skills
searchSkills('query');

// Obter por categoria
getSkillsByCategory('planning');

// Obter por comando
getSkillByCommand('/implement');

// Obter por ID
getSkillById('implement');

// MCP helpers
getConnectedMCPServers();
getEnabledMCPTools();
```
