'use client';

import { useState } from 'react';
import { MessageSquare, Image, Paintbrush, Video, Music, Mic, Terminal, Folder, Wrench, FileCode, Sparkles } from 'lucide-react';
import { useOS } from './OSContext';
import { APP_DEFINITIONS } from './types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-8 h-8" />,
  Image: <Image className="w-8 h-8" />,
  Paintbrush: <Paintbrush className="w-8 h-8" />,
  Video: <Video className="w-8 h-8" />,
  Music: <Music className="w-8 h-8" />,
  Mic: <Mic className="w-8 h-8" />,
  Terminal: <Terminal className="w-8 h-8" />,
  Folder: <Folder className="w-8 h-8" />,
  Wrench: <Wrench className="w-8 h-8" />,
  FileCode: <FileCode className="w-8 h-8" />,
  Sparkles: <Sparkles className="w-8 h-8" />,
};

export function DesktopIcons() {
  const { openApp } = useOS();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const desktopApps = APP_DEFINITIONS.filter((a) => a.desktopIcon);

  return (
    <div className="absolute top-4 left-4 grid grid-cols-1 gap-1 z-10">
      {desktopApps.map((app) => (
        <button
          key={app.id}
          onClick={() => setSelectedId(app.id)}
          onDoubleClick={() => openApp(app.id)}
          className={cn(
            'flex flex-col items-center gap-1 w-20 py-3 px-2 rounded-xl transition-all duration-150',
            selectedId === app.id
              ? 'bg-neon-blue/15 border border-neon-blue/30'
              : 'border border-transparent hover:bg-white/5'
          )}
        >
          <div className={`text-${app.color}`}>
            {ICON_MAP[app.iconName] || <Terminal className="w-8 h-8" />}
          </div>
          <span className="text-[10px] text-text-primary text-center leading-tight font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {app.title}
          </span>
        </button>
      ))}
    </div>
  );
}
