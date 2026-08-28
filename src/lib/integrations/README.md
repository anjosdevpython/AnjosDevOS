# 🔗 Integrations Module

> Integrações com sistemas externos: DeepSeek Harness, OpenHands, Theia IDE.

## Visão Geral

O módulo de integrações conecta o AnjosDevOS com ferramentas externas de desenvolvimento.

## Arquivos

### `deepseek-harness.ts`

Integração com o DeepSeek Harness - sistema de agentes com arquitetura de plugins.

```typescript
import { 
  DSH_PLUGINS, 
  DSH_PROFILES, 
  createDSHAgent,
  getPluginsByCategory 
} from '@/lib/integrations/deepseek-harness';

// Obter plugins por categoria
const modelPlugins = getPluginsByCategory('model');

// Criar agent
const agent = createDSHAgent({
  name: 'Meu Agent',
  profile: 'default'
});
```

### `openhands.ts`

Integração com o OpenHands - plataforma de agentes de código.

```typescript
import { 
  OH_AGENTS, 
  OH_AUTOMATIONS, 
  OH_SERVERS,
  createOHSession 
} from '@/lib/integrations/openhands';

// Criar sessão
const session = createOHSession({
  agent: 'openhands',
  server: 'local'
});
```

### `theia.ts`

Integração com o Theia IDE - IDE extensível.

```typescript
import { 
  THEIA_EXTENSIONS, 
  THEIA_WORKSPACES,
  installExtension 
} from '@/lib/integrations/theia';

// Instalar extensão
installExtension('python-extension');
```

---

## DeepSeek Harness (DSH)

### Conceito

O DSH usa arquitetura "Everything is a Plugin" - cada funcionalidade é um plugin que pode ser combinado.

### Plugins (24)

#### 🤖 Model Plugins (4)

| Plugin | Descrição |
|--------|-----------|
| `deepseek-model` | DeepSeek V3/R1 |
| `openai-model` | GPT-4o, GPT-4 |
| `anthropic-model` | Claude 3.5 |
| `google-model` | Gemini 2.0 |

#### 🔧 Tool Plugins (5)

| Plugin | Descrição |
|--------|-----------|
| `filesystem` | Leitura/escrita de arquivos |
| `terminal` | Execução de comandos |
| `browser` | Automação de browser |
| `git` | Operações Git |
| `code-search` | Busca no código |

#### ⚡ Skill Plugins (4)

| Plugin | Descrição |
|--------|-----------|
| `planning` | Planejamento de tarefas |
| `coding` | Escrita de código |
| `review` | Revisão de código |
| `debug` | Depuração |

#### 💬 Session Plugins (2)

| Plugin | Descrição |
|--------|-----------|
| `chat-session` | Sessão de chat |
| `agent-session` | Sessão de agent |

#### 📦 Sandbox Plugins (3)

| Plugin | Descrição |
|--------|-----------|
| `node-sandbox` | Sandbox Node.js |
| `python-sandbox` | Sandbox Python |
| `docker-sandbox` | Sandbox Docker |

#### 💾 Storage Plugins (2)

| Plugin | Descrição |
|--------|-----------|
| `memory-storage` | Armazenamento em memória |
| `file-storage` | Armazenamento em arquivo |

#### 🔌 Integration Plugins (4)

| Plugin | Descrição |
|--------|-----------|
| `github` | Integração GitHub |
| `slack` | Integração Slack |
| `mcp-bridge` | Bridge MCP |
| `custom` | Plugin personalizado |

### Perfis

Perfis são composições pré-definidas de plugins:

#### Default (8 plugins)

```typescript
{
  id: 'default',
  name: 'Default',
  plugins: [
    'deepseek-model',
    'filesystem',
    'terminal',
    'git',
    'planning',
    'coding',
    'chat-session',
    'memory-storage'
  ]
}
```

#### Full Stack (18 plugins)

Inclui todos os plugins para desenvolvimento completo.

#### Research (10 plugins)

Focado em pesquisa e análise.

### Criar Agent

```typescript
import { createDSHAgent } from '@/lib/integrations/deepseek-harness';

const agent = createDSHAgent({
  name: 'Code Assistant',
  profile: 'default',
  plugins: ['deepseek-model', 'filesystem', 'coding']
});

// Agent tem:
// - id único
// - status (idle, running, paused)
// - plugins carregados
// - sessão ativa
```

