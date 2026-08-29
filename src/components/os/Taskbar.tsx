'use client';

import { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
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
  Sparkles,
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
  Cpu,
  Layers,
} from 'lucide-react';
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
  Network: <Network className="w-4 h-4" />,
  Bot: <Bot className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
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
    <div className="fixed bottom-2.5 left-3 right-3 sm:left-6 sm:right-6 h-12 bg-[#090d17]/85 backdrop-blur-2xl border border-white/15 rounded-2xl flex items-center px-2.5 z-[9999] shadow-[0_15px_35px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]">
      {/* Start Button */}
      <button
        onClick={() => setStartMenuOpen(!isStartMenuOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 mr-2 group',
          isStartMenuOpen
            ? 'bg-cyan-500/25 border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/30'
        )}
      >
        <div className="w-6 h-5 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="AnjosDevOS"
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,210,255,0.8)] group-hover:scale-105 transition-transform"
          />
        </div>
        <span className="text-xs font-black gradient-text font-mono tracking-wider hidden sm:inline">
          INÍCIO
        </span>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Running Apps */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto px-1">
        {windows.map((win) => {
          const appDef = APP_DEFINITIONS.find((a) => a.id === win.appId);
          const isActive = activeWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              onClick={() => handleTaskClick(win.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 shrink-0 border relative',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : win.isMinimized
                  ? 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:text-slate-200'
                  : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10'
              )}
            >
              <span className={`text-${appDef?.color || 'cyan-400'}`}>
                {ICON_MAP[appDef?.iconName || 'Terminal']}
              </span>
              <span className="max-w-[110px] truncate hidden md:inline font-mono text-[11px]">
                {win.title}
              </span>
              {/* Active Dot */}
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  isActive ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,1)]' : 'bg-slate-500'
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* System Status Tray */}
      <div className="flex items-center gap-3 px-2.5 text-slate-300 text-xs font-mono">
        {/* Swarm Live Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Swarm 7/7</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          <Battery className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        <span className="text-[11px] font-semibold text-slate-100 tabular-nums">
          {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
