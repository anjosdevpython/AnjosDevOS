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
    <div className="fixed inset-0 overflow-hidden bg-[#06080e] select-none">
      {/* Boot Screen */}
      {!isBooted && <BootScreen />}

      {/* Modern Ambient Mesh Lighting Effects */}
      <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px] pointer-events-none animate-ambient-1" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-purple-600/15 via-indigo-500/10 to-transparent blur-[140px] pointer-events-none animate-ambient-2" />
      <div className="absolute top-[40%] right-[35%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Desktop Background & Micro-Grid Pattern */}
      <div
        className="absolute inset-0 bg-grid-pattern"
        style={{ paddingBottom: '70px' }}
        onClick={() => setStartMenuOpen(false)}
      >
        {/* Subtle Vignette & Gradient Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />

        {/* Ambient Center Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
          <img src="/logo.png" alt="Watermark" className="w-[600px] max-w-[80vw] object-contain" />
        </div>

        {/* Desktop Icons */}
        <DesktopIcons />

        {/* Floating Windows */}
        {windows.map((win) => {
          const appDef = APP_DEFINITIONS.find((a) => a.id === win.appId);
          return (
            <Window
              key={win.id}
              windowState={win}
              icon={ICON_COMPONENTS[appDef?.iconName || 'Terminal']}
              iconColor={`text-${appDef?.color || 'neon-cyan'}`}
            >
              {getAppContent(win.appId)}
            </Window>
          );
        })}
      </div>

      {/* Floating Modern Taskbar / Dock */}
      <Taskbar />

      {/* Modern Start Launcher */}
      <StartMenu />
    </div>
  );
}
