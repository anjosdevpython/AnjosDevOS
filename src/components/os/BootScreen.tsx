'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useOS } from './OSContext';

const BOOT_MESSAGES = [
  'Inicializando AnjosDevOS Kernel v2.0...',
  'Carregando Especialistas do Enxame (Swarm Engine)...',
  'Conectando AnjosArchitect, AnjosCoder e AnjosReviewer...',
  'Ativando Motor de Automação & Workflows AutoPilot...',
  'Calibrando Monaco IDE & Ferramentas de IA...',
  'Pronto! Bem-vindo ao AnjosDevOS — by Allan Anjos',
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
        return prev + 2.5;
      });
    }, 45);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, BOOT_MESSAGES.length - 1));
    }, 450);

    const bootTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setBooted(true), 500);
    }, 2800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(bootTimer);
    };
  }, [setBooted]);

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#07090e] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Official Logo with Halo and Glow */}
      <div className="mb-6 relative flex flex-col items-center">
        <div className="absolute -inset-4 bg-gradient-to-r from-neon-blue/20 via-neon-cyan/30 to-neon-blue/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative w-48 h-32 flex items-center justify-center drop-shadow-[0_0_35px_rgba(0,180,255,0.45)]">
          <img
            src="/logo.png"
            alt="AnjosDevOS Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(0,210,255,0.6)]"
          />
        </div>
      </div>

      <h1 className="text-2xl font-black gradient-text tracking-wider mb-1 font-mono">
        AnjosDevOS
      </h1>
      <p className="text-xs text-text-muted font-mono mb-6">
        Sistema Operacional de IA Autônomo · v2.0
      </p>

      {/* Progress Bar */}
      <div className="w-72 h-1.5 bg-cyber-card border border-cyber-border rounded-full overflow-hidden mb-4 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-green rounded-full transition-all duration-100 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Boot Message */}
      <p className="text-xs text-neon-cyan/90 font-mono h-4 transition-all duration-200">
        {BOOT_MESSAGES[messageIndex]}
      </p>

      <p className="text-[10px] text-text-muted font-mono mt-8">
        © 2026 Allan Anjos · <span className="text-neon-cyan">allananjos.dev.br</span>
      </p>
    </div>
  );
}
