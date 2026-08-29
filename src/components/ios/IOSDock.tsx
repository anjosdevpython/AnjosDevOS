'use client';

import { useOS } from '@/components/os/OSContext';
import { IOSAppIcon } from './IOSAppIcons';

const DOCK_APPS = [
  { id: 'chat', title: 'Mensagens' },
  { id: 'browser-workbench', title: 'Safari' },
  { id: 'codeeditor', title: 'Editor' },
  { id: 'automation-studio', title: 'Atalhos' },
  { id: 'agent-teams', title: 'Agentes' },
  { id: 'terminal', title: 'Terminal' },
];

export function IOSDock() {
  const { openApp } = useOS();

  return (
    <div className="fixed bottom-2.5 left-1/2 -translate-x-1/2 z-[9998] flex flex-col items-center select-none pointer-events-auto">
      {/* iOS 18 / iPadOS Floating Glass Dock Shelf */}
      <div className="bg-white/[0.22] dark:bg-white/[0.12] backdrop-blur-3xl rounded-[35px] px-4 py-2.5 flex items-center gap-3.5 border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.6)]">
        {DOCK_APPS.map((app, idx) => (
          <button
            key={app.id}
            onClick={() => openApp(app.id)}
            className={`active:scale-85 hover:scale-110 transition-all duration-150 group ${
              idx >= 4 ? 'hidden sm:block' : ''
            }`}
            title={app.title}
          >
            <IOSAppIcon appId={app.id} size={54} />
          </button>
        ))}
      </div>

      {/* iOS 18 Home Indicator Bar */}
      <div className="w-36 h-1 bg-white/70 rounded-full mt-2.5 shadow-md hover:bg-white transition-colors cursor-pointer" />
    </div>
  );
}
