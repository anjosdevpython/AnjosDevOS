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

export function MacOSLayout() {
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
      {/* macOS Sonoma / Sequoia Dynamic Gradient Wallpaper */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1427] via-[#070b16] to-[#04060d]" />
        <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-transparent blur-[140px]" />
        <div className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-purple-600/25 via-pink-600/15 to-transparent blur-[150px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-cyan-600/25 via-teal-600/15 to-transparent blur-[160px]" />
      </div>

      {/* Top Apple Menu Bar */}
      <MacOSMenuBar
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onToggleControlCenter={() => setIsControlCenterOpen((prev) => !prev)}
        onOpenLaunchpad={() => setIsLaunchpadOpen(true)}
      />

      {/* Desktop Pinned Files / Shortcuts (Top Right Column - classic macOS style) */}
      <div className="absolute top-12 right-6 flex flex-col gap-5 z-0">
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
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer group transition-all"
            >
              <div
                className={`p-1 rounded-2xl transition-all ${
                  isSelected ? 'bg-blue-600/30 ring-2 ring-blue-400' : 'group-hover:scale-105'
                }`}
              >
                <MacOSAppIcon appId={app.id} size={50} />
              </div>
              <span
                className={`text-[11px] font-medium text-center px-1.5 py-0.5 rounded-md truncate max-w-[85px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${
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