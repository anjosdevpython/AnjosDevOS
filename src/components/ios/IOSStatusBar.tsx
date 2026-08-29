'use client';

import { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface IOSStatusBarProps {
  onNotificationPull?: () => void;
  onControlCenterPull?: () => void;
}

export function IOSStatusBar({ onNotificationPull, onControlCenterPull }: IOSStatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-12 z-[10000] flex items-end pointer-events-none">
      {/* Background blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative w-full h-10 flex items-center justify-between px-6 pb-1">
        {/* Left - Time */}
        <div className="flex items-center gap-1">
          <span className="text-white text-[13px] font-semibold tabular-nums">
            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Center - Dynamic Island */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1">
          <div className="w-28 h-7 bg-black rounded-full flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 rounded-full bg-gray-700" />
          </div>
        </div>

        {/* Right - Icons */}
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 text-white" />
          <Wifi className="w-3.5 h-3.5 text-white" />
          <div className="flex items-center gap-0.5">
            <div className="w-6 h-3 border border-white/80 rounded-sm relative">
              <div className="absolute inset-0.5 bg-white/80 rounded-[1px]" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
