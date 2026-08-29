# TESTING

**Analysis Date:** 2026-08-28
**Project:** AnjosDevOS
**Repository root:** `C:\Users\allan.anjos\Downloads\anjosdevplataform`

> Estado de testes do projeto — frameworks, estrutura, mocking, cobertura. **TL;DR: não há testes automatizados.** Esta seção registra a lacuna e o que o próprio projeto se propõe a fazer.

---

## 1. Estado Atual — TL;DR

| Item | Estado |
| --- | --- |
| Framework de testes | ❌ Nenhum instalado |
| Arquivos de teste | ❌ Nenhum (`*.test.*`, `*.spec.*`) |
| Configs (`vitest.config.*`, `jest.config.*`, `playwright.config.*`) | ❌ Nenhuma |
| CI que rode testes | ❌ Sem `.github/workflows/` |
| Cobertura | ❌ 0% |
| Testes gerados em runtime | ⚠️ `generateUnitTestsForCode()` (template Vitest stub) — não executa, só retorna string |

---

## 2. Comandos de Validação (apenas o que existe)

`CONTRIBUTING.md` recomenda:
```bash
npx tsc --noEmit   # type-check estrito
npm run build      # build de produção
```

> Não há `npm test` ou similar.

`package.json`:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

- `next lint` usa default do Next (config básica de ESLint); o projeto **não traz `.eslintrc`** próprio.
- Não há `prettier` nem `format`.

---

## 3. Por que não há testes?

Nenhuma justificativa explícita no `CONTRIBUTING.md` ou `README.md`. O `CHANGELOG.md` (v2.0.0) não menciona "tests" como entrega.

A direção do projeto é **produto/UX-first** (UI do OS, integrações visíveis), com qualidade garantida por:

1. **TypeScript estrito** (`strict: true`).
2. **Análise estática do Swarm** — `analyzeCodeQuality` em `src/lib/agent-swarm/collaboration-protocols.ts` (regex de 5 regras: `any`, `eval`, `innerHTML`, `console.log`, hardcoded secrets). É executada **sob demanda** via `getSwarmEngine().runCodeAudit(code, fileName)` ou automaticamente no fluxo `executeCollaborativeCodingTask`.
3. **Geração de testes stub** — `generateUnitTestsForCode()` retorna template Vitest com 4 `it()` blocks, mas não escreve/executa nada.

---

## 4. Estrutura Esperada (se testes forem adicionados)

Dado o shape do projeto, a estrutura recomendada seria:

```
src/
├── lib/
│   ├── ai/
│   │   ├── api-client.ts
│   │   └── api-client.test.ts            # unit — mock fetch
│   ├── agent-swarm/
│   │   ├── collaboration-protocols.ts
│   │   ├── collaboration-protocols.test.ts  # unit — analyzeCodeQuality + generateUnitTestsForCode
│   │   ├── swarm-engine.ts
│   │   └── swarm-engine.test.ts          # unit — fake timers
│   ├── agent-orchestration/
│   │   ├── orchestrator.ts
│   │   ├── orchestrator.test.ts          # unit — registerAgent, sendMessage, submitTask
│   │   ├── hermes-agent.ts
│   │   ├── hermes-agent.test.ts          # unit — reasoning chains
│   │   ├── browser-engine.ts
│       └── browser-engine.test.ts        # unit — sessions
│   └── integrations/
│       └── *.test.ts                     # unit — registry / createXSession helpers
├── components/
│   └── os/
│       ├── OSContext.tsx
│       └── OSContext.test.tsx            # unit — openApp/close/minimize/maximize/focus/move/resize
└── app/
    └── api/
        ├── chat/route.ts
        ├── chat/route.test.ts            # integration — fetch stub
        ├── models/route.ts
        ├── models/route.test.ts
        ├── images/route.ts
        ├── images/route.test.ts
        └── health/route.ts
        └── health/route.test.ts
```

### 4.1 Framework recomendado

- **Vitest** — coerente com a stack atual (alinhado com o stub gerado por `generateUnitTestsForCode` que importa `from 'vitest'`).
- **@testing-library/react** para componentes (OSContext, ChatInterface).
- **Playwright** para E2E (abrir o OS, abrir 27 apps, simular janelas).

### 4.2 Mocking

- **fetch** — `vi.spyOn(global, 'fetch')` (Vitest) ou `msw` (Mock Service Worker) para interceptar `/chat/completions`, `/messages`, `/generateContent`.
- **localStorage** — `vi.spyOn(Storage.prototype, 'getItem')` ou polyfill em `setup.ts`.
- **timers** — `vi.useFakeTimers()` para `delay()` em `SwarmEngineImpl` e para os `setTimeout` simulados.
- **Monaco** — `@monaco-editor/react` é lazy e usa web workers; em testes, mockar via `__mocks__/monaco-editor.tsx`.

---

## 5. Casos de Teste Candidatos (alto valor)

### 5.1 `analyzeCodeQuality` (`src/lib/agent-swarm/collaboration-protocols.ts`)

```ts
analyzeCodeQuality(`const x: any = 1;`, 'file.ts')
// → issue: 'Uso de tipo `any` detectado', severity: 'medium', line: 1, fixedCode: 'const x: unknown = 1;'

analyzeCodeQuality(`eval("x")`, 'file.js')
// → issue: 'Execução de código dinâmico insegura (eval / Function)', severity: 'critical'

analyzeCodeQuality(`<div dangerouslySetInnerHTML={{__html: x}} />`, 'x.tsx')
// → issue: 'Possível vulnerabilidade de XSS', severity: 'high'

analyzeCodeQuality(`console.log("debug")`, 'x.ts')
// → issue: 'Log de console em produção', severity: 'low'

analyzeCodeQuality(`const api_key = "abcdef1234567890"`, 'x.ts')
// → issue: 'Possível credencial / chave de API hardcoded', severity: 'critical'
```

