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

export function IOSLayout() {
  const { windows, activeWindowId, focusWindow, closeWindow, minimizeWindow, toggleMaximize } = useOS();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);

  const handleStatusBarLeft = useCallback(() => {
    setShowNotifications(prev => !prev);
    setShowControlCenter(false);
  }, []);

  const handleStatusBarRight = useCallback(() => {
    setShowControlCenter(prev => !prev);
    setShowNotifications(false);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Background wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />

      {/* Status Bar - Left pull = Notifications, Right pull = Control Center */}
      <div className="absolute top-0 left-0 right-0 z-[10002] flex">
        <div className="w-1/2 h-12 cursor-pointer" onClick={handleStatusBarLeft} />
        <div className="w-1/2 h-12 cursor-pointer" onClick={handleStatusBarRight} />
        <IOSStatusBar />
      </div>

      {/* Home Screen (shown when no windows) */}
      {windows.length === 0 && <IOSHomeScreen />}

      {/* Windows */}
      {windows.map(win => {
        const appDef = APP_DEFINITIONS.find(a => a.id === win.appId);
        const isActive = activeWindowId === win.id;
        const icon = ICON_COMPONENTS[appDef?.iconName || 'Terminal'];

        return (
          <IOSWindow
            key={win.id}
            windowState={win}
            isActive={isActive}
            appIcon={icon}
            appColor={appDef?.color || 'neon-green'}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
          >
            {getAppContent(win.appId)}
          </IOSWindow>
        );
      })}

      {/* Dock */}
      <IOSDock />

      {/* Notifications Panel */}
      {showNotifications && (
        <IOSNotificationCenter onClose={() => setShowNotifications(false)} />
      )}

      {/* Control Center Panel */}
      {showControlCenter && (
        <IOSControlCenter onClose={() => setShowControlCenter(false)} />
      )}
    </div>
  );
}
