# INTEGRATIONS

**Analysis Date:** 2026-08-28
**Project:** AnjosDevOS
**Repository root:** `C:\Users\allan.anjos\Downloads\anjosdevplataform`

> Catálogo de integrações externas — APIs de IA, plataformas de agentes, IDEs, e o "plugin bus" interno (`deepseek-harness`, `openhands`, `theia`, `cowork`, `freebuff`).

---

## 1. Resumo das Integrações

O projeto é um **hub de integrações** que combina provedores de IA e plataformas de desenvolvimento em uma única UI web. As integrações se dividem em três categorias:

| Categoria | Integrações | Estado |
| --- | --- | --- |
| **Provedores de IA (REST)** | OpenAI, Anthropic, Google AI, DeepSeek, xAI/Grok, Mistral, Groq, Together, NetworkTools (default), Custom | UI de chaves funcional em `src/app/settings` |
| **Plataformas de agentes / IDEs (mock/in-app)** | DeepSeek Harness (DSH), OpenHands, Theia IDE, Freebuff, CoWork (memory/workbench/automation/browser/agents/channels) | Apps nativos com `next/dynamic` |
| **MCP Servers (planejado)** | Filesystem ✅, Git ✅, Browser ⏸️, Database ⏸️, API Tester ✅, Code Search ✅ | Registry em `src/lib/tools/tools.ts` (status declarado) |

---

## 2. Provedores de IA (REST)

Implementados em `src/lib/ai/`. Detalhes completos em `STACK.md` §8.

### 2.1 Camada de configuração

- `src/lib/ai/providers.ts` — define `PROVIDERS: Record<ProviderId, ProviderConfig>` com 10 provedores, modelos, baseUrl, apiFormat, capabilities.
- `src/lib/ai/provider-config.ts` — gerencia chaves via **localStorage** (`STORAGE_KEY = 'anjosdev_provider_settings'`). Funções: `loadProviderSettings`, `saveProviderSettings`, `getProviderApiKey`, `getProviderBaseUrl`, `isProviderEnabled`, `getEnabledProviders`, `getAvailableModels`, `getActiveProvider`.
- `src/lib/ai/api-client.ts` — `chatCompletion`, `chatCompletionStream` (com adapter Anthropic SSE → OpenAI-compat e Google Gemini SSE), `generateImage`, `getModels`. Suporta formatos `openai` | `anthropic` | `google`.
- `src/lib/ai/models.ts` — re-exports + aliases de compat (`CHAT_MODELS`, `IMAGE_MODELS`, etc.).

### 2.2 Modos de chamada

- **Cliente (browser):** `src/lib/ai/api-client.ts` é `'use client'` — faz `fetch` direto do navegador para `baseUrl` do provider. As chaves vivem em `localStorage` (não chegam ao servidor).
- **Servidor (Route Handlers):** `src/app/api/chat/route.ts`, `src/app/api/models/route.ts`, `src/app/api/images/route.ts` simplesmente chamam o mesmo `api-client.ts` e devolvem o resultado / stream SSE. Como o `api-client` é client-side, o servidor Next delega o fetch para o runtime do cliente em última instância (o que indica que a chave de API **sempre sai do navegador** — ver `CONCERNS.md`).

### 2.3 Streaming

- `chatCompletionStream` retorna `ReadableStream`.
- Anthropic SSE (`content_block_delta` events) é convertido para OpenAI-compat (`choices[].delta.content`).
- Google Gemini `streamGenerateContent?alt=sse` é passado direto.
- OpenAI-compat streaming é retornado cru.
- Headers de resposta do Next: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.

---

## 3. DeepSeek Harness (DSH) — `src/lib/integrations/deepseek-harness.ts`

> "Everything is a Plugin" — 24 plugins divididos em 10 categorias.

### 3.1 Categorias de plugin

`model | tool | skill | session | sandbox | storage | loop | scheduling | ui | integration`

### 3.2 Model Plugins (4)

| Plugin | Descrição |
| --- | --- |
| `deepseek-model` | DeepSeek V3/R1 |
| `openai-model` | GPT-4o, GPT-4 |
| `anthropic-model` | Claude 3.5 |
| `google-model` | Gemini 2.0 |

