'use client';

import { useState, useEffect, useRef } from 'react';
import { WorkspaceRepository, type Workspace } from '@/lib/workspaces';
import { WorkspaceExporter } from '@/lib/workspaces/workspaceExporter';
import { useOS } from '../OSContext';
import {
  FolderPlus,
  Trash2,
  FolderOpen,
  Layers,
  FileCode,
  CheckCircle,
  Plus,
  Download,
  Upload,
} from 'lucide-react';

export function WorkspacesApp() {
  const { openApp } = useOS();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newWsName, setNewWsName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'ai-swarm' | 'node' | 'react'>('ai-swarm');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadWorkspaces = async () => {
    const list = await WorkspaceRepository.getAllWorkspaces();
    setWorkspaces(list);
    const active = WorkspaceRepository.getActiveWorkspaceId();
    setActiveId(active || (list[0] ? list[0].id : null));
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    await WorkspaceRepository.createWorkspace(
      newWsName.trim(),
      selectedTemplate,
      `Workspace criado em ${new Date().toLocaleDateString('pt-BR')}`
    );

    setNewWsName('');
    setIsCreating(false);
    await loadWorkspaces();
    openApp('codeeditor');
  };

  const handleOpen = (wsId: string) => {
    WorkspaceRepository.setActiveWorkspaceId(wsId);
    setActiveId(wsId);
    openApp('codeeditor');
  };

  const handleDelete = async (wsId: string) => {
    if (confirm('Tem certeza que deseja excluir este workspace?')) {
      await WorkspaceRepository.deleteWorkspace(wsId);
      await loadWorkspaces();
    }
  };

  const handleExportZip = async (ws: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
    await WorkspaceExporter.downloadZip(ws);
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await WorkspaceExporter.importFromZip(file);
    await loadWorkspaces();
    if (fileInputRef.current) fileInputRef.current.value = '';
    openApp('codeeditor');
  };

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 p-6 overflow-y-auto font-sans">
      {/* Hidden File Input for ZIP Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleImportZip}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6 select-none">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-mono">Gerenciador de Workspaces</h1>
            <p className="text-xs text-slate-400">
              Ambientes de desenvolvimento isolados com persistência IndexedDB, WebContainers e exportação ZIP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-mono transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" /> Importar ZIP
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs hover:opacity-90 transition-opacity font-mono shadow-md"
          >
            <Plus className="w-4 h-4" /> Novo Workspace
          </button>
        </div>
      </div>

      {/* Modal de Criação */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-[#0e1322] border border-cyan-500/40 shadow-2xl mb-6 space-y-4 animate-slide-in"
        >
          <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-cyan-400" /> Criar Novo Workspace
          </h2>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-mono">Nome do Workspace</label>
            <input
              type="text"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="ex: Minha API com IA Swarm"
              className="w-full px-3 py-2 text-xs bg-[#05070c] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-mono">Template Inicial</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'ai-swarm', label: '⚡ AI Swarm Agent', desc: 'Projeto com 7 agentes integrados' },
                { id: 'node', label: '🚀 Node.js Backend', desc: 'Servidor HTTP leve' },
                { id: 'react', label: '⚛️ React + Vite', desc: 'Frontend moderno com componentes' },
              ].map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTemplate === tpl.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <p className="text-xs font-bold">{tpl.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-1.5 rounded-xl bg-white/10 text-slate-300 text-xs hover:bg-white/20"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:opacity-90 font-mono"
            >
              Criar e Abrir no Editor
            </button>
          </div>
        </form>
      )}

      {/* Lista de Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeId;
          const fileCount = Object.keys(ws.files || {}).length;

          return (
            <div
              key={ws.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-[#0d1527] border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'bg-[#0b0e18] border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileCode className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <h3 className="text-sm font-bold text-white font-mono truncate">{ws.name}</h3>
                  </div>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                      <CheckCircle className="w-3 h-3" /> Ativo
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {ws.description || 'Workspace autônomo'}
                </p>

                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mb-4">
                  <span>📁 {fileCount} arquivos</span>
                  <span>•</span>
                  <span>Modificado: {new Date(ws.updatedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <button
                  onClick={() => handleOpen(ws.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-colors font-mono"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Abrir no IDE
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleExportZip(ws, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    title="Baixar Workspace (.zip)"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(ws.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Excluir workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
