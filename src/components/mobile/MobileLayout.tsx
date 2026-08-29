'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Home,
  MessageSquare,
  Grid3X3,
  Settings,
  ChevronLeft,
  X,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_DEFINITIONS } from '../os/types';
import { getAppContent } from '../os/AppRegistry';
import { IOSAppIcon } from '../ios/IOSAppIcons';

type MobileTab = 'home' | 'apps' | 'chat' | 'settings';

interface MobileAppState {
  id: string;
  appId: string;
  title: string;
}

export function MobileLayout() {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [openApp, setOpenApp] = useState<MobileAppState | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Gesto de deslizar para fechar app
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 60) {
      if (deltaX > 0 && openApp) {
        setOpenApp(null);
      }
    }
  }, [openApp]);

  // Botão voltar do navegador
  useEffect(() => {
    const handleBackButton = () => {
      if (openApp) {
        setOpenApp(null);
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [openApp]);

  useEffect(() => {
    if (openApp) {
      window.history.pushState({ app: openApp.appId }, '', '');
    }
  }, [openApp]);

  const openAppById = (appId: string) => {
    const appDef = APP_DEFINITIONS.find((a) => a.id === appId);
    if (appDef) {
      setOpenApp({ id: `mobile-${Date.now()}`, appId, title: appDef.title });
    }
  };

  const closeApp = () => {
    setOpenApp(null);
  };

  const filteredApps = APP_DEFINITIONS.filter((app) =>
    !searchQuery || app.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickApps = APP_DEFINITIONS.filter((a) =>
    ['chat', 'codeeditor', 'automation-studio', 'agent-teams', 'terminal', 'fileexplorer'].includes(a.id)
  );

  const appsByCategory = {
    ai: APP_DEFINITIONS.filter((a) => a.category === 'ai'),
    tools: APP_DEFINITIONS.filter((a) => a.category === 'tools'),
    system: APP_DEFINITIONS.filter((a) => a.category === 'system'),
  };

  // Se um app estiver aberto, exibe em tela cheia com header mobile
  if (openApp) {
    return (
      <div className="h-[100dvh] flex flex-col bg-[#07090e] text-slate-100">
        {/* App Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0d121f] border-b border-white/10 safe-area-top">
          <button
            onClick={closeApp}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-white flex-1 truncate font-mono">
            {openApp.title}
          </h1>
          <button
            onClick={closeApp}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* App Content Container */}
        <div
          className="flex-1 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {getAppContent(openApp.appId)}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#07090e] text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d121f]/90 backdrop-blur-xl border-b border-white/10 safe-area-top">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-7 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="AnjosDevOS"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,210,255,0.7)]"
            />
          </div>
          <div>
            <h1 className="text-sm font-black gradient-text font-mono">AnjosDevOS</h1>
            <p className="text-[9px] text-cyan-400 font-mono">Swarm v2.0 · 7 Agentes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2.5 bg-[#090d18] border-b border-white/10 animate-slide-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar apps e agentes..."
              autoFocus
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#05070d] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-cyan-400 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'home' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Quick Access */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
                ⚡ Acesso Rápido
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {quickApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openAppById(app.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#0e121e] border border-white/10 hover:border-cyan-400/40 active:scale-95 transition-all shadow-sm group"
                  >
                    <IOSAppIcon appId={app.id} size={48} className="group-hover:scale-105" />
                    <span className="text-[11px] font-semibold text-slate-200 text-center leading-tight truncate max-w-full">
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Swarm Status Card */}
            <section className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#0e1424] to-blue-950/40 border border-cyan-500/30 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300 font-mono">⚡ Swarm Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  7/7 ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Agentes autônomos prontos para planejar, codificar, auditar e automatizar tarefas.
              </p>
              <button
                onClick={() => openAppById('agent-teams')}
                className="w-full py-2 bg-cyan-500 text-black font-bold text-xs rounded-xl hover:opacity-90 transition-all font-mono"
              >
                Abrir Painel de Agentes
              </button>
            </section>

            {/* All Apps Overview */}
            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
                📱 Aplicativos Recentes
              </h2>
              <div className="space-y-2">
                {APP_DEFINITIONS.slice(0, 5).map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openAppById(app.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0e121e] border border-white/5 hover:border-white/15 transition-all active:scale-[0.98]"
                  >
                    <IOSAppIcon appId={app.id} size={36} />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-white">{app.title}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{app.category}</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-500 rotate-180" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {searchQuery ? (
              <div className="space-y-2">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openAppById(app.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0e121e] border border-white/10 transition-all active:scale-[0.98]"
                  >
                    <IOSAppIcon appId={app.id} size={38} />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-white">{app.title}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{app.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              Object.entries(appsByCategory).map(([category, apps]) => (
                <section key={category}>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
                    {category === 'ai' ? '🧠 Inteligência Artificial' : category === 'tools' ? '🛠️ Desenvolvimento & Ferramentas' : '⚙️ Sistema'}
                  </h2>
                  <div className="grid grid-cols-3 gap-2.5">
                    {apps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => openAppById(app.id)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#0e121e] border border-white/5 hover:border-cyan-400/30 transition-all active:scale-95 group"
                      >
                        <IOSAppIcon appId={app.id} size={46} className="group-hover:scale-105" />
                        <span className="text-[10px] font-semibold text-slate-200 text-center leading-tight truncate max-w-full">
                          {app.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {getAppContent('chat')}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {getAppContent('settings')}
          </div>
        )}
      </div>

      {/* Bottom Navigation Dock */}
      <div className="flex items-center justify-around px-4 py-2 bg-[#090d18]/95 backdrop-blur-2xl border-t border-white/10 safe-area-bottom">
        {[
          { id: 'home' as MobileTab, icon: Home, label: 'Início' },
          { id: 'apps' as MobileTab, icon: Grid3X3, label: 'Apps' },
          { id: 'chat' as MobileTab, icon: MessageSquare, label: 'Chat IA' },
          { id: 'settings' as MobileTab, icon: Settings, label: 'Ajustes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all',
              activeTab === tab.id
                ? 'text-cyan-400 bg-cyan-500/15 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-mono">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
