'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  Star,
  Code,
  Terminal,
  Grid,
  List,
  Play,
  Check,
  Copy,
  FileCode,
  Sparkles,
  Info,
  Layers,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ALL_DEVTOOLS,
  DevTool,
  DevToolCategory,
  DEVTOOL_CATEGORY_LABELS,
  DEVTOOL_CATEGORY_COLORS,
  formatStars,
} from '@/lib/tools/devtools';
import { DevToolRunner } from '@/lib/tools/devtool-runner';
import { useOS } from '../OSContext';

type ViewMode = 'grid' | 'list';

export function DevToolsHubApp() {
  const { openApp } = useOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DevToolCategory | 'all'>('all');
  const [selectedTool, setSelectedTool] = useState<DevTool | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'stars' | 'downloads'>('stars');
  const [installedList, setInstalledList] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('devtools_installed') ?? '["continue", "aider", "cline", "openclaw"]') as string[];
      setInstalledList(stored);
    }
  }, []);

  const handleInstallToggle = (toolId: string) => {
    let updated: string[];
    if (installedList.includes(toolId)) {
      updated = installedList.filter(id => id !== toolId);
      setActionFeedback(`Ferramenta desinstalada.`);
    } else {
      updated = [...installedList, toolId];
      setActionFeedback(`Ferramenta instalada com sucesso!`);
    }
    setInstalledList(updated);
    localStorage.setItem('devtools_installed', JSON.stringify(updated));
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleCopyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLaunchTerminal = (toolId: string) => {
    openApp('terminal');
    setActionFeedback(`Abrindo terminal para executar ${toolId}...`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleOpenEditor = (toolId: string) => {
    openApp('codeeditor');
  };

  // Filter and sort tools
  const filteredTools = ALL_DEVTOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'stars') return b.stars - a.stars;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const stats = {
    total: ALL_DEVTOOLS.length,
    installed: installedList.length,
    categories: [...new Set(ALL_DEVTOOLS.map((t) => t.category))].length,
  };

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#07090e]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-mono">DevTools Hub & Ecosystem</h1>
            <p className="text-[10px] text-slate-400 font-mono">
              {stats.total} ferramentas • {stats.installed} ativas • Continue, Aider, Cline, OpenClaw
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actionFeedback && (
            <span className="text-xs text-neon-green font-mono px-3 py-1 bg-neon-green/10 border border-neon-green/30 rounded-lg animate-pulse">
              {actionFeedback}
            </span>
          )}
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-lg border transition-colors',
              viewMode === 'grid'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'text-slate-400 border-white/10 hover:bg-white/5'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-lg border transition-colors',
              viewMode === 'list'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'text-slate-400 border-white/10 hover:bg-white/5'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-white/10 bg-[#090d16]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ferramentas (ex: continue, aider, cline, openclaw)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#05070c] border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-400 font-mono"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs bg-[#05070c] border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 font-mono focus:outline-none"
        >
          <option value="stars">⭐ Mais Populares</option>
          <option value="name">📝 Nome (A-Z)</option>
          <option value="downloads">📥 Mais Baixados</option>
        </select>
      </div>

      {/* Content Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <div className="w-52 border-r border-white/10 overflow-y-auto p-3 space-y-1 bg-[#06080e]">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'w-full text-left px-3 py-2 text-xs rounded-xl transition-all font-mono',
              selectedCategory === 'all'
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:bg-white/5'
            )}
          >
            Todas ({ALL_DEVTOOLS.length})
          </button>
          {Object.entries(DEVTOOL_CATEGORY_LABELS)
            .filter(([key]) => ALL_DEVTOOLS.some((t) => t.category === key))
            .map(([key, label]) => {
              const count = ALL_DEVTOOLS.filter((t) => t.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as DevToolCategory)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs rounded-xl transition-all font-mono',
                    selectedCategory === key
                      ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                      : 'text-slate-400 hover:bg-white/5'
                  )}
                >
                  {label} ({count})
                </button>
              );
            })}
        </div>

        {/* Tools Grid/List */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#07090e]">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => {
                const isInstalled = installedList.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => setSelectedTool(tool)}
                    className={cn(
                      'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between',
                      selectedTool?.id === tool.id
                        ? 'bg-[#0e1322] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'bg-[#0b0e18] border-white/10 hover:border-white/20'
                    )}
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: `${tool.color}20`, borderColor: `${tool.color}40`, borderWidth: 1 }}
                        >
                          {tool.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-white font-mono truncate">
                              {tool.name}
                            </h3>
                            {isInstalled && (
                              <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                                Ativo
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 capitalize font-mono">
                            {tool.category.replace('-', ' ')} • {tool.author}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        {formatStars(tool.stars)}
                      </span>
                      <span>{tool.downloads}</span>
                      <span className="text-cyan-400 hover:underline flex items-center gap-1">
                        Ver detalhes →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTools.map((tool) => {
                const isInstalled = installedList.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => setSelectedTool(tool)}
                    className={cn(
                      'p-3.5 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all',
                      selectedTool?.id === tool.id
                        ? 'bg-[#0e1322] border-purple-500'
                        : 'bg-[#0b0e18] border-white/10 hover:border-white/20'
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: `${tool.color}20`, borderColor: `${tool.color}40`, borderWidth: 1 }}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white font-mono">
                          {tool.name}
                        </h3>
                        {isInstalled && (
                          <span className="px-1.5 py-0.5 text-[8px] rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 flex-shrink-0">
                      <span className="text-yellow-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400" /> {formatStars(tool.stars)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tool Detail Sidebar Panel */}
        {selectedTool && (
          <div className="w-96 border-l border-white/10 overflow-y-auto p-5 bg-[#0b0f1a] space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                style={{ backgroundColor: `${selectedTool.color}20`, borderColor: `${selectedTool.color}40`, borderWidth: 1 }}
              >
                {selectedTool.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-white font-mono">{selectedTool.name}</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedTool.author} • v{selectedTool.version}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">{selectedTool.description}</p>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleInstallToggle(selectedTool.id)}
                className={cn(
                  'w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg',
                  installedList.includes(selectedTool.id)
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:opacity-90'
                )}
              >
                {installedList.includes(selectedTool.id) ? (
                  <>
                    <Check className="w-4 h-4" /> Integrado ao AnjosDevOS
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Ativar Integração
                  </>
                )}
              </button>

              <button
                onClick={() => handleLaunchTerminal(selectedTool.id)}
                className="w-full py-2 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-mono text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5 text-neon-green" /> Abrir no Terminal
              </button>

              {DevToolRunner.getEditorConfig(selectedTool.id) && (
                <button
                  onClick={() => handleOpenEditor(selectedTool.id)}
                  className="w-full py-2 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-300 font-mono text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" /> Usar no Code Editor
                </button>
              )}
            </div>

            {/* Install Command Card */}
            <div className="p-3 rounded-xl bg-[#05070c] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Comando de Instalação</span>
                <button
                  onClick={() => handleCopyCommand(DevToolRunner.getInstallCommand(selectedTool.id), 'cmd')}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  {copiedId === 'cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'cmd' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <code className="text-xs text-neon-green font-mono block break-all">
                {DevToolRunner.getInstallCommand(selectedTool.id)}
              </code>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2">
                Funcionalidades
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedTool.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 text-[10px] rounded-lg bg-white/5 text-slate-300 border border-white/10 font-mono"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Models */}
            <div>
              <h3 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2">
                Modelos Compatíveis
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedTool.models.map((model) => (
                  <span
                    key={model}
                    className="px-2 py-1 text-[10px] rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>

            {/* External Links */}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <a
                href={selectedTool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-slate-200 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors font-mono"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Site Oficial
              </a>
              <a
                href={selectedTool.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-slate-200 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors font-mono"
              >
                <Code className="w-3.5 h-3.5 text-purple-400" /> Repositório
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}