# Phase 1 Research — Self-Contained IDE com Swarm Real

**Generated:** 2026-08-28
**Mode:** inline (gsd-phase-researcher unavailable in this runtime)
**Sources:** `.planning/codebase/`, official docs, prior art

> The `gsd-phase-researcher` agent is not installed in this runtime, so this RESEARCH.md was compiled inline from the codebase map and external documentation. It captures the same findings a researcher would surface for Phase 1, organized by domain.

---

## 1. WebContainers (`@webcontainer/api`)

### 1.1 What it is

StackBlitz's WebContainers API runs a real Node.js runtime in the browser using WebAssembly. Apps boot a `WebContainer` instance, mount a virtual filesystem, and spawn processes (Node, npm, git, vite, etc.) without any server-side execution. The same `child_process.spawn` API you use in Node is available.

### 1.2 Constraints (must plan around)

- **Requires COOP/COEP headers.** `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` must be set on the hosting page. Without them, the boot fails with "SharedArrayBuffer is not defined". The Next.js `next.config.ts` `headers()` function is the right place to add this — apply in Plan 1.2.
- **Single instance per origin per session.** You cannot boot multiple WebContainers in the same tab. For multi-workspace support, either (a) keep one WebContainer and tear down/reboot on workspace switch (expensive ~1-3s), or (b) use a per-workspace "stage" pattern where the VFS is mounted/unmounted but the runtime stays. Recommended: keep one instance + per-workspace filesystem snapshot.
- **No native binaries** (no Rust, no Go, no native Node modules with `.node` files). The VFS is in-memory + IndexedDB. Most npm packages work; ones with native bindings don't (e.g., `better-sqlite3`, `bcrypt`).
- **Browser support:** Chrome 96+, Edge 96+, Firefox 102+, Safari 16.4+ (limited). iOS Safari has restrictions — gate behind capability check.
- **License:** Free for non-commercial and commercial use up to a usage quota. Heavy commercial usage requires a StackBlitz plan. For AnjosDevOS (open-source MIT), the free tier is sufficient for evaluation; production scale will need a plan discussion.
- **Bundle cost:** the API itself is ~30KB gzipped; the heavy lifting happens in the WebAssembly which is fetched on first boot from `https://*.webcontainer-api.io`.

### 1.3 How it fits Phase 1

Plan 1.2 builds the singleton in `src/lib/runtime/webcontainer.ts`. Plan 1.3's `Terminal.tsx` panel wires xterm.js to `webcontainer.spawn('jsh', { terminal: { ... } })` for the shell. Plan 1.5 uses `webcontainer.fs.writeFile` for the Auto-Patch and the test runner.

### 1.4 Known issues / gotchas

