# AGENTS.md — AnjosDevOS

> Instruções para agentes de IA (Claude, Codex, OpenCode, Kiro, Kimi, etc.) que operam neste repositório. GSD-enforced.

## Project Snapshot

- **Project:** AnjosDevOS — Sistema Operacional web de IA **self-contained** (3 skins, 27 apps nativos, 10 provedores de IA, 2 engines de agentes, WebContainers rodando Node/npm/git, Workspaces isolados, IDE de 4 painéis).
- **Stack:** Next.js 15.1 (App Router) · React 19 · TypeScript estrito · Tailwind 3.4 · Zustand · Vitest · Playwright · Zod · Dexie (IndexedDB) · **@webcontainer/api** (Node/npm/git no browser) · **xterm.js** + xterm-addon-fit.
- **License:** MIT.
- **Working dir:** `C:\Users\allan.anjos\Downloads\anjosdevplataform`
- **Core value:** O AnjosDevOS é o único ambiente que o dev precisa abrir — IDE completo (Monaco + terminal real + git + WebContainers) + Swarm Engine chamando LLMs reais, Workspaces persistentes, sync via GitHub. Tudo no browser, nada no host.

## Build / Run

```bash
pnpm install
pnpm dev              # next dev
pnpm build            # next build (output: 'standalone')
pnpm start            # serve standalone build
pnpm lint             # next lint
pnpm tsc --noEmit     # type-check
pnpm vitest run       # unit tests (Phase 4)
pnpm playwright test  # E2E (Phase 4)
```

## Critical Rules

1. **Code lives in `src/`** — never edit files at repo root except config (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.ts`, `.env.example`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`).
2. **All UI components are Client Components** — keep `'use client'` at the top of any file that uses hooks, events, or browser APIs.
3. **No `any` in new code** — TypeScript strict mode is on; the Swarm Engine's own `analyzeCodeQuality` flags `any` as a `medium` severity finding. Set the example.
4. **Tailwind tokens only** — use `text-neon-green`, `bg-cyber-card`, etc. defined in `tailwind.config.ts`. No hardcoded colors except for the existing shadows.
5. **PT-BR in user-facing strings** — keep all user-visible messages in Portuguese (already the project norm).
6. **Lazy-load big apps** — when adding a new app to `AppRegistry.tsx`, use `next/dynamic` with `{ ssr: false }` if the bundle is heavy.
7. **API keys NEVER in client code** — Phase 3 enforces this. Until then, never add a `NEXT_PUBLIC_*` key for any provider.
8. **Respect existing conventions** — `cn()` for class merging, `'use client'` for interactivity, `unknown` + type guard in catch blocks.
9. **WebContainers require COOP/COEP** — `@webcontainer/api` only works with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. Phase 1.2 adds these headers in `next.config.ts`. Until then, do not import or reference `@webcontainer/api` in code (it will silently fail). When writing files to a WebContainer, use `webcontainer.fs.writeFile(path, contents)` — never touch `localStorage` for VFS. iOS Safari has limited support; gate Phase 1 features behind a `webcontainer.boot()` capability check with a friendly "demo mode" fallback.

## Project Structure (full)

```
src/
├── app/                # Next.js App Router
│   ├── api/           # route handlers (chat, models, images, health, automation)
│   ├── chat|editor|images|video|music|tts|audio|balance|settings/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx       # UI mode switcher
├── components/
│   ├── Sidebar.tsx
│   ├── features/chat/ChatInterface.tsx
│   ├── ios/           # iOS skin
│   ├── mobile/        # Mobile skin
│   └── os/            # Cyberpunk skin (default)
│       ├── apps/      # 18 native apps
│       ├── OSContext.tsx  # window manager
│       ├── AppRegistry.tsx
│       ├── Desktop.tsx
│       └── types.ts   # APP_DEFINITIONS
├── lib/
│   ├── agent-orchestration/  # Orchestrator + Hermes + Browser engine
│   ├── agent-swarm/          # SwarmEngine + 7 agents
│   ├── ai/                   # Multi-provider (10) client
│   ├── integrations/         # DSH, OpenHands, Theia, Freebuff, CoWork
│   ├── runtime/              # WebContainer + xterm.js bridge (Phase 1)
│   ├── tools/                # Skills + DevTools registry
│   ├── warmwind/             # AI employees
│   ├── workspaces/           # Dexie schema + repositório (Phase 1)
│   └── utils.ts
├── config/app.ts      # APP_CONFIG
├── hooks/useDevice.ts
└── types/index.ts     # central re-exports
```