### 3.3 Tool Plugins (5)

`filesystem` · `terminal` · `browser` · `git` · `code-search`

### 3.4 Skill Plugins (4)

`planning` · `coding` · `review` · `debug`

### 3.5 Session / Sandbox / Storage / Integration

- Session: `chat-session`, `agent-session`
- Sandbox: `node-sandbox`, `python-sandbox`, `docker-sandbox`
- Storage: `memory-storage`, `file-storage`
- Integration: `github`, `slack`, `mcp-bridge`, `custom`

### 3.6 Perfis pré-definidos (DSHProfile[])

- **Default** (8 plugins): `deepseek-model, filesystem, terminal, git, planning, coding, chat-session, memory-storage`
- **Full Stack** (18 plugins) — inclui todos para desenvolvimento completo
- **Research** (10 plugins) — focado em pesquisa/análise

### 3.7 Helpers

`createDSHAgent({ name, profile, plugins? })` — retorna `DSHAgent` com `id`, `status` (`idle|running|paused|error`), `plugins`, `tasks: DSHTask[]`, `createdAt`, `lastActive`.

### 3.8 UI

App nativo `src/components/os/apps/DSHApp.tsx` (lazy em `AppRegistry.tsx`, `case 'deepseek-harness'`).

---

## 4. OpenHands — `src/lib/integrations/openhands.ts`

> "AI-Driven Development - Agent Canvas".

### 4.1 Backends (`AgentBackend`)

`local | docker | remote | cloud`

### 4.2 Agents (4)

| Agent | Modelo |
| --- | --- |
| `openhands` | DeepSeek V3 |
| `claude-code` | Claude 3.5 |
| `codex` | GPT-4o |
| `gemini` | Gemini 2.0 |

### 4.3 Servers (3)

`local` (roda localmente) · `docker` (sandbox Docker) · `cloud` (OpenHands Cloud)

### 4.4 Automações (4)

`daily-report` · `issue-decomposer` · `pr-reviewer` · `dependency-updater`

Triggers: `schedule | webhook | event | manual` (`AutomationTrigger`).
Actions: `agent | notification | webhook | transform` (`AutomationAction`).

### 4.5 Helpers

`createOHSession({ agent, server, workspace })` — retorna `Conversation` com `id`, `agentId`, `title`, `messages`, `status: 'active' | 'archived'`, `createdAt`, `lastMessageAt`.

### 4.6 UI

App `src/components/os/apps/OpenHandsApp.tsx`.

---

## 5. Theia IDE — `src/lib/integrations/theia.ts`

> "Eclipse Theia — AI-Native Open-Source Cloud and Desktop IDE".

### 5.1 Categorias de extensão

`language | theme | debug | git | ai | ui | data | testing | container | other`

### 5.2 Extensions (16)

- **Languages (5):** `python`, `java`, `go`, `rust`, `cpp`
- **AI (2):** `copilot` (GitHub Copilot), `codeium`
- **Themes (3):** `dark-plus`, `monokai`, `dracula`
- **Git (1):** `git-integration`
- **Debug (2):** `node-debug`, `python-debug`
- **UI (2):** `icons`, `keybindings`
- **Containers (1):** `devcontainers`

### 5.3 Config

`TheiaConfig = { theme, fontSize, tabSize, wordWrap, minimap, autoSave, formatOnSave, aiEnabled, aiProvider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom', aiModel }`

### 5.4 Workspaces

`THEIA_WORKSPACES = [{ id: 'default', name: 'Default', path: '~/' }, { id: 'projects', name: 'Projects', path: '~/projects' }]`

### 5.5 Helpers

`installExtension('python')` — instala extensão e a torna disponível no Theia IDE.

### 5.6 UI

App `src/components/os/apps/TheiaApp.tsx`.

---

## 6. Freebuff — `src/lib/integrations/freebuff.ts`

Integração dedicada a um serviço chamado **Freebuff** (anunciado no CHANGELOG como app nativo). UI em `src/components/os/apps/FreebuffApp.tsx` (id `freebuff`, ícone `Zap`, cor `neon-green`).

