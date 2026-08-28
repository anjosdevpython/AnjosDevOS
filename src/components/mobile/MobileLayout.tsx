'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Home,
  MessageSquare,
  Grid3X3,
  Settings,
  ChevronLeft,
  Menu,
  X,
  Search,
  Bell,
  User,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOS } from '../os/OSContext';
import { APP_DEFINITIONS } from '../os/types';
import { ICON_COMPONENTS, getAppContent } from '../os/AppRegistry';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Handle swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && openApp) {
        // Swipe right = close app
        setOpenApp(null);
      }
    }
  }, [openApp]);

  // Close app on back button
  useEffect(() => {
    const handleBackButton = () => {
      if (openApp) {
        setOpenApp(null);
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [openApp]);

  // Push state when app opens
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

  // Filter apps for search
  const filteredApps = APP_DEFINITIONS.filter((app) =>
    !searchQuery || app.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get quick access apps (most used)
  const quickApps = APP_DEFINITIONS.filter((a) =>
    ['chat', 'codeeditor', 'fileexplorer', 'tools'].includes(a.id)
  );

  // Get all apps grouped by category
  const appsByCategory = {
    ai: APP_DEFINITIONS.filter((a) => a.category === 'ai'),
    tools: APP_DEFINITIONS.filter((a) => a.category === 'tools'),
    system: APP_DEFINITIONS.filter((a) => a.category === 'system'),
  };

  // If an app is open, show it full screen
  if (openApp) {
    return (
      <div className="h-[100dvh] flex flex-col bg-cyber-bg">
        {/* App Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-cyber-card border-b border-cyber-border safe-area-top">
          <button
            onClick={closeApp}
            className="p-2 rounded-lg hover:bg-cyber-hover text-text-primary"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold text-text-primary flex-1 truncate">
            {openApp.title}
          </h1>
          <button className="p-2 rounded-lg hover:bg-cyber-hover text-text-muted">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* App Content */}
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
    <div className="h-[100dvh] flex flex-col bg-cyber-bg">
      {/* Status Bar Spacer */}
      <div className="h-safe-area-top" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyber-card/80 backdrop-blur-xl border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
            <span className="text-sm">⚡</span>
          </div>
          <div>
            <h1 className="text-sm font-bold gradient-text">AnjosDevOS</h1>
            <p className="text-[9px] text-text-muted">Mobile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg hover:bg-cyber-hover text-text-muted"
          >
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-cyber-hover text-text-muted relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-neon-red rounded-full" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-cyber-card border-b border-cyber-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar apps..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-cyber-bg border border-cyber-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-green/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="p-4">
            {/* Quick Access */}
            <section className="mb-6">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Acesso Rápido
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {quickApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openAppById(app.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-cyber-card border border-cyber-border hover:border-neon-green/30 transition-all active:scale-95"
                  >
                    <div className={`text-${app.color}`}>
                      {ICON_COMPONENTS[app.iconName] || <Grid3X3 className="w-6 h-6" />}
                    </div>
                    <span className="text-[10px] text-text-secondary text-center leading-tight">
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Recent */}
            <section className="mb-6">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Recente
              </h2>
              <div className="space-y-2">
                {APP_DEFINITIONS.slice(0, 3).map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openAppById(app.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-cyber-card border border-cyber-border hover:border-neon-green/30 transition-all active:scale-[0.98]"
                  >
                    <div className={`text-${app.color}`}>
                      {ICON_COMPONENTS[app.iconName] || <Grid3X3 className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-text-primary">{app.title}</p>
                      <p className="text-[10px] text-text-muted">Último uso: agora</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-text-muted rotate-180" />
                  </button>
                ))}
              </div>
            </section>

            {/* Stats */}
            <section>
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Status do Sistema
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                  <p className="text-lg font-bold text-neon-green">9</p>
                  <p className="text-[10px] text-text-muted">Providers Ativos</p>
                </div>
                <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                  <p className="text-lg font-bold text-neon-blue">21</p>
                  <p className="text-[10px] text-text-muted">Skills Disponíveis</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="p-4">
            {searchQuery ? (
              /* Search Results */
              <div className="space-y-2">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => openAppById(app.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-cyber-card border border-cyber-border hover:border-neon-green/30 transition-all active:scale-[0.98]"
                  >
                    <div className={`text-${app.color}`}>
                      {ICON_COMPONENTS[app.iconName] || <Grid3X3 className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-text-primary">{app.title}</p>
                      <p className="text-[10px] text-text-muted capitalize">{app.category}</p>
                    </div>
                  </button>
                ))}
                {filteredApps.length === 0 && (
                  <div className="text-center py-8 text-text-muted">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Nenhum app encontrado</p>
                  </div>
                )}
              </div>
            ) : (
              /* App Categories */
              Object.entries(appsByCategory).map(([category, apps]) => (
                <section key={category} className="mb-6">
                  <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    {category === 'ai' ? '🧠 IA' : category === 'tools' ? '🛠️ Ferramentas' : '⚙️ Sistema'}
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {apps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => openAppById(app.id)}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-cyber-card border border-cyber-border hover:border-neon-green/30 transition-all active:scale-95"
                      >
                        <div className={`text-${app.color}`}>
                          {ICON_COMPONENTS[app.iconName] || <Grid3X3 className="w-6 h-6" />}
                        </div>
                        <span className="text-[10px] text-text-secondary text-center leading-tight">
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
          <div className="h-full">
            {getAppContent('chat')}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full">
            {getAppContent('settings')}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around px-4 py-2 bg-cyber-card/95 backdrop-blur-xl border-t border-cyber-border safe-area-bottom">
        {[
          { id: 'home' as MobileTab, icon: Home, label: 'Início' },
          { id: 'apps' as MobileTab, icon: Grid3X3, label: 'Apps' },
          { id: 'chat' as MobileTab, icon: MessageSquare, label: 'Chat' },
          { id: 'settings' as MobileTab, icon: Settings, label: 'Config' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
              activeTab === tab.id
                ? 'text-neon-green bg-neon-green/10'
                : 'text-text-muted'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
