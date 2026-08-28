'use client';

import { useOS } from './OSContext';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { BootScreen } from './BootScreen';
import { DesktopIcons } from './DesktopIcons';
import { getAppContent, ICON_COMPONENTS } from './AppRegistry';
import { APP_DEFINITIONS } from './types';

export function Desktop() {
  const { windows, isBooted, setStartMenuOpen } = useOS();

  return (
    <div className="fixed inset-0 overflow-hidden bg-cyber-bg">
      {/* Boot Screen */}
      {!isBooted && <BootScreen />}

      {/* Desktop Background */}
      <div
        className="absolute inset-0 bg-grid-pattern"
        style={{ paddingBottom: '48px' }}
        onClick={() => setStartMenuOpen(false)}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/3 via-transparent to-neon-blue/3" />

        {/* Desktop Icons */}
        <DesktopIcons />

        {/* Windows */}
        {windows.map((win) => {
          const appDef = APP_DEFINITIONS.find((a) => a.id === win.appId);
          return (
            <Window
              key={win.id}
              windowState={win}
              icon={ICON_COMPONENTS[appDef?.iconName || 'Terminal']}
              iconColor={`text-${appDef?.color || 'neon-green'}`}
            >
              {getAppContent(win.appId)}
            </Window>
          );
        })}
      </div>

      {/* Taskbar */}
      <Taskbar />

      {/* Start Menu */}
      <StartMenu />
    </div>
  );
}
