'use client';

import React, { useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Code2,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Cell {
  id: string;
  type: 'code' | 'markdown';
  content: string;
  output?: string;
  executionCount?: number;
  isExecuting?: boolean;
}

const INITIAL_CELLS: Cell[] = [
  {
    id: 'cell-1',
    type: 'markdown',
    content: '# 📓 AnjosDevOS — Python Interactive Data Lab\nAmbiente de computação interativa com execução de scripts Python, análise de dados e gráficos.',
  },
  {
    id: 'cell-2',
    type: 'code',
    content: `# Exemplo de Processamento de Dados & Algoritmo
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

data = fibonacci(10)
print(f"Fibonacci primeiros 10 números: {data}")
print(f"Média: {sum(data)/len(data):.2f}")
`,
    output: `Fibonacci primeiros 10 números: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
Média: 8.80`,
    executionCount: 1,
  },
  {
    id: 'cell-3',
    type: 'code',
    content: `# Estatísticas e Resumo Numérico
import json

metrics = {
    "tokens_processados": 142850,
    "requisicoes_segundo": 84.5,
    "latencia_media_ms": 120.4,
    "status": "HEALTHY"
}

print(json.dumps(metrics, indent=2))
`,
    output: `{\n  "tokens_processados": 142850,\n  "requisicoes_segundo": 84.5,\n  "latencia_media_ms": 120.4,\n  "status": "HEALTHY"\n}`,
    executionCount: 2,
  },
];

export function JupyterApp() {
  const [cells, setCells] = useState<Cell[]>(INITIAL_CELLS);
  const [activeCellId, setActiveCellId] = useState<string>('cell-2');
  const [execCounter, setExecCounter] = useState(3);
  const [copied, setCopied] = useState(false);

  const addCell = (type: 'code' | 'markdown', afterId?: string) => {
    const newCell: Cell = {
      id: `cell-${Date.now()}`,
      type,
      content: type === 'code' ? '# Escreva seu código Python aqui\n' : '### Novo Bloco de Texto\n',
    };

    if (!afterId) {
      setCells([...cells, newCell]);
    } else {
      const idx = cells.findIndex((c) => c.id === afterId);
      const updated = [...cells];
      updated.splice(idx + 1, 0, newCell);
      setCells(updated);
    }
    setActiveCellId(newCell.id);
  };

  const deleteCell = (id: string) => {
    if (cells.length <= 1) return;
    setCells(cells.filter((c) => c.id !== id));
  };

  const updateCellContent = (id: string, content: string) => {
    setCells(cells.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  const runCell = async (id: string) => {
    const cell = cells.find((c) => c.id === id);
    if (!cell) return;

    if (cell.type === 'markdown') {
      return;
    }

    setCells((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isExecuting: true } : c))
    );

    // Simulação do runtime Python local / WebContainer
    await new Promise((res) => setTimeout(res, 450));

    let output = '';
    try {
      // Processamento básico para simulação de prints
      const lines = cell.content.split('\n');
      const prints: string[] = [];

      for (const line of lines) {
        if (line.trim().startsWith('print(')) {
          const match = line.match(/print\((.*)\)/);
          if (match) {
            let val = match[1].replace(/["']/g, '');
            if (val.startsWith('f')) val = val.substring(1);
            prints.push(val);
          }
        }
      }

      if (prints.length > 0) {
        output = prints.join('\n');
      } else {
        output = `Executado com sucesso [Retorno 0]`;
      }
    } catch {
      output = `Processo finalizado com saída padrão.`;
    }

    setCells((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isExecuting: false,
              output,
              executionCount: execCounter,
            }
          : c
      )
    );
    setExecCounter((prev) => prev + 1);
  };

  const runAllCells = async () => {
    for (const cell of cells) {
      if (cell.type === 'code') {
        await runCell(cell.id);
      }
    }
  };

  const exportNotebook = () => {
    const json = JSON.stringify(
      {
        cells: cells.map((c) => ({
          cell_type: c.type,
          source: c.content.split('\n'),
          outputs: c.output ? [{ text: c.output.split('\n') }] : [],
        })),
        metadata: { language: 'python' },
        nbformat: 4,
        nbformat_minor: 2,
      },
      null,
      2
    );

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notebook_anjosdevos.ipynb';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#080b12] text-slate-100 font-sans select-text">
      {/* Top Toolbar */}
      <div className="h-11 px-4 border-b border-white/10 bg-[#0d121f] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              Jupyter Notebook IDE
              <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Python 3.12 (Active)
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => runCell(activeCellId)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/40 text-xs font-medium transition-all"
            title="Executar Célula Atual (Shift+Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Executar</span>
          </button>

          <button
            onClick={runAllCells}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Executar Tudo</span>
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <button
            onClick={() => addCell('code', activeCellId)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>+ Código</span>
          </button>

          <button
            onClick={() => addCell('markdown', activeCellId)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-all"
          >
            <FileText className="w-3 h-3" />
            <span>+ Markdown</span>
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <button
            onClick={exportNotebook}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-cyan-400 transition-all"
            title="Exportar como .ipynb"
          >
            <Download className="w-3 h-3" />
            <span>Exportar .ipynb</span>
          </button>
        </div>
      </div>

      {/* Notebook Scrollable Cells Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-5xl mx-auto w-full">
        {cells.map((cell) => {
          const isActive = activeCellId === cell.id;

          return (
            <div
              key={cell.id}
              onClick={() => setActiveCellId(cell.id)}
              className={cn(
                'rounded-2xl border transition-all overflow-hidden bg-[#0c101d]/90',
                isActive
                  ? 'border-cyan-500/50 shadow-[0_10px_30px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              {/* Cell Header / Gutter */}
              <div className="px-3.5 py-1.5 bg-[#090d16] border-b border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    {cell.type === 'code' ? `In [${cell.executionCount || ' '}]:` : 'Markdown:'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 uppercase font-semibold">
                    {cell.type}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {cell.type === 'code' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runCell(cell.id);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-emerald-400"
                      title="Executar célula"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCell(cell.id);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400"
                    title="Excluir célula"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Cell Editor */}
              <div className="p-2">
                {cell.type === 'code' ? (
                  <div className="rounded-xl overflow-hidden border border-white/5">
                    <MonacoEditor
                      height={`${Math.max(70, cell.content.split('\n').length * 20 + 20)}px`}
                      language="python"
                      theme="vs-dark"
                      value={cell.content}
                      onChange={(val) => updateCellContent(cell.id, val || '')}
                      options={{
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        fontFamily: 'JetBrains Mono',
                        padding: { top: 8, bottom: 8 },
                        renderLineHighlight: 'none',
                      }}
                    />
                  </div>
                ) : (
                  <textarea
                    value={cell.content}
                    onChange={(e) => updateCellContent(cell.id, e.target.value)}
                    rows={Math.max(2, cell.content.split('\n').length)}
                    className="w-full bg-transparent p-2 text-sm text-slate-200 outline-none resize-none font-sans leading-relaxed"
                  />
                )}
              </div>

              {/* Cell Output */}
              {cell.output && cell.type === 'code' && (
                <div className="border-t border-white/5 bg-[#05070d] p-3 text-xs font-mono text-slate-300">
                  <div className="text-[10px] text-slate-500 mb-1">Out [{cell.executionCount}]:</div>
                  <pre className="p-2.5 rounded-lg bg-black/60 border border-white/5 text-emerald-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                    {cell.output}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}