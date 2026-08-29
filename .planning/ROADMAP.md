# Roadmap: AnjosDevOS

**Generated:** 2026-08-28
**Project mode:** Vertical MVP (each phase delivers end-to-end user capability)
**Granularity:** Standard (4 phases, 3-5 plans each)
**Core Value:** O Swarm Engine chama LLMs reais de verdade — Code Editor dispara cadeia real (Arquiteto → Coder → Reviewer → Debugger), aplica patch com diff visível, e roda testes gerados.

---

## Phase 1: Self-Contained IDE com Swarm Real (LLM-backed)

**Goal:** Transformar o AnjosDevOS em um **IDE completo self-contained** dentro do browser: Workspaces isolados (Dexie), Code Editor consolidado de 4 painéis (sidebar | editor | IA | terminal), WebContainers rodando Node/npm/git de verdade, terminal xterm.js executando comandos shell reais, e o Swarm Engine chamando LLMs reais para auditar/patch/testar código.

**Mode:** mvp

**Requirements covered:** WORK-01..04, RUN-01..04, CODS-01..06

**UI hint:** yes

**Success Criteria:**

1. User opens AnjosDevOS, sees a `Workspaces` view, creates a new workspace, lands in the Code Editor (4-panel IDE), and the file tree shows the workspace's empty structure.
2. User types `npm install vitest` in the bottom terminal; WebContainers installs vitest in `/node_modules` of the workspace; the file tree updates without reload.
3. User creates `src/index.ts`, writes 5 lines of code, and `node src/index.ts` in the terminal prints the expected output.
4. User clicks `Auditar` on `src/index.ts`; within 5s the IA Swarm panel shows a real LLM-generated report (not regex): score 0-100, findings with severity + line + OWASP category + suggested fix.
5. User clicks `Auto-Patch`; the editor shows a unified diff (red/green gutter) with the LLM-suggested change; user accepts, the file is updated, and `git status` in the terminal shows the change.
6. User clicks `Gerar Testes`; a Vitest spec is created next to the source; `npm test` runs in the WebContainer; the IA panel shows pass/fail with vitest's actual output.
7. User refreshes the page; the workspace, open file, cursor position, and terminal history are restored from IndexedDB.
8. The 7 swarm agents each use a configurable model (per-agent model setting) and the audit/patch/test generation actually calls the LLM via `chatCompletion` — not the regex heuristic.

**Plans:**

