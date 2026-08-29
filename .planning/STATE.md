# Project State

**Last updated:** 2026-08-28 after scope expansion (Workspaces + Self-Contained Runtime + IDE consolidado)

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-08-28)

**Core value:** O AnjosDevOS é o único ambiente que o dev precisa abrir — IDE completo (Monaco + terminal real + git + WebContainers rodando Node) + Swarm Engine chamando LLMs reais, Workspaces persistentes, sync via GitHub. Tudo no browser, nada no host.

**Current focus:** Phase 1 — Self-Contained IDE com Swarm Real (LLM-backed + WebContainers)

## Position

- **Milestone:** v1.0 (initial release of swarm-backed editor + automation)
- **Phase:** 1 of 4
- **Plan:** (none executed yet — ready to start with `/gsd-plan-phase 1`)
- **Status:** Initialized, ready to plan
- **Mode:** mvp
- **Granularity:** standard
- **Workflow mode:** yolo
- **Parallelization:** enabled
- **Commit docs:** true
- **Research / Plan Check / Verifier:** enabled
- **Model profile:** adaptive

## Continuity

- **Last action:** Phase 1 planned — `RESEARCH.md` + 6 `PLAN.md` files committed under `.planning/phases/01-self-contained-ide-com-swarm-real-llm-backed/`. Coverage: 13/13 Phase 1 v1 REQs (WORK-01..03, RUN-01..04, CODS-01..06); WORK-04 deliberately deferred to Phase 3 (GitHub sync needs OAuth).
- **Next action:** `/gsd-execute-phase 1` to execute the 6 plans (or run them in waves). With the runtime caveat (no `gsd-planner`/`gsd-executor` subagents installed), the executor role will be performed inline.
- **Blockers:** None.
- **Open questions:**
  - Phase 1: how to handle WebContainers boot failure on iOS Safari (no COOP/COEP support)? Fallback to demo mode? Disable Phase 1 features behind a capability check?
  - Phase 1: keep the legacy `TerminalApp.tsx` mock commands (`agents`, `swarm`, etc) as a shim, or fully replace it with the new xterm.js panel?
  - Phase 1: 4-panel layout — fixed grid, resizable splitters, or drag-to-resize? (Zustand store for sizes if resizable)
  - Phase 1.5: `git push` from a WebContainer to GitHub — works via the API directly (no SSH), but needs the OAuth token from Phase 3. Defer to Phase 3, or implement a placeholder?
  - Phase 2: React Flow vs hand-rolled canvas for Automation Studio?
  - Phase 3: encrypted vault for keys — env-only, or also a `data/keys.enc` file with a passphrase?
  - Phase 4: Tailwind plugin for ESLint? Some teams skip it; verify if `plugin:tailwindcss/recommended` adds noise.

## Decisions log (this session)

- **2026-08-28** — Project mode = **Vertical MVP**. Each phase delivers a working end-to-end capability.
- **2026-08-28** — Stack minimalista mantida: Next 15.1 + React 19 + Tailwind 3.4 + TypeScript estrito. Adicionar Zustand (state), Vitest (unit), Playwright (E2E), Zod (validação), Dexie (IndexedDB), **@webcontainer/api** (Node/npm/git no browser), **xterm.js** + **xterm-addon-fit** (terminal). **Não** shadcn/Radix/MUI.
- **2026-08-28** — **Self-contained para projetos de dev**: cada usuário cria Workspaces isolados dentro do AnjosDevOS com VFS, git interno, terminal real, e Node/npm rodando via WebContainers. Nada precisa ser instalado no host. Sync opcional via GitHub (Phase 3).
- **2026-08-28** — **Code Editor consolidado em 4 painéis** (sidebar | editor | IA | terminal). Mantém Monaco mas evolui de single-pane para layout IDE real com resizable splitters.
- **2026-08-28** — **WebContainers** (`@webcontainer/api`) adotados para Node/npm/git no browser. Requer COOP/COEP headers (Phase 3 adiciona).
- **2026-08-28** — API keys movidas para servidor Next via `process.env.*` em route handlers (resolve débitos #2 do map).
- **2026-08-28** — AnjosReviewer + AnjosCoder + AnjosDebugger + AnjosAutoPilot = wrappers finos que chamam `chatCompletion` com systemPrompt + model configurável. Heurística regex de `analyzeCodeQuality` fica como **pre-check rápido** antes da chamada LLM.
- **2026-08-28** — Model profile = **adaptive**; subagents (quando disponíveis) usarão tier por role.

---
*State maintained across sessions; updated by `/gsd-progress` and phase transitions.*
