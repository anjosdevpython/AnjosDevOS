# 🤖 AI-SPEC: AnjosDevOS Artificial Intelligence Integration Contract

**Version:** 1.2.0  
**Status:** Approved & Implemented  
**Date:** 2026-08-29  
**Scope:** Multi-Provider Architecture (11 Providers, 50+ Models), Agent Swarm Engine, 21 Developer Skills Executor, Server Vault, MCP Integration & Evaluation Metrics.

---

## 1. 🌐 Multi-Provider AI Topology & Tiering

AnjosDevOS integrates 11 AI providers using a unified streaming client (`src/lib/ai/api-client.ts` + `providers.ts`):

```
                               ┌───────────────────────────┐
                               │   Client / IDE / Swarm    │
                               └─────────────┬─────────────┘
                                             │ POST /api/chat
                                             ▼
                               ┌───────────────────────────┐
                               │   Security ProviderVault  │
                               │  (Encrypted Server Keys)  │
                               └─────────────┬─────────────┘
                                             │
      ┌──────────────┬──────────────┬────────┼──────────────┬──────────────┬──────────────┐
      ▼              ▼              ▼        ▼              ▼              ▼              ▼
 ┌─────────┐   ┌───────────┐   ┌────────┐  ┌───┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
 │ OpenAI  │   │ Anthropic │   │ Google │  │xAI│  │ DeepSeek  │  │OpenRouter │  │  Cohere   │
 │ (GPT-5/ │   │ (Claude 4 │   │(Gemini │  │   │  │ (V3/R1/   │  │(Universal │  │(Command   │
 │  4o/o3) │   │  Opus/Son)│   │2.5 Pro)│  │   │  │  Coder)   │  │  Router)  │  │  R/R+)    │
 └─────────┘   └───────────┘   └────────┘  └───┘  └───────────┘  └───────────┘  └───────────┘
```

### 1.1 Provider Matrix & Formats

| Provider | Format Adapter | Default Model | Token Streaming | Function Calling | Key Capabilities |
|---|---|---|---|---|---|
| **OpenAI** | `openai` | `gpt-4o` | ✅ Server-Sent Events | ✅ Native | Reasoning (o3/o4), Code generation, Vision |
| **Anthropic** | `anthropic` | `claude-3-5-sonnet` | ✅ Messages API Stream | ✅ Tools | Deep architectural analysis, 200k context |
| **Google AI** | `google` | `gemini-2.5-pro` | ✅ GenerateContentStream | ✅ Function Call | Massive context (1M-2M tokens), Multimodal |
| **DeepSeek** | `openai` (compatible) | `deepseek-chat` | ✅ SSE Stream | ✅ Native | High-efficiency coding, DeepSeek-R1 reasoning |
| **xAI** | `openai` (compatible) | `grok-4-0709` | ✅ SSE Stream | ⚠️ Experimental | Real-time knowledge, Grok reasoning |
| **Mistral** | `openai` (compatible) | `mistral-large-latest`| ✅ SSE Stream | ✅ Native | Codestral specialized code synthesis |
| **Groq** | `openai` (compatible) | `llama-3.3-70b-versatile`| ✅ Ultra-low Latency | ✅ Native | 300+ tokens/sec realtime execution |
| **Together AI** | `openai` (compatible) | `llama-3.1-405b` | ✅ SSE Stream | ✅ Native | Massive open-weights models (405B) |
| **OpenRouter** | `openai` (compatible) | `auto` | ✅ Universal Router | ✅ Native | 200+ aggregated global models & failover |
| **Cohere** | `cohere` | `command-r-plus` | ✅ Stream chunks | ✅ Tools | RAG optimization, multilingual enterprise |
| **NetworkTools**| `openai` (fallback) | `gpt-4o` | ✅ Server Proxy | ✅ Native | Out-of-the-box zero-setup provider |

---

## 2. 🐝 Swarm Engine & Multi-Agent Specialists

The Swarm Engine (`src/lib/agent-swarm/`) orchestrates 7 specialized AI agents acting concurrently or in sequence:

