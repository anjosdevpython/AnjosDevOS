'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Sparkles,
  Zap,
  ExternalLink,
  MessageSquare,
  Image,
  Paintbrush,
  Video,
  Music,
  Mic,
  AudioLines,
  Wallet,
  Terminal,
  Settings,
  Info,
  Folder,
  Wrench,
  FileCode,
  Hand,
  Diamond,
  Blocks,
  Globe,
  FileText,
  Workflow,
  Users,
  Brain,
  Radio,
  Network,
  Bot,
  Layers,
} from 'lucide-react';
import { useOS } from './OSContext';
import { APP_DEFINITIONS } from './types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-5 h-5" />,
  Image: <Image className="w-5 h-5" />,
  Paintbrush: <Paintbrush className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  Mic: <Mic className="w-5 h-5" />,
  AudioLines: <AudioLines className="w-5 h-5" />,
  Wallet: <Wallet className="w-5 h-5" />,
  Terminal: <Terminal className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  Info: <Info className="w-5 h-5" />,
  Folder: <Folder className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
  FileCode: <FileCode className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Hand: <Hand className="w-5 h-5" />,
  Diamond: <Diamond className="w-5 h-5" />,
  Blocks: <Blocks className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Workflow: <Workflow className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  Radio: <Radio className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Network: <Network className="w-5 h-5" />,
  Bot: <Bot className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
};

export function StartMenu() {
  const { isStartMenuOpen, setStartMenuOpen, openApp } = useOS();
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'tools' | 'system'>('all');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.closest('[data-start-button]')) return;
        setStartMenuOpen(false);
      }
    }
    if (isStartMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStartMenuOpen, setStartMenuOpen]);

  if (!isStartMenuOpen) return null;

  const filteredApps = APP_DEFINITIONS.filter((app) => {
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div
      ref={menuRef}
      className="fixed bottom-16 left-3 sm:left-6 w-[450px] max-w-[calc(100vw-24px)] max-h-[75vh] flex flex-col rounded-3xl bg-[#090d18]/92 backdrop-blur-3xl border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] z-[10000] animate-slide-in overflow-hidden"
    >
      {/* Top Header with Brand */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-600/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-9 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="AnjosDevOS Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(0,210,255,0.7)]"
            />
          </div>
          <div>
            <h2 className="text-sm font-black gradient-text font-mono tracking-wider">AnjosDevOS</h2>
            <p className="text-[10px] text-cyan-300 font-mono">Autonomous AI Operating System v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>7 Agentes Swarm</span>
        </div>
      </div>

      {/* Quick Search Input */}
      <div className="p-3 border-b border-white/10 bg-white/5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar apps, ferramentas e agentes..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#060911] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-cyan-400 outline-none transition-colors"
            autoFocus
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-1 mt-2 text-[10px] font-mono">
          {[
            { id: 'all', label: '⚡ Todos' },
            { id: 'ai', label: '🧠 IA' },
            { id: 'tools', label: '🛠️ Ferramentas' },
            { id: 'system', label: '⚙️ Sistema' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all',
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-3 gap-2">
        {filteredApps.map((app) => (
          <button
            key={app.id}
            onClick={() => {
              openApp(app.id);
              setStartMenuOpen(false);
            }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-400/30 transition-all group active:scale-95"
          >
            <div
              className={`p-2.5 rounded-xl bg-${app.color || 'cyan-400'}/10 text-${app.color || 'cyan-400'} border border-${app.color || 'cyan-400'}/20 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]`}
            >
              {ICON_MAP[app.iconName] || <Terminal className="w-5 h-5" />}
            </div>
            <span className="text-[11px] font-semibold text-slate-200 text-center truncate max-w-full group-hover:text-white">
              {app.title}
            </span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-[#070a12] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>by Allan Anjos</span>
        <a
          href="https://allananjos.dev.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline flex items-center gap-1"
        >
          allananjos.dev.br <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
