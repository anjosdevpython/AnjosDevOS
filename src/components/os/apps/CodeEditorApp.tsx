'use client';

import { useState, useEffect } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import {
  Play,
  Save,
  Sparkles,
  Terminal as TerminalIcon,
  ShieldAlert,
  FileCode,
  Folder,
  Layers,
  X,
  Plus,
  Zap,
  Trash2,
} from 'lucide-react';
import {
  getSwarmEngine,
  type SwarmCollaborationSession,
  type SwarmTaskStep,
  type SwarmAgentDefinition,
} from '@/lib/agent-swarm';
import { llmAudit, type LLMAuditResult } from '@/lib/agent-swarm/llm-audit';
import { VitestRunner, type VitestRunSummary } from '@/lib/runtime/vitest-runner';
import { WorkspaceRepository, type Workspace } from '@/lib/workspaces';
import { TerminalPanel } from '../panels/Terminal';
import { cn } from '@/lib/utils';

export function CodeEditorApp() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>(['src/index.ts']);
  const [activeFile, setActiveFile] = useState<string>('src/index.ts');
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    'src/index.ts': `// AnjosDevOS — Autonomous AI Swarm IDE
import { getSwarmEngine } from '@/lib/agent-swarm';

async function bootstrap() {
  console.log("⚡ AnjosDevOS IDE inicializado com sucesso.");
  const swarm = getSwarmEngine();
  console.log("👥 7 Agentes Especialistas prontos para colaborar.");
}

bootstrap().catch(console.error);
`,
    'package.json': JSON.stringify(
      {
        name: 'anjosdev-workspace',
        version: '1.0.0',
        main: 'src/index.ts',
        scripts: { start: 'node src/index.ts', test: 'vitest run' },
      },
      null,
      2
    ),
    'README.md': '# AnjosDevOS IDE\nDesenvolvimento autônomo com IA.\n',
  });

  const [activeTab, setActiveTab] = useState<'swarm' | 'audit' | 'tests' | 'agents'>('swarm');
  const [swarmGoal, setSwarmGoal] = useState('');
  const [isRunningSwarm, setIsRunningSwarm] = useState(false);
  const [currentSession, setCurrentSession] = useState<SwarmCollaborationSession | null>(null);

  const [auditResult, setAuditResult] = useState<LLMAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const [testResult, setTestResult] = useState<VitestRunSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const [showTerminal, setShowTerminal] = useState(true);
  const [showSwarmPanel, setShowSwarmPanel] = useState(true);
  const [showDiffView, setShowDiffView] = useState(false);
  const [diffOriginal, setDiffOriginal] = useState('');
  const [diffModified, setDiffModified] = useState('');

  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  // Carrega o workspace ativo
  const loadActiveWorkspace = async () => {
    const activeId = WorkspaceRepository.getActiveWorkspaceId();
    let ws: Workspace | null = null;

    if (activeId) {
      ws = await WorkspaceRepository.getWorkspace(activeId);
    }

    if (!ws) {
      const all = await WorkspaceRepository.getAllWorkspaces();
      ws = all[0] || null;
    }

    if (ws) {
      setWorkspace(ws);
      setFileContents(ws.files || {});
      const files = Object.keys(ws.files || {});
      if (files.length > 0) {
        setOpenFiles(ws.openTabs && ws.openTabs.length > 0 ? ws.openTabs : [files[0]]);
        setActiveFile(ws.activeFilePath || files[0]);
      }
    }
  };

  useEffect(() => {
    loadActiveWorkspace();
  }, []);

  const currentCode = fileContents[activeFile] || '';

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    setFileContents((prev) => ({ ...prev, [activeFile]: value }));
  };

  const handleSave = async () => {
    if (!workspace) return;
    await WorkspaceRepository.saveFile(workspace.id, activeFile, currentCode);
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !workspace) return;

    const path = newFileName.startsWith('src/') ? newFileName : `src/${newFileName}`;
    const initialContent = path.endsWith('.json') ? '{\n  \n}' : '// Novo arquivo\n';

    await WorkspaceRepository.saveFile(workspace.id, path, initialContent);
    setFileContents((prev) => ({ ...prev, [path]: initialContent }));
    if (!openFiles.includes(path)) {
      setOpenFiles((prev) => [...prev, path]);
    }
    setActiveFile(path);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const handleDeleteFile = async (path: string) => {
    if (!workspace || confirm(`Excluir ${path}?`)) {
      if (workspace) await WorkspaceRepository.deleteFile(workspace.id, path);
      setFileContents((prev) => {
        const next = { ...prev };
        delete next[path];
        return next;
      });
      setOpenFiles((prev) => prev.filter((p) => p !== path));
      const remaining = Object.keys(fileContents).filter((p) => p !== path);
      if (remaining.length > 0) setActiveFile(remaining[0]);
    }
  };

  // Dispara o Swarm Engine
  const runSwarm = async () => {
    if (!swarmGoal.trim() || isRunningSwarm) return;
    setIsRunningSwarm(true);
    const engine = getSwarmEngine();

    const unsubscribe = engine.subscribe((event: { type: string; payload: any }) => {
      if (event.type === 'session:start') setCurrentSession(event.payload);
      if (event.type === 'message:new' || event.type === 'task:complete') {
        const active = engine.getActiveSession();
        if (active) setCurrentSession({ ...active });
      }
    });

    try {
      const session = await engine.executeCollaborativeCodingTask(swarmGoal, currentCode, activeFile);
      setCurrentSession(session);

      // Se houver código gerado pelo Coder, atualiza o arquivo com Diff
      if (session.finalResult?.code) {
        setDiffOriginal(currentCode);
        setDiffModified(session.finalResult.code);
        setShowDiffView(true);
      }
    } finally {
      unsubscribe();
      setIsRunningSwarm(false);
    }
  };

  // Executa Auditoria LLM Real
  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await llmAudit({
        code: currentCode,
        fileName: activeFile,
      });
      setAuditResult(result);
    } finally {
      setIsAuditing(false);
    }
  };

  // Executa Testes Vitest Reais
  const runTests = async () => {
    setIsRunningTests(true);
    try {
      const summary = await VitestRunner.runTests(currentCode, activeFile);
      setTestResult(summary);
    } finally {
      setIsRunningTests(false);
    }
  };

  const applyPatch = () => {
    if (diffModified) {
      setFileContents((prev) => ({ ...prev, [activeFile]: diffModified }));
      handleSave();
      setShowDiffView(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* Top IDE Toolbar */}
      <div className="h-10 px-3 bg-[#0d121f] border-b border-white/10 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span className="truncate max-w-[140px]">{workspace?.name || 'Workspace'}</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Quick Actions */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" /> Salvar
          </button>

          <button
            onClick={runAudit}
            disabled={isAuditing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono transition-colors"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>{isAuditing ? 'Auditando...' : 'Auditar'}</span>
          </button>

          <button
            onClick={runTests}
            disabled={isRunningTests}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono transition-colors"
          >
            <Zap className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin text-cyan-400' : 'text-purple-400'}`} />
            <span>{isRunningTests ? 'Testando...' : 'Rodar Testes'}</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {showDiffView && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-[10px] text-amber-400 font-mono">Modo Diff Ativo</span>
              <button
                onClick={applyPatch}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-xs font-mono hover:opacity-90"
              >
                Aplicar Patch
              </button>
              <button
                onClick={() => setShowDiffView(false)}
                className="px-2 py-1 rounded-lg bg-white/10 text-slate-300 text-xs hover:bg-white/20"
              >
                Fechar Diff
              </button>
            </div>
          )}

          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={cn(
              'p-1.5 rounded-lg border text-xs transition-colors',
              showTerminal ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'
            )}
            title="Alternar Terminal"
          >
            <TerminalIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSwarmPanel(!showSwarmPanel)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all',
              showSwarmPanel
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>IA Swarm</span>
          </button>
        </div>
      </div>

      {/* Main 4-Panel Grid Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: File Tree Sidebar */}
        <div className="w-56 bg-[#090d18] border-r border-white/10 flex flex-col shrink-0">
          <div className="p-2.5 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-cyan-400" /> Arquivos
            </span>
            <button
              onClick={() => setIsCreatingFile(!isCreatingFile)}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Novo Arquivo"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form novo arquivo */}
          {isCreatingFile && (
            <form onSubmit={handleCreateFile} className="p-2 border-b border-white/10 bg-white/5">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="nome-arquivo.ts"
                className="w-full px-2 py-1 text-xs bg-[#05070c] border border-cyan-500/40 rounded text-white outline-none font-mono"
                autoFocus
              />
            </form>
          )}

          {/* Lista de Arquivos */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 font-mono text-xs">
            {Object.keys(fileContents).map((filePath) => {
              const isActive = activeFile === filePath;
              return (
                <div
                  key={filePath}
                  onClick={() => {
                    if (!openFiles.includes(filePath)) setOpenFiles((prev) => [...prev, filePath]);
                    setActiveFile(filePath);
                  }}
                  className={cn(
                    'flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors group',
                    isActive ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{filePath}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(filePath);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Section: Editor & Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Tabs Bar */}
          <div className="h-9 bg-[#0b0f1d] border-b border-white/10 flex items-center overflow-x-auto px-1 gap-1 select-none">
            {openFiles.map((file) => {
              const isActive = activeFile === file;
              return (
                <div
                  key={file}
                  onClick={() => setActiveFile(file)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-mono cursor-pointer border-t border-x transition-colors shrink-0',
                    isActive
                      ? 'bg-[#07090e] border-white/15 text-cyan-300 font-bold border-t-cyan-400'
                      : 'bg-[#0e1322] border-transparent text-slate-400 hover:bg-[#11172a]'
                  )}
                >
                  <span>{file.split('/').pop()}</span>
                  {openFiles.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenFiles((prev) => prev.filter((f) => f !== file));
                        if (activeFile === file) {
                          const remaining = openFiles.filter((f) => f !== file);
                          if (remaining.length > 0) setActiveFile(remaining[0]);
                        }
                      }}
                      className="hover:text-red-400 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Monaco Editor / Diff Editor Container */}
          <div className="flex-1 overflow-hidden relative">
            {showDiffView ? (
              <DiffEditor
                original={diffOriginal}
                modified={diffModified}
                language={activeFile.endsWith('.json') ? 'json' : 'typescript'}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  renderSideBySide: true,
                }}
              />
            ) : (
              <Editor
                value={currentCode}
                onChange={handleCodeChange}
                language={
                  activeFile.endsWith('.json')
                    ? 'json'
                    : activeFile.endsWith('.md')
                    ? 'markdown'
                    : 'typescript'
                }
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            )}
          </div>

          {/* Panel 4: Bottom Terminal */}
          {showTerminal && (
            <div className="h-48 border-t border-white/10 bg-[#07090e] flex flex-col shrink-0">
              <div className="h-7 px-3 bg-[#0d121f] border-b border-white/10 flex items-center justify-between select-none">
                <span className="text-[11px] font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" /> Terminal do Workspace
                </span>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <TerminalPanel workspaceFiles={fileContents} />
              </div>
            </div>
          )}
        </div>

        {/* Panel 3: Right AI Swarm Panel */}
        {showSwarmPanel && (
          <div className="w-96 bg-[#090d18] border-l border-white/10 flex flex-col shrink-0">
            {/* Swarm Tabs */}
            <div className="flex border-b border-white/10 bg-[#0c101e] p-1 gap-1">
              {[
                { id: 'swarm', label: '⚡ Enxame' },
                { id: 'audit', label: '🛡️ Auditoria' },
                { id: 'tests', label: '🧪 Testes' },
                { id: 'agents', label: '👥 Time' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex-1 py-1.5 text-[11px] font-mono rounded-lg transition-all',
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activeTab === 'swarm' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-cyan-300 font-mono block mb-1">
                      Objetivo de Codificação
                    </label>
                    <textarea
                      value={swarmGoal}
                      onChange={(e) => setSwarmGoal(e.target.value)}
                      placeholder="ex: Criar endpoint REST de autenticação com validação Zod e testes unitários..."
                      className="w-full h-20 p-2.5 text-xs bg-[#05070c] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 font-sans resize-none"
                    />
                  </div>

                  <button
                    onClick={runSwarm}
                    disabled={isRunningSwarm || !swarmGoal.trim()}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs hover:opacity-90 transition-opacity font-mono flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isRunningSwarm ? 'animate-spin' : ''}`} />
                    <span>{isRunningSwarm ? 'Enxame Executando...' : 'Disparar Enxame'}</span>
                  </button>

                  {/* Sessão Ativa / Progresso */}
                  {currentSession && (
                    <div className="p-3 rounded-xl bg-[#0e1424] border border-cyan-500/30 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-cyan-300 font-mono">Status do Plano</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                          {currentSession.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {currentSession.steps.map((task: SwarmTaskStep) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40 text-[11px]"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-cyan-400 font-mono">{task.agentName}:</span>
                              <span className="text-slate-300 truncate">{task.action}</span>
                            </div>
                            <span
                              className={cn(
                                'text-[9px] font-mono px-1.5 py-0.5 rounded',
                                task.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400'
                              )}
                            >
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">Auditoria OWASP & Qualidade</span>
                    <button
                      onClick={runAudit}
                      disabled={isAuditing}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-mono hover:bg-cyan-500/30"
                    >
                      {isAuditing ? 'Auditando...' : 'Reauditar'}
                    </button>
                  </div>

                  {auditResult ? (
                    <div className="space-y-3">
                      {/* Score Card */}
                      <div className="p-3.5 rounded-xl bg-[#0e1424] border border-cyan-500/30 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono">Índice de Qualidade</p>
                          <h3 className="text-2xl font-black text-emerald-400 font-mono">
                            {auditResult.score}/100
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                            Risco: {auditResult.securityAnalysis.riskLevel}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">{auditResult.source.toUpperCase()}</p>
                        </div>
                      </div>

                      {/* Lista de Achados */}
                      <div className="space-y-2">
                        {auditResult.issues.map((issue, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-red-400">{issue.title}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono">
                                Linha {issue.line || 1}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300">{issue.description}</p>
                            <p className="text-[10px] text-cyan-300 italic">Sugestão: {issue.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Clique em "Auditar" para rodar a análise de segurança estática e OWASP com IA.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">Suíte Vitest Unitária</span>
                    <button
                      onClick={runTests}
                      disabled={isRunningTests}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-mono hover:bg-purple-500/30"
                    >
                      {isRunningTests ? 'Executando...' : 'Rodar Testes'}
                    </button>
                  </div>

                  {testResult ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-[#0e1424] border border-purple-500/30 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono">Status dos Testes</p>
                          <h3 className="text-xl font-bold text-emerald-400 font-mono">
                            {testResult.passedCount}/{testResult.total} Passaram
                          </h3>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                          {testResult.durationMs}ms
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {testResult.tests.map((t, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40 text-xs"
                          >
                            <span className="text-slate-200 truncate">✓ {t.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{t.durationMs}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Clique em "Rodar Testes" para gerar e executar a suíte de testes Vitest no WebContainer.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'agents' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-cyan-300 font-mono block mb-2">
                    7 Agentes Especialistas (Multi-Model)
                  </span>
                  {getSwarmEngine()
                    .getAllAgents()
                    .map((agent: SwarmAgentDefinition) => (
                      <div
                        key={agent.id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <h4 className="text-xs font-bold text-white font-mono">{agent.name}</h4>
                          </div>
                          <p className="text-[10px] text-slate-400">{agent.role}</p>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono">
                          {agent.model}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
