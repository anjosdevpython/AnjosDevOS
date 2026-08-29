# STRUCTURE

**Analysis Date:** 2026-08-28
**Project:** AnjosDevOS
**Repository root:** `C:\Users\allan.anjos\Downloads\anjosdevplataform`

> Mapa do diretório `src/` com localizações-chave, convenções de naming e responsabilidades.

---

## 1. Árvore de Diretórios (top-level)

```
anjosdevplataform/
├── .freebuff/                 # (runtime state — ignorar)
├── .git/                      # versionamento
├── .next/                     # build artifacts (gitignored)
├── docs/                      # documentação técnica complementar
├── node_modules/              # deps (gitignored)
├── public/                    # assets estáticos servidos em /
├── src/                       # código-fonte (toda a aplicação)
├── .env.example               # template de variáveis de ambiente
├── .env.local                 # envs locais (gitignored)
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── next-env.d.ts              # gerado pelo Next
├── next.config.ts             # output: 'standalone', images.remotePatterns: ['**']
├── package.json               # anjosdevos v1.0.0
├── package-lock.json
├── postcss.config.js          # tailwindcss + autoprefixer
├── README.md                  # documentação principal
├── tailwind.config.ts         # design tokens
└── tsconfig.json              # strict, path alias @/* → ./src/*
```

---

## 2. `public/` — Assets Estáticos

| Arquivo | Uso |
| --- | --- |
| `logo.png` | Logo oficial no BootScreen / StartMenu / Taskbar |
| `anjosdevos-logo.png` | Variante HD da logo |
| `icon-192.png`, `icon-512.png` | Ícones PWA |
| `icon.png` | Ícone genérico |
| `favicon.png` | Favicon |
| `manifest.json` | Manifesto PWA |

---

## 3. `docs/` — Documentação Complementar

- `AGENT_COLLABORATION.md` — Detalhamento do Swarm Engine e papéis dos 7 agentes.
- `AUTOMATION_GUIDE.md` — Manual do Automation Studio (triggers, ações, condições, saídas).

---

## 4. `src/` — Aplicação

