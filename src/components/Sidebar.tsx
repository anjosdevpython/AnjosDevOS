'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Image,
  Paintbrush,
  Video,
  Music,
  Mic,
  AudioLines,
  Wallet,
  Zap,
  ChevronLeft,
  ChevronRight,
  Settings,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Chat IA',
    href: '/chat',
    icon: MessageSquare,
    color: 'text-neon-green',
    bgColor: 'bg-neon-green/10',
    borderColor: 'border-neon-green/30',
    description: '50+ modelos de IA',
  },
  {
    label: 'Imagens',
    href: '/images',
    icon: Image,
    color: 'text-neon-blue',
    bgColor: 'bg-neon-blue/10',
    borderColor: 'border-neon-blue/30',
    description: 'DALL-E, Flux, SD...',
  },
  {
    label: 'Editor',
    href: '/editor',
    icon: Paintbrush,
    color: 'text-neon-purple',
    bgColor: 'bg-neon-purple/10',
    borderColor: 'border-neon-purple/30',
    description: 'Inpaint, Upscale, BG',
  },
  {
    label: 'Vídeo',
    href: '/video',
    icon: Video,
    color: 'text-neon-red',
    bgColor: 'bg-neon-red/10',
    borderColor: 'border-neon-red/30',
    description: 'Kling 3',
  },
  {
    label: 'Música',
    href: '/music',
    icon: Music,
    color: 'text-neon-yellow',
    bgColor: 'bg-neon-yellow/10',
    borderColor: 'border-neon-yellow/30',
    description: 'Suno V5',
  },
  {
    label: 'TTS',
    href: '/tts',
    icon: Mic,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/30',
    description: 'Texto para voz',
  },
  {
    label: 'Áudio',
    href: '/audio',
    icon: AudioLines,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/30',
    description: 'Efeitos sonoros',
  },
  {
    label: 'Saldo',
    href: '/balance',
    icon: Wallet,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/30',
    description: 'Uso e créditos',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-cyber-card border-r border-cyber-border transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Header/Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-cyber-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neon-green/10 border border-neon-green/30">
          <Zap className="w-5 h-5 text-neon-green" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold gradient-text truncate">ANJOSDEV</h1>
            <p className="text-[10px] text-text-muted font-mono">PLATFORM v1.0</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {/* Home link */}
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
            pathname === '/'
              ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green'
              : 'text-text-secondary hover:bg-cyber-hover hover:text-text-primary border border-transparent'
          )}
        >
          <Terminal className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
        </Link>

        <div className="pt-2 pb-1">
          {!collapsed && (
            <p className="px-3 text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Ferramentas
            </p>
          )}
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? `${item.bgColor} border ${item.borderColor} ${item.color}`
                  : 'text-text-secondary hover:bg-cyber-hover hover:text-text-primary border border-transparent'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block truncate">{item.label}</span>
                  <span className="text-[10px] text-text-muted block truncate">
                    {item.description}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-cyber-border p-2 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            pathname === '/settings'
              ? 'bg-cyber-hover text-text-primary'
              : 'text-text-muted hover:bg-cyber-hover hover:text-text-secondary'
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Configurações</span>}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-text-muted hover:bg-cyber-hover hover:text-text-secondary transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
