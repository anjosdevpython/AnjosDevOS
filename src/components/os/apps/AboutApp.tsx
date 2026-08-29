'use client';

import { Github, ExternalLink, Sparkles, Shield, Cpu, Zap, Code } from 'lucide-react';

export function AboutApp() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center overflow-y-auto bg-cyber-bg">
      {/* Official Logo */}
      <div className="relative mb-3 flex items-center justify-center">
        <div className="absolute -inset-2 bg-gradient-to-r from-neon-cyan/20 to-neon-blue/30 rounded-full blur-xl" />
        <img
          src="/logo.png"
          alt="AnjosDevOS Official Logo"
          className="w-44 h-28 object-contain relative drop-shadow-[0_0_20px_rgba(0,180,255,0.5)]"
        />
      </div>

      <h1 className="text-xl font-black gradient-text mb-0.5 tracking-wider font-mono">
        AnjosDevOS
      </h1>
      <p className="text-xs text-neon-cyan font-mono mb-3">
        Sistema Operacional de IA Autônomo · v2.0
      </p>

      <p className="text-xs text-text-secondary max-w-md mb-4 leading-relaxed">
        Plataforma baseada em navegador alimentada por um enxame de 7 agentes autônomos
        independentes focados em desenvolvimento fullstack, auditoria de segurança OWASP e automação de processos.
      </p>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 max-w-lg w-full text-[10px]">
        <div className="p-2.5 rounded-xl bg-cyber-card border border-cyber-border flex flex-col items-center">
          <Sparkles className="w-4 h-4 text-neon-cyan mb-1" />
          <span className="font-bold text-white">7 Agentes Swarm</span>
          <span className="text-text-muted">Colaborativos</span>
        </div>
        <div className="p-2.5 rounded-xl bg-cyber-card border border-cyber-border flex flex-col items-center">
          <Code className="w-4 h-4 text-neon-green mb-1" />
          <span className="font-bold text-white">Monaco IDE</span>
          <span className="text-text-muted">IA Integrada</span>
        </div>
        <div className="p-2.5 rounded-xl bg-cyber-card border border-cyber-border flex flex-col items-center">
          <Zap className="w-4 h-4 text-neon-yellow mb-1" />
          <span className="font-bold text-white">AutoPilot</span>
          <span className="text-text-muted">Workflows Visuais</span>
        </div>
        <div className="p-2.5 rounded-xl bg-cyber-card border border-cyber-border flex flex-col items-center">
          <Shield className="w-4 h-4 text-neon-purple mb-1" />
          <span className="font-bold text-white">Auditoria QA</span>
          <span className="text-text-muted">OWASP Top 10</span>
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-3 mb-4">
        <a
          href="https://allananjos.dev.br"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-xl bg-neon-blue/15 text-neon-blue border border-neon-blue/30 text-xs font-bold flex items-center gap-1.5 hover:bg-neon-blue/25 transition-all shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" /> allananjos.dev.br
        </a>
        <a
          href="https://github.com/anjosdevpython/AnjosDevOS"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-xl bg-neon-green/15 text-neon-green border border-neon-green/30 text-xs font-bold flex items-center gap-1.5 hover:bg-neon-green/25 transition-all shadow-sm"
        >
          <Github className="w-3.5 h-3.5" /> Repositório GitHub
        </a>
      </div>

      <p className="text-[10px] text-text-muted font-mono">
        Desenvolvido por <span className="text-white font-semibold">Allan Anjos</span> · © 2026 AnjosDevOS
      </p>
    </div>
  );
}
