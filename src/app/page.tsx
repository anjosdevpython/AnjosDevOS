'use client';

import { OSProvider } from '@/components/os/OSContext';
import { Desktop } from '@/components/os/Desktop';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { useDevice } from '@/hooks/useDevice';

export default function HomePage() {
  const { isMobile, isTablet } = useDevice();

  // Show mobile layout on mobile devices
  if (isMobile) {
    return <MobileLayout />;
  }

  // Show desktop layout on tablet and desktop
  return (
    <OSProvider>
      <Desktop />
    </OSProvider>
  );
}
