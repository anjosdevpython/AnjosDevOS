'use client';

import { useState, useEffect } from 'react';
import { useOS } from '@/components/os/OSContext';
import { MacOSMenuBar } from './MacOSMenuBar';
import { MacOSDock } from './MacOSDock';
import { MacOSWindow } from './MacOSWindow';
import { MacOSSpotlight } from './MacOSSpotlight';
import { MacOSControlCenter } from './MacOSControlCenter';
import { MacOSLaunchpad } from './MacOSLaunchpad';
import { MacOSAppIcon } from './MacOSAppIcons';
import { APP_DEFINITIONS, type AppDefinition, type WindowState } from '@/components/os/types';
import { getAppContent } from '@/components/os/AppRegistry';

interface MacOSLayoutProps {
  uiMode?: 'macos' | 'cyber' | 'mobile';
  onChangeUiMode?: (mode: 'macos' | 'cyber' | 'mobile') => void;
}

export function MacOSLayout({ uiMode = 'macos', onChangeUiMode = () => {} }: MacOSLayoutProps) {
  const { windows, activeWindowId, focusWindow, closeWindow, minimizeWindow, toggleMaximize, openApp } = useOS();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [selectedDesktopId, setSelectedDesktopId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const desktopPinnedApps = APP_DEFINITIONS.filter((a: AppDefinition) =>
    ['workspaces', 'codeeditor', 'chat', 'automation-studio', 'mcp-servers', 'devtools-hub', 'dashboard'].includes(a.id)
  );

  return (
    <div
      onClick={() => setSelectedDesktopId(null)}
      className="fixed inset-0 overflow-hidden select-none font-sans bg-[#050711]"
    >
      {/* Authentic macOS Sonoma / Sequoia Dynamic Wallpaper */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Base dark canvas */}
        <div className="absolute inset-0 bg-[#060913]" />

        {/* Sonoma Graphic Waves with Blur Filters */}
        <div className="absolute -top-[20%] -left-[15%] w-[850px] h-[850px] rounded-full bg-gradient-to-br from-[#1d4ed8]/35 via-[#3b82f6]/20 to-transparent blur-[130px]" />
        <div className="absolute top-[15%] -right-[15%] w-[750px] h-[750px] rounded-full bg-gradient-to-bl from-[#7c3aed]/30 via-[#a855f7]/20 to-transparent blur-[140px]" />
        <div className="absolute -bottom-[25%] left-[25%] w-[950px] h-[950px] rounded-full bg-gradient-to-tr from-[#0284c7]/30 via-[#06b6d4]/15 to-transparent blur-[150px]" />
        <div className="absolute bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#ea580c]/15 via-transparent to-transparent blur-[120px]" />
      </div>

      {/* Top Apple Menu Bar (No collisions) */}
      <MacOSMenuBar
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onToggleControlCenter={() => setIsControlCenterOpen((prev) => !prev)}
        onOpenLaunchpad={() => setIsLaunchpadOpen(true)}
        uiMode={uiMode}
        onChangeUiMode={onChangeUiMode}
      />

      {/* Desktop Shortcuts (Compact Apple Grid Top Right) */}
      <div className="absolute top-10 right-4 flex flex-col gap-3 z-0 max-h-[calc(100vh-120px)] flex-wrap">
        {desktopPinnedApps.map((app: AppDefinition) => {
          const isSelected = selectedDesktopId === app.id;
          return (
            <div
              key={app.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDesktopId(app.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openApp(app.id);
              }}
              className="flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer group transition-all w-[76px]"
            >
              <div
                className={`p-1 rounded-2xl transition-all ${
                  isSelected ? 'bg-blue-600/30 ring-2 ring-blue-400' : 'group-hover:scale-105'
                }`}
              >
                <MacOSAppIcon appId={app.id} size={44} />
              </div>
              <span
                className={`text-[10px] font-sans font-medium text-center px-1.5 py-0.5 rounded truncate w-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${
                  isSelected ? 'bg-blue-600 text-white' : 'text-white/90'
                }`}
              >
                {app.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Windows Layer */}
      {windows.map((win: WindowState) => {
        const isActive = activeWindowId === win.id;
        return (
          <MacOSWindow
            key={win.id}
            windowState={win}
            isActive={isActive}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
          >
            {getAppContent(win.appId)}
          </MacOSWindow>
        );
      })}

      {/* Floating macOS Dock */}
      <MacOSDock onOpenLaunchpad={() => setIsLaunchpadOpen(true)} />

      {/* Spotlight Search Modal */}
      <MacOSSpotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />

      {/* Control Center Panel */}
      <MacOSControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
      />

      {/* Launchpad Fullscreen Overlay */}
      <MacOSLaunchpad
        isOpen={isLaunchpadOpen}
        onClose={() => setIsLaunchpadOpen(false)}
      />
    </div>
  );
}