'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Terminal,
  RotateCcw,
  Zap,
  Layers,
  Send,
  Loader2,
  Workflow,
  Globe,
  Radio,
  FileCode,
} from 'lucide-react';
import { FlowRepository } from '@/lib/automation/flowRepository';
import { FlowExecutor } from '@/lib/automation/flowExecutor';
import type { Flow, FlowNode, FlowRunLogItem } from '@/lib/automation/types';
import { cn } from '@/lib/utils';

export function AutomationStudioApp() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<FlowRunLogItem[]>([]);
  const [showLogs, setShowLogs] = useState(true);

  // Carrega os fluxos do Dexie
  const loadFlows = async () => {
    const list = await FlowRepository.getAllFlows();
    setFlows(list);
    if (list.length > 0 && !selectedFlowId) {
      setSelectedFlowId(list[0].id);
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const currentFlow = flows.find((f) => f.id === selectedFlowId) || flows[0];

  // Executa o fluxo de automação com FlowExecutor
  const handleExecuteFlow = async () => {
    if (!currentFlow || isRunning) return;
    setIsRunning(true);
    setTerminalLogs([]);

    // Reset status dos nós
    const updatedNodes = currentFlow.nodes.map((n) => ({ ...n, status: 'idle' as const }));
    setFlows((prev) =>
      prev.map((f) => (f.id === currentFlow.id ? { ...f, nodes: updatedNodes } : f))
    );

    try {
      await FlowExecutor.executeFlow(currentFlow, {}, ({ nodeId, status, log }) => {
        setTerminalLogs((prev) => [...prev, log]);
        setFlows((prev) =>
          prev.map((f) => {
            if (f.id !== currentFlow.id) return f;
            return {
              ...f,
              nodes: f.nodes.map((n) => (n.id === nodeId ? { ...n, status } : n)),
            };
          })
        );
      });
    } finally {
      setIsRunning(false);
      await loadFlows();
    }
  };

  // Gerador de Fluxo por IA (Prompt-to-Flow)
  const handleGenerateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/automation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });

      const data = await res.json();
      if (data.success && data.flow) {
        await FlowRepository.saveFlow(data.flow);
        await loadFlows();
        setSelectedFlowId(data.flow.id);
        setAiPrompt('');
      }
    } catch (err) {
      console.error('Erro ao gerar fluxo:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteFlow = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fluxo?')) {
      await FlowRepository.deleteFlow(id);
      await loadFlows();
      const remaining = flows.filter((f) => f.id !== id);
      if (remaining.length > 0) setSelectedFlowId(remaining[0].id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <div className="h-11 px-4 bg-[#0d121f] border-b border-white/10 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-cyan-400" />
            <h1 className="text-sm font-bold text-white font-mono">Automation Studio v2.0</h1>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-bold">
            PROMPT-TO-FLOW + DEXIE RUNNER
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExecuteFlow}
            disabled={isRunning || !currentFlow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-bold text-xs hover:opacity-90 transition-opacity font-mono shadow-md disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executando...' : 'Executar Fluxo'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Flows List & Prompt-to-Flow */}
        <div className="w-80 bg-[#090d18] border-r border-white/10 flex flex-col shrink-0">
          {/* Prompt-to-Flow AI Generator */}
          <div className="p-3 border-b border-white/10 bg-gradient-to-br from-cyan-950/20 to-blue-950/20">
            <span className="text-[11px] font-bold text-cyan-300 font-mono flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Gerar Fluxo com IA
            </span>
            <form onSubmit={handleGenerateFlow} className="space-y-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Descreva o fluxo: ex: Monitorar commits, auditar com IA e notificar..."
                className="w-full h-16 p-2 text-xs bg-[#05070c] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 resize-none font-sans"
              />
              <button
                type="submit"
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isGenerating ? 'Criando Nós...' : 'Gerar Grafo'}</span>
              </button>
            </form>
          </div>

          {/* Flows List */}
          <div className="p-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Meus Fluxos ({flows.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {flows.map((flow) => {
              const isSelected = flow.id === (currentFlow?.id || '');
              return (
                <div
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  className={cn(
                    'p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group',
                    isSelected
                      ? 'bg-[#0e1526] border-cyan-500/50 shadow-md'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-white truncate max-w-[180px] font-mono">
                      {flow.name}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFlow(flow.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{flow.description}</p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400/80 mt-2">
                    <span>{flow.nodes.length} nós</span>
                    <span className="capitalize">{flow.triggerType}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#05070d] relative">
          {/* Canvas Background Dot Matrix */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* Flow Info Bar */}
          <div className="h-10 px-4 bg-[#080c16]/90 border-b border-white/10 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono">{currentFlow?.name}</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                ({currentFlow?.nodes.length} nós conectados)
              </span>
            </div>

            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs text-cyan-400 font-mono hover:underline flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" /> {showLogs ? 'Ocultar Terminal' : 'Ver Logs'}
            </button>
          </div>

          {/* Interactive Flow Nodes Canvas */}
          <div className="flex-1 overflow-auto p-8 relative flex items-center justify-center">
            <div className="flex items-center gap-6 overflow-x-auto p-4">
              {currentFlow?.nodes.map((node, index) => {
                const isNodeRunning = node.status === 'running';
                const isNodeSuccess = node.status === 'success';
                const isNodeFailed = node.status === 'failed';

                return (
                  <div key={node.id} className="flex items-center gap-6 shrink-0">
                    {/* Node Card */}
                    <div
                      className={cn(
                        'w-56 p-3.5 rounded-2xl border backdrop-blur-2xl transition-all relative overflow-hidden shadow-xl',
                        isNodeRunning
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse'
                          : isNodeSuccess
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                          : isNodeFailed
                          ? 'bg-red-950/30 border-red-500/60'
                          : 'bg-[#0d121f]/90 border-white/15'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono uppercase text-cyan-300 font-bold">
                          {node.type}
                        </span>
                        {isNodeSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isNodeRunning && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                      </div>

                      <h4 className="text-xs font-bold text-white font-mono">{node.name}</h4>

                      {node.config.prompt && (
                        <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 italic">
                          "{node.config.prompt}"
                        </p>
                      )}

                      {node.config.url && (
                        <p className="text-[10px] text-cyan-300 mt-1 truncate font-mono">
                          {node.config.method} {node.config.url}
                        </p>
                      )}

                      {node.durationMs !== undefined && (
                        <div className="mt-2 text-[9px] text-emerald-300 font-mono">
                          Tempo: {node.durationMs}ms
                        </div>
                      )}
                    </div>

                    {/* Arrow to Next Node */}
                    {index < currentFlow.nodes.length - 1 && (
                      <div className="text-cyan-500 animate-pulse">
                        <Zap className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Execution Telemetry Terminal */}
          {showLogs && (
            <div className="h-44 border-t border-white/10 bg-[#07090e] p-3 flex flex-col shrink-0 font-mono text-xs z-10">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Telemetria de Execução do Fluxo
                </span>
                <span className="text-[10px] text-slate-500">{terminalLogs.length} eventos</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 text-[11px]">
                {terminalLogs.length === 0 ? (
                  <p className="text-slate-500">
                    Aguardando execução... Clique em "Executar Fluxo" para rodar os nós.
                  </p>
                ) : (
                  terminalLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500">[{log.timestamp}]</span>
                      <span className="text-cyan-400 font-bold">[{log.nodeName}]</span>
                      <span
                        className={
                          log.level === 'error'
                            ? 'text-red-400'
                            : log.level === 'warn'
                            ? 'text-amber-400'
                            : log.level === 'success'
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
