'use client';

import { useState } from 'react';
import { useOS } from '@/components/os/OSContext';
import { APP_DEFINITIONS, type AppDefinition } from '@/components/os/types';

const APP_ICONS: Record<string, string> = {
  chat: '💬',
  images: '🎨',
  editor: '🖌️',
  video: '🎬',
  music: '🎵',
  tts: '🗣️',
  audio: '🔊',
  devtools: '🧩',
  openhands: '🙌',
  theia: '💎',
  deepseek: '🔮',
  codeeditor: '💻',
  tools: '🛠️',
  fileexplorer: '📁',
  terminal: '⌨️',
  balance: '💰',
  browser: '🌐',
  workbench: '📋',
  automation: '⚡',
  agents: '👥',
  memory: '🧠',
  channels: '📡',
  freebuff: '⚡',
  orchestrator: '🕸️',
};

function getGradient(color: string): string {
  const gradients: Record<string, string> = {
    'neon-green': 'linear-gradient(135deg, #22c55e, #15803d)',
    'neon-blue': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'neon-purple': 'linear-gradient(135deg, #a855f7, #7c3aed)',
    'neon-yellow': 'linear-gradient(135deg, #eab308, #a16207)',
    'neon-red': 'linear-gradient(135deg, #ef4444, #b91c1c)',
    'neon-orange': 'linear-gradient(135deg, #f97316, #c2410c)',
    'neon-cyan': 'linear-gradient(135deg, #06b6d4, #0e7490)',
    'neon-pink': 'linear-gradient(135deg, #ec4899, #be185d)',
    'emerald-400': 'linear-gradient(135deg, #34d399, #059669)',
    'orange-400': 'linear-gradient(135deg, #fb923c, #ea580c)',
    'cyan-400': 'linear-gradient(135deg, #22d3ee, #0891b2)',
    'text-secondary': 'linear-gradient(135deg, #94a3b8, #475569)',
  };
  return gradients[color] || 'linear-gradient(135deg, #22c55e, #15803d)';
}

export function IOSHomeScreen() {
  const { openApp } = useOS();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allApps = APP_DEFINITIONS;

  const filteredApps = searchQuery
    ? allApps.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : allApps;

  // Split into pages of 24 (6 cols x 4 rows)
  const appsPerPage = 24;
  const pages = [];
  for (let i = 0; i < filteredApps.length; i += appsPerPage) {
    pages.push(filteredApps.slice(i, i + appsPerPage));
  }

  return (
    <div className="fixed inset-0 z-[100] pt-14 pb-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />

      {/* Search Bar */}
      {searchVisible && (
        <div className="absolute top-14 left-0 right-0 z-20 p-4 bg-black/60 backdrop-blur-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar apps..."
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:bg-white/15"
            autoFocus
          />
        </div>
      )}

      {/* Pages */}
      <div className="relative h-full overflow-hidden">
        {pages.map((pageApps, pageIndex) => (
          <div
            key={pageIndex}
            className="absolute inset-0 px-6 pt-4"
          >
            <div className="grid grid-cols-4 gap-x-4 gap-y-5">
              {pageApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => openApp(app.id)}
                  className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform duration-150"
                >
                  {/* Icon */}
                  <div
                    className="w-[58px] h-[58px] rounded-[15px] flex items-center justify-center text-2xl shadow-lg relative overflow-hidden"
                    style={{ background: getGradient(app.color) }}
                  >
                    {/* Gloss effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent" />
                    <span className="relative z-10 drop-shadow-md">{APP_ICONS[app.id] || '📱'}</span>
                  </div>

                  {/* Label */}
                  <span className="text-[10px] text-white/90 text-center leading-tight font-medium w-16 truncate drop-shadow-sm">
                    {app.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Page dots */}
      <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-1.5">
        {pages.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>

      {/* Search trigger (swipe up indicator) */}
      {!searchVisible && (
        <button
          onClick={() => setSearchVisible(true)}
          className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-white/10 backdrop-blur-sm rounded-full"
        >
          <span className="text-[11px] text-white/60">🔍 Buscar</span>
        </button>
      )}
    </div>
  );
}
