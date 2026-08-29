'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useOS } from '@/components/os/OSContext';
import { APP_DEFINITIONS, type AppDefinition } from '@/components/os/types';
import { MacOSAppIcon } from './MacOSAppIcons';

interface MacOSLaunchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MacOSLaunchpad({ isOpen, onClose }: MacOSLaunchpadProps) {
  const { openApp } = useOS();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredApps = APP_DEFINITIONS.filter(
    (a: AppDefinition) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99998] flex flex-col items-center justify-between py-12 px-8 bg-black/65 backdrop-blur-3xl select-none animate-fade-in font-sans"
    >
      {/* Search Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm relative"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar no Launchpad..."
          className="w-full pl-10 pr-8 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 outline-none focus:border-white/40 backdrop-blur-md"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Apps Grid */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl my-auto grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-x-4 gap-y-8 p-4 overflow-y-auto max-h-[75vh]"
      >
        {filteredApps.map((app: AppDefinition) => (
          <div
            key={app.id}
            onClick={() => {
              openApp(app.id);
              onClose();
            }}
            className="flex flex-col items-center gap-2 group cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <div className="relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              <MacOSAppIcon appId={app.id} size={64} />
            </div>
            <span className="text-xs font-medium text-white/95 text-center truncate max-w-[85px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {app.title}
            </span>
          </div>
        ))}
      </div>

      {/* Page indicator dot */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  );
}