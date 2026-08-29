'use client';

import { useState } from 'react';
import { 
  BROWSER_PROFILES, 
  createBrowserTab, 
  createBrowserWorkspace,
  generateBrowserReport,
  type BrowserWorkspace, 
  type BrowserTab,
  type ViewportSize 
} from '@/lib/integrations/cowork-browser';

const VIEWPORT_ICONS: Record<ViewportSize, string> = {
  desktop: '🖥️',
  tablet: '📱',
  mobile: '📲',
  custom: '⚙️',
};

export function BrowserWorkbenchApp() {
  const [workspace, setWorkspace] = useState<BrowserWorkspace>(() => createBrowserWorkspace('Meu Espaço de Trabalho'));
  const [activeTabId, setActiveTabId] = useState<string>(workspace.tabs[0]?.id || '');
  const [urlInput, setUrlInput] = useState('https://');
  const [showReport, setShowReport] = useState(false);
  const [activeProfile, setActiveProfile] = useState(workspace.profile.id);
  const [view, setView] = useState<'browser' | 'diagnostics' | 'profiles'>('browser');

  const activeTab = workspace.tabs.find(t => t.id === activeTabId);

  const handleNavigate = () => {
    if (!urlInput.startsWith('http')) return;
    setWorkspace(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => 
        t.id === activeTabId 
          ? { ...t, url: urlInput, title: new URL(urlInput).hostname, isLoading: true }
          : t
      ),
      lastActivity: new Date(),
    }));
    // Simulate loading
    setTimeout(() => {
      setWorkspace(prev => ({
        ...prev,
        tabs: prev.tabs.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t),
      }));
    }, 1500);
  };

  const addTab = () => {
    const tab = createBrowserTab('https://example.com');
    setWorkspace(prev => ({ ...prev, tabs: [...prev.tabs, tab] }));
    setActiveTabId(tab.id);
  };

  const closeTab = (tabId: string) => {
    setWorkspace(prev => {
      const newTabs = prev.tabs.filter(t => t.id !== tabId);
      if (newTabs.length === 0) {
        const tab = createBrowserTab();
        return { ...prev, tabs: [tab] };
      }
      return { ...prev, tabs: newTabs };
    });
  };

  const takeScreenshot = () => {
    if (!activeTab) return;
    setWorkspace(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => 
        t.id === activeTabId 
          ? { ...t, screenshots: [...t.screenshots, { 
              id: `ss-${Date.now()}`, 
              url: t.url, 
              timestamp: new Date(), 
              viewport: t.viewport 
            }] }
          : t
      ),
    }));
  };

  const changeViewport = (viewport: ViewportSize) => {
    setWorkspace(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => t.id === activeTabId ? { ...t, viewport } : t),
    }));
  };

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <span className="font-bold">Browser Workbench</span>
        </div>
        <div className="flex gap-1">
          {(['browser', 'diagnostics', 'profiles'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded text-sm ${view === v ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {v === 'browser' ? '🌐 Browser' : v === 'diagnostics' ? '📊 Diagnostics' : '⚙️ Profiles'}
            </button>
          ))}
        </div>
      </div>

      {view === 'browser' && (
        <>
          {/* Tab Bar */}
          <div className="flex items-center bg-black/20 border-b border-white/10">
            <div className="flex overflow-x-auto">
              {workspace.tabs.map(tab => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-white/10 min-w-[120px] max-w-[200px] ${
                    tab.id === activeTabId ? 'bg-white/10' : 'bg-white/5 hover:bg-white/8'
                  }`}
                >
                  {tab.isLoading && <span className="animate-spin text-xs">⏳</span>}
                  <span className="text-xs truncate flex-1">{tab.title || 'New Tab'}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                    className="text-white/40 hover:text-white/80 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addTab} className="px-3 py-2 text-white/60 hover:text-white text-sm">+</button>
          </div>

          {/* URL Bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-black/20 border-b border-white/10">
            <div className="flex items-center gap-1">
              <button onClick={() => changeViewport('desktop')} className={`p-1 rounded ${activeTab?.viewport === 'desktop' ? 'bg-white/20' : ''}`} title="Desktop">🖥️</button>
              <button onClick={() => changeViewport('tablet')} className={`p-1 rounded ${activeTab?.viewport === 'tablet' ? 'bg-white/20' : ''}`} title="Tablet">📱</button>
              <button onClick={() => changeViewport('mobile')} className={`p-1 rounded ${activeTab?.viewport === 'mobile' ? 'bg-white/20' : ''}`} title="Mobile">📲</button>
            </div>
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNavigate()}
              className="flex-1 bg-white/10 rounded px-3 py-1 text-sm border border-white/20 focus:border-green-500 outline-none"
              placeholder="Digite a URL..."
            />
            <button onClick={handleNavigate} className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700">Ir</button>
            <button onClick={takeScreenshot} className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-700">📸 Captura</button>
          </div>

          {/* Browser Content */}
          <div className="flex-1 flex">
            {/* Main Browser View */}
            <div className="flex-1 flex items-center justify-center bg-white/5 m-2 rounded">
              {activeTab ? (
                <div className="text-center">
                  <div className="text-4xl mb-4">🌐</div>
                  <div className="text-lg font-bold mb-2">{activeTab.title}</div>
                  <div className="text-white/60 text-sm mb-4">{activeTab.url}</div>
                  {activeTab.isLoading && (
                    <div className="text-blue-400 text-sm">Carregando...</div>
                  )}
                  <div className="text-white/40 text-xs mt-4">
                    Viewport: {VIEWPORT_ICONS[activeTab.viewport]} {activeTab.viewport}
                  </div>
                </div>
              ) : (
                <div className="text-white/40">Nenhuma aba ativa</div>
              )}
            </div>

            {/* Right Panel - Screenshots */}
            {activeTab && activeTab.screenshots.length > 0 && (
              <div className="w-48 bg-black/20 border-l border-white/10 p-2 overflow-y-auto">
                <div className="text-xs font-bold mb-2 text-white/60">Capturas</div>
                {activeTab.screenshots.map(ss => (
                  <div key={ss.id} className="mb-2 p-2 bg-white/5 rounded text-xs">
                    <div>{VIEWPORT_ICONS[ss.viewport]} {ss.viewport}</div>
                    <div className="text-white/40">{ss.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'diagnostics' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="font-bold mb-4">Diagnósticos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded">
              <div className="text-sm font-bold mb-2">Console</div>
              <div className="text-2xl text-green-400">0 erros</div>
              <div className="text-sm text-white/60">0 avisos</div>
            </div>
            <div className="bg-white/5 p-4 rounded">
              <div className="text-sm font-bold mb-2">Rede</div>
              <div className="text-2xl text-green-400">0 falhas</div>
              <div className="text-sm text-white/60">0 requisições lentas</div>
            </div>
            <div className="bg-white/5 p-4 rounded">
              <div className="text-sm font-bold mb-2">Performance</div>
              <div className="text-2xl text-green-400">Boa</div>
              <div className="text-sm text-white/60">Nenhum problema detectado</div>
            </div>
            <div className="bg-white/5 p-4 rounded">
              <div className="text-sm font-bold mb-2">Capturas</div>
              <div className="text-2xl text-blue-400">{activeTab?.screenshots.length || 0}</div>
              <div className="text-sm text-white/60">Capturadas</div>
            </div>
          </div>
          <button
            onClick={() => setShowReport(!showReport)}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            {showReport ? 'Ocultar Relatório' : 'Gerar Relatório'}
          </button>
          {showReport && (
            <pre className="mt-4 p-4 bg-black/30 rounded text-xs overflow-auto max-h-64">
              {generateBrowserReport(workspace)}
            </pre>
          )}
        </div>
      )}

      {view === 'profiles' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="font-bold mb-4">Perfis do Navegador</h3>
          <div className="grid grid-cols-2 gap-3">
            {BROWSER_PROFILES.map(profile => (
              <div
                key={profile.id}
                onClick={() => {
                  setActiveProfile(profile.id);
                  setWorkspace(prev => ({ ...prev, profile }));
                }}
                className={`p-4 rounded cursor-pointer border ${
                  activeProfile === profile.id 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{profile.icon}</span>
                  <span className="font-bold">{profile.name}</span>
                </div>
                <div className="text-sm text-white/60">{profile.description}</div>
                <div className="flex gap-2 mt-2 text-xs">
                  {profile.enableConsoleCapture && <span className="bg-blue-500/20 px-2 py-0.5 rounded">Console</span>}
                  {profile.enableNetworkCapture && <span className="bg-purple-500/20 px-2 py-0.5 rounded">Rede</span>}
                  {profile.autoScreenshot && <span className="bg-green-500/20 px-2 py-0.5 rounded">Capturas</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
