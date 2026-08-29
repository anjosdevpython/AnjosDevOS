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
  Github,
  Lock,
  Globe,
  ExternalLink,
  RefreshCw,
  X,
} from 'lucide-react';

interface GitHubModalState {
  open: boolean;
  workspace: Workspace | null;
  token: string;
  repoName: string;
  isPrivate: boolean;
  commitMessage: string;
  loading: boolean;
  result: { success: boolean; message: string; repoUrl?: string } | null;
}

export function WorkspacesApp() {
  const { openApp } = useOS();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newWsName, setNewWsName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'ai-swarm' | 'node' | 'react'>('ai-swarm');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gh, setGh] = useState<GitHubModalState>({
    open: false,
    workspace: null,
    token: '',
    repoName: '',
    isPrivate: true,
    commitMessage: '',
    loading: false,
    result: null,
  });

  const loadWorkspaces = async () => {
    const list = await WorkspaceRepository.getAllWorkspaces();
    setWorkspaces(list);
    const active = WorkspaceRepository.getActiveWorkspaceId();
    setActiveId(active || (list[0] ? list[0].id : null));
  };

  useEffect(() => {
    loadWorkspaces();
    // Restore saved GitHub token (only token, never stored on server)
    const savedToken = localStorage.getItem('gh_pat');
    if (savedToken) setGh((prev) => ({ ...prev, token: savedToken }));
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

  const openGitHubModal = (ws: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = localStorage.getItem('gh_pat') ?? '';
    setGh((prev) => ({
      ...prev,
      open: true,
      workspace: ws,
      repoName: ws.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      commitMessage: `feat: sync workspace "${ws.name}" via AnjosDevOS`,
      token: saved,
      result: null,
      loading: false,
    }));
  };

  const handleGitHubPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gh.workspace || !gh.token || !gh.repoName) return;

    // Salvar token localmente (apenas no browser do usuário)
    localStorage.setItem('gh_pat', gh.token);

    setGh((prev) => ({ ...prev, loading: true, result: null }));

    try {
      const files: Record<string, string> = {};
      if (gh.workspace.files) {
        for (const [path, fileObj] of Object.entries(gh.workspace.files)) {
          files[path] = typeof fileObj === 'string' ? fileObj : (fileObj as { content?: string }).content ?? '';
        }
      }

      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: gh.token,
          repoName: gh.repoName,
          isPrivate: gh.isPrivate,
          files,
          commitMessage: gh.commitMessage,
          workspaceName: gh.workspace.name,
          workspaceDescription: gh.workspace.description,
        }),
      });

      const data = await res.json() as { success: boolean; message: string; repoUrl?: string };
      setGh((prev) => ({ ...prev, loading: false, result: data }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setGh((prev) => ({ ...prev, loading: false, result: { success: false, message: msg } }));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 p-6 overflow-y-auto font-sans">
      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept=".zip" onChange={handleImportZip} className="hidden" />

      {/* GitHub Sync Modal */}
      {gh.open && gh.workspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleGitHubPush}
            className="w-full max-w-md bg-[#0b0f1a] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 animate-slide-in"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-white" />
                <h2 className="text-sm font-bold text-white font-mono">Sincronizar com GitHub</h2>
              </div>
              <button
                type="button"
                onClick={() => setGh((prev) => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Workspace: <span className="text-cyan-400">{gh.workspace.name}</span>
            </p>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-mono">
                GitHub Personal Access Token
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=AnjosDevOS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Gerar token <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="password"
                value={gh.token}
                onChange={(e) => setGh((prev) => ({ ...prev, token: e.target.value }))}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 text-xs bg-[#05070c] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
                required
              />
              <p className="text-[10px] text-slate-500">Salvo no seu browser (localStorage). Nunca vai ao servidor.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-mono">Nome do Repositório</label>
              <input
                type="text"
                value={gh.repoName}
                onChange={(e) => setGh((prev) => ({ ...prev, repoName: e.target.value }))}
                placeholder="meu-workspace"
                className="w-full px-3 py-2 text-xs bg-[#05070c] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-mono">Mensagem do Commit</label>
              <input
                type="text"
                value={gh.commitMessage}
                onChange={(e) => setGh((prev) => ({ ...prev, commitMessage: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-[#05070c] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGh((prev) => ({ ...prev, isPrivate: !prev.isPrivate }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors border ${
                  gh.isPrivate
                    ? 'bg-slate-700/40 border-slate-600 text-slate-300'
                    : 'bg-green-500/10 border-green-500/30 text-green-400'
                }`}
              >
                {gh.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {gh.isPrivate ? 'Privado' : 'Público'}
              </button>
              <span className="text-[10px] text-slate-500">Clique para alternar</span>
            </div>

            {gh.result && (
              <div
                className={`p-3 rounded-xl text-xs font-mono border ${
                  gh.result.success
                    ? 'bg-green-500/10 border-green-500/30 text-green-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <p>{gh.result.message}</p>
                {gh.result.repoUrl && (
                  <a
                    href={gh.result.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-1 text-cyan-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> {gh.result.repoUrl}
                  </a>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGh((prev) => ({ ...prev, open: false }))}
                className="px-4 py-1.5 rounded-xl bg-white/10 text-slate-300 text-xs hover:bg-white/20"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={gh.loading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gray-900 border border-white/20 text-white font-bold text-xs hover:bg-gray-800 transition-colors font-mono disabled:opacity-50"
              >
                {gh.loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Github className="w-3.5 h-3.5" />
                )}
                {gh.loading ? 'Enviando...' : 'Push para GitHub'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6 select-none">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-mono">Gerenciador de Workspaces</h1>
            <p className="text-xs text-slate-400">
              Ambientes isolados com IndexedDB · WebContainers · ZIP · GitHub Sync
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
                { id: 'ai-swarm', label: 'AI Swarm Agent', desc: 'Projeto com 7 agentes integrados' },
                { id: 'node', label: 'Node.js Backend', desc: 'Servidor HTTP leve' },
                { id: 'react', label: 'React + Vite', desc: 'Frontend moderno' },
              ].map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id as 'ai-swarm' | 'node' | 'react')}
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
                  {ws.description || 'Workspace autonomo'}
                </p>

                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mb-4">
                  <span>Arquivos: {fileCount}</span>
                  <span>•</span>
                  <span>{new Date(ws.updatedAt).toLocaleDateString('pt-BR')}</span>
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
                    onClick={(e) => openGitHubModal(ws, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Sincronizar com GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </button>

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