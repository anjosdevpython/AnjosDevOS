'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Search,
  Sliders,
  Battery,
  Layers,
  Power,
  RotateCcw,
  Info,
  Monitor,
  Smartphone,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useOS } from '@/components/os/OSContext';
import { APP_DEFINITIONS, type AppDefinition, type WindowState } from '@/components/os/types';
import { cn } from '@/lib/utils';

interface MacOSMenuBarProps {
  onOpenSpotlight: () => void;
  onToggleControlCenter: () => void;
  onOpenLaunchpad: () => void;
  uiMode: 'macos' | 'cyber' | 'mobile';
  onChangeUiMode: (mode: 'macos' | 'cyber' | 'mobile') => void;
}

export function MacOSMenuBar({
  onOpenSpotlight,
  onToggleControlCenter,
  onOpenLaunchpad,
  uiMode,
  onChangeUiMode,
}: MacOSMenuBarProps) {
  const { openApp, windows, activeWindowId } = useOS();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeWindow = windows.find((w: WindowState) => w.id === activeWindowId);
  const activeAppDef = activeWindow ? APP_DEFINITIONS.find((a: AppDefinition) => a.id === activeWindow.appId) : null;
  const currentAppName = activeAppDef?.title || 'Finder';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={menuRef}
      className="fixed top-0 left-0 right-0 h-[28px] bg-[#12151e]/75 backdrop-blur-3xl border-b border-white/10 text-slate-100 text-[13px] flex items-center justify-between px-3 z-[99990] select-none font-sans shadow-sm"
    >
      {/* Left Menu Items */}
      <div className="flex items-center gap-0.5">
        {/* Apple Logo Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'apple' ? null : 'apple')}
            className={cn(
              'px-2 py-0.5 rounded transition-colors flex items-center justify-center',
              openDropdown === 'apple' ? 'bg-white/20' : 'hover:bg-white/10'
            )}
          >
            <svg width="14" height="14" viewBox="0 0 170 170" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-5.77-8.91-10.29-19.1-13.56-30.55-3.26-11.46-4.9-22.38-4.9-32.77 0-14.35 3.83-26.15 11.5-35.4 7.66-9.26 17.11-13.98 28.35-14.17 4.9 0 10.42 1.25 16.57 3.75 6.14 2.5 10.15 3.8 12.02 3.9 1.45 0 5.67-1.42 12.67-4.25 7-2.83 13.06-4.04 18.17-3.64 13.92.76 24.58 5.76 32 15-12.18 7.39-18.17 17.51-17.97 30.34.2 10.01 4.14 18.39 11.83 25.13 7.69 6.74 16.76 10.61 27.2 11.62-2.17 6.74-4.88 13.52-8.13 20.35zM119.22 33.05c0-7.39 2.68-14.41 8.04-21.06 5.36-6.65 12.1-10.99 20.22-13.02.2 1.3.3 2.5.3 3.6 0 7.39-2.78 14.51-8.34 21.36-5.56 6.85-12.33 11.19-20.22 13.02-.2-1.3-.3-2.5-.3-3.6z" />
            </svg>
          </button>

          {openDropdown === 'apple' && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-[#161a25]/95 backdrop-blur-3xl border border-white/15 rounded-xl shadow-2xl p-1.5 space-y-0.5 z-[99999] animate-slide-in">
              <button
                onClick={() => {
                  openApp('about');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Info className="w-3.5 h-3.5" /> Sobre o AnjosDevOS
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  openApp('settings');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" /> Ajustes do Sistema...
              </button>
              <button
                onClick={() => {
                  onOpenLaunchpad();
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" /> Launchpad
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => window.location.reload()}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Sistema...
              </button>
              <button
                onClick={() => alert('Sessão encerrada.')}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors text-red-300"
              >
                <Power className="w-3.5 h-3.5" /> Desligar...
              </button>
            </div>
          )}
        </div>

        {/* Current Active App Name */}
        <span className="font-bold text-xs px-2 py-0.5 rounded hover:bg-white/10 cursor-default">
          {currentAppName}
        </span>

        {/* Menu Bar Headers */}
        {['Arquivo', 'Editar', 'Visualizar', 'Janela', 'Ajuda'].map((menu) => (
          <button
            key={menu}
            onClick={() => setOpenDropdown(openDropdown === menu ? null : menu)}
            className={cn(
              'px-2 py-0.5 rounded text-xs transition-colors hidden sm:inline-block',
              openDropdown === menu ? 'bg-white/20' : 'hover:bg-white/10 text-slate-200'
            )}
          >
            {menu}
          </button>
        ))}
      </div>

      {/* Right Status Items */}
      <div className="flex items-center gap-1.5">
        {/* Switch Skin / UI Mode Dropdown (Integrated into macOS MenuBar) */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'skin' ? null : 'skin')}
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors',
              openDropdown === 'skin' ? 'bg-white/20' : 'hover:bg-white/10 text-slate-300'
            )}
            title="Alternar Tema / Interface"
          >
            <span>macOS</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'skin' && (
            <div className="absolute top-full right-0 mt-1 w-44 bg-[#161a25]/95 backdrop-blur-3xl border border-white/15 rounded-xl shadow-2xl p-1.5 space-y-0.5 z-[99999] animate-slide-in">
              <div className="px-2 py-1 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                Interface do OS
              </div>
              <button
                onClick={() => {
                  onChangeUiMode('macos');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white flex items-center justify-between transition-colors text-white font-medium"
              >
                <span>🍎 macOS Sonoma</span>
                <Check className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                onClick={() => {
                  onChangeUiMode('cyber');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white flex items-center justify-between transition-colors text-slate-300"
              >
                <span>⚡ CyberOS</span>
              </button>
              <button
                onClick={() => {
                  onChangeUiMode('mobile');
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white flex items-center justify-between transition-colors text-slate-300"
              >
                <span>📱 Mobile Mode</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-3.5 bg-white/15 mx-0.5" />

        {/* Battery */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 cursor-default text-xs">
          <Battery className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-slate-300 hidden md:inline">100%</span>
        </div>

        {/* Wi-Fi */}
        <div className="p-1 rounded hover:bg-white/10 cursor-pointer" title="Wi-Fi: Conectado">
          <Wifi className="w-3.5 h-3.5 text-slate-200" />
        </div>

        {/* Spotlight Search (Magnifying Glass) */}
        <button
          onClick={onOpenSpotlight}
          className="p-1 rounded hover:bg-white/10 cursor-pointer transition-colors"
          title="Busca Spotlight (Cmd+Space)"
        >
          <Search className="w-3.5 h-3.5 text-slate-200" />
        </button>

        {/* Siri / AI Orb */}
        <button
          onClick={() => openApp('chat')}
          className="p-1 rounded hover:bg-white/10 cursor-pointer transition-colors group"
          title="Siri / IA Assistant"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-amber-300 group-hover:scale-110 transition-transform" />
        </button>

        {/* Control Center Toggle */}
        <button
          onClick={onToggleControlCenter}
          className="p-1 rounded hover:bg-white/10 cursor-pointer transition-colors"
          title="Central de Controle"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-200" />
        </button>

        {/* Clock & Date */}
        <button className="px-2 py-0.5 rounded hover:bg-white/10 text-xs font-mono font-medium text-slate-200 flex items-center gap-1.5">
          <span className="text-slate-400 hidden lg:inline">{dateStr}</span>
          <span>{timeStr}</span>
        </button>
      </div>
    </div>
  );
}