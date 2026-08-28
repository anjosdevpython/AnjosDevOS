'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  Check,
  X,
  Settings,
  FolderOpen,
  Package,
  Puzzle,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Trash2,
  Plus,
  Zap,
  Globe,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  THEIA_EXTENSIONS,
  TheiaExtension,
  TheiaExtensionCategory,
  THEIA_CATEGORY_LABELS,
  THEIA_CATEGORY_COLORS,
  formatDownloads,
} from '@/lib/integrations/theia';

type TabId = 'extensions' | 'workspaces' | 'settings';

export function TheiaApp() {
  const [activeTab, setActiveTab] = useState<TabId>('extensions');
  const [selectedCategory, setSelectedCategory] = useState<TheiaExtensionCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtension, setSelectedExtension] = useState<TheiaExtension | null>(null);

  // Config state
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>('dark');
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(2);
  const [wordWrap, setWordWrap] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [formatOnSave, setFormatOnSave] = useState(true);

  // Filter extensions
  const filteredExtensions = THEIA_EXTENSIONS.filter((ext) => {
    const matchesCategory = selectedCategory === 'all' || ext.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const installedCount = THEIA_EXTENSIONS.filter((e) => e.status === 'installed').length;

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-text-primary">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-border bg-cyber-card/50">
        <div className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 flex items-center justify-center">
          <span className="text-lg">💎</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-text-primary">Theia IDE</h1>
          <p className="text-[10px] text-text-muted font-mono">AI-Native Open IDE</p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/20">
            {installedCount} installed
          </span>
          <span className="px-2 py-0.5 rounded bg-cyber-bg text-text-muted border border-cyber-border">
            {THEIA_EXTENSIONS.length} available
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border">
        {[
          { id: 'extensions' as TabId, label: 'Extensions', icon: Puzzle },
          { id: 'workspaces' as TabId, label: 'Workspaces', icon: FolderOpen },
          { id: 'settings' as TabId, label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2',
              activeTab === tab.id
                ? 'text-[#0ea5e9] border-[#0ea5e9] bg-[#0ea5e9]/5'
                : 'text-text-muted border-transparent hover:text-text-secondary hover:bg-cyber-hover'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'extensions' && (
          <div className="flex h-full">
            {/* Categories Sidebar */}
            <div className="w-48 border-r border-cyber-border overflow-y-auto">
              <div className="p-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs rounded-lg mb-1 transition-colors',
                    selectedCategory === 'all'
                      ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                      : 'text-text-muted hover:bg-cyber-hover'
                  )}
                >
                  All Extensions ({THEIA_EXTENSIONS.length})
                </button>
                {Object.entries(THEIA_CATEGORY_LABELS)
                  .filter(([key]) =>
                    THEIA_EXTENSIONS.some((e) => e.category === key)
                  )
                  .map(([key, label]) => {
                    const count = THEIA_EXTENSIONS.filter(
                      (e) => e.category === key
                    ).length;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key as TheiaExtensionCategory)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-xs rounded-lg mb-1 transition-colors',
                          selectedCategory === key
                            ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                            : 'text-text-muted hover:bg-cyber-hover'
                        )}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Extensions Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-cyber-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar extensões..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-cyber-bg border border-cyber-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#0ea5e9]/50"
                  />
                </div>
              </div>

              {/* Extensions List */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {filteredExtensions.map((ext) => (
                    <div
                      key={ext.id}
                      onClick={() => setSelectedExtension(ext)}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all',
                        selectedExtension?.id === ext.id
                          ? 'border-[#0ea5e9]/50 bg-[#0ea5e9]/5'
                          : 'border-cyber-border hover:border-cyber-border/80 hover:bg-cyber-hover/50'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{ext.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-semibold text-text-primary truncate">
                              {ext.name}
                            </h3>
                            <span
                              className={cn(
                                'px-1.5 py-0.5 text-[9px] rounded-full font-medium',
                                ext.status === 'installed'
                                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                                  : 'bg-cyber-bg text-text-muted border border-cyber-border'
                              )}
                            >
                              {ext.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                            {ext.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-0.5 text-[9px] text-text-muted">
                              <Download className="w-2.5 h-2.5" />
                              {formatDownloads(ext.downloads)}
                            </span>
                            <span className="flex items-center gap-0.5 text-[9px] text-neon-yellow">
                              <Star className="w-2.5 h-2.5" />
                              {ext.rating}
                            </span>
                            <span className="text-[9px] text-text-muted">
                              v{ext.version}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Extension Detail */}
            {selectedExtension && (
              <div className="w-72 border-l border-cyber-border overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl">{selectedExtension.icon}</span>
                    <div>
                      <h2 className="text-sm font-bold text-text-primary">
                        {selectedExtension.name}
                      </h2>
                      <p className="text-[10px] text-text-muted">
                        {selectedExtension.author} • v{selectedExtension.version}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary mb-4">
                    {selectedExtension.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-text-primary">
                        {formatDownloads(selectedExtension.downloads)}
                      </p>
                      <p className="text-[9px] text-text-muted">Downloads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-neon-yellow">
                        {selectedExtension.rating}
                      </p>
                      <p className="text-[9px] text-text-muted">Rating</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedExtension.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[9px] rounded bg-cyber-bg text-text-muted border border-cyber-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {selectedExtension.status === 'available' ? (
                      <button className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#0ea5e9] bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-lg hover:bg-[#0ea5e9]/20 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Instalar
                      </button>
                    ) : (
                      <button className="w-full flex items-center justify-center gap-2 py-2 text-xs text-neon-red bg-neon-red/10 border border-neon-red/30 rounded-lg hover:bg-neon-red/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        Desinstalar
                      </button>
                    )}
                    <a
                      href="https://open-vsx.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 text-xs text-text-muted hover:text-text-primary border border-cyber-border rounded-lg hover:bg-cyber-hover transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open VSX Registry
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workspaces' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-text-primary">Workspaces</h2>
              <div className="flex-1" />
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#0ea5e9] bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-lg hover:bg-[#0ea5e9]/20 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Abrir Workspace
              </button>
            </div>

            <div className="space-y-2">
              {/* Sample workspaces */}
              {[
                { name: 'anjosdev-platform', path: '~/anjosdev-platform', active: true },
                { name: 'my-project', path: '~/projects/my-project', active: false },
                { name: 'open-source', path: '~/github/open-source', active: false },
              ].map((ws) => (
                <div
                  key={ws.name}
                  className={cn(
                    'glass-card p-3 flex items-center gap-3 cursor-pointer transition-all',
                    ws.active && 'border-[#0ea5e9]/30'
                  )}
                >
                  <FolderOpen
                    className={cn(
                      'w-5 h-5',
                      ws.active ? 'text-[#0ea5e9]' : 'text-text-muted'
                    )}
                  />
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-text-primary">{ws.name}</h3>
                    <p className="text-[10px] text-text-muted font-mono">{ws.path}</p>
                  </div>
                  {ws.active && (
                    <span className="px-2 py-0.5 text-[9px] rounded bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="text-sm font-bold text-text-primary mb-4">IDE Settings</h2>

            <div className="space-y-4">
              {/* Theme */}
              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-text-primary mb-3">Theme</h3>
                <div className="flex gap-2">
                  {[
                    { id: 'dark' as const, label: 'Dark', icon: Moon },
                    { id: 'light' as const, label: 'Light', icon: Sun },
                    { id: 'high-contrast' as const, label: 'HC', icon: Monitor },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2 text-xs rounded-lg transition-colors',
                        theme === t.id
                          ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30'
                          : 'text-text-muted border border-cyber-border hover:bg-cyber-hover'
                      )}
                    >
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="glass-card p-4 space-y-4">
                <h3 className="text-xs font-semibold text-text-primary">Editor</h3>

                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Font Size</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="flex-1 accent-[#0ea5e9]"
                    />
                    <span className="text-xs font-mono text-text-primary w-8">{fontSize}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Tab Size</label>
                  <div className="flex gap-2">
                    {[2, 4, 8].map((size) => (
                      <button
                        key={size}
                        onClick={() => setTabSize(size)}
                        className={cn(
                          'flex-1 py-1.5 text-xs rounded transition-colors',
                          tabSize === size
                            ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30'
                            : 'text-text-muted border border-cyber-border hover:bg-cyber-hover'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Word Wrap</span>
                  <button
                    onClick={() => setWordWrap(!wordWrap)}
                    className={cn(
                      'relative w-10 h-5 rounded-full transition-colors',
                      wordWrap ? 'bg-[#0ea5e9]/30' : 'bg-cyber-border'
                    )}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{ left: wordWrap ? '22px' : '2px', backgroundColor: wordWrap ? '#0ea5e9' : '#71717a' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Minimap</span>
                  <button
                    onClick={() => setMinimap(!minimap)}
                    className={cn(
                      'relative w-10 h-5 rounded-full transition-colors',
                      minimap ? 'bg-[#0ea5e9]/30' : 'bg-cyber-border'
                    )}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{ left: minimap ? '22px' : '2px', backgroundColor: minimap ? '#0ea5e9' : '#71717a' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Auto Save</span>
                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    className={cn(
                      'relative w-10 h-5 rounded-full transition-colors',
                      autoSave ? 'bg-[#0ea5e9]/30' : 'bg-cyber-border'
                    )}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{ left: autoSave ? '22px' : '2px', backgroundColor: autoSave ? '#0ea5e9' : '#71717a' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Format on Save</span>
                  <button
                    onClick={() => setFormatOnSave(!formatOnSave)}
                    className={cn(
                      'relative w-10 h-5 rounded-full transition-colors',
                      formatOnSave ? 'bg-[#0ea5e9]/30' : 'bg-cyber-border'
                    )}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{ left: formatOnSave ? '22px' : '2px', backgroundColor: formatOnSave ? '#0ea5e9' : '#71717a' }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
