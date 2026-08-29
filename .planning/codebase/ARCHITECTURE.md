# ARCHITECTURE

**Analysis Date:** 2026-08-28
**Project:** AnjosDevOS
**Repository root:** `C:\Users\allan.anjos\Downloads\anjosdevplataform`

> Padrão arquitetural, camadas, fluxo de dados, abstrações e pontos de entrada do sistema.

---

## 1. Padrão Arquitetural

**Single-page App (SPA-like) servida por Next.js App Router com UI "Desktop OS"** — uma página raiz (`src/app/page.tsx`) monta uma das três skins visuais (Cyberpunk, iOS, Mobile) sobre um `OSProvider` (React Context) que gerencia janelas. Não há SSR de OS — todos os apps rodam client-side (`'use client'`).

**Sub-patterns internos:**

- **Hexagonal-ish para IA** — `src/lib/ai/` é o "core" (provider-agnostic), `src/lib/integrations/` e os apps do OS são "adapters", e a UI (componentes OS) é a camada externa.
- **Pub/sub bus** — duas engines (Swarm Engine + Agent Orchestrator) com message bus + listeners.
- **Registry-based extensibility** — `APP_DEFINITIONS`, `PROVIDERS`, `SKILLS`, `DEVTOOLS`, `DSH_PLUGINS` são arrays/objetos de configuração que podem ser estendidos sem mudar a infra.
- **Lazy-loading via `next/dynamic`** para apps grandes do OS.

---

## 2. Camadas

```
┌──────────────────────────────────────────────────────────────┐
│ Browser (HTML + CSS + React 19)                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Root layout (src/app/layout.tsx) — metadata + PWA     │  │
│  │   └─ src/app/page.tsx (UI Mode switcher)              │  │
│  │       └─ OSProvider (React Context)                   │  │
│  │           ├─ Desktop.tsx (Cyberpunk skin)             │  │
│  │           ├─ IOSLayout.tsx (iOS skin)                 │  │
│  │           └─ MobileLayout.tsx (Mobile skin)           │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ /api/{chat,models,images,health} route handlers       │  │
│  │  (servem só como proxy para o client-side api-client) │  │
│  └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│ Core lib (src/lib)                                           │
│  ├─ ai/ (10 provedores, 3 formatos de API, streaming)        │
│  ├─ agent-swarm/ (SwarmEngine singleton)                     │
│  ├─ agent-orchestration/ (Orchestrator + Hermes + Browser)   │
│  ├─ integrations/ (DSH, OpenHands, Theia, CoWork, Freebuff) │
│  ├─ tools/ (Skills + DevTools registry)                      │
│  ├─ warmwind/ (AI employees + app store)                     │
│  └─ utils.ts (cn = twMerge(clsx(...)))                       │
├──────────────────────────────────────────────────────────────┤
│ Shared                                                       │
│  ├─ config/app.ts (APP_CONFIG)                               │
│  ├─ types/index.ts (re-exports + PaginatedResponse etc.)     │
│  └─ hooks/useDevice.ts (mobile/tablet/desktop detector)      │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Fluxo de Inicialização (Boot)

1. **`src/app/layout.tsx`** renderiza `<html lang="pt-BR">`, importa `globals.css`, injeta metadados PWA (`appleWebApp`, `manifest`, `viewportFit: cover`, `themeColor: #0a0a0f`).
2. **`src/app/page.tsx`** (Client Component):
   - Detecta dispositivo via `useDevice()`.
   - Mantém `uiMode: 'cyber' | 'ios' | 'mobile'` (default `cyber`, ou `mobile` se `isMobile`).
   - Renderiza **UI switcher flutuante** (3 botões com ícones Lucide).
   - Envolve a árvore em `<OSProvider>`.
3. **`OSProvider`** inicializa estados: `windows=[]`, `isBooted=false`, `isStartMenuOpen=false`.
4. **Skin correspondente** (`<Desktop>` / `<IOSLayout>` / `<MobileLayout>`) renderiza:
   - `BootScreen` (se `!isBooted`) — anima glow + progress.
   - `DesktopIcons` + `Windows` (mapeando `windows[]` via `<Window>`) + `Taskbar` + `StartMenu` (overlay).
5. `setBooted(true)` é chamado pelo `BootScreen` (padrão presente em `OSContext.tsx`).
6. Usuário pode:
   - Clicar num desktop icon → `openApp(appId)` → cria nova `WindowState` ou foca uma existente.
   - Clicar no Start Menu → lista todos os `APP_DEFINITIONS` por categoria.
   - Trocar UI mode no switcher flutuante (cyber ↔ ios ↔ mobile).