- **`aot` compilation on iOS:** first boot may take 3-5s on iOS Safari. Show a "Bootando ambiente de desenvolvimento..." spinner.
- **The `webcontainer` instance is per-tab.** A refresh tears it down — the VFS is the only thing that persists (via IndexedDB through WebContainer's own snapshot). Plan 1.2 must implement a snapshot/restore cycle on boot.
- **`npm install` is expensive** — the WebContainer's npm cache is shared across runs but `node_modules` for a fresh project takes 5-15s. Show progress via `webcontainer.on('install-packages', ...)`.
- **Process exit codes:** `await webcontainer.spawn(...).exit` gives the numeric exit code. Stdout/stderr are ReadableStreams.

### 1.5 Recommended library versions

- `@webcontainer/api`: `^1.6.1` (latest stable as of mid-2026)
- `@xterm/xterm`: `^5.5.0`
- `@xterm/addon-fit`: `^0.10.0`

---

## 2. Dexie (IndexedDB) for Workspaces

### 2.1 Why Dexie over raw IndexedDB

The native IndexedDB API is verbose and event-callback heavy. Dexie wraps it with a Promise-based query API, schema versioning, and observability hooks. Bundle cost: ~22KB gzipped.

### 2.2 Schema for Phase 1 (Plan 1.1)

```typescript
// src/lib/workspaces/db.ts
class AnjosDevOSDB extends Dexie {
  workspaces!: Table<Workspace, string>;
  sessions!: Table<EditorSession, string>;
  swarmRuns!: Table<SwarmRun, string>;

  constructor() {
    super('anjosdevos');
    this.version(1).stores({
      workspaces: 'id, name, createdAt, updatedAt, lastOpenedAt',
      sessions: 'id, workspaceId, updatedAt',  // session per workspace
      swarmRuns: 'id, workspaceId, startedAt',  // audit log of swarm runs
    });
  }
}

interface Workspace {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt: Date;
  // Snapshotted file tree (only metadata, not content) — content lives in WebContainer's IndexedDB.
  fileTree: FileNode[];
  // Per-workspace settings (provider, model, theme)
  settings: {
    defaultProvider: ProviderId;
    defaultModel: string;
    theme: 'dark' | 'light';
  };
}

interface EditorSession {
  id: string;        // = workspaceId
  workspaceId: string;
  openTabs: { path: string; cursor: { line: number; column: number } }[];
  activeTab: string;
  terminalHistory: string[];
  updatedAt: Date;
}
```

### 2.3 Gotchas

- **IndexedDB quotas** are browser-dependent (typically 50% of disk, with a hard floor of ~10MB in private mode). Phase 1 doesn't store file contents in Dexie — those go in WebContainer's IndexedDB (which has a separate quota).
- **Versioning:** if the schema changes, bump the version and provide an `upgrade()` callback.
- **Multi-tab:** two tabs writing to the same Dexie can race. For Phase 1, single-tab is assumed (the OS is one tab).

---

## 3. Monaco DiffEditor for Auto-Patch (Plan 1.5)

### 3.1 Existing usage

The project already imports `Editor, { OnMount, OnChange } from '@monaco-editor/react'` in `CodeEditorApp.tsx`. The same package exports `DiffEditor` — no new dependency.

### 3.2 API shape

```tsx
import { DiffEditor } from '@monaco-editor/react';

<DiffEditor
  original={currentCode}
  modified={patchedCode}
  language={languageFromExtension(filePath)}
  theme="vs-dark"
  options={{ readOnly: false, renderSideBySide: true, minimap: { enabled: false } }}
  onMount={(editor, monaco) => { /* wire monaco.editor.getOriginalEditor() etc. */ }}
/>
```

### 3.3 UX considerations

- **Accept** → write modified to WebContainer VFS, close the diff.
- **Reject** → close without writing.
- **Apply manually** → open modified in the regular editor for line-by-line editing before accepting.
- **Show context** → diff with 3 lines of context above and below each change is the default in Monaco; good.

---

## 4. LLM Audit Prompt Engineering (Plan 1.4)

### 4.1 System prompt pattern

We already have `AnjosReviewer.systemPrompt` in `src/lib/agent-swarm/agent-specialists.ts:60-64`:

```
Você é o AnjosReviewer, o auditor de qualidade e segurança do AnjosDevOS.
Sua missão:
1. Inspecionar todo código gerado procurando vulnerabilidades de segurança (OWASP Top 10, SQL Injection, XSS, SSRF).
2. Avaliar legibilidade, complexidade ciclomática, conformidade com SOLID e vazamentos de memória.
3. Emitir relatórios de auditoria com nota (0-100), classificação de severidade (Critical, High, Medium, Low) e sugestões de correção.
4. Se encontrar bugs, acionar o AnjosDebugger para formulação de patch.
```

For the LLM audit, the user prompt should be structured to elicit a parseable response. Two patterns to choose from:

**A) JSON mode** (works with OpenAI's `response_format: { type: 'json_object' }`, Anthropic's tool-use, Google's `responseMimeType: 'application/json'`):

```json
{
  "score": 75,
  "issues": [
    {
      "severity": "high",
      "line": 42,
      "title": "SQL injection risk",
      "description": "...",
      "suggestion": "...",
      "fixedCode": "..."
    }
  ],
  "summary": "...",
  "securityAnalysis": {
    "owaspCategory": "A03:2021 - Injection",
    "vulnerabilitiesFound": 1,
    "sanitizeInputsChecked": true,
    "authIssuesChecked": false
  }
}
```

**B) Free-form with a regex parser** (fallback for providers without JSON mode).

### 4.2 Recommendation

