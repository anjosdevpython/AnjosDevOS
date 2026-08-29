# STACK

**Analysis Date:** 2026-08-28
**Project:** AnjosDevOS (Sistema Operacional de IA Autônomo)
**Repository root:** `C:\Users\allan.anjos\Downloads\anjosdevplataform`
**Codebase version (per `package.json`):** `anjosdevos` 1.0.0 (v2.0.0 in CHANGELOG — code/SW specs)

> Análise técnica das tecnologias, runtime, frameworks, dependências e configuração do projeto.

---

## 1. Stack Resumido

| Camada | Tecnologia | Versão |
| --- | --- | --- |
| Framework | Next.js (App Router) | `^15.1.0` |
| UI Runtime | React + ReactDOM | `^19.0.0` |
| Linguagem | TypeScript | `^5.7.0` |
| Estilização | Tailwind CSS + `@tailwindcss/typography` | `^3.4.0` + `^0.5.15` |
| PostCSS / autoprefixer | `postcss` / `autoprefixer` | `^8.4.0` / `^10.4.0` |
| Helpers CSS | `clsx`, `tailwind-merge` | `^2.1.1`, `^2.6.0` |
| Ícones | `lucide-react` | `^0.468.0` |
| Editor de código (in-browser) | `@monaco-editor/react` | `^4.7.0` |
| Markdown / syntax highlight | `react-markdown`, `react-syntax-highlighter` | `^9.0.1`, `^15.6.1` |
| Types (dev) | `@types/node`, `@types/react`, `@types/react-dom`, `@types/react-syntax-highlighter` | `^22.0.0`, `^19.0.0`, `^19.0.0`, `^15.5.13` |

**Saída de build:** Next.js `output: 'standalone'` (`next.config.ts`).

---

## 2. Linguagem & Compilação

- **TypeScript** em modo `strict: true`, `target: ES2017`, `moduleResolution: bundler`, `jsx: preserve`, `isolatedModules: true`, `incremental: true` (`tsconfig.json`).
- **Path alias** `@/*` → `./src/*` — todos os imports de bibliotecas usam `@/lib/...`, `@/components/...`, `@/hooks/...`, `@/config/...`, `@/types/...`, `@/app/...`.
- **Plugin Next** declarado em `tsconfig.json` (`plugins: [{ name: 'next' }]`).
- **Arquivos incluídos:** `**/*.ts`, `**/*.tsx`, `next-env.d.ts`, `.next/types/**/*.ts`.
- **JS permitido:** `allowJs: true` (sem JSX runtime JSX próprio; usa o do Next).

---

## 3. Framework & Build

- **Next.js 15.1** com **App Router** (`src/app/`).
  - Rota raiz: `src/app/page.tsx` (Client Component que alterna entre 3 UIs).
  - Layout raiz: `src/app/layout.tsx` (HTML `lang="pt-BR"`, viewport PWA, `themeColor: #0a0a0f`, `viewportFit: cover`).
  - Rotas de API: `src/app/api/{chat,models,images,health}/route.ts`.
  - Páginas standalone: `/chat`, `/editor`, `/images`, `/video`, `/music`, `/tts`, `/audio`, `/balance`, `/settings`.
  - `next.config.ts` define `output: 'standalone'` e libera `images.remotePatterns` para `**` (qualquer host HTTPS).
- **Scripts** (`package.json`):
  - `dev` → `next dev`
  - `build` → `next build`
  - `start` → `next start`
  - `lint` → `next lint` (sem `.eslintrc` próprio — usa config padrão do Next)
- **PWA / manifest** — `public/manifest.json`, ícones `icon-192.png`/`icon-512.png`/`favicon.png`/`icon.png`, `appleWebApp: { capable: true, statusBarStyle: 'black-translucent' }`.

---

## 4. Estilização

- **Tailwind v3.4** (configurado em `tailwind.config.ts`).
- **Tokens customizados** (extensão do tema):
  - Cores: `cyber-bg (#07090e)`, `cyber-card`, `cyber-border`, `cyber-border-hover`, `cyber-hover`, `neon-{green,blue,cyan,purple,red,yellow,pink}`, `text-{primary,secondary,muted}`.
  - Fontes: `mono: JetBrains Mono / Fira Code`, `sans: Inter` (carregada via Google Fonts no `globals.css`).
  - Sombras: `neon-{green,blue,cyan,purple}`, `glass`, `window`.
  - Animações: `glow`, `pulse-slow`, `slide-in`, `scale-in` com keyframes correspondentes.
- **CSS global** (`src/app/globals.css`): scrollbar ultra-fina custom (5px, thumb `rgba(255,255,255,0.12)`), `color-scheme: dark`, `user-select: none` no `body`, imports de `Inter` e `JetBrains Mono`.
- **PostCSS** (`postcss.config.js`): apenas `tailwindcss` e `autoprefixer`.
- **Plugin** `@tailwindcss/typography` habilitado.

---

## 5. Estado & Reatividade