---

## 4. Sistema de Janelas (Window Manager)

Implementado em `src/components/os/OSContext.tsx` (provider) + `src/components/os/Window.tsx` (visual).

### 4.1 `WindowState` (em `src/components/os/types.ts`)

```ts
interface WindowState {
  id: string; appId: string; title: string;
  x: number; y: number; width: number; height: number;
  minWidth: number; minHeight: number;
  isMinimized: boolean; isMaximized: boolean;
  zIndex: number;
  prevBounds?: { x, y, width, height };  // snapshot pre-maximize
}
```

### 4.2 Operações do provider

| Operação | Comportamento |
| --- | --- |
| `openApp(appId)` | Se já aberta não-minimizada → foca. Se minimizada → restaura. Senão cria nova janela com offset cascata (`offset = (windowCounter % 8) * 30`) e z-index novo. |
| `closeWindow(id)` | Remove da lista. |
| `minimizeWindow(id)` | Marca `isMinimized: true`. |
| `toggleMaximize(id)` | Salva `prevBounds` antes de maximizar, restaura ao desmaximizar. Tamanho: `width: innerWidth`, `height: innerHeight - 48` (altura da taskbar). |
| `focusWindow(id)` | Incrementa z-index e remove minimize. |
| `moveWindow(id, x, y)` | Move + força `isMaximized: false`. |
| `resizeWindow(id, w, h)` | Aplica `Math.max(w, minWidth)` etc. |

### 4.3 Globais em escopo de módulo

```ts
let zIndexCounter = 100;
let windowCounter = 0;
```

> Ver `CONCERNS.md` — counters são mutáveis no module scope (não persistem após hot-reload de HMR).

### 4.4 Renderização (`Desktop.tsx`)

Itera `windows[]` e renderiza `<Window windowState={win} icon={...} iconColor={...}>` para cada uma. Cada `<Window>` recebe children do `AppRegistry.getAppContent(appId)`. Taskbar abaixo dos 48px de altura.

---

## 5. AppRegistry — Dispatch de Conteúdo

`src/components/os/AppRegistry.tsx` mapeia `appId → ReactNode`:

- **Direto (sem lazy):** `ChatInterface`, `TerminalApp`, `AboutApp`.
- **Lazy (`next/dynamic`, `ssr: false`):** 15 apps de `src/components/os/apps/*` + 8 páginas de `src/app/{images,editor,video,music,tts,audio,balance,settings}/page.tsx`.
- **`ICON_COMPONENTS`** — mapa `string → ReactNode` dos ícones Lucide (27 entradas).
- **Error boundary** — cada app é envolvido em `<AppErrorBoundary appName={...}>`.

---

## 6. Fluxo de uma Requisição de Chat (Ponta-a-Ponta)

```
[User] → ChatInterface (UI)
        ↓ (form: { model, messages, temperature, stream })
        ↓ fetch /api/chat
[Server] src/app/api/chat/route.ts
        ↓ valida { model, messages }
        ↓ (stream=true) → chatCompletionStream(request)
        ↓ (stream=false) → chatCompletion(request)
[Lib] src/lib/ai/api-client.ts
        ↓ getProviderApiConfig(request.provider)
        │     ├─ getProviderApiKey()  ← localStorage
        │     └─ getProviderBaseUrl() ← localStorage
        ↓ if apiFormat === 'openai'
        │     fetch(baseUrl + '/chat/completions', { Authorization: Bearer apiKey })
        ├─ if apiFormat === 'anthropic'
        │     fetch(baseUrl + '/messages', { x-api-key, anthropic-version })
        │     Converter SSE Anthropic → SSE OpenAI-compat
        └─ if apiFormat === 'google'
              fetch(baseUrl + '/models/{model}:generateContent?key={apiKey}')
        ↓ JSON / ReadableStream
[Server] devolve Response (SSE ou JSON)
[Client] ChatInterface renderiza tokens
```

> Importante: a chave sai do **navegador** (localStorage) e vai direto para o provider externo. O servidor Next age só como "proxy" que repassa o stream — **não tem acesso à chave** a menos que o `api-client` seja executado lá (o que é questionável dado o `'use client'`). Ver `CONCERNS.md` §2.

---

## 7. Fluxo do Swarm Engine (uma sessão de coding colaborativa)

