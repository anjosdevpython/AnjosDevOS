# AnjosDevOS

## What This Is

AnjosDevOS é um **Sistema Operacional web de IA focado em desenvolvimento e automação**, executando inteiramente no navegador, com 27 apps nativos, 3 skins visuais (Cyberpunk / iOS / Mobile), 10 provedores de IA integrados, e dois barramentos de agentes (Swarm Engine + Agent Orchestrator) que coordenam 7 especialistas autônomos para planejar, codificar, auditar, corrigir, automatizar, fazer deploy e documentar software.

Pensado para uso por uma **equipe pequena (2–5 devs)** que abre o OS, escreve código no Monaco com um painel lateral de IA que de fato chama LLMs reais, dispara automações visuais que executam nó-a-nó, e mantém o trabalho persistido entre reloads sem perder o estado das janelas.

## Core Value

**O Swarm Engine precisa chamar LLMs reais de verdade** — o diferencial central do produto é o painel "IA Swarm" no editor que, ao receber um objetivo do usuário, dispara uma cadeia real (Arquiteto → Coder → Reviewer → Debugger) usando os modelos configurados, aplica patch no código com diff visível, e roda testes gerados. Tudo o resto (UI, OS, automação) é meio; isso é o fim.

## Business Context

- **Customer:** Allan Anjos (autor) e a equipe de 2–5 devs que adotar o OS para trabalho diário de codificação e automação.
- **Revenue model:** Open-source sob licença MIT (`LICENSE`); branding pessoal via `allananjos.dev.br`; potenciais serviços profissionais em cima.
- **Success metric:** Pelo menos 1 task de coding-automation real completada por semana via Code Editor + Swarm, sem intervenção manual no loop de patch.
- **Strategy notes:** Repo oficial em `github.com/anjosdevpython/AnjosDevOS`; já tem CHANGELOG v2.0.0 publicada.

## Requirements

### Validated

Capacidades existentes no codebase, confirmadas pelo map em `.planning/codebase/`:

- ✓ **Multi-provider IA via `api-client`** — 10 provedores (OpenAI, Anthropic, Google, DeepSeek, xAI, Mistral, Groq, Together, NetworkTools, Custom) com 3 formatos de API (openai/anthropic/google) e SSE streaming.
- ✓ **UI Desktop OS com 3 skins** — Cyberpunk (default), iOS (Dynamic Island + Dock + Home Screen), Mobile; troca em runtime via switcher flutuante.
- ✓ **Sistema de janelas completo** — drag, resize, minimize, maximize, focus, z-index management, prevBounds snapshot, cascata de abertura (`src/components/os/OSContext.tsx`).
- ✓ **27 apps nativos registrados** — 8 páginas de IA (chat, images, editor, video, music, tts, audio, balance) + 15 apps do OS (Code Editor, Automation Studio, Agent Teams, Orquestrador, Memória, Canais, Browser, Workbench, DevTools Hub, OpenHands, Theia, DSH, Freebuff, Funcionários IA, Tools) + system (Settings, About).
- ✓ **Swarm Engine com 7 agentes definidos** — `AnjosArchitect`, `AnjosCoder`, `AnjosReviewer`, `AnjosDebugger`, `AnjosAutoPilot`, `AnjosDevOps`, `AnjosDocs`; templates de colaboração (`feature-dev-loop`, `autonomous-bugfix-loop`, `security-audit-remediation`, `end-to-end-automation`).
- ✓ **Heurística de auditoria de código** — `analyzeCodeQuality` em `src/lib/agent-swarm/collaboration-protocols.ts`: 5 regras regex (any, eval, innerHTML, console.log, hardcoded secrets) com score 0-100.
- ✓ **Orchestrator + Hermes + Browser Engine** — barramento paralelo para coordenação de tarefas genéricas + chain-of-thought + automação de browser (`src/lib/agent-orchestration/`).
- ✓ **6 integrações de plataforma** — DSH, OpenHands, Theia, Freebuff, CoWork (memory/workbench/automation/browser/agents/channels); cada uma com schema próprio e UI app.
- ✓ **Registry de Skills (21) + DevTools (18+)** — registry de tools inspirado em AI Hero/GSD/MCP.
- ✓ **PWA manifest + tema dark** — manifest.json, ícones 192/512, `appleWebApp: { capable: true, statusBarStyle: 'black-translucent' }`.
- ✓ **i18n PT-BR em toda a UI** — mensagens, labels, documentação em português brasileiro.

