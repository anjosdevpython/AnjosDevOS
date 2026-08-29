# Roadmap: AnjosDevOS

**Generated:** 2026-08-28
**Project mode:** Vertical MVP (each phase delivers end-to-end user capability)
**Granularity:** Standard (4 phases, 3-5 plans each)
**Core Value:** O Swarm Engine chama LLMs reais de verdade — Code Editor dispara cadeia real (Arquiteto → Coder → Reviewer → Debugger), aplica patch com diff visível, e roda testes gerados.

---

## Phase 1: Code Editor com Swarm Real (LLM-backed)

**Goal:** Tornar o `codeeditor` um ambiente real de coding-assistido, onde cada agente do Swarm chama o LLM configurado, o patch é aplicado de verdade ao código no Monaco, e testes são gerados e executados.

**Mode:** mvp

**Requirements covered:** CODS-01, CODS-02, CODS-03, CODS-04

**UI hint:** yes

**Success Criteria:**

1. User opens `Code Editor` and sees Monaco with file tree (FileExplorer integrated) + `✨ IA Swarm` side panel showing 7 agent cards with live status.
2. User clicks `Auditar` on `src/lib/utils.ts` and within 5s sees a structured report: score 0-100, findings with severity + line + OWASP category + suggested fix.
3. User clicks `Auto-Patch` on a finding and the Monaco buffer shows a unified diff (red/green gutter) with the proposed change; user can accept, reject, or undo.
4. User clicks `Gerar Testes` and a Vitest spec file appears next to the source file, runs (`vitest run`), and the side panel shows pass/fail with output.
5. The 7 agents each use a configurable model (per-agent model setting in `src/config/app.ts` and the existing `PROVIDERS` registry) and the audit/patch/test generation actually calls the LLM via the `api-client` — not the regex heuristic.

**Plans:**

- **1.1 — Real LLM audit pipeline:** Replace `analyzeCodeQuality` regex with a hybrid (regex pre-check + LLM deep-audit via `chatCompletion`); define `LLMAuditRequest`/`LLMAuditResult` types; persist reports to `.planning/code-audits/{timestamp}-{file}.json`.
- **1.2 — Swarm panel UI (CODS-01):** Build `SwarmPanel.tsx` with 7 agent cards, live status via SwarmEngine events (`agent:status_change`, `message:new`), per-agent model selector, "Ask Swarm" input that dispatches a goal to `executeCollaborativeCodingTask`.
- **1.3 — Auto-Patch with diff (CODS-03):** Build `PatchApplier.tsx` consuming `CodeAuditResult`; integrate Monaco diff editor (`@monaco-editor/react` `DiffEditor`); accept/reject/undo via Zustand slice.
- **1.4 — Vitest generator + runner (CODS-04):** Replace the static template in `generateUnitTestsForCode` with an LLM-driven generator; write spec to `__tests__/`; spawn `vitest run` via a Node subprocess triggered from a Next API route; stream output to the panel.
- **1.5 — Phase 1 verification:** E2E spec (Playwright) that audits a real file, applies a patch, runs the generated test, and asserts the green state.

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

**Requirements covered:** SEC-01, SEC-02, SEC-03, SEC-04

**UI hint:** yes

**Success Criteria:**

1. DevTools → Network on a chat request shows the request goes only to `/api/chat`; no `Authorization: Bearer sk-...` header anywhere in the browser.
2. `process.env.OPENAI_API_KEY` set on the server; user configures via `/settings`; `localStorage` only stores `providerId → isEnabled` boolean; the actual key is fetched by the server from the encrypted vault.
3. User clicks "Sign in with GitHub" in the top bar; OAuth flow completes; the user menu shows avatar + email; protected routes (`/settings/api-keys`) require auth.
4. `curl -I http://localhost:3000/` returns headers including `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
5. A script that fires 100 chat requests in 1 minute to `/api/chat` gets 429 responses after the 60th request; each request writes an entry to the audit log; admin can view the log.

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
| 1 | Code Editor com Swarm Real | Painel IA Swarm chama LLM real, audit/patch/test aplicados de verdade | CODS-01..04 | mvp | yes |
| 2 | Automation Studio com Execução Real | Prompt-to-Flow LLM, persistência IndexedDB, executor topológico, triggers | AUTO-01..04 | mvp | yes |
| 3 | Persistência + Segurança | Server-side keys, OAuth, CSP, rate limit + audit | SEC-01..04 | mvp | yes |
| 4 | Testes + CI | Vitest + Playwright + GH Actions + lint/format | TEST-01..04 | mvp | no |

**Total:** 4 phases · 16 v1 requirements · 20 plans · Vertical MVP slicing

---
*Roadmap generated 2026-08-28 after greenfield-equivalent flow (brownfield + Validated requirements already in place).*
