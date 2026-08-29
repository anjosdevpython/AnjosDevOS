'use client';

import { useEffect, useRef } from 'react';
import { Zap, MessageSquare, Image, Paintbrush, Video, Music, Mic, AudioLines, Wallet, Terminal, Settings, Info, Folder, Wrench, FileCode, Sparkles, Hand, Diamond, Blocks, Globe, FileText, Workflow, Users, Brain, Radio, Network } from 'lucide-react';
import { useOS } from './OSContext';
import { APP_DEFINITIONS } from './types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  Image: <Image className="w-6 h-6" />,
  Paintbrush: <Paintbrush className="w-6 h-6" />,
  Video: <Video className="w-6 h-6" />,
  Music: <Music className="w-6 h-6" />,
  Mic: <Mic className="w-6 h-6" />,
  AudioLines: <AudioLines className="w-6 h-6" />,
  Wallet: <Wallet className="w-6 h-6" />,
  Terminal: <Terminal className="w-6 h-6" />,
  Settings: <Settings className="w-6 h-6" />,
  Info: <Info className="w-6 h-6" />,
  Folder: <Folder className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
  FileCode: <FileCode className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Hand: <Hand className="w-6 h-6" />,
  Diamond: <Diamond className="w-6 h-6" />,
  Blocks: <Blocks className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  Workflow: <Workflow className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Brain: <Brain className="w-6 h-6" />,
  Radio: <Radio className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Network: <Network className="w-6 h-6" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  ai: '🧠 Inteligência Artificial',
  tools: '🛠️ Ferramentas',
  system: '⚙️ Sistema',
};

export function StartMenu() {
  const { isStartMenuOpen, setStartMenuOpen, openApp } = useOS();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Don't close if clicking the start button
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

  const categories = ['ai', 'tools', 'system'] as const;

  return (
    <div
      ref={menuRef}
      className="fixed bottom-14 left-2 w-[420px] max-h-[70vh] overflow-y-auto rounded-2xl bg-cyber-card/95 backdrop-blur-2xl border border-cyber-border shadow-[0_0_60px_rgba(0,0,0,0.5)] z-[10000] animate-slide-in"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-cyber-border">
        <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center animate-glow">
          <Zap className="w-5 h-5 text-neon-green" />
        </div>
        <div>
          <h2 className="text-sm font-bold gradient-text">AnjosDevOS</h2>
          <p className="text-[10px] text-text-muted font-mono">AI Operating System v1.0</p>
        </div>
      </div>

      {/* App Categories */}
      <div className="p-3">
        {categories.map((cat) => {
          const apps = APP_DEFINITIONS.filter((a) => a.category === cat);
          if (apps.length === 0) return null;
          return (
            <div key={cat} className="mb-3 last:mb-0">
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider px-2 mb-1.5">
                {CATEGORY_LABELS[cat]}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openApp(app.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200',
                      'hover:bg-cyber-hover text-text-secondary hover:text-text-primary',
                      `hover:border-${app.color}/30 border border-transparent`
                    )}
                  >
                    <div className={`text-${app.color}`}>
                      {ICON_MAP[app.iconName]}
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight">{app.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