### Active

Hipóteses a serem entregues no v1 (ver `REQUIREMENTS.md` para REQ-IDs):

- [ ] Code Editor com painel IA Swarm que chama LLMs reais (cada agente usa um modelo configurável)
- [ ] Auditoria de código via API LLM (não só regex) com classificação de severidade e patch sugerido
- [ ] Auto-Patch real aplicado ao código no Monaco (diff visível, undo, commit opcional)
- [ ] Geração e execução real de testes Vitest a partir do código auditado
- [ ] Automation Studio com Prompt-to-Flow gerando grafo JSON executável, persistido em disco
- [ ] Execução real nó-a-nó com retry, timeout, error handling, telemetria em tempo real
- [ ] Persistência de workspaces, sessões de chat, fluxos, memória de agentes entre reloads
- [ ] API keys movidas para o servidor Next (proxy real) — fim do `localStorage` para segredos
- [ ] OAuth (GitHub, Google) além de API key para providers que suportam
- [ ] CSP, headers de segurança, rate limiting em `/api/*`
- [ ] Vitest configurado, GitHub Actions CI, ≥40% cobertura em `src/lib/`
- [ ] Playwright E2E dos 3 fluxos: abrir OS, abrir Code Editor + patch, criar+e executar automation

### Out of Scope

- **Mobile app nativa (iOS/Android)** — web-only, mobile é uma das 3 skins. Custo de build/test/distribuição não justifica para 2-5 devs.
- **Backend de dados (Postgres/Supabase)** — persistência será local (IndexedDB + filesystem via OPFS quando disponível) e via GitHub API para sync. Sem DB managed.
- **Multi-tenant / multi-org** — single-workspace por usuário. Multi-workspace pessoal via troca de profiles.
- **Marketplace de agentes/apps third-party** — registry interno, sem upload externo nesta fase.
- **Treinamento/fine-tuning de modelos** — uso apenas via API. Sem infra de GPU.
- **Versão paga / SaaS** — open-source MIT apenas. Receita via serviços profissionais do Allan.
- **Integração real com OpenHands/Theia runtime** — UIs são declarativas (registry), sem backend. Decidido no map (§13) que essas são representações, não execuções.

## Context

**Estado atual do codebase (ver `.planning/codebase/`):**

- 23 arquivos TS/TSX no `src/lib/` (~3.000 linhas), 18 apps nativos, 1.348 linhas de swarm-engine.
- TypeScript estrito (`strict: true`), Next 15.1, React 19, Tailwind 3.4, sem UI framework externa.
- Persistência atual é `localStorage` (4 chaves: `anjosdev_*`).
- Sem testes, sem CI, sem ESLint config próprio, sem Prettier, sem Husky.
- 21 débitos técnicos identificados em `.planning/codebase/CONCERNS.md`, sendo 2 🔴 críticas:
  - **D1 (Crítica):** Swarm Engine é simulado — `analyzeCodeQuality` é regex puro, `generateBoilerplateForGoal` é string hardcoded, "auditoria OWASP" checa 5 padrões (não 10). Toda a "IA" do produto central é fictícia.
  - **D2 (Crítica):** API keys em `localStorage` — vulneráveis a XSS; servidor Next age como proxy burro e o fetch real sai do cliente.
- 6 débitos 🟠 médias: engines sobrepostas, globais mutáveis, console.log residual, zero testes, zero CI.
- Codebase segue convenções PT-BR, `'use client'` em tudo, `cn()` + Tailwind, tratamento de erros com `unknown`.

**Pesquisa/docs existente no repo:**

- `README.md` (231 linhas) — visão geral + 7 agentes swarm.
- `CHANGELOG.md` (73 linhas) — v1.0.0 (2026-08-28) e v2.0.0 (2026-08-28).
- `CONTRIBUTING.md` (111 linhas) — adicionar agentes, apps, automações; validação via `tsc --noEmit` e `npm run build`.
- `docs/AGENT_COLLABORATION.md` (85 linhas) — protocolos do Swarm.
- `docs/AUTOMATION_GUIDE.md` (51 linhas) — manual do Automation Studio.
- `src/STRUCTURE.md` (64 linhas) — mapa do projeto.
- READMEs em cada módulo (`src/lib/ai/`, `src/lib/tools/`, `src/lib/integrations/`, `src/lib/agent-orchestration/`, `src/components/os/`).

