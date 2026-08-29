'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { useOS } from '@/components/os/OSContext';
import { APP_DEFINITIONS, type AppDefinition } from '@/components/os/types';
import { MacOSAppIcon } from './MacOSAppIcons';
import { cn } from '@/lib/utils';

interface MacOSSpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MacOSSpotlight({ isOpen, onClose }: MacOSSpotlightProps) {
  const { openApp } = useOS();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIdx(0);
    }
  }, [isOpen]);

  const results = APP_DEFINITIONS.filter(
    (app: AppDefinition) =>
      app.title.toLowerCase().includes(query.toLowerCase()) ||
      app.id.toLowerCase().includes(query.toLowerCase()) ||
      app.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIdx]) {
        openApp(results[selectedIdx].id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-[18vh] bg-black/40 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#141824]/90 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)] overflow-hidden animate-slide-in font-sans"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Busca Spotlight (Apps, Ferramentas, IA...)"
            className="w-full text-base bg-transparent text-white placeholder:text-slate-500 outline-none font-sans"
          />
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono px-2 py-1 rounded bg-white/5 border border-white/10">
            <span>ESC</span>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.map((app: AppDefinition, idx: number) => {
            const isSelected = idx === selectedIdx;
            return (
              <div
                key={app.id}
                onClick={() => {
                  openApp(app.id);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIdx(idx)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'hover:bg-white/5 text-slate-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <MacOSAppIcon appId={app.id} size={32} />
                  <div>
                    <h4 className="text-xs font-semibold">{app.title}</h4>
                    <p className="text-[10px] opacity-70 font-mono capitalize">
                      {app.category} • AnjosDevOS
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1 text-[10px] opacity-80 font-mono">
                    <span>Abrir</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}

          {results.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              Nenhum aplicativo ou comando correspondente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}