---

## OpenHands

### Conceito

OpenHands é uma plataforma de agentes de código que executa tarefas de desenvolvimento.

### Agents (4)

| Agent | Descrição | Modelo |
|-------|-----------|--------|
| `openhands` | Agent principal | DeepSeek V3 |
| `claude-code` | Coding agent | Claude 3.5 |
| `codex` | OpenAI agent | GPT-4o |
| `gemini` | Google agent | Gemini 2.0 |

### Servers (3)

| Server | Descrição |
|--------|-----------|
| `local` | Roda localmente |
| `docker` | Sandbox Docker |
| `cloud` | OpenHands Cloud |

### Automações (4)

| Automação | Descrição |
|-----------|-----------|
| `daily-report` | Relatório diário de atividades |
| `issue-decomposer` | Decompora issues em tarefas |
| `pr-reviewer` | Revisa Pull Requests |
| `dependency-updater` | Atualiza dependências |

### Criar Sessão

```typescript
import { createOHSession } from '@/lib/integrations/openhands';

const session = createOHSession({
  agent: 'openhands',
  server: 'local',
  workspace: '/path/to/project'
});

// Sessão tem:
// - id único
// - status (connected, disconnected)
// - logs
// - output
```

---

## Theia IDE

### Conceito

Theia é uma framework para criar IDEs extensíveis, similar ao VS Code.

### Extensões (16)

#### Languages (5)

| Extensão | Descrição |
|----------|-----------|
| `python` | Suporte Python |
| `java` | Suporte Java |
| `go` | Suporte Go |
| `rust` | Suporte Rust |
| `cpp` | Suporte C++ |

#### AI (2)

| Extensão | Descrição |
|----------|-----------|
| `copilot` | GitHub Copilot |
| `codeium` | Codeium AI |

#### Themes (3)

| Extensão | Descrição |
|----------|-----------|
| `dark-plus` | Dark+ Theme |
| `monokai` | Monokai Theme |
| `dracula` | Dracula Theme |

#### Git (1)

| Extensão | Descrição |
|----------|-----------|
| `git-integration` | Git Integration |

#### Debug (2)

| Extensão | Descrição |
|----------|-----------|
| `node-debug` | Node.js Debugger |
| `python-debug` | Python Debugger |

#### UI (2)

| Extensão | Descrição |
|----------|-----------|
| `icons` | File Icons |
| `keybindings` | Keybindings |

#### Containers (1)

| Extensão | Descrição |
|----------|-----------|
| `devcontainers` | Dev Containers |

### Workspaces

```typescript
import { THEIA_WORKSPACES } from '@/lib/integrations/theia';

// Workspaces disponíveis
const workspaces = [
  { id: 'default', name: 'Default', path: '~/' },
  { id: 'projects', name: 'Projects', path: '~/projects' }
];
```

### Instalar Extensão

```typescript
import { installExtension } from '@/lib/integrations/theia';

// Instala extensão
await installExtension('python');

// Extensão fica disponível no Theia IDE
```

---

## Adicionar Nova Integração

### 1. Criar Arquivo

```typescript
// src/lib/integrations/minha-integracao.ts

export interface MinhaIntegracaoConfig {
  id: string;
  name: string;
  // ...
}

export const MINHA_CONFIG: MinhaIntegracaoConfig = {
  id: 'minha',
  name: 'Minha Integração'
};

export function criarSessao(config: unknown) {
  // Lógica de criação
}
```

### 2. Criar App

```tsx
// src/components/os/apps/MinhaIntegracaoApp.tsx
'use client';

import { MINHA_CONFIG } from '@/lib/integrations/minha-integracao';

export function MinhaIntegracaoApp() {
  return (
    <div className="h-full p-4">
      <h1>{MINHA_CONFIG.name}</h1>
      {/* UI */}
    </div>
  );
}
```

### 3. Registrar no OS

Em `types.ts`:
```typescript
{
  id: 'minha-integracao',
  title: 'Minha Integração',
  iconName: 'Plug',
  color: 'neon-green',
  // ...
}
```

Em `AppRegistry.tsx`:
```typescript
case 'minha-integracao':
  return <MinhaIntegracaoApp />;
```
