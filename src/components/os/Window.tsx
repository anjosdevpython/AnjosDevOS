'use client';

import { useRef, useCallback, useEffect, ReactNode } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
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
        'absolute flex flex-col rounded-xl overflow-hidden shadow-2xl border transition-shadow duration-200',
        isActive
          ? 'border-neon-green/30 shadow-[0_0_30px_rgba(0,255,136,0.1)]'
          : 'border-cyber-border shadow-[0_0_15px_rgba(0,0,0,0.5)]'
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
      {/* Title Bar */}
      <div
        className={cn(
          'flex items-center gap-2 h-10 px-3 select-none shrink-0 cursor-grab active:cursor-grabbing',
          isActive ? 'bg-cyber-card' : 'bg-cyber-card/80'
        )}
        onMouseDown={handleDragStart}
        onDoubleClick={() => toggleMaximize(windowState.id)}
      >
        <span className={`flex-shrink-0 ${iconColor}`}>{icon}</span>
        <span className="text-xs font-medium text-text-primary truncate flex-1">{windowState.title}</span>

        {/* Window controls */}
        <div className="flex items-center gap-0.5" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => minimizeWindow(windowState.id)}
            className="p-1.5 rounded hover:bg-neon-yellow/20 text-text-muted hover:text-neon-yellow transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => toggleMaximize(windowState.id)}
            className="p-1.5 rounded hover:bg-neon-green/20 text-text-muted hover:text-neon-green transition-colors"
          >
            {windowState.isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => closeWindow(windowState.id)}
            className="p-1.5 rounded hover:bg-neon-red/20 text-text-muted hover:text-neon-red transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-cyber-bg">
        {children}
      </div>

      {/* Resize Handle (bottom-right corner) */}
      {!windowState.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
          onMouseDown={handleResizeStart}
        >
          <svg viewBox="0 0 16 16" className="w-full h-full text-text-muted/30">
            <path d="M14 16L16 14M10 16L16 10M6 16L16 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      )}
    </div>
  );
}