- **Sem libs externas** (não usa Zustand, Redux, Jotai, React Query, SWR, etc.).
- **Estado de SO** é puramente **React Context + useState/useCallback** (`src/components/os/OSContext.tsx`).
  - `OSProvider` expõe `windows[]`, `activeWindowId`, `isStartMenuOpen`, `isBooted` e ações: `openApp`, `closeWindow`, `minimizeWindow`, `toggleMaximize`, `focusWindow`, `moveWindow`, `resizeWindow`, `setStartMenuOpen`, `setBooted`, `getAppDef`.
  - **Globais mutáveis** em escopo de módulo: `zIndexCounter`, `windowCounter` (counters do `OSProvider`).
- **Hook próprio** `useDevice` em `src/hooks/useDevice.ts` para detectar `mobile | tablet | desktop | touch` via `window.innerWidth` (breakpoints `<768` e `<1024`) + `ontouchstart`/`navigator.maxTouchPoints`.
- **Persistência local:** `localStorage` com chaves em `src/config/app.ts` (`anjosdev_provider_settings`, `anjosdev_theme`, `anjosdev_language`, `anjosdev_last_open_apps`).
- **Lazy loading de apps** via `next/dynamic` em `src/components/os/AppRegistry.tsx` (apps grandes entram com `ssr: false`).

---

## 6. Bibliotecas Internas (camada `src/lib`)

Estrutura hexagonal-ish, mas auto-contida (sem monorepo, sem packages externos).

| Módulo | Responsabilidade | Arquivo-âncora |
| --- | --- | --- |
| `lib/ai` | Camada multi-provider de IA (10 provedores) | `src/lib/ai/{providers,provider-config,api-client,models}.ts` |
| `lib/agent-swarm` | Motor SwarmEngine (7 agentes, bus pub/sub) | `src/lib/agent-swarm/{swarm-engine,agent-specialists,collaboration-protocols,types}.ts` |
| `lib/agent-orchestration` | Orquestrador + Hermes (chain-of-thought) + Browser engine + Workflow learner | `src/lib/agent-orchestration/{orchestrator,hermes-agent,browser-engine,workflow-learner,types}.ts` |
| `lib/agent-swarm` (sibling) | `agent-specialists.ts` define os 7 agentes | `src/lib/agent-swarm/agent-specialists.ts` |
| `lib/integrations` | Plugins DSH, OpenHands, Theia, CoWork, Freebuff | `src/lib/integrations/*.ts` |
| `lib/tools` | Registry de Skills + DevTools | `src/lib/tools/{tools,devtools}.ts` |
| `lib/warmwind` | "Funcionários IA" — registry de AI employees + app-store | `src/lib/warmwind/{ai-employees,app-store,types}.ts` |
| `lib/utils.ts` | `cn()` (`twMerge(clsx(...))`) | `src/lib/utils.ts` |

> Há **duas** engines de agentes no projeto: `agent-swarm` (SwarmEngine, 7 especialistas com `SwarmAgentDefinition`) e `agent-orchestration` (orquestrador com `OrchestratorAgent`, `TaskRequest`, `TaskResult` + `HermesAgent` com `HermesReasoningChain`). São camadas diferentes, mas com sobreposição conceitual (ver `CONCERNS.md`).

---

## 7. Camada de API (Backend em Next Route Handlers)

| Rota | Método | Função | Local |
| --- | --- | --- | --- |
| `/api/health` | `GET` | Healthcheck (`{ status, timestamp, version }`) | `src/app/api/health/route.ts` |
| `/api/chat` | `POST` | Chat completion (multi-provider, suporta `stream: true`) | `src/app/api/chat/route.ts` |
| `/api/models` | `GET` | Lista modelos por provedor | `src/app/api/models/route.ts` |
| `/api/images` | `POST` | Image generation (apenas providers OpenAI-compatíveis) | `src/app/api/images/route.ts` |

> A camada de API em `route.ts` chama **diretamente `src/lib/ai/api-client.ts`**, que é uma lib client-side (`'use client'`) e usa `fetch` para chamar o provider externo. O **tráfego de chave de API** passa pelo **localStorage** do navegador (não pelo servidor Next) — o que tem implicações de segurança (ver `CONCERNS.md`).

---

## 8. Provedores de IA (configurados em `src/lib/ai/providers.ts`)

`ProviderId` é uma união de 10 valores: `openai | anthropic | google | deepseek | xai | mistral | groq | together | networktools | custom`.

