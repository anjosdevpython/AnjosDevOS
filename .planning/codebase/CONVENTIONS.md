# CONVENTIONS

**Analysis Date:** 2026-08-28
**Project:** AnjosDevOS
**Repository root:** `C:\Users\allan.anjos\Downloads\anjosdevplataform`

> Estilo de código, naming, padrões estruturais e tratamento de erros observados no codebase.

---

## 1. Linguagem & Tipagem

- **TypeScript estrito** (`strict: true` no `tsconfig.json`).
- **Sem `any` como norma** — quando aparece é explicitamente combatido pela própria análise estática do Swarm (`collaboration-protocols.ts` regex `#1`).
- **`unknown` + type guards** em catch blocks:
  ```ts
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
  }
  ```
  Padrão consistente em `src/app/api/{chat,models,images}/route.ts`, `src/lib/ai/api-client.ts` e `swarm-engine.ts`.
- **Types centralizados** em `src/types/index.ts` (re-exports) + arquivos `types.ts` por módulo.
- **Interfaces nomeadas** (não `type X = {…}` em structs de domínio) — usado em `WindowState`, `AppDefinition`, `SwarmAgentDefinition`, `ProviderConfig`, etc.
- **Types com união discriminada** — ex.: `SwarmMessageType` = `'task_delegation' | 'code_submission' | …`, `SwarmAgentStatus` = `'idle' | 'thinking' | 'coding' | 'reviewing' | 'debugging' | 'automating' | 'error'`.

---

## 2. Componentes React

### 2.1 Client vs Server Components

- **Quase tudo é `'use client'`** — qualquer componente que use `useState`, `useEffect`, `useContext` ou event handlers.
- **`'use client'` no topo do arquivo** (primeira linha) — padrão do projeto.
- **Server components** são apenas:
  - `src/app/layout.tsx` (apenas metadata + `<html>` + `<body>` wrappers)
  - `src/app/not-found.tsx`
  - Route handlers em `src/app/api/*/route.ts`

### 2.2 Lazy loading

```ts
const FileExplorerApp = dynamic(
  () => import('./apps/FileExplorerApp').then(m => ({ default: m.FileExplorerApp })),
  { ssr: false }
);
```

- 15 apps usam `dynamic(..., { ssr: false })` em `AppRegistry.tsx`.
- 3 apps são importados diretamente: `ChatInterface`, `TerminalApp`, `AboutApp`.
- 8 páginas standalone (em `src/app/<feature>/page.tsx`) também são carregadas via `dynamic` dentro do `AppRegistry`.

### 2.3 Error Boundary

Todos os apps são envolvidos em `<AppErrorBoundary appName={...}>` (helper `wrapInBoundary` em `AppRegistry.tsx`).

### 2.4 Hooks

- `useDevice()` (`src/hooks/useDevice.ts`) é o único custom hook compartilhado. Hooks adicionais: `useIsMobile`, `useIsTablet`, `useIsDesktop`, `useIsTouchDevice`.
- Hooks do Context: `useOS()` em `src/components/os/OSContext.tsx` lança erro se usado fora do provider (`if (!ctx) throw new Error('useOS must be used within OSProvider')`).

### 2.5 Provider Pattern

```ts
const OSContext = createContext<OSContextType | null>(null);
export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be used within OSProvider');
  return ctx;
}
```

Padrão "throw if no provider" replicado.

---

## 3. Tailwind & Estilização

### 3.1 Convenção de classes

- **`cn()`** (`src/lib/utils.ts`) é usado em todo lugar:
  ```ts
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```
  Combina `clsx` (conditional classes) + `tailwind-merge` (deduplicação).

- **Cores semânticas** — uso consistente de tokens: `text-neon-green`, `bg-cyber-bg`, `border-cyber-border`, `text-text-secondary`, etc.

- **Glassmorphism / Cyberpunk** — combinação recorrente:
  ```html
  className="bg-cyber-card/90 backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
  ```
  - `backdrop-blur-2xl` para glass
  - Bordas com opacidade (`border-white/15`)
  - Sombras inline com rgba (`shadow-[...]`) para neon glow

### 3.2 Animações