```
src/
├── STRUCTURE.md                # (legado) mapa humano da estrutura
├── app/                        # Next.js App Router
│   ├── api/                    # Route Handlers
│   │   ├── chat/route.ts
│   │   ├── health/route.ts
│   │   ├── images/route.ts
│   │   └── models/route.ts
│   ├── audio/page.tsx          # Efeitos Sonoros (UI standalone)
│   ├── balance/page.tsx        # Saldo & Uso
│   ├── chat/page.tsx           # Chat IA (página completa)
│   ├── editor/page.tsx         # Editor de Imagens
│   ├── images/page.tsx         # Gerador de Imagens
│   ├── music/page.tsx          # Gerador de Música (Suno V5)
│   ├── settings/page.tsx       # Configurações de providers
│   ├── tts/page.tsx            # Text-to-Speech
│   ├── video/page.tsx          # Gerador de Vídeo
│   ├── globals.css             # tokens CSS + scrollbar + fonts
│   ├── layout.tsx              # RootLayout (metadata PWA)
│   ├── not-found.tsx           # 404
│   └── page.tsx                # UI Mode switcher (HomePage)
│
├── components/
│   ├── Sidebar.tsx             # Sidebar de navegação
│   ├── features/
│   │   └── chat/
│   │       └── ChatInterface.tsx
│   ├── ios/                    # Skin iOS
│   │   ├── IOSAppIcons.tsx
│   │   ├── IOSControlCenter.tsx
│   │   ├── IOSDock.tsx
│   │   ├── IOSHomeScreen.tsx
│   │   ├── IOSLayout.tsx
│   │   ├── IOSNotificationCenter.tsx
│   │   ├── IOSStatusBar.tsx
│   │   └── IOSWindow.tsx
│   ├── mobile/
│   │   └── MobileLayout.tsx
│   └── os/                     # Skin Cyberpunk (principal)
│       ├── AppErrorBoundary.tsx
│       ├── AppRegistry.tsx     # appId → ReactNode
│       ├── BootScreen.tsx
│       ├── Desktop.tsx
│       ├── DesktopIcons.tsx
│       ├── OSContext.tsx       # window manager (Context)
│       ├── README.md
│       ├── StartMenu.tsx
│       ├── Taskbar.tsx
│       ├── Window.tsx
│       ├── types.ts            # WindowState, AppDefinition, APP_DEFINITIONS
│       └── apps/               # 18 apps nativos
│           ├── AboutApp.tsx
│           ├── AgentOrchestratorApp.tsx
│           ├── AgentTeamsApp.tsx
│           ├── AutomationStudioApp.tsx
│           ├── BrowserWorkbenchApp.tsx
│           ├── ChannelGatewayApp.tsx
│           ├── CodeEditorApp.tsx
│           ├── DSHApp.tsx                  # DeepSeek Harness UI
│           ├── DevToolsHubApp.tsx
│           ├── EverythingWorkbenchApp.tsx
│           ├── FileExplorerApp.tsx
│           ├── FreebuffApp.tsx
│           ├── MemorySystemApp.tsx
│           ├── OpenHandsApp.tsx
│           ├── TerminalApp.tsx
│           ├── TheiaApp.tsx
│           ├── ToolsApp.tsx
│           └── WarmwindApp.tsx
│
├── config/
│   └── app.ts                  # APP_CONFIG (constantes globais)
│
├── hooks/
│   └── useDevice.ts            # mobile | tablet | desktop detector
│
├── lib/
│   ├── agent-orchestration/    # Orchestrator + Hermes + Browser + WorkflowLearner
│   │   ├── README.md
│   │   ├── browser-engine.ts
│   │   ├── hermes-agent.ts
│   │   ├── index.ts
│   │   ├── orchestrator.ts
│   │   ├── types.ts
│   │   └── workflow-learner.ts
│   ├── agent-swarm/            # SwarmEngine + 7 agentes
│   │   ├── agent-specialists.ts
│   │   ├── collaboration-protocols.ts
│   │   ├── index.ts
│   │   ├── swarm-engine.ts
│   │   └── types.ts
│   ├── ai/                     # Multi-provider de IA
│   │   ├── README.md
│   │   ├── api-client.ts
│   │   ├── models.ts
│   │   ├── provider-config.ts
│   │   └── providers.ts
│   ├── integrations/           # DSH, OpenHands, Theia, CoWork, Freebuff
│   │   ├── README.md
│   │   ├── cowork-agents.ts
│   │   ├── cowork-automation.ts
│   │   ├── cowork-browser.ts
│   │   ├── cowork-channels.ts
│   │   ├── cowork-memory.ts
│   │   ├── cowork-workbench.ts
│   │   ├── deepseek-harness.ts
│   │   ├── freebuff.ts
│   │   ├── openhands.ts
│   │   └── theia.ts
│   ├── tools/                  # Skills + DevTools
│   │   ├── README.md
│   │   ├── devtools.ts
│   │   └── tools.ts
│   ├── warmwind/               # AI Employees + App Store
│   │   ├── README.md
│   │   ├── ai-employees.ts
│   │   ├── app-store.ts
│   │   └── types.ts
│   └── utils.ts                # cn() = twMerge(clsx(...))
│
└── types/
    └── index.ts                # re-exports + tipos centrais
```

---

## 5. Localizações-Chave por Funcionalidade

### 5.1 UI Root & Skins

| Conceito | Local |
| --- | --- |
| Root metadata + PWA | `src/app/layout.tsx` |
| UI mode switcher | `src/app/page.tsx` |
| Cyberpunk skin | `src/components/os/Desktop.tsx` |
| iOS skin | `src/components/ios/IOSLayout.tsx` |
| Mobile skin | `src/components/mobile/MobileLayout.tsx` |
| Window manager | `src/components/os/OSContext.tsx` |
| App registry | `src/components/os/AppRegistry.tsx` |
| App definitions (27) | `src/components/os/types.ts` |

### 5.2 Backend / API

| Rota | Handler |
| --- | --- |
| `GET /api/health` | `src/app/api/health/route.ts` |
| `POST /api/chat` | `src/app/api/chat/route.ts` |
| `GET /api/models` | `src/app/api/models/route.ts` |
| `POST /api/images` | `src/app/api/images/route.ts` |

### 5.3 Camada de IA

| Conceito | Local |
| --- | --- |
| Registry de provedores | `src/lib/ai/providers.ts` |
| Storage de chaves (localStorage) | `src/lib/ai/provider-config.ts` |
| HTTP client multi-provider | `src/lib/ai/api-client.ts` |
| Modelos (legacy) | `src/lib/ai/models.ts` |

### 5.4 Engines de Agentes

