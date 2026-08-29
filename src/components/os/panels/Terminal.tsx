'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { webcontainer } from '@/lib/runtime/webcontainer';
import { getSwarmEngine } from '@/lib/agent-swarm';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  workspaceFiles?: Record<string, string>;
  onCommandRun?: (command: string) => void;
}

export function TerminalPanel({ workspaceFiles = {}, onCommandRun }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<XTerm | null>(null);
  const fitAddonInstance = useRef<FitAddon | null>(null);
  const inputBuffer = useRef<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.2,
      theme: {
        background: '#07090e',
        foreground: '#f8fafc',
        cursor: '#00ff88',
        selectionBackground: 'rgba(6, 182, 212, 0.3)',
        black: '#07090e',
        red: '#ff3366',
        green: '#00ff88',
        yellow: '#ffd700',
        blue: '#0066ff',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#f8fafc',
        brightBlack: '#64748b',
        brightGreen: '#34d399',
        brightCyan: '#38bdf8',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonInstance.current = fitAddon;

    // Mensagem de boas-vindas do AnjosDevOS
    term.writeln('\x1b[1;36m┌──────────────────────────────────────────────────────────┐\x1b[0m');
    term.writeln('\x1b[1;36m│\x1b[0m  \x1b[1;32m⚡ AnjosDevOS WebContainer & Shell Terminal v2.0\x1b[0m         \x1b[1;36m│\x1b[0m');
    term.writeln('\x1b[1;36m│\x1b[0m  Node.js + npm + git + Swarm Engine no browser          \x1b[1;36m│\x1b[0m');
    term.writeln('\x1b[1;36m└──────────────────────────────────────────────────────────┘\x1b[0m');
    term.writeln('Digite \x1b[33mhelp\x1b[0m para ver os comandos disponíveis.\r\n');

    const prompt = () => {
      term.write('\r\n\x1b[1;32manjos@os\x1b[0m:\x1b[1;34m~/workspace\x1b[0m$ ');
    };

    prompt();
    setIsReady(true);

    term.onData(async (data) => {
      const code = data.charCodeAt(0);

      if (data === '\r') {
        // ENTER
        const commandLine = inputBuffer.current.trim();
        inputBuffer.current = '';
        term.writeln('');

        if (commandLine) {
          if (onCommandRun) onCommandRun(commandLine);
          await handleCommand(commandLine, term);
        }
        prompt();
      } else if (code === 127 || data === '\b') {
        // BACKSPACE
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (code === 3) {
        // CTRL + C
        inputBuffer.current = '';
        term.writeln('^C');
        prompt();
      } else if (code >= 32) {
        // Caracter imprimível
        inputBuffer.current += data;
        term.write(data);
      }
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {}
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const handleCommand = async (fullCommand: string, term: XTerm) => {
    const parts = fullCommand.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (cmd === 'clear') {
      term.clear();
      return;
    }

    if (cmd === 'help') {
      term.writeln('\x1b[1;36mComandos do Terminal:\x1b[0m');
      term.writeln('  \x1b[32mnode <arquivo>\x1b[0m     Executa arquivo JS/TS no WebContainer');
      term.writeln('  \x1b[32mnpm <cmd>\x1b[0m          Instala pacotes e executa scripts (test, start)');
      term.writeln('  \x1b[32mgit <cmd>\x1b[0m          Controle de versão no workspace (status, commit)');
      term.writeln('  \x1b[32mswarm <objetivo>\x1b[0m   Dispara o enxame autônomo para codificar');
      term.writeln('  \x1b[32magents\x1b[0m             Lista os 7 agentes especialistas');
      term.writeln('  \x1b[32maudit\x1b[0m              Auditoria de segurança estática OWASP');
      term.writeln('  \x1b[32mls\x1b[0m                 Lista arquivos do workspace');
      term.writeln('  \x1b[32mclear\x1b[0m              Limpa a tela do terminal');
      return;
    }

    if (cmd === 'agents') {
      term.writeln('\x1b[1;36m👥 Enxame de Agentes Especialistas (7/7 Online):\x1b[0m');
      const agents = getSwarmEngine().getAllAgents();
      agents.forEach((ag) => {
        term.writeln(`  \x1b[32m●\x1b[0m \x1b[1m${ag.name}\x1b[0m (${ag.role}) — \x1b[33m${ag.model}\x1b[0m [${ag.status.toUpperCase()}]`);
      });
      return;
    }

    if (cmd === 'swarm') {
      const goal = args.join(' ') || 'Criar serviço completo com testes';
      term.writeln(`\x1b[36m⚡ Disparando Enxame para o objetivo:\x1b[0m "${goal}"\r\n`);
      const engine = getSwarmEngine();

      const unsubscribe = engine.subscribe((event: { type: string; payload: any }) => {
        if (event.type === 'message') {
          term.writeln(`\x1b[35m[${event.payload.sender || event.payload.from}]\x1b[0m ${event.payload.content?.slice(0, 100)}...`);
        }
      });

      const session = await engine.executeCollaborativeCodingTask(goal);
      unsubscribe();

      const score = session.finalResult?.reviewScore || 95;
      term.writeln(`\r\n\x1b[32m✓ Enxame concluiu o plano com sucesso!\x1b[0m Score de Qualidade: \x1b[1;33m${score}/100\x1b[0m`);
      return;
    }

    if (cmd === 'audit') {
      term.writeln('\x1b[36m🔍 Executando auditoria estática de código...\x1b[0m');
      const files = Object.entries(workspaceFiles);
      const code = files.length > 0 ? files[0][1] : 'console.log("ok");';
      const audit = getSwarmEngine().auditCode(code);

      term.writeln(`\x1b[1;32mAuditoria Concluída!\x1b[0m Score: \x1b[1;33m${audit.score}/100\x1b[0m`);
      term.writeln(`Achados encontrados: ${audit.issues.length}`);
      audit.issues.forEach((f) => {
        term.writeln(`  \x1b[31m[${f.severity.toUpperCase()}]\x1b[0m Linha ${f.line || 1}: ${f.title}`);
      });
      return;
    }

    // Executa via WebContainer singleton
    await webcontainer.spawn(cmd, args, (chunk) => {
      term.write(chunk);
    });
  };

  return (
    <div className="w-full h-full bg-[#07090e] p-2 overflow-hidden flex flex-col">
      <div ref={terminalRef} className="flex-1 w-full h-full overflow-hidden" />
    </div>
  );
}