```
                  ┌──────────────────────┐
                  │   Developer / Code   │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │ AnjosOrchestrator    │
                  │ (Topology & Planner) │
                  └──────────┬───────────┘
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ AnjosArchitect  │ │  AnjosCoder     │ │ AnjosReviewer   │
│ (System Design) │ │ (Code Synthesis)│ │ (OWASP Audit)   │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ AnjosDebugger   │ │  AnjosTester    │ │ AnjosSecurity   │
│ (Root Cause)    │ │(Vitest Specs)   │ │ (Vulnerability) │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 2.1 Agent Roles & System Prompt Contracts

1. **`AnjosReviewer`:**
   - **Focus:** Code quality, clean architecture, anti-patterns, OWASP Top 10 vulnerabilities.
   - **Contract Output:** Structured JSON containing `score` (0-100), `findings` array (`severity`, `line`, `title`, `description`, `suggestion`, `fixedCode`), `summary`.
2. **`AnjosCoder`:**
   - **Focus:** Full implementation, refactoring, type-safety, TypeScript strict compliance.
   - **Contract Output:** Self-contained code blocks with unified diff markers for Monaco DiffEditor.
3. **`AnjosTester`:**
   - **Focus:** Unit & integration test generation for Vitest and Playwright.
   - **Contract Output:** Executable `*.test.ts` suites targeting 100% critical branch coverage.
4. **`AnjosDebugger`:**
   - **Focus:** Runtime stack trace analysis, memory leaks, and async race conditions.
5. **`AnjosSecurity`:**
   - **Focus:** Threat modeling, secrets detection, CSRF/XSS, sanitized I/O validation.

---

## 3. 🛠️ 21 Developer Skills Execution Contract

All 21 skills (`src/lib/tools/skills-executor.ts`) execute via the unified `/api/chat` backend pipeline:

```typescript
export interface SkillExecutionRequest {
  skillId: string;
  contextCode?: string;
  customPrompt: string;
  model: string;
  provider: ProviderId;
  temperature?: number;
}
```

### 3.1 Skill Catalog Matrix

| Skill Group | Skills Included | Output Format | Fallback Temperature |
|---|---|---|---|
| **GSD Architecture (8)** | Grill with Docs, To Spec, To Tickets, Wayfinder, Research, Implement, Prototype, TDD | Markdown Spec / Tickets / Code | `0.3` (Deterministic) |
| **AI Hero Core (7)** | Code Review, Refactor, Explain Code, Debug Assistant, Generate Docs, Optimize, Security Audit | Markdown + Diff + Score Card | `0.2` (Strict) |
| **AI Hero Design & Ops (6)**| API Design, DB Design, System Architecture, CI/CD Pipeline, Migration Plan, Cloud Cost Analysis | OpenAPI / Mermaid Diagram / YAML | `0.4` (Creative Structuring) |

---

## 4. 🔌 Model Context Protocol (MCP) Integration

The MCP Subsystem (`src/components/os/apps/MCPServersApp.tsx`) interfaces local agent runtimes with external tools:

```
 ┌──────────────────────┐         JSON-RPC 2.0         ┌──────────────────────┐
 │   AnjosDevOS Agent   │ ◄──────────────────────────► │  MCP Server Daemon   │
 │   (Client Context)   │  tools/list, tools/call      │ (FS, Git, DB, Http)  │
 └──────────────────────┘                              └──────────────────────┘
```

- **Protocols Supported:** stdio, SSE (Server-Sent Events), WebSocket.
- **Active Servers:** Filesystem (`@modelcontextprotocol/server-filesystem`), Git (`mcp-server-git`), Browser (`browser-automation-mcp`), Database (`sqlite-postgres-mcp`), API Tester (`rest-graphql-mcp`), Code Search (`ripgrep-ast-mcp`).
- **Telemetry Contract:** Real-time roundtrip ping latency (ms), active tool schemas cache, error isolation.

---

## 5. 🧪 Evaluation Framework & Quality Guardrails (Evals)

```
                            ┌────────────────────────┐
                            │   LLM Generated Code   │
                            └───────────┬────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌──────────────────┐          ┌──────────────────┐            ┌──────────────────┐
│  Static Analysis │          │ Dynamic Runtime  │            │  LLM-as-a-Judge  │
│(Regex / AST Fast)│          │ (WebContainers)  │            │ (Reviewer Score) │
│  ≤ 100ms Budget  │          │ `npm test` Exit  │            │  Score: 0 - 100  │
└──────────────────┘          └──────────────────┘            └──────────────────┘
```

1. **Quality Gates:**
   - Code score ≥ 80 to pass automatic PR/patch staging.
   - Zero `critical` or `high` severity security findings.
   - No `any` type escapes in TypeScript generation.
2. **Hallucination Mitigation:**
   - System prompts inject strict markdown fences and require runnable code snippets.
   - Code changes are validated via `@monaco-editor/react` language service parser before write.
3. **Telemetry & Cost Logging:**
   - In-memory global accumulator (`src/lib/stats.ts`) records `tokensIn`, `tokensOut`, and `latencyMs` per provider and per model.