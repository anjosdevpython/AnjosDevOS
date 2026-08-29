'use client';

import { useState, useEffect } from 'react';
import { Wifi, BatteryCharging, Sparkles, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IOSStatusBarProps {
  onNotificationPull?: () => void;
  onControlCenterPull?: () => void;
  isDynamicIslandExpanded?: boolean;
  onToggleDynamicIsland?: () => void;
}

export function IOSStatusBar({
  onNotificationPull,
  onControlCenterPull,
  isDynamicIslandExpanded = false,
  onToggleDynamicIsland,
}: IOSStatusBarProps) {
  const [time, setTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [isCharging, setIsCharging] = useState(false);
  const [islandMode, setIslandMode] = useState<'idle' | 'active'>('active');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-13 z-[10005] select-none pointer-events-auto">
      {/* Interactive Top Pull Zones */}
      <div className="absolute inset-0 flex justify-between pointer-events-auto">
        <div
          onClick={onNotificationPull}
          className="w-1/3 h-full cursor-pointer"
          title="Puxar Central de Notificações"
        />
        <div
          onClick={onToggleDynamicIsland}
          className="w-1/3 h-full cursor-pointer flex justify-center"
          title="Expandir Dynamic Island"
        />
        <div
          onClick={onControlCenterPull}
          className="w-1/3 h-full cursor-pointer"
          title="Puxar Central de Controle"
        />
      </div>

      <div className="relative w-full h-11 flex items-center justify-between px-7 pt-1 pointer-events-none">
        {/* Left: Authentic iOS Clock */}
        <div className="flex items-center gap-1 pointer-events-auto">
          <span className="text-white text-[14px] font-semibold tracking-tight font-sans tabular-nums">
            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Center: Authentic Dynamic Island (Interactive & Expandable) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 pointer-events-auto">
          <div
            onClick={onToggleDynamicIsland}
            className={cn(
              'bg-black rounded-[28px] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_10px_30px_rgba(0,0,0,0.9)] cursor-pointer flex items-center justify-between px-3 relative overflow-hidden group border border-white/5',
              isDynamicIslandExpanded
                ? 'w-80 h-28 p-3.5'
                : 'w-[124px] h-[34px] hover:scale-105 active:scale-95'
            )}
          >
            {/* Camera and Sensor Punch Holes */}
            {!isDynamicIslandExpanded ? (
              <>
                {/* Left: Swarm AI Activity Pill */}
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-tight">
                    SWARM
                  </span>
                </div>

                {/* Right: Camera Lens & Equalizer */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-pulse delay-75" />
                    <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-150" />
                  </div>
                  {/* Camera Ring Reflection */}
                  <div className="w-3 h-3 rounded-full bg-[#111] border border-[#222] flex items-center justify-center relative">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#051125] border border-blue-900/60" />
                  </div>
                </div>
              </>
            ) : (
              /* Expanded Dynamic Island Widget */
              <div className="w-full h-full flex flex-col justify-between text-white animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">AnjosDevOS Swarm</h4>
                      <p className="text-[10px] text-cyan-300">7 Agentes Especialistas Ativos</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    ONLINE
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pt-2 border-t border-white/10">
                  <span>Modelo: Claude 3.7 / GPT-4o</span>
                  <span className="text-cyan-400">Toque para recolher ✕</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Authentic iOS Signal, 5G, Wi-Fi & Battery */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* iOS Cellular 4-Bar Signal */}
          <div className="flex items-end gap-[1.5px] h-3">
            <span className="w-[3px] h-[3px] bg-white rounded-[0.5px]" />
            <span className="w-[3px] h-[5px] bg-white rounded-[0.5px]" />
            <span className="w-[3px] h-[8px] bg-white rounded-[0.5px]" />
            <span className="w-[3px] h-[11px] bg-white rounded-[0.5px]" />
          </div>

          <span className="text-[10px] font-bold text-white font-sans tracking-tight">5G</span>

          {/* iOS Wi-Fi Curved Waves Icon */}
          <Wifi className="w-4 h-4 text-white stroke-[2.5]" />

          {/* iOS Authentic Battery Capsule */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-white font-sans tabular-nums">
              {batteryLevel}%
            </span>
            <div className="w-[23px] h-[11.5px] border-[1.5px] border-white/80 rounded-[4px] p-[1.5px] relative flex items-center">
              <div
                className="h-full bg-white rounded-[1.5px] transition-all"
                style={{ width: `${batteryLevel}%` }}
              />
              {/* Positive Battery Terminal Bump */}
              <div className="absolute -right-[3.5px] top-[2.5px] w-[1.5px] h-[4.5px] bg-white/80 rounded-r-[1px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