| Conceito | Local |
| --- | --- |
| SwarmEngine singleton | `src/lib/agent-swarm/swarm-engine.ts` |
| 7 Especialistas | `src/lib/agent-swarm/agent-specialists.ts` |
| Protocolos de colaboração | `src/lib/agent-swarm/collaboration-protocols.ts` |
| Tipos Swarm | `src/lib/agent-swarm/types.ts` |
| Orchestrator | `src/lib/agent-orchestration/orchestrator.ts` |
| Hermes (chain-of-thought) | `src/lib/agent-orchestration/hermes-agent.ts` |
| Browser engine | `src/lib/agent-orchestration/browser-engine.ts` |
| Workflow learner | `src/lib/agent-orchestration/workflow-learner.ts` |

### 5.5 Integrações Externas (UI + config)

| Integração | Schema | UI App |
| --- | --- | --- |
| DeepSeek Harness | `src/lib/integrations/deepseek-harness.ts` | `src/components/os/apps/DSHApp.tsx` |
| OpenHands | `src/lib/integrations/openhands.ts` | `src/components/os/apps/OpenHandsApp.tsx` |
| Theia IDE | `src/lib/integrations/theia.ts` | `src/components/os/apps/TheiaApp.tsx` |
| Freebuff | `src/lib/integrations/freebuff.ts` | `src/components/os/apps/FreebuffApp.tsx` |
| CoWork Memory | `src/lib/integrations/cowork-memory.ts` | `src/components/os/apps/MemorySystemApp.tsx` |
| CoWork Workbench | `src/lib/integrations/cowork-workbench.ts` | `src/components/os/apps/EverythingWorkbenchApp.tsx` |
| CoWork Browser | `src/lib/integrations/cowork-browser.ts` | `src/components/os/apps/BrowserWorkbenchApp.tsx` |
| CoWork Channels | `src/lib/integrations/cowork-channels.ts` | `src/components/os/apps/ChannelGatewayApp.tsx` |
| CoWork Automation | `src/lib/integrations/cowork-automation.ts` | (consumido por `AutomationStudioApp`) |
| CoWork Agents | `src/lib/integrations/cowork-agents.ts` | (consumido por `AgentTeamsApp`) |

### 5.6 Tools Registry

| Conceito | Local |
| --- | --- |
| Skills registry (21) | `src/lib/tools/tools.ts` |
| DevTools registry (18+) | `src/lib/tools/devtools.ts` |
| Tools App UI | `src/components/os/apps/ToolsApp.tsx` |
| DevTools Hub UI | `src/components/os/apps/DevToolsHubApp.tsx` |

### 5.7 Configuração

| Conceito | Local |
| --- | --- |
| `APP_CONFIG` (storage keys, defaults, feature flags) | `src/config/app.ts` |
| Tailwind tokens | `tailwind.config.ts` |
| Next config (output: standalone, images) | `next.config.ts` |
| PostCSS | `postcss.config.js` |
| TS path alias | `tsconfig.json` (`@/*` → `./src/*`) |
| Env template | `.env.example` |

---

## 6. Convenções de Naming

| Tipo | Convenção | Exemplo |
| --- | --- | --- |
| Pastas de módulo | `kebab-case` | `agent-orchestration/`, `deepseek-harness.ts` |
| Arquivos TS/TSX | `PascalCase` para componentes, `kebab-case` para utils/libs | `OSContext.tsx`, `api-client.ts` |
| Componentes React | `PascalCase`, export nomeado | `export function OSProvider({...})` |
| Apps do OS | `PascalCase` + sufixo `App` | `CodeEditorApp`, `AutomationStudioApp` |
| Variáveis globais do Context | `camelCase` | `zIndexCounter`, `isStartMenuOpen` |
| Tipos de provider | `lowercase` string union | `'openai' | 'anthropic' | ...` |
| IDs de agente swarm | `anjos-<role>` (kebab) | `anjos-architect`, `anjos-coder` |
| IDs de janela | `window-{timestamp}-{counter}` | `window-1700000000000-3` |
| IDs de mensagem swarm | `msg-{timestamp}-{rand}` | `msg-1700000000000-x7k2p` |
| Sessões de swarm | `session-{timestamp}` | `session-1700000000000` |
| Skills | `kebab-case` (id) | `grill-with-docs`, `to-spec` |
| Plugins DSH | `kebab-case` (id) | `deepseek-model`, `mcp-bridge` |
| localStorage keys | `anjosdev_*` | `anjosdev_provider_settings` |

---

## 7. Convenção de Camadas

