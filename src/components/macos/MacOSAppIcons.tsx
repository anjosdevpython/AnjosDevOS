'use client';

import React from 'react';
import { IOSAppIcon } from '../ios/IOSAppIcons';

interface MacOSAppIconProps {
  appId: string;
  size?: number;
  className?: string;
}

export function MacOSAppIcon({ appId, size = 52, className = '' }: MacOSAppIconProps) {
  const id = appId.toLowerCase();

  // Superellipse squircle container with Apple inner rim highlight
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: `${size * 0.2237}px`,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow:
      '0 8px 20px -4px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -0.5px 0.5px rgba(0,0,0,0.2)',
  };

  const GlossOverlay = (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0) 60%)',
      }}
    />
  );

  // 1. FINDER (macOS Default File Manager)
  if (id === 'finder' || id === 'fileexplorer') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #5ec9ff 0%, #1e94f6 50%, #0c74d6 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 40 40" fill="none">
          {/* Half split face */}
          <path
            d="M8 8C8 8 13 8 20 8C27 8 32 8 32 8C32 8 32 16 32 24C32 29 27 32 20 32C13 32 8 29 8 24C8 16 8 8 8 8Z"
            fill="#dbeafe"
          />
          <path
            d="M20 8C27 8 32 8 32 8C32 8 32 16 32 24C32 29 27 32 20 32V8Z"
            fill="#93c5fd"
          />
          {/* Eyes */}
          <circle cx="14" cy="18" r="2.2" fill="#1e3a8a" />
          <circle cx="26" cy="18" r="2.2" fill="#1e3a8a" />
          {/* Smile and nose line */}
          <path
            d="M20 16V22M14 24C16 26.5 24 26.5 26 24"
            stroke="#1e3a8a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 2. LAUNCHPAD (Rocket / App Grid)
  if (id === 'launchpad') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #94a3b8 0%, #475569 50%, #334155 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          <circle cx="12" cy="12" r="3" fill="#38bdf8" />
          <circle cx="20" cy="12" r="3" fill="#f43f5e" />
          <circle cx="28" cy="12" r="3" fill="#a855f7" />
          <circle cx="12" cy="20" r="3" fill="#fbbf24" />
          <circle cx="20" cy="20" r="3" fill="#34d399" />
          <circle cx="28" cy="20" r="3" fill="#60a5fa" />
          <circle cx="12" cy="28" r="3" fill="#ec4899" />
          <circle cx="20" cy="28" r="3" fill="#818cf8" />
          <circle cx="28" cy="28" r="3" fill="#f97316" />
        </svg>
      </div>
    );
  }

  // 3. TRASH CAN (macOS Trash)
  if (id === 'trash') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40" fill="none">
          <path
            d="M13 12L15 32H25L27 12H13Z"
            fill="white"
            fillOpacity="0.8"
            stroke="#475569"
            strokeWidth="2"
          />
          <path d="M10 12H30" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 12V9C16 8.44772 16.4477 8 17 8H23C23.5523 8 24 8.44772 24 9V12" stroke="#475569" strokeWidth="2" />
          <line x1="17" y1="16" x2="17" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="16" x2="20" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="23" y1="16" x2="23" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 4. SIRI / AI ORB
  if (id === 'siri') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
        }}
      >
        {GlossOverlay}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-amber-300 blur-[1px] animate-pulse" />
      </div>
    );
  }

  // Fallback to our complete 23+ Apple HIG icons in IOSAppIcons
  return <IOSAppIcon appId={appId} size={size} className={className} />;
}