'use client';

import React, { useState } from 'react';
import {
  FileText,
  Eye,
  Columns,
  Download,
  Copy,
  Check,
  Sparkles,
  Bold,
  Italic,
  List,
  Heading,
  Code,
  Table,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const DEFAULT_DOC = `# 📘 Documentação do Sistema — AnjosDevOS Architecture

## 1. Visão Geral
O **AnjosDevOS** é uma plataforma de desenvolvimento autônoma baseada em navegadores com arquitetura multi-agente e múltiplos ambientes integrados.

### 🌟 Destaques Tecnológicos
- **Next.js 15.5 App Router** com React 19 e TypeScript Estrito
- **12 Provedores de IA Integrados** (OpenAI, Anthropic, AIML API, DeepSeek, Google, etc.)
- **Swarm Engine** com 7 agentes autônomos
- **WebContainers Runtime** com shell interativo e xterm.js

---

## 2. Tabela de Módulos e Portas

| Módulo | Tipo | Status | Latência |
|---|---|---|---|
| Swarm Engine | Multi-Agent | ✅ ONLINE | 45ms |
| Workspaces | IndexedDB (Dexie) | ✅ PERSISTED | 2ms |
| MCP Protocol | JSON-RPC 2.0 | ✅ CONNECTED | 12ms |
| Security Vault | Server-Side | 🔒 ENCRYPTED | 1ms |

---

## 3. Exemplo de Código & Inicialização

\`\`\`typescript
import { SwarmEngine } from '@/lib/agent-swarm/swarm-engine';
import { SecurityVault } from '@/lib/security/vault';

const engine = new SwarmEngine({
  provider: 'aimlapi',
  model: 'openai/gpt-5-5',
  apiKey: SecurityVault.getApiKey('aimlapi'),
});

const result = await engine.executeTask('Criar microsserviço de autenticação');
console.log(result.code);
\`\`\`

> 💡 **Nota de Produção:** Todos os endpoints suportam fallback automático e criptografia em repouso.
`;

export function DocStudioApp() {
  const [markdown, setMarkdown] = useState(DEFAULT_DOC);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState(false);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportFile = (format: 'md' | 'html') => {
    const content = format === 'md' ? markdown : `<!DOCTYPE html><html><body>${markdown}</body></html>`;
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentacao.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    setMarkdown((prev) => `${prev}\n${prefix}${suffix}\n`);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#080b12] text-slate-100 font-sans select-none">
      {/* Header Toolbar */}
      <div className="h-11 px-4 border-b border-white/10 bg-[#0d121f] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-white">Doc Studio (Markdown & Tech Specs)</h2>
          </div>

          {/* Quick Insert Actions */}
          <div className="hidden lg:flex items-center gap-1 pl-4 border-l border-white/10 text-slate-400">
            <button
              onClick={() => insertSnippet('### ')}
              className="p-1.5 rounded hover:bg-white/10 hover:text-white"
              title="Título"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('**Texto em Negrito**')}
              className="p-1.5 rounded hover:bg-white/10 hover:text-white"
              title="Negrito"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('*Texto em Itálico*')}
              className="p-1.5 rounded hover:bg-white/10 hover:text-white"
              title="Itálico"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('```typescript\n// Seu código aqui\n```')}
              className="p-1.5 rounded hover:bg-white/10 hover:text-white"
              title="Bloco de Código"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('| Coluna 1 | Coluna 2 |\n|---|---|\n| Item A | Item B |')}
              className="p-1.5 rounded hover:bg-white/10 hover:text-white"
              title="Tabela"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Switchers & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090d16] border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('edit')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-colors font-medium',
                viewMode === 'edit' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1',
                viewMode === 'split' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1',
                viewMode === 'preview' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>

          <button
            onClick={copyMarkdown}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            onClick={() => exportFile('md')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:bg-blue-600/40 text-xs font-medium"
          >
            <Download className="w-3 h-3" />
            <span>Exportar .md</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col min-h-0 border-r border-white/10">
            <MonacoEditor
              height="100%"
              language="markdown"
              theme="vs-dark"
              value={markdown}
              onChange={(val) => setMarkdown(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono',
                padding: { top: 14, bottom: 14 },
                wordWrap: 'on',
                lineNumbers: 'on',
              }}
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 overflow-y-auto p-8 bg-[#060810] text-slate-200 select-text prose prose-invert max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:text-white prose-p:leading-relaxed prose-pre:bg-[#0b0e18] prose-pre:border prose-pre:border-white/10 prose-th:text-cyan-300 prose-table:border prose-table:border-white/10 prose-td:border prose-td:border-white/5">
            <div className="max-w-3xl mx-auto whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {markdown}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}