- **UI nunca importa `src/lib/agent-*/`** diretamente para lógica de runtime (apenas para tipos). A UI consome via `AppRegistry`/`getAppContent`.
- **`src/lib/ai/`** é a única camada com side-effects de `fetch` real (rede).
- **`src/lib/integrations/`** não tem I/O — apenas schemas de plugins/agents/extensions (declarativo).
- **`src/lib/agent-swarm/`** e **`src/lib/agent-orchestration/`** são engines em memória (não persistem estado entre reloads).
- **`src/components/os/`** é o único lugar que monta o "OS" propriamente dito. As skins `ios/` e `mobile/` são alternativas paralelas.

---

## 8. Mapa de Apps do OS (27)

| ID | Título | Categoria | Origem (lazy ou direto) |
| --- | --- | --- | --- |
| `chat` | Chat IA | ai | direto (`ChatInterface`) |
| `images` | Gerador de Imagens | ai | `src/app/images/page.tsx` |
| `editor` | Editor de Imagens | ai | `src/app/editor/page.tsx` |
| `video` | Gerador de Vídeo | ai | `src/app/video/page.tsx` |
| `music` | Gerador de Música | ai | `src/app/music/page.tsx` |
| `tts` | Text-to-Speech | ai | `src/app/tts/page.tsx` |
| `audio` | Efeitos Sonoros | ai | `src/app/audio/page.tsx` |
| `balance` | Saldo & Uso | tools | `src/app/balance/page.tsx` |
| `codeeditor` | Code Editor | system | `CodeEditorApp` |
| `fileexplorer` | Explorador | system | `FileExplorerApp` |
| `terminal` | Terminal | system | direto (`TerminalApp`) |
| `tools` | AI Tools | system | `ToolsApp` |
| `devtools-hub` | DevTools Hub | system | `DevToolsHubApp` |
| `openhands` | OpenHands | system | `OpenHandsApp` |
| `theia` | Theia IDE | system | `TheiaApp` |
| `deepseek-harness` | DeepSeek Harness | system | `DSHApp` |
| `settings` | Configurações | system | `src/app/settings/page.tsx` |
| `about` | Sobre o Sistema | system | direto (`AboutApp`) |
| `browser-workbench` | Browser | tools | `BrowserWorkbenchApp` |
| `everything-workbench` | Workbench | tools | `EverythingWorkbenchApp` |
| `automation-studio` | Automação | tools | `AutomationStudioApp` |
| `channel-gateway` | Canais | tools | `ChannelGatewayApp` |
| `agent-teams` | Agent Teams | ai | `AgentTeamsApp` |
| `memory-system` | Memória | ai | `MemorySystemApp` |
| `freebuff` | Freebuff | ai | `FreebuffApp` |
| `orchestrator` | Orquestrador | system | `AgentOrchestratorApp` |
| `warmwind` | Funcionários IA | ai | `WarmwindApp` |

---

## 9. Onde Adicionar Coisas (referência rápida)

| Quero adicionar… | Onde mexer |
| --- | --- |
| **Novo app no OS** | 1) `src/components/os/apps/MeuApp.tsx` 2) `src/components/os/types.ts` (APP_DEFINITIONS) 3) `src/components/os/AppRegistry.tsx` (case + ICON_COMPONENTS) 4) `Taskbar.tsx` / `DesktopIcons.tsx` / `StartMenu.tsx` (icon maps) |
| **Novo provedor de IA** | 1) `src/lib/ai/providers.ts` (PROVIDERS) 2) `src/lib/ai/provider-config.ts` (defaults) 3) `src/app/settings/page.tsx` (UI) 4) se novo apiFormat ≠ openai/anthropic/google, estender `src/lib/ai/api-client.ts` |
| **Novo agente Swarm** | `src/lib/agent-swarm/agent-specialists.ts` (array `SWARM_SPECIALISTS`) |
| **Novo template de colaboração** | `src/lib/agent-swarm/collaboration-protocols.ts` (`SWARM_COLLABORATION_TEMPLATES`) |
| **Novo skill** | `src/lib/tools/tools.ts` (array `SKILLS`) |
| **Novo DevTool** | `src/lib/tools/devtools.ts` (array `AI_IDES` ou outra categoria) |
| **Novo plugin DSH** | `src/lib/integrations/deepseek-harness.ts` (DSH_PLUGINS-like) |
| **Nova automação CoWork** | `src/lib/integrations/cowork-automation.ts` |

---

*Análise atualizada em 2026-08-28. Fontes: `src/STRUCTURE.md` (legado, mantido pelo projeto), inspeção de `src/**/*`, e cruzamento com `package.json` e `tsconfig.json`.*
