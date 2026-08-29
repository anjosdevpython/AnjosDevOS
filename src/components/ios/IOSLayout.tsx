'use client';

import { useState, useCallback } from 'react';
import { useOS } from '@/components/os/OSContext';
import { IOSStatusBar } from './IOSStatusBar';
import { IOSDock } from './IOSDock';
import { IOSHomeScreen } from './IOSHomeScreen';
import { IOSNotificationCenter } from './IOSNotificationCenter';
import { IOSControlCenter } from './IOSControlCenter';
import { IOSWindow } from './IOSWindow';
import { APP_DEFINITIONS } from '@/components/os/types';
import { getAppContent, ICON_COMPONENTS } from '@/components/os/AppRegistry';
import { Smartphone, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IOSLayout() {
  const { windows, activeWindowId, focusWindow, closeWindow, minimizeWindow, toggleMaximize } = useOS();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState(false);
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  const handleStatusBarLeft = useCallback(() => {
    setShowNotifications((prev) => !prev);
    setShowControlCenter(false);
  }, []);

  const handleStatusBarRight = useCallback(() => {
    setShowControlCenter((prev) => !prev);
    setShowNotifications(false);
  }, []);

  const toggleDynamicIsland = useCallback(() => {
    setIsDynamicIslandExpanded((prev) => !prev);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#03060c] flex items-center justify-center select-none">
      {/* Device Frame Toggle (visible on desktop) */}
      <div className="fixed bottom-3 left-4 z-[99999] hidden md:flex items-center gap-1 bg-[#0c101d]/90 backdrop-blur-2xl border border-white/15 rounded-full p-1 shadow-lg">
        <button
          onClick={() => setDeviceFrameMode(!deviceFrameMode)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-semibold rounded-full transition-all',
            deviceFrameMode
              ? 'bg-cyan-500 text-black font-bold'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Smartphone className="w-3 h-3" />
          <span>{deviceFrameMode ? 'Moldura iPhone Ativa' : 'Moldura iPhone'}</span>
        </button>
      </div>

      {/* Main iOS Container (Either Fullscreen or iPhone 16 Pro Frame) */}
      <div
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          deviceFrameMode
            ? 'w-[400px] h-[850px] max-h-[95vh] rounded-[52px] border-[10px] border-[#2c3240] ring-1 ring-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.15)] bg-black'
            : 'w-full h-full bg-black'
        )}
      >
        {/* iOS 18 Dynamic Wallpaper */}
        <div className="absolute inset-0 bg-[#050811]">
          <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-transparent blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-[20%] -right-[15%] w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-cyan-500/25 via-teal-600/15 to-transparent blur-[130px] pointer-events-none" />
        </div>

        {/* Authentic iOS Status Bar with Interactive Dynamic Island */}
        <IOSStatusBar
          onNotificationPull={handleStatusBarLeft}
          onControlCenterPull={handleStatusBarRight}
          isDynamicIslandExpanded={isDynamicIslandExpanded}
          onToggleDynamicIsland={toggleDynamicIsland}
        />

        {/* Home Screen (visible when no app is open) */}
        {windows.length === 0 && <IOSHomeScreen />}

        {/* iOS App Windows */}
        {windows.map((win) => {
          const appDef = APP_DEFINITIONS.find((a) => a.id === win.appId);
          const isActive = activeWindowId === win.id;
          const icon = ICON_COMPONENTS[appDef?.iconName || 'Terminal'];

          return (
            <IOSWindow
              key={win.id}
              windowState={win}
              isActive={isActive}
              appIcon={icon}
              appColor={appDef?.color || 'neon-cyan'}
              onFocus={() => focusWindow(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
            >
              {getAppContent(win.appId)}
            </IOSWindow>
          );
        })}

        {/* Floating Glass Dock (when on Home Screen) */}
        {windows.length === 0 && <IOSDock />}

        {/* Notifications Panel */}
        {showNotifications && (
          <IOSNotificationCenter onClose={() => setShowNotifications(false)} />
        )}

        {/* Control Center Panel */}
        {showControlCenter && (
          <IOSControlCenter onClose={() => setShowControlCenter(false)} />
        )}
      </div>
    </div>
  );
}
