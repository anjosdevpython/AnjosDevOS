'use client';

import { useState } from 'react';
import { useOS } from '@/components/os/OSContext';
import { MacOSAppIcon } from './MacOSAppIcons';
import { cn } from '@/lib/utils';
import type { WindowState } from '@/components/os/types';

interface MacOSDockProps {
  onOpenLaunchpad: () => void;
}

export function MacOSDock({ onOpenLaunchpad }: MacOSDockProps) {
  const { openApp, windows, activeWindowId, minimizeWindow, focusWindow } = useOS();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [bouncingId, setBouncingId] = useState<string | null>(null);

  const primaryDockApps = [
    { id: 'finder', name: 'Finder', appId: 'fileexplorer' },
    { id: 'launchpad', name: 'Launchpad', isCustomAction: true },
    { id: 'chat', name: 'Chat IA (Siri)', appId: 'chat' },
    { id: 'codeeditor', name: 'Code Editor', appId: 'codeeditor' },
    { id: 'workspaces', name: 'Workspaces', appId: 'workspaces' },
    { id: 'terminal', name: 'Terminal', appId: 'terminal' },
    { id: 'browser-workbench', name: 'Safari / Browser', appId: 'browser-workbench' },
    { id: 'automation-studio', name: 'Atalhos & Automação', appId: 'automation-studio' },
    { id: 'mcp-servers', name: 'MCP Servers', appId: 'mcp-servers' },
    { id: 'dashboard', name: 'Monitor de Atividade', appId: 'dashboard' },
    { id: 'devtools-hub', name: 'DevTools Hub', appId: 'devtools-hub' },
    { id: 'images', name: 'Fotos & Imagens', appId: 'images' },
    { id: 'warmwind', name: 'Funcionários IA', appId: 'warmwind' },
  ];

  const secondaryDockApps = [
    { id: 'settings', name: 'Ajustes do Sistema', appId: 'settings' },
    { id: 'trash', name: 'Lixeira', isCustomAction: true },
  ];

  const handleAppClick = (item: (typeof primaryDockApps)[0]) => {
    setBouncingId(item.id);
    setTimeout(() => setBouncingId(null), 1200);

    if (item.isCustomAction) {
      if (item.id === 'launchpad') {
        onOpenLaunchpad();
      }
      return;
    }

    if (!item.appId) return;

    const openWin = windows.find((w: WindowState) => w.appId === item.appId);
    if (openWin) {
      if (openWin.isMinimized) {
        minimizeWindow(openWin.id);
        focusWindow(openWin.id);
      } else if (activeWindowId === openWin.id) {
        minimizeWindow(openWin.id);
      } else {
        focusWindow(openWin.id);
      }
    } else {
      openApp(item.appId);
    }
  };

  const getScale = (index: number) => {
    if (hoveredIdx === null) return 1;
    const distance = Math.abs(hoveredIdx - index);
    if (distance === 0) return 1.35;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.08;
    return 1;
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[99990] select-none">
      <div
        onMouseLeave={() => setHoveredIdx(null)}
        className="flex items-end gap-1.5 px-3 py-2 bg-black/40 backdrop-blur-3xl border border-white/20 rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.35)]"
      >
        {primaryDockApps.map((item, idx) => {
          const isOpen = windows.some((w: WindowState) => w.appId === item.appId);
          const scale = getScale(idx);
          const isBouncing = bouncingId === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredIdx(idx)}
              onClick={() => handleAppClick(item)}
              className="relative group flex flex-col items-center cursor-pointer transition-transform duration-150 origin-bottom"
              style={{ transform: `scale(${scale})` }}
            >
              <div className="absolute -top-9 px-2.5 py-1 bg-[#181c27]/90 backdrop-blur-md border border-white/15 rounded-lg text-[11px] font-sans text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                {item.name}
              </div>

              <div className={cn('transition-transform', isBouncing && 'animate-bounce')}>
                <MacOSAppIcon appId={item.id} size={48} />
              </div>

              <div className="h-1 flex items-center justify-center mt-1">
                {isOpen && <div className="w-1 h-1 rounded-full bg-white/80 shadow-[0_0_4px_white]" />}
              </div>
            </div>
          );
        })}

        <div className="w-px h-10 bg-white/15 mx-1 self-center" />

        {secondaryDockApps.map((item, idx) => {
          const totalIdx = primaryDockApps.length + idx;
          const isOpen = windows.some((w: WindowState) => w.appId === item.appId);
          const scale = getScale(totalIdx);
          const isBouncing = bouncingId === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredIdx(totalIdx)}
              onClick={() => {
                if (item.id === 'trash') {
                  alert('Lixeira vazia.');
                } else if (item.appId) {
                  openApp(item.appId);
                }
              }}
              className="relative group flex flex-col items-center cursor-pointer transition-transform duration-150 origin-bottom"
              style={{ transform: `scale(${scale})` }}
            >
              <div className="absolute -top-9 px-2.5 py-1 bg-[#181c27]/90 backdrop-blur-md border border-white/15 rounded-lg text-[11px] font-sans text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                {item.name}
              </div>

              <div className={cn('transition-transform', isBouncing && 'animate-bounce')}>
                <MacOSAppIcon appId={item.id} size={48} />
              </div>

              <div className="h-1 flex items-center justify-center mt-1">
                {isOpen && <div className="w-1 h-1 rounded-full bg-white/80 shadow-[0_0_4px_white]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}