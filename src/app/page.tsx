'use client';

import { useState, useEffect } from 'react';
import { OSProvider } from '@/components/os/OSContext';
import { Desktop } from '@/components/os/Desktop';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { IOSLayout } from '@/components/ios/IOSLayout';
import { useDevice } from '@/hooks/useDevice';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { isMobile, isTablet } = useDevice();
  const [mounted, setMounted] = useState(false);
  const [uiMode, setUiMode] = useState<'cyber' | 'ios' | 'mobile'>('cyber');

  useEffect(() => {
    setMounted(true);
    if (isMobile) {
      setUiMode('mobile');
    }
  }, [isMobile]);

  return (
    <OSProvider>
      {/* Floating Modern UI Mode Switcher */}
      <div className="fixed top-3 right-4 z-[99999] flex items-center p-1 bg-[#0c101d]/90 backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setUiMode('cyber')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono font-semibold rounded-full transition-all duration-200',
            uiMode === 'cyber'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">CyberOS</span>
        </button>

        <button
          onClick={() => setUiMode('ios')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono font-semibold rounded-full transition-all duration-200',
            uiMode === 'ios'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <Tablet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>iOS</span>
        </button>

        <button
          onClick={() => setUiMode('mobile')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-mono font-semibold rounded-full transition-all duration-200',
            uiMode === 'mobile'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Mobile</span>
        </button>
      </div>

      {/* Render Selected Interface with full OSContext */}
      {uiMode === 'mobile' ? (
        <MobileLayout />
      ) : uiMode === 'ios' ? (
        <IOSLayout />
      ) : (
        <Desktop />
      )}
    </OSProvider>
  );
}
