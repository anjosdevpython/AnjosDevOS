'use client';

import { useState } from 'react';
import {
  Wifi,
  Bluetooth,
  Moon,
  Sun,
  Volume2,
  Lock,
  Timer,
  Calculator,
  Camera,
  QrCode,
  Sparkles,
  Zap,
  Radio,
  Sliders,
  X,
} from 'lucide-react';

interface ToggleItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  color: string;
}

export function IOSControlCenter({ onClose }: { onClose: () => void }) {
  const [toggles, setToggles] = useState<ToggleItem[]>([
    { id: 'airplane', icon: <span className="text-base">✈️</span>, label: 'Modo Avião', active: false, color: '#f97316' },
    { id: 'cellular', icon: <span className="text-base">📶</span>, label: 'Dados Móveis', active: true, color: '#22c55e' },
    { id: 'wifi', icon: <Wifi className="w-5 h-5" />, label: 'Wi-Fi 6', active: true, color: '#0284c7' },
    { id: 'bluetooth', icon: <Bluetooth className="w-5 h-5" />, label: 'Bluetooth', active: true, color: '#0284c7' },
  ]);

  const [focusActive, setFocusActive] = useState(false);
  const [rotationLock, setRotationLock] = useState(false);
  const [brightness, setBrightness] = useState(85);
  const [volume, setVolume] = useState(65);

  const toggleConnectivity = (id: string) => {
    setToggles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  return (
    <div
      className="fixed inset-0 z-[10008] bg-black/60 backdrop-blur-2xl p-4 pt-12 flex justify-end animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm flex flex-col gap-3.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Header */}
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" /> Central de Controle
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Row 1: 2x2 Connectivity Platter & Media Platter */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Connectivity Group */}
          <div className="p-3 rounded-[26px] bg-white/[0.12] dark:bg-black/40 backdrop-blur-3xl border border-white/20 shadow-xl grid grid-cols-2 gap-2.5">
            {toggles.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleConnectivity(item.id)}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                  item.active ? 'text-white shadow-md' : 'bg-white/10 text-white/40'
                }`}
                style={{
                  backgroundColor: item.active ? item.color : undefined,
                }}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>

          {/* Now Playing / Swarm Audio Platter */}
          <div className="p-3.5 rounded-[26px] bg-white/[0.12] dark:bg-black/40 backdrop-blur-3xl border border-white/20 shadow-xl flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-[11px] font-bold text-white truncate">AnjosDevOS Audio</p>
                <p className="text-[9px] text-cyan-300 truncate">Synthesizer v2.0</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white pt-2 border-t border-white/10">
              <button className="hover:text-cyan-300">⏮</button>
              <button className="hover:text-cyan-300">▶️</button>
              <button className="hover:text-cyan-300">⏭</button>
            </div>
          </div>
        </div>

        {/* Row 2: Focus, Rotation & Vertical Sliders */}
        <div className="grid grid-cols-4 gap-3.5">
          {/* Rotation Lock */}
          <button
            onClick={() => setRotationLock(!rotationLock)}
            className={`h-[135px] rounded-[24px] p-3 flex flex-col items-center justify-between transition-all border border-white/15 ${
              rotationLock ? 'bg-white text-black' : 'bg-white/[0.12] dark:bg-black/40 text-white'
            }`}
          >
            <Lock className="w-5 h-5 mt-1" />
            <span className="text-[9px] font-semibold text-center leading-tight">Travar Rotação</span>
          </button>

          {/* Focus Mode */}
          <button
            onClick={() => setFocusActive(!focusActive)}
            className={`h-[135px] rounded-[24px] p-3 flex flex-col items-center justify-between transition-all border border-white/15 ${
              focusActive ? 'bg-purple-600 text-white' : 'bg-white/[0.12] dark:bg-black/40 text-white'
            }`}
          >
            <Moon className="w-5 h-5 mt-1" />
            <span className="text-[9px] font-semibold text-center leading-tight">Foco / Não Perturbe</span>
          </button>

          {/* Brightness Vertical Slider */}
          <div className="h-[135px] rounded-[24px] bg-white/[0.12] dark:bg-black/40 border border-white/20 p-2 relative overflow-hidden flex flex-col justify-end items-center shadow-inner">
            <div
              className="absolute bottom-0 left-0 right-0 bg-white/90 rounded-[20px] transition-all"
              style={{ height: `${brightness}%` }}
            />
            <Sun className="w-5 h-5 text-slate-800 relative z-10 mb-2 pointer-events-none" />
            <input
              type="range"
              min="10"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Volume Vertical Slider */}
          <div className="h-[135px] rounded-[24px] bg-white/[0.12] dark:bg-black/40 border border-white/20 p-2 relative overflow-hidden flex flex-col justify-end items-center shadow-inner">
            <div
              className="absolute bottom-0 left-0 right-0 bg-white/90 rounded-[20px] transition-all"
              style={{ height: `${volume}%` }}
            />
            <Volume2 className="w-5 h-5 text-slate-800 relative z-10 mb-2 pointer-events-none" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Row 3: Quick Utilities */}
        <div className="grid grid-cols-4 gap-3.5">
          {[
            { label: 'Timer', icon: <Timer className="w-5 h-5" /> },
            { label: 'Calculadora', icon: <Calculator className="w-5 h-5" /> },
            { label: 'Câmera', icon: <Camera className="w-5 h-5" /> },
            { label: 'QR Code', icon: <QrCode className="w-5 h-5" /> },
          ].map((item) => (
            <button
              key={item.label}
              className="h-14 rounded-[22px] bg-white/[0.12] dark:bg-black/40 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all shadow-md"
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