> Detalhes do schema não foram inspecionados em profundidade — ver `CONCERNS.md` (integração ainda sem docs granulares).

---

## 7. CoWork Suite — `src/lib/integrations/cowork-*.ts`

Suite de 6 módulos "CoWork" (memória, workbench, automação, browser, agents, channels) que servem de base para o app "Everything Workbench" e "Channel Gateway". Os arquivos:

| Arquivo | Tema |
| --- | --- |
| `cowork-memory.ts` | Sistema de memória compartilhada |
| `cowork-workbench.ts` | Workbench central |
| `cowork-automation.ts` | Automações em runtime |
| `cowork-browser.ts` | Browser automation |
| `cowork-agents.ts` | Registry de agentes CoWork |
| `cowork-channels.ts` | Gateway de canais (Discord, Slack, etc. — presumido pelo nome) |

São consumidos pelos apps:
- `BrowserWorkbenchApp` (`browser-workbench` / `Globe` / `neon-cyan`)
- `EverythingWorkbenchApp` (`everything-workbench` / `FileText` / `neon-purple`)
- `ChannelGatewayApp` (`channel-gateway` / `Radio` / `neon-green`)

---

## 8. DevTools Hub — `src/lib/tools/devtools.ts`

Registry curado de **18+ ferramentas para desenvolvedores** (ver `TESTING.md` / `CONVENTIONS.md`).

### 8.1 Categorias

`ai-ide | ai-agent | ai-assistant | terminal | editor | devops | testing | utilities`

### 8.2 Exemplos de DevTools declarados

| Categoria | Tools |
| --- | --- |
| AI IDE | Cursor, Windsurf |
| AI Agent | OpenHands, Theia, Freebuff, DSH |
| AI Assistant | GitHub Copilot, Codeium, Cody, Tabnine |
| Terminal | Warp, Fig, Oh-My-Zsh |
| Editor | VS Code, JetBrains, Zed, Sublime |
| DevOps | Docker, Kubernetes, GitHub Actions |
| Testing | Playwright, Cypress, Vitest, Jest |
| Utilities | HTTPie, jq, ripgrep, fzf |

> Detalhes de cada um estão em `src/lib/tools/devtools.ts` (485 linhas).

---

## 9. MCP Servers — `src/lib/tools/tools.ts` (registry declarado)

> Status **declarado** no README; implementação real é mock.

| MCP | Status declarado | Tools |
| --- | --- | --- |
| Filesystem | ✅ Conectado | `read_file`, `write_file`, `list_directory`, `search_files` |
| Git | ✅ Conectado | `git_status`, `git_diff`, `git_log`, `git_commit` |
| Browser | ⏸️ Desconectado | `navigate`, `screenshot`, `click`, `type_text` |
| Database | ⏸️ Desconectado | `query`, `list_tables`, `describe_table` |
| API Tester | ✅ Conectado | `http_request`, `graphql` |
| Code Search | ✅ Conectado | `search_code`, `find_definitions`, `find_references` |

A feature flag em `src/config/app.ts` é `enableMCP: true`.

---

## 10. Swarm Engine × Orchestrator (interno)

Apesar de não serem "integrações externas", vale registrar como dois barramentos paralelos:

### 10.1 Swarm Engine (`src/lib/agent-swarm/`)

Singleton `SwarmEngineImpl` com bus pub/sub de mensagens (`SwarmMessage` com 10 tipos: `task_delegation`, `code_submission`, `review_feedback`, `bug_report`, `patch_proposal`, `automation_trigger`, `deploy_request`, `docs_update`, `broadcast`, `user_query`).
- 7 agentes especialistas (`SWARM_SPECIALISTS`).
- 4 templates de colaboração (`SWARM_COLLABORATION_TEMPLATES`):
  - `feature-dev-loop` (Arquiteto → Coder → Reviewer → Debugger → DevOps → Docs)
  - `autonomous-bugfix-loop` (Debugger → Coder → Reviewer → AutoPilot)
  - `security-audit-remediation` (Reviewer → Debugger → Coder → Docs)
  - `end-to-end-automation` (AutoPilot → Architect → AutoPilot → DevOps)
