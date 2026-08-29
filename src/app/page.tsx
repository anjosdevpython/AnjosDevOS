'use client';

import { useState, useEffect } from 'react';
import { OSProvider } from '@/components/os/OSContext';
import { Desktop } from '@/components/os/Desktop';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { MacOSLayout } from '@/components/macos/MacOSLayout';
import { useDevice } from '@/hooks/useDevice';
import { Smartphone, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { isMobile } = useDevice();
  const [mounted, setMounted] = useState(false);
  const [uiMode, setUiMode] = useState<'macos' | 'cyber' | 'mobile'>('macos');

  useEffect(() => {
    setMounted(true);
    if (isMobile) {
      setUiMode('mobile');
    }
  }, [isMobile]);

  return (
    <OSProvider>
      {/* Floating Modern UI Mode Switcher (Visible in CyberOS and Mobile modes) */}
      {uiMode !== 'macos' && (
        <div className="fixed top-3 right-4 z-[99999] flex items-center p-1 bg-[#0c101d]/90 backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
          {/* macOS Mode (Apple Desktop) */}
          <button
            onClick={() => setUiMode('macos')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 text-[11px] font-sans font-semibold rounded-full transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <svg width="12" height="12" viewBox="0 0 170 170" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-5.77-8.91-10.29-19.1-13.56-30.55-3.26-11.46-4.9-22.38-4.9-32.77 0-14.35 3.83-26.15 11.5-35.4 7.66-9.26 17.11-13.98 28.35-14.17 4.9 0 10.42 1.25 16.57 3.75 6.14 2.5 10.15 3.8 12.02 3.9 1.45 0 5.67-1.42 12.67-4.25 7-2.83 13.06-4.04 18.17-3.64 13.92.76 24.58 5.76 32 15-12.18 7.39-18.17 17.51-17.97 30.34.2 10.01 4.14 18.39 11.83 25.13 7.69 6.74 16.76 10.61 27.2 11.62-2.17 6.74-4.88 13.52-8.13 20.35zM119.22 33.05c0-7.39 2.68-14.41 8.04-21.06 5.36-6.65 12.1-10.99 20.22-13.02.2 1.3.3 2.5.3 3.6 0 7.39-2.78 14.51-8.34 21.36-5.56 6.85-12.33 11.19-20.22 13.02-.2-1.3-.3-2.5-.3-3.6z" />
            </svg>
            <span>macOS</span>
          </button>

          {/* CyberOS Mode */}
          <button
            onClick={() => setUiMode('cyber')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-semibold rounded-full transition-all duration-200',
              uiMode === 'cyber'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CyberOS</span>
          </button>

          {/* Mobile Mode */}
          <button
            onClick={() => setUiMode('mobile')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 text-[11px] font-sans font-semibold rounded-full transition-all duration-200',
              uiMode === 'mobile'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      )}

      {/* Render Selected Interface */}
      {uiMode === 'mobile' ? (
        <MobileLayout />
      ) : uiMode === 'macos' ? (
        <MacOSLayout uiMode={uiMode} onChangeUiMode={setUiMode} />
      ) : (
        <Desktop />
      )}
    </OSProvider>
  );
}