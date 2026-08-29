'use client';

import { useOS } from '@/components/os/OSContext';
import { APP_DEFINITIONS } from '@/components/os/types';

const DOCK_APPS = ['chat', 'codeeditor', 'fileexplorer', 'tools'];

const APP_ICONS: Record<string, string> = {
  chat: '💬',
  codeeditor: '💻',
  fileexplorer: '📁',
  tools: '🛠️',
  images: '🎨',
  video: '🎬',
  music: '🎵',
  terminal: '⌨️',
  settings: '⚙️',
  devtools: '🔧',
};

export function IOSDock() {
  const { openApp } = useOS();

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9998]">
      {/* Dock background */}
      <div className="bg-white/15 backdrop-blur-2xl rounded-[28px] px-4 py-2.5 flex items-center gap-3 border border-white/20 shadow-2xl">
        {DOCK_APPS.map(appId => {
          const appDef = APP_DEFINITIONS.find(a => a.id === appId);
          return (
            <button
              key={appId}
              onClick={() => openApp(appId)}
              className="w-14 h-14 rounded-[14px] flex items-center justify-center text-2xl active:scale-90 transition-transform duration-150"
              style={{
                background: `linear-gradient(135deg, ${getGradient(appDef?.color || 'neon-green')})`,
              }}
              title={appDef?.title}
            >
              {APP_ICONS[appId] || '📱'}
            </button>
          );
        })}
      </div>

      {/* Home indicator */}
      <div className="flex justify-center mt-2">
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}

function getGradient(color: string): string {
  const gradients: Record<string, string> = {
    'neon-green': '#22c55e, #16a34a',
    'neon-blue': '#3b82f6, #2563eb',
    'neon-purple': '#a855f7, #7c3aed',
    'neon-yellow': '#eab308, #ca8a04',
    'neon-red': '#ef4444, #dc2626',
    'neon-orange': '#f97316, #ea580c',
    'neon-cyan': '#06b6d4, #0891b2',
    'neon-pink': '#ec4899, #db2777',
    'emerald-400': '#34d399, #10b981',
    'orange-400': '#fb923c, #f97316',
    'cyan-400': '#22d3ee, #06b6d4',
    'text-secondary': '#94a3b8, #64748b',
  };
  return gradients[color] || '#22c55e, #16a34a';
}
