'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useOS } from './OSContext';

const BOOT_MESSAGES = [
  'Inicializando kernel...',
  'Carregando módulos de IA...',
  'Conectando à NetworkTools API...',
  'Verificando modelos disponíveis...',
  'Preparando ambiente de trabalho...',
  'Bem-vindo ao AnjosDevOS',
];

export function BootScreen() {
  const { setBooted } = useOS();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, BOOT_MESSAGES.length - 1));
    }, 500);

    const bootTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setBooted(true), 500);
    }, 3200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(bootTimer);
    };
  }, [setBooted]);

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo */}
      <div className="mb-8 animate-pulse">
        <div className="w-20 h-20 rounded-2xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,136,0.3)]">
          <Zap className="w-10 h-10 text-neon-green" />
        </div>
      </div>

      <h1 className="text-2xl font-bold gradient-text mb-2">AnjosDevOS</h1>
      <p className="text-xs text-text-muted font-mono mb-8">AI Operating System v1.0</p>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-cyber-border rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Boot Message */}
      <p className="text-xs text-text-muted font-mono h-4 transition-all duration-200">
        {BOOT_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