- Tailwind `animate-*` (`glow`, `slide-in`, `scale-in`, `pulse-slow`) definidas em `tailwind.config.ts` (theme.extend.animation + keyframes).
- Durações curtas (200–300ms) com `cubic-bezier(0.16, 1, 0.3, 1)` (Apple-like easing).
- Transições inline com `transition-all duration-200`.

### 3.3 Responsivo

- `useDevice()` separa `mobile | tablet | desktop` (breakpoints 768/1024).
- Layout mobile dedicado em `src/components/mobile/MobileLayout.tsx`.
- `user-scalable: false` no viewport + `viewportFit: cover` para iOS notch.

### 3.4 Scrollbar custom

5px, thumb `rgba(255,255,255,0.12)`, transition 0.2s — em `globals.css`.

---

## 4. Naming

| Tipo | Convenção | Exemplo |
| --- | --- | --- |
| Componentes React | `PascalCase` | `OSProvider`, `ChatInterface`, `CodeEditorApp` |
| Hooks | `camelCase` começando com `use` | `useDevice`, `useOS`, `useIsMobile` |
| Funções de utilidade | `camelCase` | `cn`, `loadProviderSettings`, `getSwarmEngine` |
| Constantes de config | `UPPER_SNAKE` (em objetos) | `STORAGE_KEY`, `LEGACY_BASE_URL` |
| Tipos/interfaces | `PascalCase` | `WindowState`, `SwarmAgentDefinition` |
| Enums (string union) | `PascalCase` (nome) + `lowercase` (valor) | `ProviderId = 'openai' | 'anthropic' \| ...` |
| IDs de agentes swarm | `anjos-<role>` (kebab) | `anjos-architect` |
| Eventos pub/sub | `domain:event` | `swarm:ready`, `agent:status_change`, `message:new` |
| localStorage keys | `anjosdev_*` | `anjosdev_provider_settings` |
| Pastas de módulo | `kebab-case` | `agent-orchestration`, `deepseek-harness.ts` |
| Variáveis de env | `UPPER_SNAKE` | `NETWORK_TOOLS_API_KEY` |

---

## 5. Tratamento de Erros

### 5.1 API Routes

```ts
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro interno do servidor';
  return NextResponse.json({ error: message }, { status: 500 });
}
```

Padrão replicado em `chat/route.ts`, `models/route.ts`, `images/route.ts`. Validação 400 para input ausente.

### 5.2 api-client (client-side fetch)

```ts
if (!response.ok) {
  const error = await response.text();
  throw new Error(`Anthropic API Error ${response.status}: ${error}`);
}
```

Mensagem inclui status + body. Convenção `<Provider> API Error <status>: <body>`.

### 5.3 provider-config (localStorage)

```ts
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as ProviderSettings;
    // ...
  }
} catch {
  // Ignore parse errors
}
```

Catch silencioso para erros de parse de localStorage (estratégia defensiva).

### 5.4 Swarm Engine

- `SwarmEngineImpl.emit` envolve listener em try/catch (`console.error('Erro no listener do SwarmEngine:', err)`) para isolar falhas de um listener.
- `getAgent`, `updateAgentStatus`, `findProviderByModel` retornam `undefined` em vez de throw.

### 5.5 console.log residual

Detectado 1 `console.log` em produção: `src/components/os/apps/CodeEditorApp.tsx:121` — `console.log("Buscando usuário: " + userId)`. Ver `CONCERNS.md` §5.

---

## 6. Persistência & Side Effects

- **Apenas `localStorage`** (browser). Sem `IndexedDB`, `Cookies`, `SessionStorage`, `Service Workers` além do manifest PWA.
- **Sem backend de dados** — não há DB, ORM, ou migrations. Não há cache server-side.
- **Singletons in-memory** para engines: `getSwarmEngine()`, `getOrchestrator()`, `getHermesAgent()`, `getBrowserEngine()`, `getWorkflowLearner()` — todos usam `let instance: X | null = null; ... return instance;` no escopo de módulo.

---

## 7. Documentação no Código

- **JSDoc** em arquivos críticos: `swarm-engine.ts`, `agent-specialists.ts`, `api-client.ts`, `providers.ts`, `orchestrator.ts`, `hermes-agent.ts`, `browser-engine.ts`, `deepseek-harness.ts`, `openhands.ts`, `theia.ts`, `tools.ts`, `devtools.ts`.
- **Headers de arquivo** (bloco `/** ... */`) com:
  - Título
  - Descrição curta
  - Link opcional (ex: `https://github.com/deepseek-ai/deepseek-harness`)