- `analyzeCodeQuality` (heurística regex de auditoria — 5 regras: `any`, `eval`, `innerHTML`, `console.log`, hardcoded secrets).
- `generateUnitTestsForCode` (gera skeleton de testes Vitest).

### 10.2 Agent Orchestrator (`src/lib/agent-orchestration/`)

Outra engine, também singleton, com API mais "Enterprise":
- `AgentOrchestratorImpl` com `registerAgent`, `sendMessage`, `submitTask`, `getAvailableAgents` (filtra por status + maxConcurrentTasks).
- `HermesAgent` — chain-of-thought, `HermesReasoningChain`, `HermesDecision`.
- `BrowserAutomationEngine` — `createSession`, `executeAction`, `startRecording`/`stopRecording`, `learnWorkflow`.
- `WorkflowLearner` — `startWatching`, `observeAction`, `getFrequentPatterns`, `createWorkflowFromActions`.

> **Risco arquitetural:** duas engines sobrepostas (Swarm Engine focado em codificação, Orchestrator focado em coordenação/tarefas genéricas). Ver `CONCERNS.md`.

---

## 11. Pontos de Entrada (Apps que Exõem Integrações)

Map de `src/components/os/AppRegistry.tsx` (case statement):

| App ID | Componente | Integração exposta |
| --- | --- | --- |
| `chat` | `ChatInterface` (em `src/components/features/chat`) | Multi-provider (todos) |
| `images` / `editor` / `video` / `music` / `tts` / `audio` | Pages em `src/app/{images,editor,video,music,tts,audio}/page.tsx` | Providers com `category` correspondente |
| `balance` | `src/app/balance/page.tsx` | Saldo & uso (apenas UI) |
| `settings` | `src/app/settings/page.tsx` | Configuração de chaves de API |
| `codeeditor` | `CodeEditorApp` (Monaco) | Audit + patch via Swarm Engine |
| `automation-studio` | `AutomationStudioApp` | Builder visual de fluxos |
| `agent-teams` | `AgentTeamsApp` | UI do Swarm Engine |
| `orchestrator` | `AgentOrchestratorApp` | UI do Orchestrator |
| `memory-system` | `MemorySystemApp` | CoWork memory |
| `channel-gateway` | `ChannelGatewayApp` | CoWork channels |
| `browser-workbench` | `BrowserWorkbenchApp` | CoWork browser engine |
| `everything-workbench` | `EverythingWorkbenchApp` | CoWork workbench |
| `devtools-hub` | `DevToolsHubApp` | Registry de DevTools |
| `openhands` / `theia` / `deepseek-harness` | Respectivos `*App` | UIs das integrações externas |
| `freebuff` | `FreebuffApp` | Freebuff |
| `warmwind` | `WarmwindApp` | "Funcionários IA" (registry em `src/lib/warmwind/`) |
| `fileexplorer` | `FileExplorerApp` | (UI local, sem integração externa) |
| `terminal` | `TerminalApp` | (UI local — comando `agents`, `swarm`, `audit`, `flows`, `models`, `neofetch`) |
| `tools` | `ToolsApp` | Skills registry |
| `about` | `AboutApp` | (estático) |

---

## 12. Notas de Segurança sobre Integrações

(Resumo — detalhes em `CONCERNS.md`.)

1. **API keys em `localStorage`** (`anjosdev_provider_settings`) — expostas a qualquer XSS.
2. **Chaves enviadas em `NEXT_PUBLIC_*`** embutem no bundle do cliente se usadas.
3. **A camada `/api/*` do Next** delega o fetch para o `api-client` client-side — o **gateway de chave de API é o browser**, não o servidor Next.
4. **DSH/OpenHands/Theia/Freebuff apps** são UIs declarativas — não executam código nativo (sem chamadas reais a serviços remotos confirmados).
5. **MCP servers** estão apenas como **declarados** no registry; não há `mcp.json` ou processo MCP real.

---

*Análise atualizada em 2026-08-28. Fontes: `src/lib/ai/*`, `src/lib/integrations/*`, `src/lib/tools/*`, `src/lib/agent-swarm/*`, `src/lib/agent-orchestration/*`, `src/components/os/AppRegistry.tsx`.*