| Provider | baseUrl | apiFormat | Streaming | Imagens | Modelos |
| --- | --- | --- | --- | --- | --- |
| OpenAI | `https://api.openai.com/v1` | `openai` | ✅ | ✅ | gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo, o1/o1-mini/o3/o3-mini, dall-e-3/2, tts-1/hd, whisper-1 |
| Anthropic | `https://api.anthropic.com/v1` | `anthropic` | ✅ | ❌ | claude-sonnet-4-20250514, claude-3-5-sonnet/haiku, claude-3-opus/sonnet/haiku |
| Google AI | `https://generativelanguage.googleapis.com/v1beta` | `google` | ✅ | ❌ (imagen-3) | gemini-2.5-pro/flash, gemini-2.0-flash, gemini-1.5-pro/flash, imagen-3 |
| DeepSeek | `https://api.deepseek.com/v1` | `openai` | ✅ | ❌ | deepseek-chat (V3), deepseek-reasoner (R1) |
| xAI (Grok) | `https://api.x.ai/v1` | `openai` | ✅ | ❌ | grok-3, grok-3-mini, grok-2 |
| Mistral AI | `https://api.mistral.ai/v1` | `openai` | ✅ | ❌ | mistral-large/medium/small, mixtral-8x22b, mixtral-8x7b, codestral |
| Groq | `https://api.groq.com/openai/v1` | `openai` | ✅ | ❌ | llama-3.3-70b-versatile, llama-3.1-8b-instant, gemma2-9b-it, mixtral-8x7b-32768 |
| Together AI | `https://api.together.xyz/v1` | `openai` | ✅ | ❌ | Llama-3.1-405B/70B/8B, Mixtral-8x22B, Qwen-2.5-72B |
| **NetworkTools** (default) | `https://yellowfire.ru/v1` | `openai` | ✅ | ✅ | gpt-5, gpt-5.5, claude-5-opus/sonnet, deepseek-v4, grok-4, gemini-3.5-flash, dall-e-3, flux, suno-v5, kling-3 |
| Custom | (vazio) | `openai` | ✅ | ❌ | (vazio) |

**Helper:** `getAllModels()`, `getModelsByCategory()`, `findProviderByModel()`, `getModelInfo()`.

---

## 9. Variáveis de Ambiente

Definidas em `.env.example` (template) — chaves de API por provedor e duas variáveis opcionais:

```
NETWORK_TOOLS_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
DEEPSEEK_API_KEY=
XAI_API_KEY=
MISTRAL_API_KEY=
GROQ_API_KEY=
TOGETHER_API_KEY=
NEXT_PUBLIC_API_BASE_URL=    # opcional
NEXT_PUBLIC_NETWORK_TOOLS_BASE_URL=   # fallback client-side
NEXT_PUBLIC_NETWORK_TOOLS_API_KEY=    # fallback client-side
PORT=                         # opcional
DEBUG=
LOG_LEVEL=
```

> Ver `CONCERNS.md` (segurança: `.env.local` é gitignored mas `NEXT_PUBLIC_*` é embutido no bundle).

---

## 10. Configuração Central

- `src/config/app.ts` → `APP_CONFIG` (objeto `as const`):
  - `name: 'AnjosDevOS'`, `version: '1.0.0'`
  - `api.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://yellowfire.ru/v1'`
  - `api.timeout = 30000`
  - `storage.*` (4 chaves de localStorage)
  - `ui = { taskbarHeight: 48, windowMinWidth: 400, windowMinHeight: 350, animationDuration: 200 }`
  - `features = { enableMCP, enableGSD, enableDeepSeekHarness, enableOpenHands, enableTheiaIDE, enableDevToolsHub, enableMobile }`
  - `providers` (9 provedores com flag `enabled: true`)
  - `defaults = { provider: 'networktools', model: 'gpt-4o', temperature: 0.7, theme: 'dark' }`

---

## 11. Comandos / Scripts de Desenvolvimento

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia `next dev` (porta 3000 padrão) |
| `npm run build` | Build de produção (saída `output: 'standalone'`) |
| `npm run start` | Serve o build standalone |
| `npm run lint` | `next lint` (sem config custom) |
| `npx tsc --noEmit` | Type-check estrito (documentado em `CONTRIBUTING.md`) |

---

## 12. Versões-Chave e Compatibilidade

- **Next.js 15.1** + **React 19** — exige `"use client"` em todos os componentes interativos. Padrão consistente (componentes do OS são client).
- **Tailwind v3.4** (não v4) — sintaxe clássica de `tailwind.config.ts`, `postcss.config.js` separado, `extend.theme`.
- **Monaco Editor** carregado via wrapper `@monaco-editor/react` (lazy).
- **Sem testes automatizados** (zero `*.test.*` / `*.spec.*` no repo) — ver `TESTING.md`.
- **Sem CI** (sem `.github/workflows`) — ver `CONCERNS.md`.

---

## 13. Dependências Resumidas (formato árvore)

```
@monaco-editor/react
clsx
lucide-react
next
react
react-dom
react-markdown
react-syntax-highlighter
tailwind-merge
[dev] @tailwindcss/typography
[dev] @types/node, @types/react, @types/react-dom, @types/react-syntax-highlighter
[dev] autoprefixer
[dev] postcss
[dev] tailwindcss
[dev] typescript
```

> **Não há** dependências de UI primitives (shadcn, Radix, MUI, Chakra, etc.), animação (framer-motion, react-spring), formulários (react-hook-form, zod), data-fetching (TanStack Query), ou state (zustand, jotai). Tudo é **React puro + Tailwind**.

---

*Análise atualizada em 2026-08-28 com base em inspeção direta de `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `src/config/app.ts`, `src/lib/ai/providers.ts` e `.env.example`.*
