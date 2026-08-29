'use client';

import { Zap, Github, ExternalLink } from 'lucide-react';

export function AboutApp() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mb-4 shadow-neon-green">
        <Zap className="w-8 h-8 text-neon-green" />
      </div>
      <h1 className="text-xl font-bold gradient-text mb-1">AnjosDevOS</h1>
      <p className="text-sm text-text-muted font-mono mb-4">Sistema Operacional de IA v1.0</p>
      <p className="text-xs text-neon-green mb-2">by <a href="https://allananjos.dev.br" target="_blank" rel="noopener noreferrer" className="underline hover:text-neon-blue">Allan Anjos</a></p>
      
      <div className="space-y-2 text-xs text-text-secondary mb-6">
        <p>Plataforma de IA baseada em navegador</p>
        <p>Alimentado por <span className="text-neon-green">NetworkTools API</span></p>
        <p className="font-mono text-text-muted">Next.js 15.5 · React 19 · Tailwind CSS</p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://allananjos.dev.br"
          target="_blank"
          rel="noopener noreferrer"
          className="neon-button-blue text-xs flex items-center gap-1.5"
        >
          <ExternalLink className="w-3 h-3" /> allananjos.dev.br
        </a>
        <a
          href="https://github.com/anjosdevpython/AnjosDevOS"
          target="_blank"
          rel="noopener noreferrer"
          className="neon-button-green text-xs flex items-center gap-1.5"
        >
          <Github className="w-3 h-3" /> GitHub
        </a>
      </div>

      <p className="text-[10px] text-text-muted mt-6">© 2026 Allan Anjos · allananjos.dev.br</p>
    </div>
  );
}