- **1.1 — Workspaces (WORK-01..03):** Install Dexie; build `src/lib/workspaces/` with `db.ts` (Dexie schema for `workspaces` table: `id, name, createdAt, updatedAt, lastOpenedAt, fileTree, snapshots`), `workspaceRepository.ts` (CRUD), and `useWorkspaces()` Zustand store. Build `WorkspacesApp.tsx` (new app registered in `AppRegistry.tsx` + `types.ts` APP_DEFINITIONS) showing a list with create/open/rename/duplicate/delete. Persist + restore last-opened workspace, open editor tabs, cursor positions, terminal history on reload.
- **1.2 — WebContainers runtime (RUN-01, RUN-02):** Install `@webcontainer/api`; add COOP/COEP headers to `next.config.ts` (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`). Build `src/lib/runtime/webcontainer.ts` singleton (boot on first use, reuse across workspaces). Build `src/components/os/panels/Terminal.tsx` using `xterm.js` + `xterm-addon-fit` wired to the WebContainer shell via a Node `Server`-like stream. Refactor `TerminalApp.tsx` to mount the new panel for the active workspace, with a fallback "demo mode" that prints mock output when WebContainers can't boot (e.g., iOS Safari).
- **1.3 — Code Editor consolidado (CODS-01, CODS-06):** Refactor `CodeEditorApp.tsx` from single-pane into a 4-panel IDE using a CSS grid: left sidebar (`FileTreePanel.tsx` + `SearchPanel.tsx`), central editor (existing Monaco setup + tabs), right `SwarmPanel.tsx` placeholder, bottom `Terminal.tsx` from Plan 1.2. Resizable splitters between panels (zustand store for sizes). Keyboard shortcuts: Ctrl+P (file search), Ctrl+Shift+O (symbol search), Ctrl+` (toggle terminal), Ctrl+J (toggle panel).
- **1.4 — Real LLM audit pipeline (CODS-02, CODS-05):** Build `src/lib/agent-swarm/llm-audit.ts` exposing `llmAudit({ code, fileName, model, agents })` that calls `chatCompletion` with a structured prompt derived from `AnjosReviewer.systemPrompt`; response is parsed as `{ score, issues: [{ severity, line, title, description, suggestion, fixedCode }], summary, securityAnalysis }`. Wire into `SwarmPanel.tsx`: clicking `Auditar` calls `llmAudit` and renders findings as cards. Keep the regex pre-check in `analyzeCodeQuality` as a fast first pass (≤ 100ms) before the LLM call (for cheap detection of obvious issues).
- **1.5 — Auto-Patch with diff + real test execution (CODS-03, CODS-04, RUN-03, RUN-04):** Build `PatchApplier.tsx` using `@monaco-editor/react` `DiffEditor`; the finding's `fixedCode` is shown as the right-side buffer; user clicks `Accept` → write to WebContainer VFS via `webcontainer.fs.writeFile`; reject keeps the original. Add `git` workflow inside the WebContainer: `git init` on workspace creation, `git add` on save, `git commit` via UI button. Build `src/lib/runtime/vitest-runner.ts` that writes a generated spec to the workspace's `__tests__/`, runs `npm test` in the WebContainer, parses output (JSON reporter or stdout heuristics), streams progress to the IA panel. Wire the legacy `agents` / `swarm` / `audit` / `flows` / `models` / `neofetch` / `help` commands to real data (they should now query the engine and the registry, not return hardcoded strings).
- **1.6 — Phase 1 verification (E2E):** Playwright spec that: creates a workspace, writes a JS file, audits it (mock LLM response in CI), applies a patch, runs `npm test`, asserts pass. Unit tests (Vitest) for `workspaceRepository` (CRUD, restore), `llm-audit` (prompt construction, response parsing), and `vitest-runner` (output parsing).

---

## Phase 2: Automation Studio com Execução Real

**Goal:** Tornar o `automation-studio` um builder e runner de fluxos de verdade, com prompt-to-flow via LLM, persistência IndexedDB, execução topológica com retry/timeout, e triggers reais (cron/webhook/git push).

**Mode:** mvp

**Requirements covered:** AUTO-01, AUTO-02, AUTO-03, AUTO-04

**UI hint:** yes

**Success Criteria:**

1. User types "monitorar commits na main, rodar auditoria e notificar no Slack" in the prompt bar; within 5s the canvas shows a graph with ≥4 nodes connected correctly.
2. User clicks Save on a flow; reloads the page; opens Automation Studio; the flow is listed in the sidebar with last-run timestamp.
3. User clicks Executar; nodes transition pending→running→success in topological order; live logs stream to the terminal panel; durationMs is shown per node.
4. User attaches a `cron` trigger to a flow (e.g., "every 5 minutes") and within 5 minutes the flow fires automatically and records an execution.
5. A `webhook` trigger is reachable at `/api/automation/trigger/{flowId}` and POSTing a sample payload runs the flow with that payload as the initial context.

**Plans:**

- **2.1 — Flow schema + Dexie persistence (AUTO-02):** Define `Flow`, `FlowNode`, `FlowEdge`, `FlowRun`, `FlowExecution` types; install `dexie`; build `flowRepository.ts` with CRUD + versioning; write hooks `useFlows()` / `useFlow()`.
- **2.2 — Prompt-to-Flow LLM (AUTO-01):** Add a new provider-format adapter in `src/lib/ai/api-client.ts` for `json-mode` outputs; new API route `POST /api/automation/generate` accepts a description and returns `Flow` JSON; canvas component consumes it and renders nodes/edges via React Flow or hand-rolled.
- **2.3 — Topological executor (AUTO-03):** Implement `flowExecutor.ts` with Kahn's algorithm for topo sort; per-node `{ timeoutMs, retries, onError: 'fail' | 'continue' | 'retry' }`; node types: `llm`, `http`, `transform`, `log`, `webhook-out`, `condition`; persist `FlowRun` per execution.
- **2.4 — Triggers (AUTO-04):** `cron` via `node-cron` running in a Next Node runtime (or a separate worker process); `webhook` via `/api/automation/trigger/[flowId]/route.ts` with payload validation (Zod) and replay protection (idempotency-key); `git push` via polling a configured repo's events API.
- **2.5 — Phase 2 verification:** E2E spec (Playwright) that creates a flow via Prompt-to-Flow, saves, reloads, executes, asserts node statuses.

---

## Phase 3: Persistência + Segurança (Server-side Keys, OAuth, CSP, Rate Limit)

**Goal:** Eliminar a exposição de API keys no `localStorage`; introduzir OAuth (GitHub/Google) para identidade; aplicar headers de segurança padrão; rate-limit + audit log em `/api/*`.

**Mode:** mvp

**Requirements covered:** SEC-01, SEC-02, SEC-03, SEC-04, WORK-04 (GitHub sync), RUN-04 (git push)

**UI hint:** yes

**Success Criteria:**

1. DevTools → Network on a chat request shows the request goes only to `/api/chat`; no `Authorization: Bearer sk-...` header anywhere in the browser.
2. `process.env.OPENAI_API_KEY` set on the server; user configures via `/settings`; `localStorage` only stores `providerId → isEnabled` boolean; the actual key is fetched by the server from the encrypted vault.
3. User clicks "Sign in with GitHub" in the top bar; OAuth flow completes; the user menu shows avatar + email; protected routes (`/settings/api-keys`) require auth.
4. `curl -I http://localhost:3000/` returns headers including `Content-Security-Policy` (with nonce), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, **and** `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` (required for WebContainers from Phase 1).
5. A script that fires 100 chat requests in 1 minute to `/api/chat` gets 429 responses after the 60th request; each request writes an entry to the audit log; admin can view the log.
6. User signs in with GitHub, opens a Workspace, clicks `Push to GitHub`; a remote is created (or pushed to existing); commit history matches local; `git pull` on a different machine restores the same workspace tree.

**Plans:**

- **3.1 — Server-side proxy (SEC-01):** Refactor `src/app/api/chat/route.ts`, `models/route.ts`, `images/route.ts` to call providers server-side; build a server-side `providerVault.ts` (env + optional encrypted file); migrate any browser-side key usage to a `/api/auth/keys` GET that returns only the public metadata (provider, model, isEnabled).
- **3.2 — NextAuth.js (SEC-02):** Install `next-auth` v5; add GitHub + Google providers; session-aware UI (avatar in top bar, `useSession`); protect `/settings` and `/api/*` (non-public) with middleware.
- **3.3 — Security headers (SEC-03):** `next.config.ts` `headers()` with CSP (script-src 'self' + nonce), HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy; verify via `curl -I` in CI.
- **3.4 — Rate limit + audit log (SEC-04):** `next-rate-limit` or hand-rolled token-bucket middleware on `/api/*`; per-IP, per-route configurable; write audit entries to `data/audit/{YYYY-MM-DD}.jsonl` (or table); build `/settings/audit` view.
- **3.5 — Phase 3 verification:** Security E2E: assert no provider key in browser bundle (`grep -r "sk-" .next/static`); assert CSP header; simulate 100 requests, count 429s; assert audit log file written.

---

## Phase 4: Testes + CI (Vitest, Playwright, GitHub Actions, Lint)

**Goal:** Sair de 0% de cobertura e 0 CI para uma base sólida de testes automatizados em PRs, com lint/format/type-check no pre-commit.

**Mode:** mvp

**Requirements covered:** TEST-01, TEST-02, TEST-03, TEST-04

**UI hint:** no

**Success Criteria:**

1. `pnpm vitest run` exits 0 with ≥40% line coverage on `src/lib/` and ≥20% on `src/components/`; HTML coverage report is published as a CI artifact.
2. `pnpm playwright test` runs 3 E2E specs (OS switch, Code Editor patch, Automation create+run) on Chromium/WebKit/Firefox and exits 0; test report is uploaded.
3. Opening a PR triggers the CI workflow; if any of `tsc --noEmit`, `vitest run`, `playwright test`, or `build` fails, the PR is blocked.
4. `git commit` with a staged `.ts` file runs Prettier + ESLint on the staged content, then `tsc --noEmit` on the full tree; if any step fails, the commit is aborted with a clear error.

**Plans:**

- **4.1 — Vitest setup + baseline suite (TEST-01):** Install `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`; `vitest.config.ts` with `@/*` alias; cover `analyzeCodeQuality` (12 cases), `OSProvider` (8 cases), `api-client` request shaping (5 cases per provider).
- **4.2 — Playwright setup + 3 E2E specs (TEST-02):** Install `@playwright/test`; `playwright.config.ts` with Chromium/WebKit/Firefox + baseURL from `package.json` scripts; write 3 specs from `TESTING.md` §4.1; record videos on failure.
- **4.3 — GitHub Actions CI (TEST-03):** `.github/workflows/ci.yml`: trigger on `push` and `pull_request`; jobs: `lint` (eslint + prettier --check), `typecheck` (tsc --noEmit), `test` (vitest), `e2e` (playwright), `build` (next build); cache pnpm store; upload coverage + playwright report.
- **4.4 — Lint + format + pre-commit (TEST-04):** `eslint.config.mjs` (next/core-web-vitals + next/typescript + plugin:tailwindcss/recommended); `.prettierrc`; install `husky` + `lint-staged`; `.husky/pre-commit` runs `lint-staged` then `pnpm tsc --noEmit`.
- **4.5 — Phase 4 verification:** Open a dummy PR with a known TypeScript error; CI fails with the expected message; fix the error; CI passes; coverage report shows the expected percentage.

---

## Summary

| # | Phase | Goal | Requirements | Mode | UI |
|---|-------|------|--------------|------|----|
| 1 | Self-Contained IDE com Swarm Real | Workspaces + WebContainers + IDE 4 painéis + LLM audit/patch/test | WORK-01..04, RUN-01..04, CODS-01..06 | mvp | yes |
| 2 | Automation Studio com Execução Real | Prompt-to-Flow + persistência IndexedDB + executor + triggers | AUTO-01..04 | mvp | yes |
| 3 | Persistência + Segurança | Server-side keys, OAuth (GitHub sync), CSP, rate limit + audit | SEC-01..04, WORK-04, RUN-04 | mvp | yes |
| 4 | Testes + CI | Vitest + Playwright + GH Actions + lint | TEST-01..04 | mvp | no |

**Total:** 4 phases · 26 v1 requirements · 22 plans · Vertical MVP slicing

---
*Roadmap generated 2026-08-28. Last updated 2026-08-28 after scope expansion (Workspaces + Self-Contained Runtime + IDE consolidado).*