## Where to Add Things

| Goal | Files to touch |
|------|----------------|
| New OS app | 1) `src/components/os/apps/MeuApp.tsx` 2) `src/components/os/types.ts` (APP_DEFINITIONS) 3) `src/components/os/AppRegistry.tsx` (case + ICON_COMPONENTS) 4) `Taskbar.tsx` / `DesktopIcons.tsx` / `StartMenu.tsx` (icon maps) |
| New AI provider | `src/lib/ai/providers.ts` (PROVIDERS); `src/lib/ai/provider-config.ts` (defaults); if new apiFormat ≠ openai/anthropic/google, extend `src/lib/ai/api-client.ts` |
| New swarm agent | `src/lib/agent-swarm/agent-specialists.ts` (SWARM_SPECIALISTS) |
| New skill | `src/lib/tools/tools.ts` (SKILLS) |
| New dev tool | `src/lib/tools/devtools.ts` |
| New DSH plugin | `src/lib/integrations/deepseek-harness.ts` |
| New workspace (Dexie) | `src/lib/workspaces/db.ts` (Dexie schema), `src/lib/workspaces/workspaceRepository.ts` (CRUD), `src/components/os/apps/WorkspacesApp.tsx` (UI) |
| WebContainer runtime / terminal | `src/lib/runtime/webcontainer.ts` (singleton + boot), `src/lib/runtime/terminal.ts` (xterm.js + shell stream), `src/components/os/panels/Terminal.tsx` (UI) |

## Documentation Map

- **Codebase map (read first):** `.planning/codebase/` (STACK, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, INTEGRATIONS, CONCERNS)
- **Project intent:** `.planning/PROJECT.md`
- **v1 requirements:** `.planning/REQUIREMENTS.md`
- **Roadmap:** `.planning/ROADMAP.md` (4 phases, MVP slicing)
- **Current state:** `.planning/STATE.md`
- **Workflow config:** `.planning/config.json`
- **Product docs:** `README.md`, `docs/AGENT_COLLABORATION.md`, `docs/AUTOMATION_GUIDE.md`, `src/STRUCTURE.md`
- **Module READMEs:** `src/lib/{ai,tools,integrations,agent-orchestration}/README.md`, `src/components/os/README.md`

## Tech Debt Priorities

Ver `.planning/codebase/CONCERNS.md` para lista completa (21 itens). Top 5 a atacar:

1. **🔴 Swarm Engine é simulado** — `analyzeCodeQuality` é regex, `generateBoilerplateForGoal` é string hardcoded. Phase 1 corrige.
2. **🔴 API keys em `localStorage`** — vulneráveis a XSS. Phase 3 corrige.
3. **🟠 Duas engines sobrepostas** (Swarm + Orchestrator) sem ponte. Documentar a separação (manter ambas no v1).
4. **🟠 Sem testes / sem CI.** Phase 4 corrige.
5. **🟠 `console.log` em `CodeEditorApp.tsx:121`.** Remover na primeira oportunidade.

## GSD Workflow

- Use `/gsd-progress` para verificar o estado atual e descobrir o próximo passo.
- Use `/gsd-discuss-phase N` para alinhar contexto antes de planejar uma fase.
- Use `/gsd-plan-phase N` para quebrar uma fase em planos.
- Use `/gsd-execute-phase N` para executar os planos.
- Use `/gsd-verify-work` para validar deliverables ao fim de cada fase.

---
*Generated 2026-08-28 by GSD new-project workflow. Update when stack or rules change.*
