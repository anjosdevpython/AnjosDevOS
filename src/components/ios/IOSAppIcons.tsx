'use client';

import React from 'react';

interface IOSAppIconProps {
  appId: string;
  size?: number; // default 60px
  className?: string;
}

/**
 * Pixel-Perfect Apple iOS Design Resource Icon Suite
 * Diretrizes Oficiais: Apple Human Interface Guidelines (HIG) + SF Symbols
 * Superellipse Squircle Geometry + Specular Top Lighting + SVG Layering
 */
export function IOSAppIcon({ appId, size = 60, className = '' }: IOSAppIconProps) {
  // Normalize app ID
  const id = appId.toLowerCase();

  // Superellipse squircle container with Apple inner rim highlight
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: `${size * 0.2237}px`, // Apple HIG 22.37% standard squircle curve
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow:
      '0 8px 18px -4px rgba(0,0,0,0.4), 0 2px 5px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.65), inset 0 -0.5px 0.5px rgba(0,0,0,0.15)',
  };

  // Top Gloss Specular Highlight Layer
  const GlossOverlay = (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0) 60%)',
      }}
    />
  );

  // 1. MESSAGES (Chat IA) - Official Apple Messages Icon
  if (id === 'chat') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #38e06e 0%, #28cd41 60%, #1fb836 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40" fill="none">
          <path
            d="M20 6C11.163 6 4 12.268 4 20C4 24.168 5.992 27.892 9.204 30.472C8.616 32.748 7.42 34.348 5.64 35.888C5.236 36.236 5.48 36.924 6.016 36.916C9.172 36.872 12.188 35.536 14.452 33.684C16.208 34.192 18.064 34.468 20 34.468C28.837 34.468 36 28.2 36 20.468C36 12.736 28.837 6 20 6Z"
            fill="white"
          />
        </svg>
      </div>
    );
  }

  // 2. PHOTOS (Gerador de Imagens) - Official Apple Photos 8-Petal Pinwheel
  if (id === 'images') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: '#FFFFFF',
          boxShadow: '0 8px 18px -4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.9)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.76} height={size * 0.76} viewBox="0 0 44 44" fill="none">
          <path d="M22 6C23.657 6 25 7.343 25 9V22H19V9C19 7.343 20.343 6 22 6Z" fill="#FFCC00" />
          <path d="M33.314 10.686C34.485 11.858 34.485 13.757 33.314 14.929L24.121 24.121L19.879 19.879L29.071 10.686C30.243 9.515 32.142 9.515 33.314 10.686Z" fill="#FF9500" />
          <path d="M38 22C38 23.657 36.657 25 35 25H22V19H35C36.657 19 38 20.343 38 22Z" fill="#FF2D55" />
          <path d="M33.314 33.314C32.142 34.485 30.243 34.485 29.071 33.314L19.879 24.121L24.121 19.879L33.314 29.071C34.485 30.243 34.485 32.142 33.314 33.314Z" fill="#AF52DE" />
          <path d="M22 38C20.343 38 19 36.657 19 35V22H25V35C25 36.657 23.657 38 22 38Z" fill="#5856D6" />
          <path d="M10.686 33.314C9.515 32.142 9.515 30.243 10.686 29.071L19.879 19.879L24.121 24.121L14.929 33.314C13.757 34.485 11.858 34.485 10.686 33.314Z" fill="#007AFF" />
          <path d="M6 22C6 20.343 7.343 19 9 19H22V25H9C7.343 25 6 23.657 6 22Z" fill="#34C759" />
          <path d="M10.686 10.686C11.858 9.515 13.757 9.515 14.929 10.686L24.121 19.879L19.879 24.121L10.686 14.929C9.515 13.757 9.515 11.858 10.686 10.686Z" fill="#30B0C7" />
        </svg>
      </div>
    );
  }

  // 3. SAFARI (Browser Workbench) - Official Apple Safari Compass
  if (id === 'browser' || id === 'browser-workbench') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: '#FFFFFF',
          boxShadow: '0 8px 18px -4px rgba(0,122,255,0.35), inset 0 1px 1px rgba(255,255,255,0.9)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 46 46" fill="none">
          <defs>
            <linearGradient id="safariDisc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#25c6fc" />
              <stop offset="100%" stopColor="#0062eb" />
            </linearGradient>
          </defs>
          <circle cx="23" cy="23" r="20" fill="url(#safariDisc)" />
          {/* Compass 12-Tics */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="23"
              y1="5"
              x2="23"
              y2="7.5"
              stroke="white"
              strokeWidth="1.2"
              transform={`rotate(${deg} 23 23)`}
              opacity="0.9"
            />
          ))}
          {/* Compass Needle (45 deg) */}
          <polygon points="23,8 27,23 23,21 19,23" fill="#FF3B30" transform="rotate(45 23 23)" />
          <polygon points="23,38 27,23 23,25 19,23" fill="#FFFFFF" transform="rotate(45 23 23)" />
          <circle cx="23" cy="23" r="2" fill="white" />
        </svg>
      </div>
    );
  }

  // 4. XCODE / DEVELOPER (Code Editor / Theia) - Official Apple Xcode Hammer & Brackets
  if (id === 'codeeditor' || id === 'theia') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #1c75f2 0%, #0553c9 100%)',
        }}
      >
        {GlossOverlay}
        {/* Blueprint Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '5px 5px',
          }}
        />
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          <path d="M12 26L26 12L30 16L16 30L12 26Z" fill="#D1D5DB" />
          <path d="M27 9L33 15L31 17L25 11L27 9Z" fill="#9CA3AF" />
          <path d="M9 29C7.895 30.105 7.895 31.895 9 33C10.105 34.105 11.895 34.105 13 33L17 29L13 25L9 29Z" fill="#F3F4F6" />
          <path d="M14 14L8 20L14 26" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 14L32 20L26 26" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // 5. SHORTCUTS (Automation Studio / Freebuff) - Official Apple Shortcuts 3D Rhombus
  if (id === 'automation-studio' || id === 'automation' || id === 'freebuff') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #222226 0%, #000000 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 40 40" fill="none">
          <rect x="7" y="10" width="18" height="18" rx="5" transform="rotate(-45 7 10)" fill="#007AFF" fillOpacity="0.95" />
          <rect x="15" y="18" width="18" height="18" rx="5" transform="rotate(-45 15 18)" fill="#FF2D55" fillOpacity="0.95" style={{ mixBlendMode: 'screen' }} />
        </svg>
      </div>
    );
  }

  // 6. APPLE INTELLIGENCE (Agent Teams / Swarm Orchestrator / Warmwind) - Apple iOS 18 Siri Loop
  if (
    id === 'agent-teams' ||
    id === 'agents' ||
    id === 'orchestrator' ||
    id === 'warmwind' ||
    id === 'deepseek-harness' ||
    id === 'deepseek'
  ) {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #131728 0%, #080a14 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.74} height={size * 0.74} viewBox="0 0 44 44" fill="none">
          <defs>
            <linearGradient id="aiGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="50%" stopColor="#7B2CBF" />
              <stop offset="100%" stopColor="#FF007F" />
            </linearGradient>
            <linearGradient id="aiGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD166" />
              <stop offset="50%" stopColor="#EF476F" />
              <stop offset="100%" stopColor="#118AB2" />
            </linearGradient>
          </defs>
          <circle cx="22" cy="22" r="14" stroke="url(#aiGrad1)" strokeWidth="4.2" strokeLinecap="round" opacity="0.9" />
          <circle cx="22" cy="22" r="9" stroke="url(#aiGrad2)" strokeWidth="3.6" strokeLinecap="round" opacity="0.95" />
          <circle cx="22" cy="22" r="3" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 7. FILES (File Explorer) - Official Apple Files Icon
  if (id === 'fileexplorer' || id === 'files') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: '#FFFFFF',
          boxShadow: '0 8px 18px -4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.9)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 44 44" fill="none">
          <path
            d="M7 13C7 11.343 8.343 10 10 10H17.5L20.5 13H34C35.657 13 37 14.343 37 16V31C37 32.657 35.657 34 34 34H10C8.343 34 7 32.657 7 31V13Z"
            fill="#007AFF"
          />
          <path
            d="M7 18C7 16.895 7.895 16 9 16H35C36.105 16 37 16.895 37 18V31C37 32.657 35.657 34 34 34H10C8.343 34 7 32.657 7 31V18Z"
            fill="#409CFF"
          />
        </svg>
      </div>
    );
  }

  // 8. SETTINGS (Configurações) - Official Apple Settings Metallic Cogwheel
  if (id === 'settings') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="8" fill="#4B5563" stroke="#E5E7EB" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="4" fill="#E5E7EB" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect
              key={deg}
              x="18"
              y="6"
              width="4"
              height="6"
              rx="1"
              fill="#E5E7EB"
              transform={`rotate(${deg} 20 20)`}
            />
          ))}
        </svg>
      </div>
    );
  }

  // 9. MUSIC (Música) - Official Apple Music Notes
  if (id === 'music') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #fa3252 0%, #d71537 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40" fill="none">
          <path
            d="M28 8V24.5C28 26.985 25.985 29 23.5 29C21.015 29 19 26.985 19 24.5C19 22.015 21.015 20 23.5 20C24.42 20 25.275 20.276 26 20.752V13L16 15.5V26.5C16 28.985 13.985 31 11.5 31C9.015 31 7 28.985 7 26.5C7 24.015 9.015 22 11.5 22C12.42 22 13.275 22.276 14 22.752V11.5C14 10.472 14.773 9.615 15.795 9.513L26.795 8.013C27.464 7.922 28 8.441 28 9.117V8Z"
            fill="white"
          />
        </svg>
      </div>
    );
  }

  // 10. CAMERA & FACETIME (Vídeo & Câmera) - Official Apple Video / FaceTime
  if (id === 'video') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #38e06e 0%, #28cd41 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40" fill="none">
          <rect x="6" y="11" width="20" height="18" rx="4" fill="white" />
          <path d="M27 16.5L34 12V28L27 23.5V16.5Z" fill="white" />
        </svg>
      </div>
    );
  }

  // 11. WALLET (Saldo & Uso) - Official Apple Wallet Card Stack
  if (id === 'balance' || id === 'wallet') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #222226 0%, #111113 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 44 44" fill="none">
          <rect x="7" y="10" width="30" height="20" rx="3" fill="#10B981" />
          <rect x="7" y="15" width="30" height="18" rx="3" fill="#F59E0B" />
          <rect x="7" y="20" width="30" height="16" rx="3" fill="#EF4444" />
          <rect x="7" y="24" width="30" height="14" rx="3" fill="#3B82F6" />
        </svg>
      </div>
    );
  }

  // 12. TERMINAL (Terminal) - Official Apple macOS Terminal
  if (id === 'terminal') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          <rect x="4" y="6" width="32" height="28" rx="4" fill="#000000" fillOpacity="0.75" stroke="#48484a" strokeWidth="1.5" />
          <path d="M10 16L16 21L10 26" stroke="#30D158" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="19" y1="26" x2="28" y2="26" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 13. NOTES / WORKBENCH (Workbench & OpenHands) - Official Apple Notes
  if (id === 'everything-workbench' || id === 'workbench' || id === 'openhands') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: '#FFFFFF',
          boxShadow: '0 8px 18px -4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.9)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 44 44" fill="none">
          <path d="M7 10C7 8.343 8.343 7 10 7H34C35.657 7 37 8.343 37 10V15H7V10Z" fill="#FBBF24" />
          <rect x="7" y="15" width="30" height="22" rx="2" fill="#F3F4F6" />
          <line x1="12" y1="20" x2="32" y2="20" stroke="#D1D5DB" strokeWidth="1.5" />
          <line x1="12" y1="25" x2="32" y2="25" stroke="#D1D5DB" strokeWidth="1.5" />
          <line x1="12" y1="30" x2="24" y2="30" stroke="#D1D5DB" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  // 14. HEALTH / MEMORY (Memória) - Official Apple Health Heart
  if (id === 'memory-system' || id === 'memory') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: '#FFFFFF',
          boxShadow: '0 8px 18px -4px rgba(236,72,153,0.35), inset 0 1px 1px rgba(255,255,255,0.9)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="appleHeart" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <path
            d="M20 32S8 24.5 8 16.5C8 12.5 11 9.5 15 9.5C17.5 9.5 19.5 11 20 12.5C20.5 11 22.5 9.5 25 9.5C29 9.5 32 12.5 32 16.5C32 24.5 20 32 20 32Z"
            fill="url(#appleHeart)"
          />
        </svg>
      </div>
    );
  }

  // 15. PODCASTS / AUDIO / TTS (TTS e Efeitos Sonoros) - Official Apple Podcasts / Voice Memos
  if (id === 'tts' || id === 'audio') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #bf5af2 0%, #8928db 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="17" r="4" fill="white" />
          <path d="M14 17C14 13.686 16.686 11 20 11C23.314 11 26 13.686 26 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M10 17C10 11.477 14.477 7 20 7C25.523 7 30 11.477 30 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M20 22V32M15 32H25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 16. APP STORE / TOOLS (AI Tools & DevTools Hub) - Official Apple App Store Isometric 'A'
  if (id === 'tools' || id === 'devtools-hub' || id === 'devtools') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #1ea1f2 0%, #0070e0 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          <line x1="14" y1="30" x2="26" y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="26" y1="30" x2="14" y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="11" y1="23" x2="29" y2="23" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 17. PHONE / CHANNELS (Canais) - Official Apple Phone Handset
  if (id === 'channel-gateway' || id === 'channels') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #38e06e 0%, #28cd41 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 40 40" fill="none">
          <path
            d="M11.5 8C10.5 8 9.5 8.5 9 9.5C7.5 12.5 7 17 11 22.5C15 28 19.5 28.5 22.5 27C23.5 26.5 24 25.5 24 24.5L23 21C22.8 20.2 22 19.7 21.2 20L19.5 20.8C18.5 19.5 17 17.5 16.5 16.2L17.5 14.8C18 14.2 18 13.2 17.5 12.5L14.5 9C14 8.5 13 8 11.5 8Z"
            fill="white"
          />
        </svg>
      </div>
    );
  }

  // 18. TIPS / ABOUT (Sobre o Sistema) - Official Apple Tips Bulb
  if (id === 'about') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="2.5" />
          <circle cx="20" cy="13" r="1.5" fill="white" />
          <line x1="20" y1="18" x2="20" y2="27" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 19. PHOTO EDITOR (Editor de Imagens) - Apple Iris/Aperture Style
  if (id === 'editor') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #c084fc 0%, #7c3aed 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="12" stroke="white" strokeWidth="2" />
          <circle cx="20" cy="20" r="5" fill="white" />
          <line x1="20" y1="8" x2="27" y2="15" stroke="white" strokeWidth="1.8" />
          <line x1="32" y1="20" x2="25" y2="27" stroke="white" strokeWidth="1.8" />
          <line x1="20" y1="32" x2="13" y2="25" stroke="white" strokeWidth="1.8" />
          <line x1="8" y1="20" x2="15" y2="13" stroke="white" strokeWidth="1.8" />
        </svg>
      </div>
    );
  }

  // 20. WORKSPACES (Gerenciador de Workspaces) - Apple Multi-tier Layers
  if (id === 'workspaces') {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
        }}
      >
        {GlossOverlay}
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 40 40" fill="none">
          {/* Bottom layer */}
          <path
            d="M8 24L20 30L32 24"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.6"
          />
          {/* Middle layer */}
          <path
            d="M8 18L20 24L32 18"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />
          {/* Top rhombus */}
          <path
            d="M20 10L32 16L20 22L8 16L20 10Z"
            fill="white"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // DEFAULT / FALLBACK (Clean Apple Cyan App Tile)
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
      }}
    >
      {GlossOverlay}
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 40 40" fill="none">
        <rect x="8" y="8" width="24" height="24" rx="6" fill="white" fillOpacity="0.9" />
        <circle cx="20" cy="20" r="4" fill="#0284C7" />
      </svg>
    </div>
  );
}