`getSwarmEngine().executeCollaborativeCodingTask(goal, contextCode, contextFile, onProgress)` em `src/lib/agent-swarm/swarm-engine.ts`:

1. **Architect planeja** — `anjos-architect` posta `task_delegation` (broadcast), `status: 'thinking'`. Step 1 marcado `running` → após 600ms vira `completed`. (delay simulado)
2. **Coder implementa** — `anjos-coder` muda para `coding`, posta `code_submission` para reviewer. Step 2: gera código (boilerplate se `contextCode` vazio, senão `enhanceCodeWithGoal`). Delay 800ms.
3. **Reviewer audita** — `anjos-reviewer` muda para `reviewing`, executa `analyzeCodeQuality(code, file)` (heurística regex). Step 3: posta `review_feedback` (aprovação para architect OU apontamentos para debugger).
4. **Debugger corrige (se houver issues)** — Step 4: aplica `issue.fixedCode` em cada linha apontada.
5. **Testes gerados** — `generateUnitTestsForCode(code, file)` (template Vitest stub).
6. **Broadcast final** — architect posta `broadcast` de conclusão.
7. Sessão retornada com `finalResult = { code, summary, reviewScore, testsGenerated }`.

### 7.1 Sistema de eventos

`SwarmEngineImpl.on(listener)` — listener recebe `(event: string, data: unknown)`. Eventos emitidos: `swarm:ready`, `agent:status_change`, `message:new`, `session:start`, `session:complete`.

> **Risco:** toda a "IA" do Swarm Engine é **simulada** (regex + boilerplate estático). Não chama nenhum provider de IA real. Ver `CONCERNS.md` §1.

---

## 8. Fluxo do Agent Orchestrator (camada superior)

`src/lib/agent-orchestration/orchestrator.ts` — barramento alternativo para `OrchestratorAgent` (não confundir com `SwarmAgentDefinition`).

- `registerAgent({ id, name, type, status, capabilities, maxConcurrentTasks, currentTasks, metadata })`
- `sendMessage({ from, to, type, payload, priority })` — broadcast ou unicast, com `correlationId` opcional.
- `submitTask({ id, description, requiredCapabilities, input, timeout, callbacks })` — fila interna.
- `getAvailableAgents()` — filtra `status === 'idle' && currentTasks.length < maxConcurrentTasks`.

`HermesAgent` adiciona `HermesReasoningChain` (chain-of-thought tree) e `HermesDecision` (multi-option com pros/cons).

`BrowserAutomationEngine` (`browser-engine.ts`) — `createSession(url)`, `executeAction(sessionId, action)`, `startRecording`/`stopRecording`, `learnWorkflow`.

`WorkflowLearner` (`workflow-learner.ts`) — observa ações do usuário e detecta padrões.

> **Sobreposição com Swarm Engine:** dois sistemas com APIs parecidas (`Agent*`, mensagens, tasks) coexistem sem ponte clara entre eles. Ver `CONCERNS.md` §3.

---

## 9. UI Skins (modos visuais)

| Skin | Componente | Características |
| --- | --- | --- |
| **Cyberpunk** (default) | `Desktop` (`src/components/os/Desktop.tsx`) | Boot screen, desktop icons, taskbar, start menu, janelas arrastáveis. Tema neon (verde/cyan/azul/roxo). |
| **iOS** | `IOSLayout` (`src/components/ios/IOSLayout.tsx`) | Dynamic Island, status bar, dock, home screen grid, control center, notification center, app icons. |
| **Mobile** | `MobileLayout` (`src/components/mobile/MobileLayout.tsx`) | Layout responsivo com gestos touch, otimizado para smartphones. |

A escolha fica no `useState uiMode` da página raiz e o switcher é o floating pill no canto superior direito (3 botões: CyberOS, iOS, Mobile).

---

## 10. Componentes de UI Reutilizáveis

| Componente | Arquivo | Função |
| --- | --- | --- |
| `Window` | `src/components/os/Window.tsx` | Janela genérica com title bar, botões minimize/maximize/close, drag/resize |
| `Taskbar` | `src/components/os/Taskbar.tsx` | Barra inferior com apps abertos + relógio + indicadores |
| `StartMenu` | `src/components/os/StartMenu.tsx` | Menu Iniciar com lista categorizada de apps |
| `BootScreen` | `src/components/os/BootScreen.tsx` | Animação de boot com logo + progress |
| `DesktopIcons` | `src/components/os/DesktopIcons.tsx` | Grid de ícones no desktop |
| `AppErrorBoundary` | `src/components/os/AppErrorBoundary.tsx` | Error boundary por app (envolve todo app lazy-loaded) |
| `Sidebar` | `src/components/Sidebar.tsx` | Sidebar de navegação (parece não usada pelo OS principal — usada em páginas standalone) |
| `ChatInterface` | `src/components/features/chat/ChatInterface.tsx` | UI completa do chat com seleção de provider/model |

