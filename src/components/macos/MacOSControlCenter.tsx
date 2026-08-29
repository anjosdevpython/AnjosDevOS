'use client';

import { useState } from 'react';
import {
  Wifi,
  Bluetooth,
  Airplay,
  Moon,
  Sun,
  Volume2,
  Sliders,
  Battery,
  Music,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MacOSControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MacOSControlCenter({ isOpen, onClose }: MacOSControlCenterProps) {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airdrop, setAirdrop] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [volume, setVolume] = useState(80);
  const [brightness, setBrightness] = useState(90);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99995] select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-8 right-3 w-80 bg-[#151926]/90 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] p-3.5 space-y-3 text-slate-100 font-sans animate-slide-in"
      >
        {/* Top 4 Pill Toggles Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Wi-Fi */}
          <div
            onClick={() => setWifi(!wifi)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2.5"
          >
            <div className={cn('p-2 rounded-full', wifi ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400')}>
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold">Wi-Fi</p>
              <p className="text-[10px] text-slate-400 font-mono">{wifi ? 'Conectado' : 'Desligado'}</p>
            </div>
          </div>

          {/* Bluetooth */}
          <div
            onClick={() => setBluetooth(!bluetooth)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2.5"
          >
            <div className={cn('p-2 rounded-full', bluetooth ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400')}>
              <Bluetooth className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold">Bluetooth</p>
              <p className="text-[10px] text-slate-400 font-mono">{bluetooth ? 'Ativo' : 'Desligado'}</p>
            </div>
          </div>

          {/* AirDrop */}
          <div
            onClick={() => setAirdrop(!airdrop)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2.5"
          >
            <div className={cn('p-2 rounded-full', airdrop ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400')}>
              <Airplay className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold">AirDrop</p>
              <p className="text-[10px] text-slate-400 font-mono">{airdrop ? 'Todos' : 'Desligado'}</p>
            </div>
          </div>

          {/* Dark Mode */}
          <div
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2.5"
          >
            <div className={cn('p-2 rounded-full', darkMode ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400')}>
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold">Modo Escuro</p>
              <p className="text-[10px] text-slate-400 font-mono">{darkMode ? 'Ativo' : 'Claro'}</p>
            </div>
          </div>
        </div>

        {/* Display Slider */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sun className="w-3.5 h-3.5" /> Brilho da Tela
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{brightness}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-white cursor-pointer h-1.5 bg-white/10 rounded-lg"
          />
        </div>

        {/* Sound Slider */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Volume2 className="w-3.5 h-3.5" /> Volume do Som
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full accent-white cursor-pointer h-1.5 bg-white/10 rounded-lg"
          />
        </div>

        {/* Media / Music Card */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-white">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold truncate max-w-[130px]">AnjosDevOS Ambient</p>
              <p className="text-[10px] text-slate-400">Cyber AI Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono font-bold">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> Live
          </div>
        </div>
      </div>
    </div>
  );
}