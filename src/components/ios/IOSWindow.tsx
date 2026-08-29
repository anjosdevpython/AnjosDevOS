'use client';

import { ReactNode } from 'react';
import type { WindowState } from '@/components/os/types';
import { ChevronLeft, X } from 'lucide-react';

interface IOSWindowProps {
  windowState: WindowState;
  isActive: boolean;
  appIcon: ReactNode;
  appColor: string;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  children: ReactNode;
}

export function IOSWindow({
  windowState,
  isActive,
  appIcon,
  appColor,
  onFocus,
  onClose,
  children,
}: IOSWindowProps) {
  if (windowState.isMinimized) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col bg-[#07090e] text-slate-100 animate-slide-in overflow-hidden select-none"
      onClick={onFocus}
    >
      {/* iOS App Navigation Bar */}
      <div className="pt-12 pb-3 px-4 bg-[#0d121f]/95 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between shadow-md">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 active:opacity-60 transition-opacity font-semibold text-sm"
        >
          <ChevronLeft className="w-5 h-5 -ml-1 stroke-[2.5]" />
          <span>Início</span>
        </button>

        <div className="flex items-center gap-2 max-w-[50%] truncate">
          <span className={`text-base text-${appColor}`}>{appIcon}</span>
          <h2 className="text-sm font-bold text-white truncate font-mono">{windowState.title}</h2>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* App Body Content */}
      <div className="flex-1 overflow-hidden bg-[#07090e]">
        {children}
      </div>

      {/* Bottom Home Indicator Bar (Swipe/Click to Return Home) */}
      <div
        onClick={onClose}
        className="h-7 bg-[#07090e] flex items-center justify-center cursor-pointer group"
        title="Voltar para a tela inicial"
      >
        <div className="w-36 h-1 bg-white/60 group-hover:bg-white rounded-full transition-all group-active:scale-90" />
      </div>
    </div>
  );
}
