'use client';

import { useState } from 'react';
import { OSProvider } from '@/components/os/OSContext';
import { Desktop } from '@/components/os/Desktop';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { IOSLayout } from '@/components/ios/IOSLayout';
import { useDevice } from '@/hooks/useDevice';

export default function HomePage() {
  const { isMobile, isTablet } = useDevice();
  const [uiMode, setUiMode] = useState<'cyber' | 'ios'>('cyber');

  // Show mobile layout on mobile devices
  if (isMobile) {
    return <MobileLayout />;
  }

  return (
    <OSProvider>
      {/* Theme Switcher */}
      <div className="fixed top-2 right-2 z-[99999] flex gap-1">
        <button
          onClick={() => setUiMode('cyber')}
          className={`px-2 py-1 text-[9px] rounded-full transition-all ${
            uiMode === 'cyber' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-white/10 text-white/50 border border-white/10'
          }`}
        >
          🖥️ Cyber
        </button>
        <button
          onClick={() => setUiMode('ios')}
          className={`px-2 py-1 text-[9px] rounded-full transition-all ${
            uiMode === 'ios' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/10 text-white/50 border border-white/10'
          }`}
        >
          📱 iOS
        </button>
      </div>

      {uiMode === 'ios' ? <IOSLayout /> : <Desktop />}
    </OSProvider>
  );
}