**Persona e contexto de uso:**

- Equipe de 2-5 devs (Allan + colaboradores) usando o OS como ferramenta diária.
- Caso de uso principal: abrir `codeeditor` → pedir ao Swarm "adicionar auth JWT com rate limit" → ver 4 steps do enxame → receber patch no Monaco → rodar testes → commit.
- Caso secundário: usar `automation-studio` para criar pipelines "notion → slack quando issue nova".

## Constraints

- **Stack:** Preservar Next 15.1 + React 19 + Tailwind 3.4 + TypeScript estrito. Adicionar Zustand (state), Vitest (unit), Playwright (E2E), Zod (validação). **Não** introduzir shadcn/Radix/MUI nem framework de animação (framer-motion) — manter bundle enxuto.
- **Idioma:** UI e mensagens em PT-BR; código, comentários e commits em inglês (exceto quando citam o produto). Documentação em PT-BR.
- **Licença:** MIT — sem dependência GPL/AGPL que contamine o bundle.
- **Compatibilidade:** Chrome/Edge/Firefox/Safari últimas 2 versões; iOS Safari 16+ para skin mobile.
- **Performance:** First Contentful Paint < 2s no desktop; lazy-load de apps grandes; TTI < 5s no Code Editor com Monaco.
- **Segurança:** Chaves de API nunca no bundle do cliente a partir do v1. CSP, HSTS, X-Content-Type-Options desde o primeiro deploy.
- **Bundle:** `output: 'standalone'` mantido; total client bundle < 1.5 MB gzipped (atual ≈ 800KB sem Monaco).
- **Sem dependência de serviços externos pagos** que não tenham free tier (NetworkTools default é mantido; demais provedores são opt-in por chave do usuário).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar `gsd-codebase-mapper` quando disponível, senão mapeamento inline | Workflow declara; subagent indisponível no runtime atual → cair em `sequential_mapping` | — Pending |
| Manter 2 engines de agentes (Swarm + Orchestrator) no v1 | Unificação custa refactor grande; Swarm = coding, Orchestrator = coordination. Documentar a separação. | — Pending |
| Adotar Zustand (não Redux/Jotai) para state global | Mínimo de boilerplate, API ergonômica, bundle 1.2KB. Suficiente para OSContext, SwarmEngine wrapper, etc. | — Pending |
| Vitest (não Jest) para unit | Compat com esm nativo, mesmo stub já gerado pelo Swarm; melhor TS DX. | — Pending |
| Playwright para E2E | Único framework E2E do mercado com qualidade de selector e multi-browser confiável. | — Pending |
| Mover API keys para servidor Next via `process.env.*` em route handlers | Resolve débitos #2 (XSS via localStorage) e habilita rate limit + audit server-side. | — Pending |
| Zod para validação de payloads de API | TS estrutural não é o mesmo que validação em runtime; Zod fecha o gap. | — Pending |
| Persistência local: `IndexedDB` (via Dexie) para workspaces/fluxos/sessões; filesystem via OPFS opcional | localStorage é 5MB; fluxos reais podem ter MBs de logs. | — Pending |
| Project mode: **Vertical MVP** | Recomendado para brownfield com v1 MUST-HAVE definido. Cada fase entrega capacidade end-to-end. | — Pending |
| Granulidade: **Standard** (5-8 fases, 3-5 planos cada) | Balanceado: cobre os 4 MUST-HAVE sem inflar roadmap. | — Pending |
| AI Models: **inherit** (modelo da sessão) | Runtime atual não é Claude; herdar evita erro 404 de tier alias. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Business Context check (if present) — customer, revenue model, success metric still accurate?
4. Audit Out of Scope — reasons still valid?
5. Update Context with current state (users, feedback, metrics)

---
*Last updated: 2026-08-28 after brownfield initialization (codebase map at .planning/codebase/)*
