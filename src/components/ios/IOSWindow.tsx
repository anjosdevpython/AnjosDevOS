'use client';

import { useState, useCallback, useRef, ReactNode } from 'react';
import type { WindowState } from '@/components/os/types';

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
  onMinimize,
  onMaximize,
  children,
}: IOSWindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowState.x,
      y: e.clientY - windowState.y,
    });

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 200));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100));
      // Would update window position via context
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [windowState.x, windowState.y, dragOffset, onFocus]);

  if (windowState.isMinimized) return null;

  const style: React.CSSProperties = windowState.isMaximized
    ? { top: 48, left: 0, width: '100%', height: 'calc(100% - 140px)' }
    : {
        top: windowState.y,
        left: windowState.x,
        width: windowState.width,
        height: windowState.height,
      };

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col overflow-hidden transition-shadow duration-200 ${
        isActive
          ? 'shadow-[0_8px_40px_rgba(0,0,0,0.5)] z-[1000]'
          : 'shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-[999]'
      } ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        ...style,
        borderRadius: windowState.isMaximized ? 0 : 16,
        opacity: isDragging ? 0.95 : 1,
        transform: isDragging ? 'scale(1.01)' : 'scale(1)',
      }}
      onMouseDown={handleMouseDown}
      onClick={onFocus}
    >
      {/* Title Bar */}
      <div
        className="flex items-center h-10 px-3 gap-2 shrink-0 select-none"
        style={{
          background: `linear-gradient(180deg, rgba(30,30,30,0.98), rgba(20,20,20,0.95))`,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 mr-2">
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff4040] transition-colors flex items-center justify-center group"
          >
            <span className="text-[8px] text-[#8a0000] opacity-0 group-hover:opacity-100 font-bold">✕</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#ffa500] transition-colors flex items-center justify-center group"
          >
            <span className="text-[8px] text-[#8a6600] opacity-0 group-hover:opacity-100 font-bold">−</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#20a834] transition-colors flex items-center justify-center group"
          >
            <span className="text-[8px] text-[#006400] opacity-0 group-hover:opacity-100 font-bold">+</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex-1 flex items-center gap-1.5">
          <div className={`text-${appColor}`}>{appIcon}</div>
          <span className="text-[11px] text-white/70 font-medium truncate">{windowState.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-[#1a1a1a]">
        {children}
      </div>

      {/* Bottom glow for active window */}
      {isActive && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent, var(--tw-shadow-color, #3b82f6), transparent)`,
            boxShadow: `0 0 10px var(--tw-shadow-color, #3b82f6)`,
          }}
        />
      )}
    </div>
  );
}