Add a `jsonOutput: true` option to `chatCompletion` in `api-client.ts` that:
- For OpenAI-compatible: pass `response_format: { type: 'json_object' }`
- For Anthropic: use `tools: [{ name: 'audit_report', input_schema: { ... } }]` (tool-use is Anthropic's JSON mode)
- For Google: pass `generationConfig.responseMimeType: 'application/json'`

For Plan 1.4, start with the existing `chatCompletion` and parse with a defensive JSON parser (try `JSON.parse`, fallback to "could not parse" with a single finding of severity `low`).

### 4.3 Cost & latency budget

- Audit prompt: ~300 tokens (system + 5-line file context).
- Expected response: ~500-1500 tokens.
- For a 100-line file with one LLM call: ~$0.005-0.02 (Claude Sonnet 4 / GPT-4o).
- Target latency: < 5s for files up to 500 lines.

---

## 5. Vitest in a WebContainer (Plan 1.5)

### 5.1 What works

- `npm install vitest` → vitest in node_modules.
- `npx vitest run` → runs tests, prints to stdout.
- `npx vitest run --reporter=json` → emits JSON output to stdout. We can parse this.

### 5.2 What doesn't

- Watch mode is unreliable in WebContainers (no file-system events).
- Coverage requires `c8` or `v8` which need native bindings — not available. Defer coverage to Phase 4 (server-side).

### 5.3 UI flow

1. User clicks "Gerar Testes" on a file.
2. Swarm generates a Vitest spec (LLM call, Plan 1.4 pattern).
3. Spec is written to `/__tests__/{filename}.spec.ts` via `webcontainer.fs.writeFile`.
4. `npx vitest run --reporter=json {path}` is spawned.
5. JSON stdout is parsed for `{ numPassedTests, numFailedTests, numTotalTests, testResults: [{ name, status, message? }] }`.
6. UI shows pass/fail cards with each test's name and any failure message.

### 5.4 npm install time

First install of vitest in a fresh workspace takes ~10s. Show a progress overlay with the npm install steps. Subsequent boots are cached.

---

## 6. Z-index, drag, and panel layout for the 4-panel IDE (Plan 1.3)

### 6.1 Library choice

Two paths:
- **Hand-rolled CSS grid** with Zustand for sizes. ~80 lines of code, no extra dep. Splitters are mouse-event-driven. No animations baked in.
- **`react-resizable-panels`** (`@xyflow/react` ecosystem) — already maintained, drag-handles, snap-points, keyboard accessible. Adds ~12KB gzipped.

**Recommendation:** `react-resizable-panels` (`^2.1.0`). Battle-tested, saves 4-6 hours of splitter work, plays well with Monaco's layout requirements.

### 6.2 Layout grid

```
┌────────┬───────────────────────────┬──────────────┐
│        │                           │              │
│  Side  │      Editor (Monaco)      │  IA Swarm    │
│  bar   │                           │              │
│        │                           │              │
│        ├───────────────────────────┤              │
│        │      Terminal (xterm)     │              │
│        │                           │              │
└────────┴───────────────────────────┴──────────────┘
```

CSS Grid:
```css
.code-editor-grid {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr var(--swarm-w);
  grid-template-rows: 1fr var(--terminal-h);
  grid-template-areas:
    "side editor swarm"
    "side terminal swarm";
}
```

### 6.3 Keyboard shortcuts (Plan 1.3 deliverable)

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` / `Cmd+P` | Open file search palette |
| `Ctrl+Shift+O` / `Cmd+Shift+O` | Open symbol search palette |
| `Ctrl+`` ` (backtick) | Toggle terminal |
| `Ctrl+J` | Toggle Swarm panel |
| `Ctrl+S` / `Cmd+S` | Save current file to WebContainer |
| `Ctrl+Shift+P` | Command palette (future) |

Use `monaco.editor.IEditorContribution` or just `addEventListener('keydown')` on the editor grid wrapper.

---

## 7. Browser compatibility (RUN-01) — summary

| Browser | WebContainers | xterm.js | Monaco | Dexie |
|---------|---------------|----------|--------|-------|
| Chrome 96+ | ✅ | ✅ | ✅ | ✅ |
| Edge 96+ | ✅ | ✅ | ✅ | ✅ |
| Firefox 102+ | ✅ | ✅ | ✅ | ✅ |
| Safari 16.4+ | ⚠️ limited | ✅ | ✅ | ✅ |
| iOS Safari 16.4+ | ⚠️ limited | ✅ | ✅ | ✅ |

For unsupported browsers, fallback to a "Demo Mode" — file explorer and editor work on a virtual in-memory FS (no real npm/git), audit/patch still work via LLM, but no `npm install`.

---

## 8. Risks and open questions

- **WebContainer licensing** for production scale: StackBlitz may require a paid plan above a usage threshold. Need to confirm before relying on this for v1.
- **Bundle size** impact: `@webcontainer/api` + `@xterm/xterm` + `dexie` + `react-resizable-panels` add ~80KB gzipped to the client. Phase 3's bundle budget (< 1.5MB) is still met.
- **iOS Safari** has limited WebContainer support — the "Demo Mode" fallback is essential for that segment.
- **Vitest in WebContainer** is slow on first install. Consider a "skip tests, just generate" path for the first run.

---

*This research was compiled inline because the `gsd-phase-researcher` subagent is not installed in this runtime. Findings are based on the `.planning/codebase/` map, the official `@webcontainer/api` docs, and prior art from StackBlitz, Replit, and CodeSandbox.*
