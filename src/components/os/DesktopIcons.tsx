'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Image,
  Paintbrush,
  Video,
  Music,
  Mic,
  Terminal,
  Folder,
  Wrench,
  FileCode,
  Sparkles,
  Hand,
  Diamond,
  Blocks,
  Globe,
  FileText,
  Workflow,
  Users,
  Brain,
  Radio,
  Zap,
  Network,
  Bot,
  Layers,
} from 'lucide-react';
import { useOS } from './OSContext';
import { APP_DEFINITIONS } from './types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  Image: <Image className="w-6 h-6" />,
  Paintbrush: <Paintbrush className="w-6 h-6" />,
  Video: <Video className="w-6 h-6" />,
  Music: <Music className="w-6 h-6" />,
  Mic: <Mic className="w-6 h-6" />,
  Terminal: <Terminal className="w-6 h-6" />,
  Folder: <Folder className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
  FileCode: <FileCode className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Hand: <Hand className="w-6 h-6" />,
  Diamond: <Diamond className="w-6 h-6" />,
  Blocks: <Blocks className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  Workflow: <Workflow className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Brain: <Brain className="w-6 h-6" />,
  Radio: <Radio className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Network: <Network className="w-6 h-6" />,
  Bot: <Bot className="w-6 h-6" />,
  Layers: <Layers className="w-6 h-6" />,
};

export function DesktopIcons() {
  const { openApp } = useOS();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const desktopApps = APP_DEFINITIONS.filter((a) => a.desktopIcon);

  return (
    <div className="absolute top-5 left-5 grid grid-cols-1 gap-3 z-10">
      {desktopApps.map((app) => (
        <button
          key={app.id}
          onClick={() => setSelectedId(app.id)}
          onDoubleClick={() => openApp(app.id)}
          className={cn(
            'flex flex-col items-center gap-1.5 w-24 py-2.5 px-2 rounded-2xl transition-all duration-200 group relative',
            selectedId === app.id
              ? 'bg-cyan-500/20 border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
              : 'border border-transparent hover:bg-white/[0.06] hover:border-white/15'
          )}
        >
          {/* Squircle Icon Container with Glass Effect */}
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md relative overflow-hidden',
              `bg-${app.color || 'cyan-400'}/15 text-${app.color || 'cyan-400'} border border-${app.color || 'cyan-400'}/30`,
              'group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
            )}
          >
            {/* Top Gloss Highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              {ICON_MAP[app.iconName] || <Terminal className="w-6 h-6" />}
            </div>
          </div>

          {/* Label */}
          <span className="text-[11px] text-slate-200 text-center leading-tight font-semibold tracking-wide max-w-full truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:text-white">
            {app.title}
          </span>
        </button>
      ))}
    </div>
  );
}
