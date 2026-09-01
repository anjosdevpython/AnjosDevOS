'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  Terminal,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type ActiveTab = 'html' | 'css' | 'js';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>AnjosDevOS Live Playground</title>
</head>
<body>
  <div class="card">
    <div class="badge">🚀 AnjosDevOS Web Playground</div>
    <h1>Construa em Tempo Real</h1>
    <p>Edite o HTML, CSS e JavaScript à esquerda e veja a renderização instantânea ao vivo!</p>
    
    <div class="button-group">
      <button id="btnClick" class="btn primary">Contador: <span id="count">0</span></button>
      <button id="btnAnimate" class="btn secondary">Efeito Neon ✨</button>
    </div>
  </div>
</body>
</html>`;

const DEFAULT_CSS = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top right, #1e1b4b, #030712);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #f8fafc;
  padding: 20px;
}

.card {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 32px;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
  text-align: center;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.card:hover {
  transform: translateY(-4px);
}

.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  padding: 4px 12px;
  border-radius: 99px;
  margin-bottom: 16px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

h1 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 12px;
  background: linear-gradient(to right, #38bdf8, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 24px;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn.primary {
  background: linear-gradient(135deg, #0284c7, #6366f1);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn.primary:hover {
  filter: brightness(1.15);
  transform: scale(1.04);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}`;

const DEFAULT_JS = `let count = 0;
const countEl = document.getElementById('count');
const btnClick = document.getElementById('btnClick');
const btnAnimate = document.getElementById('btnAnimate');
const card = document.querySelector('.card');

btnClick.addEventListener('click', () => {
  count++;
  countEl.textContent = count;
  console.log('Contador atualizado para:', count);
});

btnAnimate.addEventListener('click', () => {
  card.style.boxShadow = '0 0 40px rgba(56, 189, 248, 0.8), 0 0 80px rgba(99, 102, 241, 0.4)';
  setTimeout(() => {
    card.style.boxShadow = '0 25px 60px -15px rgba(0, 0, 0, 0.7)';
  }, 1000);
  console.log('Efeito Neon ativado!');
});

console.log('Playground inicializado com sucesso!');`;

export function LivePlaygroundApp() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [js, setJs] = useState(DEFAULT_JS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('html');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updatePreview = () => {
    const combinedCode = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            // Interceptar console.log
            const _log = console.log;
            console.log = function(...args) {
              window.parent.postMessage({ type: 'PLAYGROUND_LOG', message: args.join(' ') }, '*');
              _log.apply(console, args);
            };
            try {
              ${js}
            } catch (err) {
              console.log('Erro de Execução: ' + err.message);
            }
          </script>
        </body>
      </html>
    `;

    if (iframeRef.current) {
      iframeRef.current.srcdoc = combinedCode;
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PLAYGROUND_LOG') {
        setLogs((prev) => [...prev.slice(-30), event.data.message]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const timer = setTimeout(updatePreview, 300);
    return () => clearTimeout(timer);
  }, [html, css, js]);

  const getViewportWidth = () => {
    if (viewport === 'mobile') return '375px';
    if (viewport === 'tablet') return '600px';
    return '100%';
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#080b12] text-slate-100 font-sans select-none">
      {/* Toolbar */}
      <div className="h-11 px-4 border-b border-white/10 bg-[#0d121f] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090d16] border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab('html')}
              className={cn(
                'px-3 py-1 rounded-lg transition-colors font-medium',
                activeTab === 'html' ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-slate-400 hover:text-white'
              )}
            >
              HTML
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={cn(
                'px-3 py-1 rounded-lg transition-colors font-medium',
                activeTab === 'css' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
              )}
            >
              CSS
            </button>
            <button
              onClick={() => setActiveTab('js')}
              className={cn(
                'px-3 py-1 rounded-lg transition-colors font-medium',
                activeTab === 'js' ? 'bg-yellow-500/20 text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'
              )}
            >
              JavaScript
            </button>
          </div>
        </div>

        {/* Center: Viewport switches */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090d16] border border-white/10 text-xs hidden md:flex">
          <button
            onClick={() => setViewport('desktop')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              viewport === 'desktop' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            )}
            title="Desktop View (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              viewport === 'tablet' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            )}
            title="Tablet View (600px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              viewport === 'mobile' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            )}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-colors',
              showLogs ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            )}
          >
            <Terminal className="w-3 h-3" />
            <span>Console ({logs.length})</span>
          </button>

          <button
            onClick={updatePreview}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/40 text-xs font-medium transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Editor Left, Live Preview Right */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Code Editor */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-white/10">
          <MonacoEditor
            height="100%"
            language={activeTab === 'js' ? 'javascript' : activeTab}
            theme="vs-dark"
            value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
            onChange={(val) => {
              if (activeTab === 'html') setHtml(val || '');
              else if (activeTab === 'css') setCss(val || '');
              else setJs(val || '');
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'JetBrains Mono',
              padding: { top: 12, bottom: 12 },
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Right Live Preview Iframe */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#03060c] items-center justify-center p-3 relative overflow-hidden">
          <div
            className="h-full bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 border border-white/10"
            style={{ width: getViewportWidth(), maxWidth: '100%' }}
          >
            <iframe
              ref={iframeRef}
              title="Live Playground Output"
              className="w-full h-full border-0 bg-transparent"
              sandbox="allow-scripts allow-modals"
            />
          </div>

          {/* Floating Console Drawer */}
          {showLogs && (
            <div className="absolute bottom-3 left-3 right-3 h-40 bg-[#0c101d]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 flex flex-col z-30 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-400">
                <span className="text-[10px] uppercase font-bold">Console Output</span>
                <button onClick={() => setLogs([])} className="hover:text-white text-[10px]">
                  Limpar
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-2 space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="text-emerald-400 text-[11px]">
                    › {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-slate-600 text-[11px]">Nenhuma saída no console.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}