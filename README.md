# ⚡ AnjosDevOS

> **AI Operating System** — Um sistema operacional de IA completo para desenvolvedores, com desktop interface, multi-provider AI, ferramentas de desenvolvimento e integrações externas.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Setup](#-setup)
- [Providers de IA](#-providers-de-ia)
- [Sistema de Apps](#-sistema-de-apps)
- [AI Tools & Skills](#-ai-tools--skills)
- [MCP Integrations](#-mcp-integrations)
- [Integrações Externas](#-integrações-externas)
- [Sistema Mobile](#-sistema-mobile)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Guia de Contribuição](#-guia-de-contribuição)
- [Roadmap](#-roadmap)
- [Licença](#-licença)

---

## 🎯 Visão Geral

AnjosDevOS é uma plataforma web que simula um sistema operacional voltado para desenvolvedores, onde:

- **Apps rodam como janelas** em um desktop interativo
- **Múltiplos providers de IA** estão integrados (OpenAI, Anthropic, Google, DeepSeek, etc.)
- **Ferramentas de desenvolvimento** estão disponíveis como apps nativos
- **Integrações externas** permitem conectar-se a outros sistemas
- **Funciona em mobile** com layout adaptativo e PWA

### Conceito

```
┌─────────────────────────────────────────────────────────────────┐
│  🖥️ AnjosDevOS — Desktop Interface                              │
├─────────────┬───────────────────────┬───────────────────────────┤
│  File       │   Code Editor         │   AI Tools & Skills       │
│  Explorer   │   (Monaco Editor)     │   (21+ skills, GSD)       │
├─────────────┼───────────────────────┼───────────────────────────┤
│  DevTools   │   Terminal            │   Integrations            │
│  Hub        │   (xterm.js)          │   (DSH, OpenHands, etc.)  │
└─────────────┴───────────────────────┴───────────────────────────┘
```

---

## 🚀 Funcionalidades

### 🖥️ Sistema Operacional

| Componente | Descrição |
|------------|-----------|
| **Desktop** | Interface com ícones arrastáveis, fundo animado |
| **Windows** | Sistema de janelas com mover, redimensionar, minimizar, maximizar |
| **Taskbar** | Barra de tarefas com apps abertos e relógio |
| **Start Menu** | Menu iniciar com lista de todos os apps |
| **Boot Screen** | Tela de inicialização animada |

### 🤖 Apps de IA

| App | Descrição | Modelos |
|-----|-----------|---------|
| **Chat IA** | Chat com streaming e histórico | GPT-4o, Claude, Gemini, DeepSeek, Grok |
| **Gerador de Imagens** | Geração por texto | DALL-E 3, Flux, Imagen 3 |
| **Editor de Imagens** | Remove fundo, inpaint, upscale | Recraft V3, Stable Diffusion |
| **Gerador de Vídeo** | Vídeo com áudio | Kling 3 |
| **Gerador de Música** | Criar, cover, estender | Suno V5, V4.5, V4 |
| **Text-to-Speech** | Voz natural | Model V3 |
| **Efeitos Sonoros** | Áudio por prompt | Stable Audio |

### 💻 Ferramentas de Desenvolvimento

| App | Descrição |
|-----|-----------|
| **Code Editor** | Monaco Editor com IntelliSense, 40+ linguagens |
| **File Explorer** | Navegação de arquivos com tree view e grid |
| **Terminal** | Terminal simulado com comandos |
| **AI Tools** | 21+ skills inspiradas no AI Hero |
| **DevTools Hub** | 18+ ferramentas de dev (Cursor, Windsurf, Cline, etc.) |

### 🔌 Integrações

| App | Descrição |
|-----|-----------|
| **DeepSeek Harness** | Sistema de plugins com 24+ plugins |
| **OpenHands** | Agent canvas com automações |
| **Theia IDE** | IDE extensível com 16 extensões |

---

## 🏗️ Arquitetura

### Stack Técnico

```
Frontend:     Next.js 15 + React 19 + Tailwind CSS 3.4
Editor:       @monaco-editor/react
State:        React Context (OSContext)
Backend:      Next.js API Routes
AI:           Multi-provider (OpenAI, Anthropic, Google, etc.)
Storage:      localStorage + IndexedDB
PWA:          manifest.json + service worker
```

### Diagrama de Componentes

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Chat streaming endpoint
│   │   ├── models/               # List available models
│   │   ├── images/               # Image generation
│   │   ├── video/                # Video generation
│   │   ├── music/                # Music generation
│   │   ├── tts/                  # Text-to-speech
│   │   ├── audio/                # Audio effects
│   │   ├── editor/               # Image editing
│   │   └── balance/              # Credit balance
│   ├── chat/                     # Chat page
│   ├── settings/                 # Settings page
│   └── page.tsx                  # Home (device detection)
│
├── components/
│   ├── os/                       # OS Core
│   │   ├── OSContext.tsx          # Window management state
│   │   ├── Desktop.tsx           # Desktop background + icons
│   │   ├── Window.tsx            # Draggable/resizable window
│   │   ├── Taskbar.tsx           # Bottom taskbar
│   │   ├── StartMenu.tsx         # Start menu overlay
│   │   ├── BootScreen.tsx        # Boot animation
│   │   ├── DesktopIcons.tsx      # Desktop icon grid
│   │   ├── AppRegistry.tsx       # App content mapping
│   │   ├── types.ts              # Window & App types
│   │   └── apps/                 # Individual app components
│   │       ├── ChatApp.tsx
│   │       ├── FileExplorerApp.tsx
│   │       ├── CodeEditorApp.tsx
│   │       ├── TerminalApp.tsx
│   │       ├── ToolsApp.tsx
│   │       ├── DevToolsHubApp.tsx
│   │       ├── DSHApp.tsx
│   │       ├── OpenHandsApp.tsx
│   │       ├── TheiaApp.tsx
│   │       └── AboutApp.tsx
│   ├── features/
│   │   └── chat/
│   │       └── ChatInterface.tsx
│   └── mobile/
│       └── MobileLayout.tsx
│
├── lib/
│   ├── ai/                       # AI Providers
│   │   ├── providers.ts          # 9 provider definitions
│   │   ├── provider-config.ts    # Config manager
│   │   ├── models.ts             # Model registry
│   │   └── api-client.ts         # Multi-format API client
│   ├── integrations/             # External integrations
│   │   ├── deepseek-harness.ts
│   │   ├── openhands.ts
│   │   └── theia.ts
│   ├── tools/                    # Developer tools
│   │   ├── tools.ts              # 21 skills + MCP servers
│   │   └── devtools.ts           # 18+ dev tools registry
│   └── utils.ts
│
├── hooks/
│   └── useDevice.ts              # Device detection hook
│
├── config/
│   └── app.ts                    # App configuration
│
└── types/
    └── index.ts                  # Centralized types
```

---

## 📦 Setup

### Pré-requisitos

- Node.js 18+
- npm, yarn ou pnpm

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/anjosdevpython/AnjosDevOS.git
cd AnjosDevOS

# 2. Instale dependências
npm install

# 3. Configure as API keys (opcional)
cp .env.example .env.local
# Edite .env.local com suas chaves

# 4. Inicie o servidor
npm run dev
```

Abra **http://localhost:3000** no navegador.

### Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Iniciar servidor de produção
npm run lint     # Verificação de código
```

### Configuração de API Keys

Crie um arquivo `.env.local`:

```env
# NetworkTools (padrão)
NETWORK_TOOLS_API_KEY=sua_chave_aqui

# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# Anthropic (opcional)
ANTHROPIC_API_KEY=sk-ant-...

# Google AI (opcional)
GOOGLE_AI_API_KEY=AIza...

# DeepSeek (opcional)
DEEPSEEK_API_KEY=sk-...

# xAI/Grok (opcional)
XAI_API_KEY=xai-...

# Mistral (opcional)
MISTRAL_API_KEY=...

# Groq (opcional)
GROQ_API_KEY=gsk_...

# Together AI (opcional)
TOGETHER_API_KEY=...
```

> 💡 Você pode configurar as keys diretamente na interface de Settings

---

## 🤖 Providers de IA

AnjosDevOS suporta **9 provedores de IA** independentes:

| Provider | Icone | Formato API | Modelos Principais |
|----------|-------|-------------|-------------------|
| **OpenAI** | 🤖 | OpenAI | GPT-4o, GPT-4, o1, o3, DALL-E 3 |
| **Anthropic** | 🧠 | Anthropic | Claude Sonnet 4, Claude 3.5, Claude 3 |
| **Google AI** | 💎 | Google | Gemini 2.5 Pro, Gemini 2.0, Imagen 3 |
| **DeepSeek** | 🔮 | OpenAI | DeepSeek V3, DeepSeek R1 |
| **xAI (Grok)** | ⚡ | OpenAI | Grok 3, Grok 2 |
| **Mistral AI** | 🌊 | OpenAI | Mistral Large, Codestral, Mixtral |
| **Groq** | 🚀 | OpenAI | Llama 3.3, Gemma 2, Mixtral |
| **Together AI** | 🤝 | OpenAI | Llama 3.1 405B, Qwen 2.5 |
| **NetworkTools** | 🌐 | OpenAI | GPT-5, Claude 5, DeepSeek V4 |

### Formatos de API

```typescript
// OpenAI format (usado por maioria dos providers)
{
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
  stream: true
}

// Anthropic format
{
  model: 'claude-sonnet-4-20250514',
  messages: [{ role: 'user', content: 'Hello' }],
  max_tokens: 4096
}

// Google format
{
  contents: [{ parts: [{ text: 'Hello' }] }]
}
```

### Configuração de Providers

Acesse **http://localhost:3000/settings** para:

1. Expandir um provider
2. Inserir a API key
3. Ativar/desativar o provider
4. Salvar as configurações

---

## 📱 Sistema de Apps

### Registrar um Novo App

1. **Crie o componente** em `src/components/os/apps/MeuApp.tsx`:

```tsx
'use client';

export function MeuApp() {
  return (
    <div className="h-full p-4">
      <h1>Meu App</h1>
      {/* Conteúdo */}
    </div>
  );
}
```

2. **Registre em `src/components/os/types.ts`**:

```typescript
{ 
  id: 'meuapp', 
  title: 'Meu App', 
  iconName: 'Star', 
  color: 'neon-green', 
  defaultWidth: 800, 
  defaultHeight: 600, 
  minWidth: 400, 
  minHeight: 350, 
  desktopIcon: true, 
  category: 'tools' 
}
```

3. **Adicione ao AppRegistry** em `src/components/os/AppRegistry.tsx`:

```typescript
case 'meuapp':
  return <MeuApp />;
```

4. **Adicione o ícone** em:
   - `Taskbar.tsx` (ICON_MAP)
   - `DesktopIcons.tsx` (ICON_MAP)
   - `StartMenu.tsx` (ICON_MAP)

### Gerenciamento de Janelas

O `OSContext` gerencia todas as janelas:

```typescript
const { openApp, closeWindow, minimizeWindow, toggleMaximize } = useOS();

// Abrir app
openApp('chat');

// Fechar janela
closeWindow(windowId);

// Minimizar
minimizeWindow(windowId);

// Maximizar/restaurar
toggleMaximize(windowId);
```

---

## 🛠️ AI Tools & Skills

### Skills Disponíveis (21)

#### 📋 Planejamento
| Skill | Comando | Descrição |
|-------|---------|-----------|
| Grill with Docs | `/grill-with-docs` | Entreviste sobre um plano |
| To Spec | `/to-spec` | Converta conversa em spec |
| To Tickets | `/to-tickets` | Divida spec em tickets |
| Wayfinder | `/wayfinder` | Mapeie decisões |
| Research | `/research` | Pesquisa fundamentada |

#### ⚡ Desenvolvimento
| Skill | Comando | Descrição |
|-------|---------|-----------|
| Implement | `/implement` | Construa spec completa |
| Prototype | `/prototype` | Código descartável |
| TDD | `/tdd` | Ciclo red-green-refactor |
| Diagnosing Bugs | `/diagnosing-bugs` | Diagnostique bugs |
| Improve Codebase | `/improve-codebase-architecture` | Refatore código |

#### 👁️ Revisão
| Skill | Comando | Descrição |
|-------|---------|-----------|
| Code Review | `/code-review` | Revise diff |
| Resolve Conflicts | `/resolving-merge-conflicts` | Resolva conflitos git |
| Triage | `/triage` | Classifique issues |

#### 🚀 Produtividade
| Skill | Comando | Descrição |
|-------|---------|-----------|
| Grill Me | `/grill-me` | Alinhe ideias |
| Handoff | `/handoff` | Documente sessão |
| Teach | `/teach` | Aprenda tópicos |
| Wait What | `/wait-what` | Explique novamente |

#### 🎯 GSD Workflow
| Skill | Comando | Descrição |
|-------|---------|-----------|
| GSD: Plan | `/gsd-plan` | Fase 1: Planeje |
| GSD: Execute | `/gsd-execute` | Fase 2: Execute |
| GSD: Verify | `/gsd-verify` | Fase 3: Verifique |

### Uso

```typescript
import { SKILLS, searchSkills, getSkillsByCategory } from '@/lib/tools/tools';

// Buscar skills
const planningSkills = getSkillsByCategory('planning');

// Buscar por texto
const results = searchSkills('implement');
```

---

## 🔌 MCP Integrations

### MCP Servers Disponíveis

| Server | Tools | Status |
|--------|-------|--------|
| 📁 **Filesystem** | read_file, write_file, list_directory, search_files | ✅ Conectado |
| 🔀 **Git** | git_status, git_diff, git_log, git_commit | ✅ Conectado |
| 🌐 **Browser** | navigate, screenshot, click, type_text | ⏸️ Desconectado |
| 🗄️ **Database** | query, list_tables, describe_table | ⏸️ Desconectado |
| 🔌 **API Tester** | http_request, graphql | ✅ Conectado |
| 🔎 **Code Search** | search_code, find_definitions, find_references | ✅ Conectado |

### Uso

```typescript
import { MCP_SERVERS, getConnectedMCPServers, getEnabledMCPTools } from '@/lib/tools/tools';

// Obter servers conectados
const connected = getConnectedMCPServers();

// Obter tools habilitadas
const tools = getEnabledMCPTools();
```

---

## 🔗 Integrações Externas

### DeepSeek Harness (DSH)

Sistema de agentes com arquitetura "Everything is a Plugin":

| Categoria | Plugins |
|-----------|---------|
| 🤖 Modelos | DeepSeek, OpenAI, Anthropic, Google |
| 🔧 Ferramentas | Filesystem, Terminal, Browser, Git |
| ⚡ Skills | Planning, Coding, Review, Debug |
| 📦 Sandboxes | Node.js, Python, Docker |
| 🔌 Integrações | GitHub, Slack, MCP Bridge |

**Perfis Pré-configurados:**
- Default (8 plugins)
- Full Stack (18 plugins)
- Research (10 plugins)

### OpenHands

Agent canvas com automações:

| Agent | Descrição |
|-------|-----------|
| OpenHands | Agent principal |
| Claude Code | Coding agent |
| Codex | OpenAI agent |
| Gemini | Google agent |

**Automações:**
- Daily Report
- Issue Decomposer
- PR Reviewer
- Dependency Updater

### Theia IDE

IDE extensível com 16 extensões:

| Categoria | Extensões |
|-----------|-----------|
| Languages | Python, Java, Go, Rust, C++ |
| AI | Copilot, Codeium |
| Themes | Dark+, Monokai, Dracula |
| Git | Git Integration |
| Debug | Node.js, Python |

---

## 📱 Sistema Mobile

### Device Detection

```typescript
import { useDevice, useIsMobile } from '@/hooks/useDevice';

const { type, isMobile, isTablet, isDesktop } = useDevice();
```

### Layout Adaptativo

| Dispositivo | Layout |
|-------------|--------|
| **Mobile** (< 768px) | MobileLayout com bottom nav |
| **Tablet** (768-1023px) | Desktop com ajustes |
| **Desktop** (≥ 1024px) | Desktop completo |

### Mobile Layout

- **Bottom Navigation**: Início, Apps, Chat, Config
- **Quick Access Grid**: Acesso rápido aos apps
- **Search**: Busca por todos os apps
- **Touch Targets**: Botões de 44px
- **Safe Areas**: Suporte para notch

### PWA

O app pode ser instalado como PWA:

```json
{
  "name": "AnjosDevOS",
  "short_name": "AnjosDevOS",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#00ff88"
}
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── features/           # Feature components
│   ├── mobile/             # Mobile layout
│   ├── os/                 # OS core + apps
│   ├── ui/                 # Reusable UI
│   └── layout/             # Layout components
├── config/                 # Configuration
├── hooks/                  # Custom hooks
├── lib/
│   ├── ai/                 # AI providers
│   ├── integrations/       # External integrations
│   └── tools/              # Developer tools
├── types/                  # TypeScript types
└── STRUCTURE.md            # Detailed structure docs
```

### Import Paths

```typescript
// Use path aliases
import { providers } from '@/lib/ai/providers';
import { useDevice } from '@/hooks/useDevice';
import { APP_CONFIG } from '@/config/app';
```

---

## 🤝 Guia de Contribuição

### Adicionar Novo Provider

1. Edite `src/lib/ai/providers.ts`
2. Adicione a definição do provider
3. Adicione os modelos disponíveis
4. Atualize `src/app/settings/page.tsx` se necessário

### Adicionar Nova Skill

1. Edite `src/lib/tools/tools.ts`
2. Adicione o objeto Skill ao array `SKILLS`
3. Defina inputs, outputs e modelo recomendado

### Adicionar Novo MCP Server

1. Edite `src/lib/tools/tools.ts`
2. Adicione o objeto MCPServer ao array `MCP_SERVERS`
3. Defina as tools disponíveis

### Adicionar Nova Integração

1. Crie arquivo em `src/lib/integrations/minha-integracao.ts`
2. Crie o componente em `src/components/os/apps/MinhaIntegracaoApp.tsx`
3. Registre em `types.ts` e `AppRegistry.tsx`

### Padrões de Código

- **Componentes**: Use `'use client'` para components interativos
- **Imports**: Sempre use path aliases (`@/...`)
- **Types**: Importe de `@/types` quando possível
- **Config**: Use valores de `@/config/app`
- **Naming**: Componentes em PascalCase, utils em camelCase

---

## 🗺️ Roadmap

### ✅ Concluído

- [x] Desktop OS interface
- [x] Window management (drag, resize, minimize, maximize)
- [x] Taskbar & Start Menu
- [x] Boot screen animation
- [x] Multi-provider AI (9 providers)
- [x] Chat interface com streaming
- [x] Image generation
- [x] Video generation
- [x] Music generation
- [x] Text-to-Speech
- [x] File Explorer
- [x] Code Editor (Monaco)
- [x] Terminal
- [x] AI Tools & Skills (21 skills)
- [x] GSD Workflow
- [x] MCP Integrations (6 servers)
- [x] DeepSeek Harness integration
- [x] OpenHands integration
- [x] Theia IDE integration
- [x] DevTools Hub (18+ tools)
- [x] Mobile responsive layout
- [x] PWA support

### 🔜 Próximo

- [ ] Autenticação de usuários
- [ ] Backend persistente (banco de dados)
- [ ] Sistema de permissões
- [ ] Multi-tenancy
- [ ] Plugin system extensível
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron/Tauri)
- [ ] Offline support
- [ ] Analytics dashboard

### 🚀 Futuro

- [ ] AI Agent orchestration
- [ ] Custom model fine-tuning
- [ ] Enterprise features
- [ ] API para terceiros
- [ ] Marketplace de plugins

---

## 📄 Licença

MIT License

```
Copyright (c) 2024 AnjosDev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🔗 Links

- **Repositório**: https://github.com/anjosdevpython/AnjosDevOS
- **Demo**: http://localhost:3000
- **Issues**: https://github.com/anjosdevpython/AnjosDevOS/issues

---

Feito com ❤️ por [AnjosDev](https://github.com/anjosdevpython)
