'use client';

import { useState } from 'react';
import { Wifi, Bluetooth, Moon, Sun, Volume2, Lock, Timer, Calculator, Camera, QrCode } from 'lucide-react';

interface ToggleItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  color: string;
}

export function IOSControlCenter({ onClose }: { onClose: () => void }) {
  const [toggles, setToggles] = useState<ToggleItem[]>([
    { id: 'wifi', icon: <Wifi className="w-4 h-4" />, label: 'Wi-Fi', active: true, color: '#3b82f6' },
    { id: 'bluetooth', icon: <Bluetooth className="w-4 h-4" />, label: 'Bluetooth', active: true, color: '#3b82f6' },
    { id: 'airplane', icon: <span className="text-sm">✈️</span>, label: 'Avião', active: false, color: '#f97316' },
    { id: 'cellular', icon: <span className="text-sm">📶</span>, label: 'Dados', active: true, color: '#22c55e' },
    { id: 'dnd', icon: <Moon className="w-4 h-4" />, label: 'Não Perturbe', active: false, color: '#7c3aed' },
    { id: 'lock', icon: <Lock className="w-4 h-4" />, label: 'Travar Rotação', active: false, color: '#64748b' },
  ]);

  const [brightness, setBrightness] = useState(75);
  const [volume, setVolume] = useState(50);

  const toggleItem = (id: string) => {
    setToggles(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  return (
    <div className="fixed inset-0 z-[10001]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="absolute top-14 right-4 left-4 max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-900/95 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl space-y-3">
          {/* Connectivity */}
          <div className="grid grid-cols-2 gap-2">
            {toggles.slice(0, 4).map(toggle => (
              <button
                key={toggle.id}
                onClick={() => toggleItem(toggle.id)}
                className={`p-3 rounded-2xl flex items-center gap-2.5 transition-all ${
                  toggle.active
                    ? 'bg-white/15'
                    : 'bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    toggle.active ? 'text-white' : 'text-white/40'
                  }`}
                  style={{ backgroundColor: toggle.active ? toggle.color : 'rgba(255,255,255,0.1)' }}
                >
                  {toggle.icon}
                </div>
                <span className="text-[11px] text-white font-medium">{toggle.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Toggles */}
          <div className="grid grid-cols-2 gap-2">
            {toggles.slice(4).map(toggle => (
              <button
                key={toggle.id}
                onClick={() => toggleItem(toggle.id)}
                className={`p-3 rounded-2xl flex items-center gap-2.5 transition-all ${
                  toggle.active ? 'bg-white/15' : 'bg-white/5'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    toggle.active ? 'text-white' : 'text-white/40'
                  }`}
                  style={{ backgroundColor: toggle.active ? toggle.color : 'rgba(255,255,255,0.1)' }}
                >
                  {toggle.icon}
                </div>
                <span className="text-[11px] text-white font-medium">{toggle.label}</span>
              </button>
            ))}
          </div>

          {/* Brightness & Volume */}
          <div className="grid grid-cols-2 gap-2">
            {/* Brightness */}
            <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
              <Sun className="w-4 h-4 text-white/60" />
              <div className="w-full h-24 bg-white/10 rounded-xl relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white/80 rounded-xl transition-all"
                  style={{ height: `${brightness}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-[9px] text-white/40">Brilho</span>
            </div>

            {/* Volume */}
            <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center gap-2">
              <Volume2 className="w-4 h-4 text-white/60" />
              <div className="w-full h-24 bg-white/10 rounded-xl relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white/80 rounded-xl transition-all"
                  style={{ height: `${volume}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-[9px] text-white/40">Volume</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: <Timer className="w-5 h-5" />, label: 'Timer' },
              { icon: <Calculator className="w-5 h-5" />, label: 'Calc' },
              { icon: <Camera className="w-5 h-5" />, label: 'Câmera' },
              { icon: <QrCode className="w-5 h-5" />, label: 'QR Code' },
            ].map((action, i) => (
              <button
                key={i}
                className="bg-white/5 rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/10 transition-colors"
              >
                <div className="text-white/60">{action.icon}</div>
                <span className="text-[9px] text-white/50">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pt-2">
            <div className="w-32 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
