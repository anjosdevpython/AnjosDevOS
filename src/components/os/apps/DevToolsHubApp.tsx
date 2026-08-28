'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  ExternalLink,
  Star,
  Code,
  Terminal,
  Puzzle,
  Zap,
  Brain,
  Globe,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Grid,
  List,
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

type ViewMode = 'grid' | 'list';

export function DevToolsHubApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DevToolCategory | 'all'>('all');
  const [selectedTool, setSelectedTool] = useState<DevTool | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'stars' | 'downloads'>('stars');

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
    installed: ALL_DEVTOOLS.filter((t) => t.status === 'installed').length,
    categories: [...new Set(ALL_DEVTOOLS.map((t) => t.category))].length,
  };

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-text-primary">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-border bg-cyber-card/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-lg">🛠️</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-text-primary">DevTools Hub</h1>
          <p className="text-[10px] text-text-muted font-mono">
            {stats.total} tools • {stats.categories} categories
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'grid'
                ? 'bg-purple-500/10 text-purple-400'
                : 'text-text-muted hover:bg-cyber-hover'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'list'
                ? 'bg-purple-500/10 text-purple-400'
                : 'text-text-muted hover:bg-cyber-hover'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-cyber-border bg-cyber-card/30">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tools..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-cyber-bg border border-cyber-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs bg-cyber-bg border border-cyber-border rounded-lg px-2 py-1.5 text-text-primary"
        >
          <option value="stars">⭐ Stars</option>
          <option value="name">📝 Nome</option>
          <option value="downloads">📥 Downloads</option>
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <div className="w-48 border-r border-cyber-border overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs rounded-lg mb-1 transition-colors',
                selectedCategory === 'all'
                  ? 'bg-purple-500/10 text-purple-400'
                  : 'text-text-muted hover:bg-cyber-hover'
              )}
            >
              All Tools ({ALL_DEVTOOLS.length})
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
                      'w-full text-left px-3 py-1.5 text-xs rounded-lg mb-1 transition-colors',
                      selectedCategory === key
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'text-text-muted hover:bg-cyber-hover'
                    )}
                  >
                    {label} ({count})
                  </button>
                );
              })}
          </div>
        </div>

        {/* Tools Grid/List */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className={cn(
                    'glass-card p-4 cursor-pointer transition-all hover:scale-[1.02]',
                    selectedTool?.id === tool.id && 'border-purple-500/50'
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${tool.color}20`, borderColor: `${tool.color}40`, borderWidth: 1 }}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-text-primary truncate">
                          {tool.name}
                        </h3>
                        {tool.status === 'installed' && (
                          <span className="px-1.5 py-0.5 text-[8px] rounded bg-neon-green/10 text-neon-green border border-neon-green/20">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted capitalize">
                        {tool.category.replace('-', ' ')}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-text-secondary line-clamp-2 mb-3">
                    {tool.description}
                  </p>

                  <div className="flex items-center gap-3 text-[9px] text-text-muted">
                    {tool.stars > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-neon-yellow" />
                        {formatStars(tool.stars)}
                      </span>
                    )}
                    <span>{tool.downloads}</span>
                    <span className="ml-auto">{tool.license}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className={cn(
                    'glass-card p-3 flex items-center gap-4 cursor-pointer transition-all',
                    selectedTool?.id === tool.id && 'border-purple-500/50'
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${tool.color}20`, borderColor: `${tool.color}40`, borderWidth: 1 }}
                  >
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-text-primary">
                        {tool.name}
                      </h3>
                      <span className="text-[9px] text-text-muted capitalize">
                        {tool.category.replace('-', ' ')}
                      </span>
                      {tool.status === 'installed' && (
                        <span className="px-1.5 py-0.5 text-[8px] rounded bg-neon-green/10 text-neon-green border border-neon-green/20">
                          Installed
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted line-clamp-1">
                      {tool.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-text-muted flex-shrink-0">
                    {tool.stars > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-neon-yellow" />
                        {formatStars(tool.stars)}
                      </span>
                    )}
                    <span>{tool.downloads}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tool Detail Panel */}
        {selectedTool && (
          <div className="w-80 border-l border-cyber-border overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${selectedTool.color}20`, borderColor: `${selectedTool.color}40`, borderWidth: 1 }}
                >
                  {selectedTool.icon}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary">{selectedTool.name}</h2>
                  <p className="text-[10px] text-text-muted">
                    {selectedTool.author} • v{selectedTool.version}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-text-secondary mb-4">{selectedTool.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-cyber-bg border border-cyber-border">
                  <p className="text-sm font-bold text-neon-yellow">
                    {formatStars(selectedTool.stars)}
                  </p>
                  <p className="text-[9px] text-text-muted">Stars</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-cyber-bg border border-cyber-border">
                  <p className="text-sm font-bold text-text-primary">
                    {selectedTool.downloads}
                  </p>
                  <p className="text-[9px] text-text-muted">Downloads</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-cyber-bg border border-cyber-border">
                  <p className="text-sm font-bold text-text-primary">
                    {selectedTool.license}
                  </p>
                  <p className="text-[9px] text-text-muted">License</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <h3 className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  Features
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedTool.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-0.5 text-[9px] rounded bg-cyber-bg text-text-secondary border border-cyber-border"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div className="mb-4">
                <h3 className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedTool.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-2 py-0.5 text-[9px] rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 capitalize"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {/* Models */}
              <div className="mb-4">
                <h3 className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  Supported Models
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedTool.models.map((model) => (
                    <span
                      key={model}
                      className="px-2 py-0.5 text-[9px] rounded bg-neon-green/10 text-neon-green border border-neon-green/20"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <h3 className="text-[10px] text-text-muted uppercase tracking-wider mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedTool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[9px] rounded bg-cyber-bg text-text-muted border border-cyber-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2">
                <a
                  href={selectedTool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 text-xs text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
                <a
                  href={selectedTool.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 text-xs text-text-primary bg-cyber-bg border border-cyber-border rounded-lg hover:bg-cyber-hover transition-colors"
                >
                  <Code className="w-3.5 h-3.5" />
                  Repository
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