---

## 11. Tipos Centrais

- `src/components/os/types.ts` — `WindowState`, `AppDefinition`, `APP_DEFINITIONS[]` (27 apps).
- `src/lib/agent-swarm/types.ts` — `SwarmAgentRole`, `SwarmAgentStatus`, `SwarmMessageType`, `SwarmMessage`, `SwarmAgentDefinition`, `SwarmTaskStep`, `SwarmCollaborationSession`, `CodeAuditResult`, `AutomationExecutionStep`.
- `src/lib/agent-orchestration/types.ts` — `AgentMessage`, `AgentCapability`, `OrchestratorAgent`, `TaskRequest`, `TaskResult`, `Workflow`, `WorkflowStep`, `TaskArtifact`, `HermesThought`, `HermesReasoningChain`, `HermesDecision`, `BrowserAction`, `BrowserSession`, `LearnedWorkflow`.
- `src/lib/ai/providers.ts` — `ProviderId`, `ProviderConfig`, `ProviderModel`.
- `src/lib/tools/tools.ts` — `Skill`, `SkillInput`, `SkillExecution`, `MCPTool`.
- `src/lib/tools/devtools.ts` — `DevTool`, `DevToolCategory`, `DevToolStatus`.
- `src/lib/integrations/{deepseek-harness,openhands,theia}.ts` — `DSHPlugin`, `DSHAgent`, `OpenHandsAgent`, `Automation`, `TheiaExtension`, `TheiaWorkspace`, `TheiaConfig`.
- `src/types/index.ts` — re-exports + `BaseEntity`, `PaginatedResponse<T>`, `ApiResponse<T>`, `User`, `UserPreferences`, `WindowBounds`, `WindowState` (legacy alias), `AppEvent`, utility types.

---

## 12. Pontos de Entrada por Camada

| Camada | Ponto de entrada | URL/Contexto |
| --- | --- | --- |
| Web root | `src/app/page.tsx` | `GET /` |
| Web sub-pages | `src/app/{chat,editor,images,video,music,tts,audio,balance,settings}/page.tsx` | `GET /<route>` |
| API chat | `src/app/api/chat/route.ts` | `POST /api/chat` |
| API models | `src/app/api/models/route.ts` | `GET /api/models` |
| API images | `src/app/api/images/route.ts` | `POST /api/images` |
| API health | `src/app/api/health/route.ts` | `GET /api/health` |
| OS | `src/components/os/OSContext.tsx` (provider) | Contexto React, não URL |
| App dispatch | `src/components/os/AppRegistry.tsx` (`getAppContent(appId)`) | Contexto React |
| IA core | `src/lib/ai/{providers,api-client,provider-config}.ts` | Lib puro |
| Swarm core | `src/lib/agent-swarm/index.ts` | `getSwarmEngine()` |
| Orchestrator core | `src/lib/agent-orchestration/index.ts` | `getOrchestrator()`, `getHermesAgent()`, `getBrowserEngine()`, `getWorkflowLearner()` |

---

## 13. Invariantes Arquiteturais

1. **Tudo dentro de `src/`** — não há monorepo, packages externos ou workspaces.
2. **Sem testes automatizados** — não há `*.test.*`, `*.spec.*`, nem `vitest.config`/`jest.config`/`playwright.config`.
3. **Sem CI** — não há `.github/workflows/`.
4. **Sem dependência de framework UI** — React puro + Tailwind.
5. **Sem state global externo** — apenas Context + localStorage.
6. **Client-side first** — `'use client'` na maioria dos componentes, server-side usado só para route handlers que delegam.
7. **Standalone output** — `next.config.ts` define `output: 'standalone'` para deploys minimalistas.

---

*Análise atualizada em 2026-08-28. Fontes: `src/app/{page,layout}.tsx`, `src/app/api/*`, `src/components/os/*`, `src/lib/ai/*`, `src/lib/agent-swarm/*`, `src/lib/agent-orchestration/*`, `src/lib/integrations/*`, `src/config/app.ts`, `src/types/index.ts`.*
