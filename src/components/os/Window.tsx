'use client';

import { useRef, useCallback, ReactNode } from 'react';
import { useOS } from './OSContext';
import { WindowState } from './types';
import { cn } from '@/lib/utils';

interface WindowProps {
  windowState: WindowState;
  icon: ReactNode;
  iconColor: string;
  children: ReactNode;
}

export function Window({ windowState, icon, iconColor, children }: WindowProps) {
  const { closeWindow, minimizeWindow, toggleMaximize, focusWindow, moveWindow, resizeWindow, activeWindowId } = useOS();
  const dragRef = useRef<{ startX: number; startY: number; startWinX: number; startWinY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  const isActive = activeWindowId === windowState.id;

  // DRAG handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    e.preventDefault();
    focusWindow(windowState.id);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWinX: windowState.x,
      startWinY: windowState.y,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      moveWindow(windowState.id, dragRef.current.startWinX + dx, Math.max(0, dragRef.current.startWinY + dy));
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [windowState.id, windowState.x, windowState.y, windowState.isMaximized, focusWindow, moveWindow]);

  // RESIZE handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(windowState.id);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: windowState.width,
      startH: windowState.height,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dw = ev.clientX - resizeRef.current.startX;
      const dh = ev.clientY - resizeRef.current.startY;
      resizeWindow(windowState.id, resizeRef.current.startW + dw, resizeRef.current.startH + dh);
    };

    const handleMouseUp = () => {
      resizeRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [windowState.id, windowState.width, windowState.height, focusWindow, resizeWindow]);

  if (windowState.isMinimized) return null;

  return (
    <div
      className={cn(
        'absolute flex flex-col rounded-2xl overflow-hidden backdrop-blur-3xl transition-all duration-200 group',
        isActive
          ? 'border border-cyan-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/20'
          : 'border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.7)] opacity-95 hover:opacity-100'
      )}
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
      }}
      onMouseDown={() => focusWindow(windowState.id)}
    >
      {/* Sleek Modern Window Titlebar */}
      <div
        className={cn(
          'flex items-center justify-between h-10 px-3.5 select-none shrink-0 cursor-grab active:cursor-grabbing border-b transition-colors',
          isActive
            ? 'bg-[#0d121f]/95 border-white/10'
            : 'bg-[#0a0d16]/90 border-white/5'
        )}
        onMouseDown={handleDragStart}
        onDoubleClick={() => toggleMaximize(windowState.id)}
      >
        {/* Left: Traffic Lights (macOS / VisionOS style) */}
        <div className="flex items-center gap-2 group/lights" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => closeWindow(windowState.id)}
            className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff453a] border border-[#e0443e] flex items-center justify-center text-black/70 hover:text-black transition-all shadow-sm active:scale-90"
            title="Fechar"
          >
            <span className="opacity-0 group-hover/lights:opacity-100 text-[8px] font-black leading-none">✕</span>
          </button>
          <button
            onClick={() => minimizeWindow(windowState.id)}
            className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffb020] border border-[#dea123] flex items-center justify-center text-black/70 hover:text-black transition-all shadow-sm active:scale-90"
            title="Minimizar"
          >
            <span className="opacity-0 group-hover/lights:opacity-100 text-[8px] font-black leading-none">−</span>
          </button>
          <button
            onClick={() => toggleMaximize(windowState.id)}
            className="w-3 h-3 rounded-full bg-[#27c93f] hover:bg-[#20b835] border border-[#1aab29] flex items-center justify-center text-black/70 hover:text-black transition-all shadow-sm active:scale-90"
            title={windowState.isMaximized ? "Restaurar" : "Maximizar"}
          >
            <span className="opacity-0 group-hover/lights:opacity-100 text-[8px] font-black leading-none">+</span>
          </button>
        </div>

        {/* Center: Title & Icon */}
        <div className="flex items-center gap-2 max-w-[60%] truncate">
          <span className={`flex-shrink-0 text-sm ${iconColor}`}>{icon}</span>
          <span className="text-xs font-semibold text-slate-200 truncate tracking-wide font-mono">
            {windowState.title}
          </span>
        </div>

        {/* Right: Active Status Indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse' : 'bg-slate-600'
            )}
          />
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-auto bg-[#07090e]/95 text-slate-100">
        {children}
      </div>

      {/* Resize Handle (bottom-right corner) */}
      {!windowState.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20 flex items-end justify-end p-0.5"
          onMouseDown={handleResizeStart}
        >
          <div className="w-2 h-2 border-r-2 border-b-2 border-white/20 rounded-br-sm" />
        </div>
      )}
    </div>
  );
}
