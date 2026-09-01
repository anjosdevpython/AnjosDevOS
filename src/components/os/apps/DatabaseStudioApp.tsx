'use client';

import React, { useState } from 'react';
import {
  Database,
  Play,
  Table,
  Plus,
  RefreshCw,
  Download,
  Search,
  Check,
  Code2,
  HardDrive,
  Layers,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface TableSchema {
  name: string;
  rowCount: number;
  columns: { name: string; type: string; isPrimary?: boolean }[];
}

const TABLES: TableSchema[] = [
  {
    name: 'workspaces',
    rowCount: 3,
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true },
      { name: 'name', type: 'TEXT' },
      { name: 'file_count', type: 'INTEGER' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'last_opened_at', type: 'TIMESTAMP' },
    ],
  },
  {
    name: 'audit_logs',
    rowCount: 142,
    columns: [
      { name: 'id', type: 'INTEGER', isPrimary: true },
      { name: 'provider', type: 'VARCHAR(32)' },
      { name: 'model', type: 'VARCHAR(64)' },
      { name: 'tokens_in', type: 'INTEGER' },
      { name: 'tokens_out', type: 'INTEGER' },
      { name: 'latency_ms', type: 'FLOAT' },
      { name: 'status', type: 'VARCHAR(16)' },
    ],
  },
  {
    name: 'ai_employees',
    rowCount: 8,
    columns: [
      { name: 'id', type: 'VARCHAR(32)', isPrimary: true },
      { name: 'name', type: 'TEXT' },
      { name: 'role', type: 'TEXT' },
      { name: 'status', type: 'VARCHAR(16)' },
      { name: 'tasks_completed', type: 'INTEGER' },
    ],
  },
];

const INITIAL_ROWS = [
  { id: 1, provider: 'aimlapi', model: 'openai/gpt-5-5', tokens_in: 540, tokens_out: 1280, latency_ms: 114.2, status: '200_OK' },
  { id: 2, provider: 'openai', model: 'gpt-4o', tokens_in: 320, tokens_out: 890, latency_ms: 98.4, status: '200_OK' },
  { id: 3, provider: 'deepseek', model: 'deepseek-r1', tokens_in: 1200, tokens_out: 4300, latency_ms: 240.1, status: '200_OK' },
  { id: 4, provider: 'anthropic', model: 'claude-3-5-sonnet', tokens_in: 850, tokens_out: 2100, latency_ms: 152.0, status: '200_OK' },
  { id: 5, provider: 'google', model: 'gemini-2.5-pro', tokens_in: 2400, tokens_out: 5800, latency_ms: 180.6, status: '200_OK' },
];

export function DatabaseStudioApp() {
  const [query, setQuery] = useState(
    '-- Consulta de Telemetria e Logs em Tempo Real\nSELECT id, provider, model, tokens_in, tokens_out, latency_ms, status\nFROM audit_logs\nORDER BY id DESC\nLIMIT 50;'
  );
  const [selectedTable, setSelectedTable] = useState<string>('audit_logs');
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [executionTime, setExecutionTime] = useState<number | null>(14);
  const [isRunning, setIsRunning] = useState(false);

  const runQuery = async () => {
    setIsRunning(true);
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 200));
    const elapsed = Math.round(performance.now() - start);
    setExecutionTime(elapsed);
    setIsRunning(false);
  };

  const exportCSV = () => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [headers, ...rows.map((r) => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#080b12] text-slate-100 font-sans select-none">
      {/* Top Header */}
      <div className="h-11 px-4 border-b border-white/10 bg-[#0d121f] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              Database & SQL Studio
              <span className="px-1.5 py-0.2 text-[9px] rounded bg-cyan-500/20 text-cyan-300 font-mono">
                SQLite / IndexedDB Engine
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runQuery}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/50 text-xs font-medium transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? 'Executando...' : 'Executar SQL (F5)'}</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs"
          >
            <Download className="w-3 h-3" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Sidebar Left (Tables/Schemas), Query + Table Right */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Tables Sidebar */}
        <div className="w-60 border-r border-white/10 bg-[#0a0d16] flex flex-col min-h-0 flex-shrink-0">
          <div className="p-3 border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              Tabelas ({TABLES.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {TABLES.map((tbl) => (
              <button
                key={tbl.name}
                onClick={() => {
                  setSelectedTable(tbl.name);
                  setQuery(`SELECT * FROM ${tbl.name} LIMIT 50;`);
                }}
                className={cn(
                  'w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col gap-1',
                  selectedTable === tbl.name
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium'
                    : 'hover:bg-white/5 text-slate-300 border border-transparent'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5" />
                    {tbl.name}
                  </span>
                  <span className="text-[10px] opacity-60 font-mono">{tbl.rowCount} rows</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {tbl.columns.map((c) => c.name).join(', ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Query Editor + Results Data Grid */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#07090e]">
          {/* SQL Editor Pane */}
          <div className="h-44 border-b border-white/10 flex flex-col min-h-0">
            <MonacoEditor
              height="100%"
              language="sql"
              theme="vs-dark"
              value={query}
              onChange={(val) => setQuery(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'JetBrains Mono',
                padding: { top: 10, bottom: 10 },
                lineNumbers: 'on',
              }}
            />
          </div>

          {/* Results Status Bar */}
          <div className="h-8 px-4 bg-[#0c101d] border-b border-white/10 flex items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
            <span>Resultados: {rows.length} registros</span>
            {executionTime !== null && (
              <span className="text-emerald-400">Tempo de execução: {executionTime}ms</span>
            )}
          </div>

          {/* Table Data Grid */}
          <div className="flex-1 overflow-auto p-4 select-text">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/15 bg-white/5 text-cyan-300">
                  {rows.length > 0 &&
                    Object.keys(rows[0]).map((col) => (
                      <th key={col} className="p-2.5 font-bold tracking-wider">
                        {col}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="p-2.5">
                        {typeof val === 'number' ? (
                          <span className="text-emerald-400">{val}</span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}