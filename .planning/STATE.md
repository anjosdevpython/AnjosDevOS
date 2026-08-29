# Project State

**Last updated:** 2026-08-28 after brownfield initialization

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-08-28)

**Core value:** O Swarm Engine chama LLMs reais de verdade — Code Editor dispara cadeia real (Arquiteto → Coder → Reviewer → Debugger), aplica patch com diff visível, e roda testes gerados.

**Current focus:** Phase 1 — Code Editor com Swarm Real (LLM-backed)

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

- **Last action:** `/gsd-new-project` completed end-to-end. Generated PROJECT.md, config.json, REQUIREMENTS.md, ROADMAP.md, and the 7-document codebase map in `.planning/codebase/`.
- **Next action:** `/gsd-plan-phase 1` to break Phase 1 (Code Editor com Swarm Real) into executable plans.
- **Blockers:** None.
- **Open questions:**
  - Phase 1: do we need to ship a new UI library (e.g., React Flow for Automation canvas in Phase 2) or hand-roll the canvas?
  - Phase 2: cron runner — co-locate with Next Node runtime, or run a separate worker process?
  - Phase 3: encrypted vault for keys — env-only, or also a `data/keys.enc` file with a passphrase?
  - Phase 4: Tailwind plugin for ESLint? Some teams skip it; verify if `plugin:tailwindcss/recommended` adds noise.

## Decisions log (this session)

- **2026-08-28** — Project mode = **Vertical MVP**. Each phase delivers a working end-to-end capability.
- **2026-08-28** — Stack minimalista mantida: Next 15.1 + React 19 + Tailwind 3.4 + TypeScript estrito. Adicionar Zustand (state), Vitest (unit), Playwright (E2E), Zod (validação), Dexie (IndexedDB). **Não** shadcn/Radix/MUI.
- **2026-08-28** — API keys movidas para servidor Next via `process.env.*` em route handlers (resolve débitos #2 do map).
- **2026-08-28** — AnjosReviewer + AnjosCoder + AnjosDebugger + AnjosAutoPilot = wrappers finos que chamam `chatCompletion` com systemPrompt + model configurável. Heurística regex de `analyzeCodeQuality` fica como **pre-check rápido** antes da chamada LLM.
- **2026-08-28** — Model profile = **adaptive**; subagents (quando disponíveis) usarão tier por role.

---
*State maintained across sessions; updated by `/gsd-progress` and phase transitions.*
