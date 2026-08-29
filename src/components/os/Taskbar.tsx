'use client';

import { useState, useEffect } from 'react';
import { Zap, Wifi, Battery, MessageSquare, Image, Paintbrush, Video, Music, Mic, AudioLines, Wallet, Terminal, Settings, Info, Folder, Wrench, FileCode, Sparkles, Hand, Diamond, Blocks, Globe, FileText, Workflow, Users, Brain, Radio } from 'lucide-react';
import { useOS } from './OSContext';
import { APP_DEFINITIONS } from './types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Image: <Image className="w-4 h-4" />,
  Paintbrush: <Paintbrush className="w-4 h-4" />,
  Video: <Video className="w-4 h-4" />,
  Music: <Music className="w-4 h-4" />,
  Mic: <Mic className="w-4 h-4" />,
  AudioLines: <AudioLines className="w-4 h-4" />,
  Wallet: <Wallet className="w-4 h-4" />,
  Terminal: <Terminal className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
  Info: <Info className="w-4 h-4" />,
  Folder: <Folder className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  FileCode: <FileCode className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Hand: <Hand className="w-4 h-4" />,
  Diamond: <Diamond className="w-4 h-4" />,
  Blocks: <Blocks className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Workflow: <Workflow className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Brain: <Brain className="w-4 h-4" />,
  Radio: <Radio className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
};

export function Taskbar() {
  const { windows, activeWindowId, isStartMenuOpen, setStartMenuOpen, focusWindow, minimizeWindow } = useOS();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskClick = (windowId: string) => {
    const win = windows.find((w) => w.id === windowId);
    if (!win) return;
    if (win.isMinimized) {
      focusWindow(windowId);
    } else if (activeWindowId === windowId) {
      minimizeWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-cyber-card/95 backdrop-blur-xl border-t border-cyber-border flex items-center px-2 z-[9999]">
      {/* Start Button */}
      <button
        onClick={() => setStartMenuOpen(!isStartMenuOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 mr-2',
          isStartMenuOpen
            ? 'bg-neon-green/20 text-neon-green shadow-neon-green'
            : 'text-neon-green hover:bg-neon-green/10'
        )}
      >
        <Zap className="w-5 h-5" />
        <span className="text-xs font-bold hidden sm:inline">INICIO</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-cyber-border mx-1" />

      {/* Running Apps */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto px-1">
        {windows.map((win) => {
          const appDef = APP_DEFINITIONS.find((a) => a.id === win.appId);
          const isActive = activeWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              onClick={() => handleTaskClick(win.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0',
                isActive
                  ? `bg-${appDef?.color || 'neon-green'}/15 text-${appDef?.color || 'neon-green'} border border-${appDef?.color || 'neon-green'}/30`
                  : win.isMinimized
                  ? 'text-text-muted hover:bg-cyber-hover border border-transparent'
                  : 'text-text-secondary hover:bg-cyber-hover border border-transparent'
              )}
            >
              {ICON_MAP[appDef?.iconName || 'Terminal']}
              <span className="max-w-[100px] truncate hidden md:inline">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-cyber-border mx-1" />

      {/* System Tray */}
      <div className="flex items-center gap-3 px-2 text-text-muted">
        <Wifi className="w-3.5 h-3.5" />
        <Battery className="w-3.5 h-3.5" />
        <span className="text-[11px] font-mono tabular-nums">
          {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-[10px] font-mono text-text-muted hidden lg:inline">
          {time.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
