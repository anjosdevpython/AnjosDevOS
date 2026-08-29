'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { WindowState } from '@/components/os/types';
import { cn } from '@/lib/utils';

interface MacOSWindowProps {
  windowState: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  children: React.ReactNode;
}

export function MacOSWindow({
  windowState,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  children,
}: MacOSWindowProps) {
  const [isTrafficHovered, setIsTrafficHovered] = useState(false);
  const [pos, setPos] = useState({ x: windowState.x, y: Math.max(34, windowState.y) });
  const [size, setSize] = useState({ width: windowState.width, height: windowState.height });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });

  useEffect(() => {
    setPos({ x: windowState.x, y: Math.max(34, windowState.y) });
    setSize({ width: windowState.width, height: windowState.height });
  }, [windowState.x, windowState.y, windowState.width, windowState.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-control-btn')) return;
    onFocus();
    if (windowState.isMaximized) return;

    setIsDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: pos.x,
      winY: pos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setPos({
        x: Math.max(10, dragStart.current.winX + dx),
        y: Math.max(34, dragStart.current.winY + dy),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (windowState.isMinimized) return null;

  return (
    <div
      onMouseDown={onFocus}
      className={cn(
        'fixed flex flex-col rounded-[14px] overflow-hidden transition-all duration-100',
        isActive
          ? 'shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.18)]'
          : 'shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] opacity-95'
      )}
      style={{
        zIndex: windowState.zIndex,
        left: windowState.isMaximized ? 0 : pos.x,
        top: windowState.isMaximized ? 28 : pos.y,
        width: windowState.isMaximized ? '100vw' : size.width,
        height: windowState.isMaximized ? 'calc(100vh - 28px)' : size.height,
        maxWidth: '100vw',
        maxHeight: 'calc(100vh - 28px)',
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
        className={cn(
          'h-[34px] flex items-center justify-between px-3.5 select-none transition-colors border-b relative',
          isActive
            ? 'bg-[#181c27]/90 backdrop-blur-2xl border-white/10 text-white'
            : 'bg-[#12151e]/85 backdrop-blur-xl border-white/5 text-slate-400'
        )}
      >
        <div
          onMouseEnter={() => setIsTrafficHovered(true)}
          onMouseLeave={() => setIsTrafficHovered(false)}
          className="flex items-center gap-2 z-10"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="window-control-btn w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center text-[8px] text-black/70 font-bold transition-opacity hover:opacity-90"
            title="Fechar (Cmd+W)"
          >
            {isTrafficHovered && '✕'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="window-control-btn w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center text-[8px] text-black/70 font-bold transition-opacity hover:opacity-90"
            title="Minimizar (Cmd+M)"
          >
            {isTrafficHovered && '−'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="window-control-btn w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center text-[7px] text-black/70 font-bold transition-opacity hover:opacity-90"
            title="Tela Cheia"
          >
            {isTrafficHovered && '⤢'}
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold tracking-wide truncate max-w-[50%]">
            {windowState.title}
          </span>
        </div>

        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-hidden bg-[#07090e]">{children}</div>
    </div>
  );
}