- **README por módulo** em `src/lib/{ai,tools,integrations,agent-orchestration}/README.md` e `src/components/os/README.md` — em PT-BR, com seções "Visão Geral", "Arquivos", "Como adicionar…".

---

## 8. Padrões de Identidade Visual (Cyberpunk)

- **Logo** com glow (`text-neon-green/80` + `shadow-neon-green`).
- **Glassmorphism** como tema dominante.
- **Gradient buttons** recorrentes: `bg-gradient-to-r from-neon-green to-neon-blue text-black`.
- **Glyphs emoji** para avatares dos agentes swarm (`🧠 💻 🔍 🛠️ ⚡ 🚀 📝`).
- **Mensagens em PT-BR** em toda a UI (`Erro interno do servidor`, `API key não configurada`, `Pronto para execução`).

---

## 9. Padrões Específicos por Subsistema

### 9.1 Provider de IA

- Toda chamada de API passa por `getProviderApiConfig(providerId)` que retorna `{ baseUrl, apiKey, apiFormat }`.
- Formatos suportados: `'openai' | 'anthropic' | 'google'`.
- Anthropic SSE → OpenAI SSE em streaming (com decoder buffer + chunk parsing).
- Google Gemini SSE usado cru.

### 9.2 App do OS

- **Registro de 3 lugares** para adicionar um app novo (ver `STRUCTURE.md` §9):
  1. `src/components/os/types.ts` (`APP_DEFINITIONS`)
  2. `src/components/os/AppRegistry.tsx` (`case` em `getAppContent` + `ICON_COMPONENTS`)
  3. `Taskbar.tsx` / `DesktopIcons.tsx` / `StartMenu.tsx` (icon maps)

### 9.3 Skills (tools)

- `Skill` interface com `command: string` (slash command) e `inputs: SkillInput[]`.
- Helpers de busca: `searchSkills(query)`, `getSkillsByCategory(category)`, `getSkillByCommand(command)`, `getSkillById(id)`.

### 9.4 Agents (Swarm)

- `SwarmAgentDefinition` carrega: `systemPrompt`, `model`, `skills[]`, `tools[]`.
- Status de agente: `'idle' | 'thinking' | 'coding' | 'reviewing' | 'debugging' | 'automating' | 'error'`.
- Eventos de swarm: `swarm:ready`, `agent:status_change`, `message:new`, `session:start`, `session:complete`.

---

## 10. Convenções de Mensagens PT-BR

- Mensagens voltadas ao usuário final em **português** (acentos corretos): `Pronto para execução`, `Processando com agentes AnjosDevOS…`, `Execução realizada com sucesso!`, `Falha na execução`.
- Mensagens de API: `model e messages são obrigatórios`, `API key não configurada para este provider. Vá em Configurações para adicionar.`
- Identificadores de UI: `Chat IA`, `Gerador de Imagens`, `Saldo & Uso`, `Funcionários IA`.

---

## 11. Convenções de `package.json` e Scripts

- **Quatro scripts apenas:** `dev`, `build`, `start`, `lint`.
- **`next lint` sem config** — não há `.eslintrc` custom (Next usa default).
- **Sem scripts de test** — não há `test`, `test:watch`, `test:ci`.
- **Sem scripts de format** — não há Prettier nem Husky hooks.
- **Sem scripts de type-check standalone** — `tsc --noEmit` é mencionado em `CONTRIBUTING.md` mas não está em `package.json`.

---

## 12. Conventional Commits (recomendado, não obrigatório)

`CONTRIBUTING.md` recomenda Conventional Commits com exemplos:
```
feat(swarm): adiciona novo especialista em performance
fix(editor): corrige cursor no Monaco ao aplicar auto-patch
docs: atualiza manual de automação e colaboração
```

> Não há validador (commitlint/husky) instalado.

---

*Análise atualizada em 2026-08-28. Fontes: `tsconfig.json`, `tailwind.config.ts`, `src/lib/utils.ts`, `src/components/os/OSContext.tsx`, `src/app/api/*`, `src/lib/ai/api-client.ts`, `src/lib/agent-swarm/*`, `CONTRIBUTING.md`, `src/**/*`.*
