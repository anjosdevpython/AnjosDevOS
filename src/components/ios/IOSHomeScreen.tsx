'use client';

import { useState } from 'react';
import { useOS } from '@/components/os/OSContext';
import { APP_DEFINITIONS } from '@/components/os/types';
import { IOSAppIcon } from './IOSAppIcons';
import { Search, Sparkles, Cpu, ShieldCheck, ArrowRight, X } from 'lucide-react';

export function IOSHomeScreen() {
  const { openApp } = useOS();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allApps = APP_DEFINITIONS;

  const filteredApps = searchQuery
    ? allApps.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : allApps;

  return (
    <div className="fixed inset-0 z-[100] pt-14 overflow-hidden select-none">
      {/* Authentic iOS 18 Iridescent Dark Wallpaper */}
      <div className="absolute inset-0 bg-[#050811]">
        <div className="absolute -top-[15%] -left-[10%] w-[750px] h-[750px] rounded-full bg-gradient-to-br from-blue-600/25 via-indigo-600/15 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-[20%] -right-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-cyan-500/20 via-teal-600/10 to-transparent blur-[150px] pointer-events-none" />
        <div className="absolute top-[25%] right-[20%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[130px] pointer-events-none" />
      </div>

      {/* Main Home Screen Container - Responsive Grid with generous clearance */}
      <div className="relative h-full overflow-y-auto px-4 sm:px-8 md:px-12 pt-2 pb-44 max-w-6xl mx-auto">
        {/* iOS 18 Top Widgets Row (Responsive 2, 3 or 4 columns) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Widget 1: Official Brand & Swarm Status */}
          <div className="p-4 rounded-[26px] bg-white/[0.12] dark:bg-black/40 backdrop-blur-3xl border border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] flex flex-col justify-between h-[155px]">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-9 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="AnjosDevOS"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,210,255,0.8)]"
                />
              </div>
              <div>
                <h3 className="text-xs font-black text-white tracking-wide font-mono leading-none">AnjosDevOS</h3>
                <span className="text-[9px] text-cyan-300 font-mono">v2.0 Autonomous</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-300 font-medium leading-tight">
                7 Agentes Especialistas Integrados
              </p>
              <div className="flex items-center gap-1.5 text-[9px] text-emerald-300 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]" />
                <span>SWARM ENGINE ONLINE</span>
              </div>
            </div>
          </div>

          {/* Widget 2: Fast Action Hub */}
          <div className="p-4 rounded-[26px] bg-white/[0.12] dark:bg-black/40 backdrop-blur-3xl border border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] flex flex-col justify-between h-[155px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Ações Rápidas
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                IA
              </span>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => openApp('codeeditor')}
                className="w-full py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center justify-between transition-colors"
              >
                <span>💻 Monaco IDE Swarm</span>
                <ArrowRight className="w-3 h-3 text-cyan-300" />
              </button>

              <button
                onClick={() => openApp('automation-studio')}
                className="w-full py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center justify-between transition-colors"
              >
                <span>⚡ Automation Studio</span>
                <ArrowRight className="w-3 h-3 text-emerald-300" />
              </button>
            </div>
          </div>

          {/* Widget 3: Telemetria de Modelos (Hidden on small screens) */}
          <div className="hidden lg:flex p-4 rounded-[26px] bg-white/[0.12] dark:bg-black/40 backdrop-blur-3xl border border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] flex-col justify-between h-[155px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Modelos Ativos
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                MULTI-LLM
              </span>
            </div>
            <div className="space-y-1 text-[10px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Claude 3.7 Sonnet</span>
                <span className="text-emerald-400">Pronto</span>
              </div>
              <div className="flex justify-between">
                <span>GPT-4o Reasoning</span>
                <span className="text-cyan-400">Ativo</span>
              </div>
              <div className="flex justify-between">
                <span>DeepSeek R1 Distill</span>
                <span className="text-purple-400">Local</span>
              </div>
            </div>
          </div>

          {/* Widget 4: Segurança & Qualidade (Hidden on small screens) */}
          <div className="hidden lg:flex p-4 rounded-[26px] bg-white/[0.12] dark:bg-black/40 backdrop-blur-3xl border border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] flex-col justify-between h-[155px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Auditoria OWASP
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                100/100
              </span>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              Análise estática de vulnerabilidades e testes Vitest integrados em tempo real.
            </p>
            <div className="text-[9px] text-cyan-300 font-mono font-bold">
              0 VULNERABILIDADES
            </div>
          </div>
        </div>

        {/* Authentic iOS 18 Responsive App Grid across entire screen */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-x-4 sm:gap-x-6 gap-y-7 place-items-center">
          {allApps.map((app) => (
            <button
              key={app.id}
              onClick={() => openApp(app.id)}
              className="flex flex-col items-center gap-1.5 w-[76px] sm:w-[84px] active:scale-85 hover:scale-105 transition-all duration-150 group"
            >
              {/* Authentic Apple HIG Vector Icon */}
              <IOSAppIcon appId={app.id} size={58} className="group-hover:scale-105" />

              {/* iOS App Label with multi-line wrap protection */}
              <span className="text-[11px] sm:text-[12px] text-white/95 text-center leading-tight font-medium w-full line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {app.title}
              </span>
            </button>
          ))}
        </div>

        {/* Spotlight Search Capsule Pill */}
        <div className="flex justify-center mt-10 mb-4">
          <button
            onClick={() => setIsSpotlightOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 text-white/75 hover:text-white hover:bg-black/60 active:scale-95 transition-all shadow-md"
          >
            <Search className="w-3.5 h-3.5 text-white/70" />
            <span className="text-[11px] font-semibold font-sans">Buscar</span>
          </button>
        </div>
      </div>

      {/* Authentic iOS Spotlight Search Overlay */}
      {isSpotlightOpen && (
        <div
          className="fixed inset-0 z-[10006] bg-black/65 backdrop-blur-2xl p-6 pt-16 flex flex-col items-center animate-fade-in"
          onClick={() => setIsSpotlightOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#161a26]/90 border border-white/20 rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 px-3 py-2 bg-white/10 rounded-2xl border border-white/10">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar apps, comandos e agentes..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 outline-none"
                autoFocus
              />
              <button onClick={() => setIsSpotlightOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => {
                    openApp(app.id);
                    setIsSpotlightOpen(false);
                  }}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <IOSAppIcon appId={app.id} size={42} />
                  <div>
                    <h4 className="text-xs font-bold text-white">{app.title}</h4>
                    <p className="text-[10px] text-slate-400 capitalize">{app.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
