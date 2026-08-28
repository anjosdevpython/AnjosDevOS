'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Settings,
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  ExternalLink,
  Terminal,
  Brain,
  Zap,
  Package,
  Layers,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DSH_PLUGINS,
  DSH_PROFILES,
  DSHPlugin,
  DSHPluginCategory,
  DSHAgent,
  DSHTask,
  DSHProfile,
  getPluginsByCategory,
  getInstalledPlugins,
  getProfilePlugins,
  DSH_CATEGORY_LABELS,
  DSH_CATEGORY_COLORS,
} from '@/lib/integrations/deepseek-harness';

type TabId = 'plugins' | 'agents' | 'profiles' | 'logs';

export function DSHApp() {
  const [activeTab, setActiveTab] = useState<TabId>('plugins');
  const [selectedCategory, setSelectedCategory] = useState<DSHPluginCategory | 'all'>('all');
  const [selectedPlugin, setSelectedPlugin] = useState<DSHPlugin | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<DSHAgent[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<DSHProfile>(DSH_PROFILES[0]);
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);

  // Filter plugins
  const filteredPlugins = DSH_PLUGINS.filter((plugin) => {
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get stats
  const installedCount = getInstalledPlugins().length;
  const availableCount = DSH_PLUGINS.filter((p) => p.status === 'available').length;

  // Create new agent
  const createAgent = () => {
    const name = prompt('Nome do agent:', `Agent-${agents.length + 1}`);
    if (!name) return;

    const newAgent: DSHAgent = {
      id: `agent-${Date.now()}`,
      name,
      description: `Agent criado com perfil ${selectedProfile.name}`,
      model: 'deepseek-chat',
      plugins: selectedProfile.plugins,
      status: 'idle',
      createdAt: new Date(),
      tasks: [],
    };

    setAgents((prev) => [...prev, newAgent]);
  };

  // Toggle agent status
  const toggleAgentStatus = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, status: a.status === 'running' ? 'paused' : 'running' }
          : a
      )
    );
  };

  // Stop agent
  const stopAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: 'idle' } : a))
    );
  };

  // Delete agent
  const deleteAgent = (agentId: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
  };

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-text-primary">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-border bg-cyber-card/50">
        <div className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 flex items-center justify-center">
          <span className="text-lg">🔮</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-text-primary">DeepSeek Harness</h1>
          <p className="text-[10px] text-text-muted font-mono">Everything is a Plugin</p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
            {installedCount} installed
          </span>
          <span className="px-2 py-0.5 rounded bg-cyber-bg text-text-muted border border-cyber-border">
            {availableCount} available
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border">
        {[
          { id: 'plugins' as TabId, label: 'Plugins', icon: Package },
          { id: 'agents' as TabId, label: 'Agents', icon: Bot },
          { id: 'profiles' as TabId, label: 'Profiles', icon: Layers },
          { id: 'logs' as TabId, label: 'Logs', icon: Clock },
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
        {activeTab === 'plugins' && (
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
                  Todos ({DSH_PLUGINS.length})
                </button>
                {Object.entries(DSH_CATEGORY_LABELS).map(([key, label]) => {
                  const count = getPluginsByCategory(key as DSHPluginCategory).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key as DSHPluginCategory)}
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

            {/* Plugins Grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-cyber-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar plugins..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-cyber-bg border border-cyber-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#0ea5e9]/50"
                  />
                </div>
              </div>

              {/* Plugins List */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {filteredPlugins.map((plugin) => (
                    <div
                      key={plugin.id}
                      onClick={() => setSelectedPlugin(plugin)}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all',
                        selectedPlugin?.id === plugin.id
                          ? 'border-[#0ea5e9]/50 bg-[#0ea5e9]/5'
                          : 'border-cyber-border hover:border-cyber-border/80 hover:bg-cyber-hover/50'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{plugin.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-semibold text-text-primary truncate">
                              {plugin.name}
                            </h3>
                            <span
                              className={cn(
                                'px-1.5 py-0.5 text-[9px] rounded-full font-medium',
                                plugin.status === 'installed'
                                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                                  : plugin.status === 'available'
                                  ? 'bg-cyber-bg text-text-muted border border-cyber-border'
                                  : 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20'
                              )}
                            >
                              {plugin.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                            {plugin.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="px-1.5 py-0.5 text-[9px] rounded"
                              style={{
                                backgroundColor: `${DSH_CATEGORY_COLORS[plugin.category]}15`,
                                color: DSH_CATEGORY_COLORS[plugin.category],
                              }}
                            >
                              {plugin.category}
                            </span>
                            <span className="text-[9px] text-text-muted">v{plugin.version}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Plugin Detail */}
            {selectedPlugin && (
              <div className="w-72 border-l border-cyber-border overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{selectedPlugin.icon}</span>
                    <div>
                      <h2 className="text-sm font-bold text-text-primary">
                        {selectedPlugin.name}
                      </h2>
                      <p className="text-[10px] text-text-muted">
                        {selectedPlugin.author} • v{selectedPlugin.version}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary mb-4">
                    {selectedPlugin.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedPlugin.tags.map((tag) => (
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
                    {selectedPlugin.status === 'available' ? (
                      <button className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#0ea5e9] bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-lg hover:bg-[#0ea5e9]/20 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Instalar
                      </button>
                    ) : selectedPlugin.status === 'installed' ? (
                      <button className="w-full flex items-center justify-center gap-2 py-2 text-xs text-neon-red bg-neon-red/10 border border-neon-red/30 rounded-lg hover:bg-neon-red/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        Desinstalar
                      </button>
                    ) : null}

                    {selectedPlugin.repository && (
                      <a
                        href={selectedPlugin.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-2 text-xs text-text-muted hover:text-text-primary border border-cyber-border rounded-lg hover:bg-cyber-hover transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Repository
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="h-full flex flex-col p-4">
            {/* Agents Header */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-text-primary">Agents</h2>
              <div className="flex-1" />
              <button
                onClick={createAgent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#0ea5e9] bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-lg hover:bg-[#0ea5e9]/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Agent
              </button>
            </div>

            {/* Agents List */}
            {agents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
                <Brain className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Nenhum agent criado</p>
                <p className="text-xs mt-1">
                  Clique em "Novo Agent" para criar um agent com o perfil selecionado
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          agent.status === 'running'
                            ? 'bg-neon-green/10 border border-neon-green/30'
                            : agent.status === 'paused'
                            ? 'bg-neon-yellow/10 border border-neon-yellow/30'
                            : 'bg-cyber-bg border border-cyber-border'
                        )}
                      >
                        <Brain
                          className={cn(
                            'w-5 h-5',
                            agent.status === 'running'
                              ? 'text-neon-green'
                              : agent.status === 'paused'
                              ? 'text-neon-yellow'
                              : 'text-text-muted'
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-semibold text-text-primary">
                            {agent.name}
                          </h3>
                          <span
                            className={cn(
                              'px-1.5 py-0.5 text-[9px] rounded-full font-medium',
                              agent.status === 'running'
                                ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                                : agent.status === 'paused'
                                ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20'
                                : 'bg-cyber-bg text-text-muted border border-cyber-border'
                            )}
                          >
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted">
                          {agent.plugins.length} plugins • {agent.model}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleAgentStatus(agent.id)}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            agent.status === 'running'
                              ? 'text-neon-yellow hover:bg-neon-yellow/10'
                              : 'text-neon-green hover:bg-neon-green/10'
                          )}
                          title={agent.status === 'running' ? 'Pausar' : 'Iniciar'}
                        >
                          {agent.status === 'running' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => stopAgent(agent.id)}
                          className="p-1.5 rounded text-text-muted hover:text-neon-red hover:bg-neon-red/10 transition-colors"
                          title="Parar"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAgent(agent.id)}
                          className="p-1.5 rounded text-text-muted hover:text-neon-red hover:bg-neon-red/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-text-primary mb-1">DSH Profiles</h2>
              <p className="text-xs text-text-muted">
                Perfis de composição de plugins para diferentes cenários
              </p>
            </div>

            <div className="space-y-3">
              {DSH_PROFILES.map((profile) => (
                <div key={profile.id} className="glass-card overflow-hidden">
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-cyber-hover/50 transition-colors"
                    onClick={() =>
                      setExpandedProfile(expandedProfile === profile.id ? null : profile.id)
                    }
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        profile.isDefault
                          ? 'bg-[#0ea5e9]/10 border border-[#0ea5e9]/30'
                          : 'bg-cyber-bg border border-cyber-border'
                      )}
                    >
                      <Layers
                        className={cn(
                          'w-4 h-4',
                          profile.isDefault ? 'text-[#0ea5e9]' : 'text-text-muted'
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-text-primary">
                          {profile.name}
                        </h3>
                        {profile.isDefault && (
                          <span className="px-1.5 py-0.5 text-[9px] rounded bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted">
                        {profile.description} • {profile.plugins.length} plugins
                      </p>
                    </div>
                    {expandedProfile === profile.id ? (
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    )}
                  </div>

                  {/* Profile Plugins */}
                  {expandedProfile === profile.id && (
                    <div className="border-t border-cyber-border p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {getProfilePlugins(profile.id).map((plugin) => (
                          <span
                            key={plugin.id}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-cyber-bg border border-cyber-border"
                          >
                            <span>{plugin.icon}</span>
                            <span className="text-text-secondary">{plugin.name}</span>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setSelectedProfile(profile)}
                          className={cn(
                            'flex-1 py-1.5 text-xs rounded-lg transition-colors',
                            selectedProfile.id === profile.id
                              ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30'
                              : 'text-text-muted border border-cyber-border hover:bg-cyber-hover'
                          )}
                        >
                          {selectedProfile.id === profile.id ? 'Selecionado' : 'Selecionar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="h-full flex flex-col items-center justify-center text-text-muted">
            <Clock className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Nenhum log ainda</p>
            <p className="text-xs mt-1">
              Os logs aparecerão aqui quando agents forem executados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Bot icon component
function Bot({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