Casos a cobrir:
- Score 100 para código limpo.
- Score cai 30 por crítico, 15 por high, 5 por medium.
- `passed === true` quando `criticals === 0 && highs === 0`.

### 5.2 `getSwarmEngine().executeCollaborativeCodingTask`

- Step 1 (Architect) é `completed` após delay.
- Step 2 (Coder) gera boilerplate quando `contextCode === ''`.
- Step 2 (Coder) chama `enhanceCodeWithGoal` quando `contextCode !== ''`.
- Step 3 (Reviewer) posta `review_feedback` para architect se `audit.passed`, ou para debugger se não.
- Step 4 (Debugger) é pulado quando `audit.issues.length === 0`.
- Step 4 (Debugger) aplica `issue.fixedCode` na linha correta.
- `session.status` final é `'completed'`.
- `session.finalResult` inclui `code`, `summary`, `reviewScore`, `testsGenerated`.

### 5.3 `OSProvider` (React Context)

- `openApp('chat')` cria uma janela com `appId === 'chat'` e zIndex incrementado.
- `openApp('chat')` duas vezes foca a janela existente.
- `minimizeWindow(id)` esconde; segundo `openApp('chat')` restaura.
- `toggleMaximize(id)` salva `prevBounds` na ida e restaura na volta.
- `moveWindow(id, 100, 100)` desmaximiza.
- `resizeWindow(id, 50, 50)` respeita `minWidth`/`minHeight`.

### 5.4 `api-client`

- `chatCompletion` com `provider: 'openai'` faz `fetch` para `${baseUrl}/chat/completions` com `Authorization: Bearer <key>`.
- `chatCompletion` com `provider: 'anthropic'` faz `fetch` para `${baseUrl}/messages` com `x-api-key` e `anthropic-version`.
- `chatCompletion` com `provider: 'google'` faz `fetch` para `${baseUrl}/models/${model}:generateContent?key=${key}`.
- `chatCompletion` lança `Error('API key não configurada…')` se `apiKey === ''`.
- `chatCompletionStream` com Anthropic converte `content_block_delta` para OpenAI SSE.

### 5.5 Route Handlers

- `POST /api/chat` com body inválido → 400.
- `POST /api/chat` com `stream: true` → 200 + `text/event-stream`.
- `GET /api/health` → 200 + `{ status: 'ok', timestamp, version }`.
- `POST /api/images` com `apiFormat !== 'openai'` → throw "Geração de imagens ainda não suportada".

---

## 6. O que o Projeto Afirma Fazer (sem fazer)

O `README.md` e `CHANGELOG.md` anunciam:
- "Gerador automático de suítes de testes unitários Vitest" — gera o **stub** em runtime, não roda nada (`generateUnitTestsForCode` em `collaboration-protocols.ts`).
- "Botão Auto-Corrigir" — aplica `issue.fixedCode` linha a linha em `swarm-engine.ts:239-247`.
- "Auditoria de 1 Clique" — chama `runCodeAudit` (regex, sem AST real).
- "Vitest" — apenas mencionado no stub gerado, **não há instalação**.

> Ver `CONCERNS.md` §1 — claim vs. realidade: a maior parte da "IA" do Swarm Engine é simulada.

---

## 7. Mínimo Viável para Adicionar Testes

1. Instalar `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `msw`.
2. Criar `vitest.config.ts`:
   ```ts
   import { defineConfig } from 'vitest/config';
   import { resolve } from 'path';
   export default defineConfig({
     test: {
       environment: 'jsdom',
       setupFiles: ['./src/test-setup.ts'],
       globals: true,
     },
     resolve: {
       alias: { '@': resolve(__dirname, './src') },
     },
   });
   ```
3. Adicionar `src/test-setup.ts` (jest-dom + matchers).
4. Adicionar scripts em `package.json`:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:ui": "vitest --ui",
   "test:coverage": "vitest run --coverage"
   ```
5. Migrar `generateUnitTestsForCode` para um helper real que escreve arquivos em disco (se a feature for além de stub).

---

## 8. Convenções Recomendadas (quando adotar testes)

| Aspecto | Recomendação |
| --- | --- |
| Naming | `*.test.ts` / `*.test.tsx` colocalizado com o source (não em `__tests__/`) |
| Framework | Vitest (alinhado com o stub gerado) |
| Cobertura mínima | ≥70% em `src/lib/`, ≥40% em `src/components/` |
| Tipos de teste | Unit (lib + Context), Integration (route handlers + api-client com fetch mockado), E2E (Playwright — abrir OS + abrir 3 apps) |
| CI | GitHub Actions — `pnpm test && pnpm build` em cada PR |
| Coverage report | Codecov ou Vercel Analytics |

---

*Análise atualizada em 2026-08-28. Fontes: `package.json` (scripts), `CONTRIBUTING.md` (comandos sugeridos), `src/lib/agent-swarm/collaboration-protocols.ts` (`generateUnitTestsForCode`), inspeção de `src/**/*.{test,spec}.*` (zero resultados), ausência de `vitest.config.*`/`jest.config.*`/`playwright.config.*` e `.github/workflows/`.*
