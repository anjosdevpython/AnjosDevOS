# Requirements: AnjosDevOS

**Defined:** 2026-08-28
**Core Value:** O Swarm Engine chama LLMs reais de verdade — o painel "IA Swarm" no editor dispara uma cadeia real (Arquiteto → Coder → Reviewer → Debugger), aplica patch no código com diff visível, e roda testes gerados.

## v1 Requirements

### Code Editor (Coder Swarm)

- [ ] **CODS-01**: User can open `Code Editor` app and see Monaco with a `✨ IA Swarm` side panel showing 7 agents (Arquiteto, Coder, Reviewer, Debugger, AutoPilot, DevOps, Docs) with live status (idle/thinking/coding/reviewing/debugging) and the model configured for each agent.
- [ ] **CODS-02**: User can click `Auditar` on the open file and AnjosReviewer (real LLM, not regex) returns a structured report: score 0-100, severity per finding (critical/high/medium/low), file:line references, suggested fix, and OWASP Top 10 category.
- [ ] **CODS-03**: User can click `Auto-Patch` on a finding and AnjosDebugger generates a patch, applies it to the Monaco buffer with a visual diff, and lets the user accept/reject/undo.
- [ ] **CODS-04**: User can click `Gerar Testes` and AnjosCoder+AnjosReviewer generate a Vitest spec next to the audited file, execute it, and report pass/fail in the side panel.

### Automation Studio

- [ ] **AUTO-01**: User can type a natural-language description of a pipeline in a prompt bar; AnjosAutoPilot (real LLM) returns a Flow JSON `{ nodes: Node[], edges: Edge[] }` and the canvas renders it.
- [ ] **AUTO-02**: User can save, list, open, rename, and delete flows in `IndexedDB` (via Dexie). Each flow has `id, name, createdAt, updatedAt, graph, lastRun, lastStatus`.
- [ ] **AUTO-03**: User can click `Executar Fluxo` and the engine runs the graph topologically, each node transitions `pending → running → success|failed|skipped`, with `durationMs` and `output` recorded; live log streams to the integrated terminal.
- [ ] **AUTO-04**: User can attach a trigger to a flow: `cron` (scheduler interno), `webhook` (endpoint exposto pelo Next), ou `git push` (polling a um repo configurado).

### Security & Persistence

- [ ] **SEC-01**: API keys for all 10 providers are stored server-side in `process.env.*`; the Next route handlers (`/api/chat`, `/api/models`, `/api/images`) do the upstream fetch; the browser only ever talks to `/api/*` with no provider key in transit.
- [ ] **SEC-02**: User can sign in with GitHub or Google via NextAuth.js; the session is used to scope per-user persisted data (workspaces, flows, chat history, agent memory).
- [ ] **SEC-03**: `next.config.ts` `headers()` emits `Content-Security-Policy` (script-src 'self' + nonce), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` for all routes.
- [ ] **SEC-04**: `/api/*` is protected by a token-bucket rate limiter (per IP, 60 req/min default, configurable per route); each call writes an audit log entry `{ userId, route, provider, model, tokens, durationMs, status }`.

### Testing & CI

- [ ] **TEST-01**: `vitest` is installed and configured with `jsdom` env; a baseline suite covers `src/lib/agent-swarm/collaboration-protocols.ts` (`analyzeCodeQuality`, `generateUnitTestsForCode`), `src/components/os/OSContext.tsx` (open/close/minimize/maximize/focus/move/resize), and `src/lib/ai/api-client.ts` (multi-provider request shaping) with ≥40% line coverage on `src/lib/`.
- [ ] **TEST-02**: `playwright` is installed with Chromium + WebKit + Firefox; 3 E2E specs run against `npm run dev`: (a) open OS and switch UI mode, (b) open Code Editor, request audit, apply patch, see diff, (c) create automation via Prompt-to-Flow, execute, see node status changes.
- [ ] **TEST-03**: `.github/workflows/ci.yml` runs on every PR: `pnpm install --frozen-lockfile && pnpm tsc --noEmit && pnpm vitest run && pnpm playwright test && pnpm build`. No-deploy until green.
- [ ] **TEST-04**: `eslint` (next/core-web-vitals + next/typescript + plugin:tailwindcss/recommended) + `prettier` + `husky` pre-commit hook running `lint-staged` (prettier + eslint on staged files, `tsc --noEmit` on full tree).

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Code Editor (Coder Swarm)

- **CODS-05**: AnjosArchitect plans + delegates a full collaborative session (`feature-dev-loop` template) with on-progress UI updates.
- **CODS-06**: AnjosDocs generates JSDoc + OpenAPI/Swagger + Mermaid diagrams from audited code.
- **CODS-07**: AnjosDevOps generates Dockerfile + GitHub Actions workflow + Kubernetes manifest for the audited module.

### Automation Studio

- **AUTO-05**: Conditional nodes (`if score > 80`), branching, parallel branches, sub-flows.
- **AUTO-06**: Webhook receiver with payload schema validation (Zod) and replay protection.
- **AUTO-07**: Reusable flow library — extract subgraph from one flow, publish to shared library, import into another flow.

### Security & Persistence

- **SEC-05**: End-to-end encryption of local persisted data (workspaces, flows) using Web Crypto with user-derived key.
- **SEC-06**: Multi-workspace — switch between independent workspaces (each with its own provider keys, flows, sessions).
- **SEC-07**: Audit log export to JSON / OpenTelemetry.

### Testing & CI

- **TEST-05**: Visual regression testing (Playwright snapshots) for the 3 OS skins.
- **TEST-06**: Performance budget enforcement in CI (Lighthouse CI: FCP < 2s, TTI < 5s, bundle < 1.5MB gzipped).

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile app nativa (iOS/Android) | Web-only. A skin Mobile já é responsiva. Custo de build/test/distribuição não justifica para 2-5 devs. |
| Backend de dados (Postgres/Supabase) | Persistência será local (IndexedDB) + sync opcional via GitHub API. Sem DB managed para v1. |
| Multi-tenant / multi-org | Single-workspace por usuário. Multi-workspace pessoal via troca de profile (v2). |
| Marketplace de agentes/apps third-party | Registry interno apenas. Sem upload externo. |
| Treinamento / fine-tuning de modelos | Apenas uso via API. Sem infra de GPU. |
| Versão paga / SaaS | Open-source MIT. Receita via serviços profissionais. |
| Integração real com OpenHands/Theia runtime | UIs são declarativas; apps mostram a forma do produto sem backend real. Decidido no map (§13). |
| Browser MCP real (Playwright server) | Browser Workbench é registry declarativo; automação real fica para v2+. |
| Account-level billing / quota management | Provider-side, fora do escopo do OS. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CODS-01 | Phase 1 | Pending |
| CODS-02 | Phase 1 | Pending |
| CODS-03 | Phase 1 | Pending |
| CODS-04 | Phase 1 | Pending |
| AUTO-01 | Phase 2 | Pending |
| AUTO-02 | Phase 2 | Pending |
| AUTO-03 | Phase 2 | Pending |
| AUTO-04 | Phase 2 | Pending |
| SEC-01 | Phase 3 | Pending |
| SEC-02 | Phase 3 | Pending |
| SEC-03 | Phase 3 | Pending |
| SEC-04 | Phase 3 | Pending |
| TEST-01 | Phase 4 | Pending |
| TEST-02 | Phase 4 | Pending |
| TEST-03 | Phase 4 | Pending |
| TEST-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-28*
*Last updated: 2026-08-28 after brownfield initialization (4 MUST-HAVE areas confirmed with user)*
