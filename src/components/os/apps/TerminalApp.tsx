'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface TerminalLine {
  type: 'input' | 'output';
  content: string;
}

const NEOFETCH = `
  ⚡ AnjosDevOS          anjosdev@os
  ──────────────         ───────────────
  ██████╗ ███████╗       OS: AnjosDevOS v1.0
  ██╔═══██╗██╔════╝      Kernel: Next.js 15.5
  ██║   ██║███████╗       Shell: AnjosTerminal
  ██║   ██║╚════██║       UI: React 19 + Tailwind
  ╚██████╔╝███████║       API: NetworkTools v1
   ╚═════╝ ╚══════╝      Models: 50+ AI Models
                          Theme: Cyberpunk Dark
`;

const COMMANDS: Record<string, (args: string[]) => string> = {
  help: () => `Comandos disponíveis:
  help      - Mostra esta ajuda
  clear     - Limpa o terminal
  about     - Sobre o AnjosDevOS
  models    - Lista modelos de IA
  balance   - Consulta saldo
  date      - Data e hora atual
  echo      - Repete texto
  neofetch  - Informações do sistema
  whoami    - Usuário atual`,

  about: () => `AnjosDevOS v1.0 — AI Operating System
Powered by NetworkTools API (yellowfire.ru/v1)
Plataforma de ferramentas de IA integrada
© 2024 AnjosDevPlatform`,

  models: () => `Modelos disponíveis:
  ── OpenAI ──────── GPT-5, GPT-5.5, GPT-4o, o4-mini
  ── Anthropic ───── Claude 5, Claude 4.5, Claude 3.7
  ── Google ──────── Gemini 3.5, Gemini 2.5 Pro
  ── DeepSeek ────── V4, V3, R1
  ── xAI ──────────── Grok 4, Grok 3
  ── Imagens ─────── DALL-E 3, Flux, SD, Recraft V3
  ── Vídeo ────────── Kling 3
  ── Música ──────── Suno V5
  Total: 50+ modelos`,

  balance: () => `Consulte seu saldo no app "Saldo & Uso"
Ou configure sua API key em "Configurações"`,

  date: () => new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'medium' }),

  neofetch: () => NEOFETCH,

  whoami: () => 'anjosdev',
};

export function TerminalApp() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: '⚡ AnjosDevOS Terminal v1.0' },
    { type: 'output', content: 'Digite "help" para ver os comandos disponíveis.\n' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newLines: TerminalLine[] = [
      ...lines,
      { type: 'input', content: `anjosdev@os:~$ ${trimmed}` },
    ];

    if (command === 'clear') {
      setLines([]);
    } else if (command === 'echo') {
      newLines.push({ type: 'output', content: args.join(' ') });
      setLines(newLines);
    } else if (COMMANDS[command]) {
      newLines.push({ type: 'output', content: COMMANDS[command](args) });
      setLines(newLines);
    } else {
      newLines.push({ type: 'output', content: `comando não encontrado: ${command}. Digite "help" para ajuda.` });
      setLines(newLines);
    }

    setHistory((prev) => [trimmed, ...prev]);
    setHistoryIdx(-1);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      className="h-full bg-black font-mono text-sm flex flex-col cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {lines.map((line, i) => (
          <div
            key={i}
            className={line.type === 'input' ? 'text-neon-green' : 'text-text-secondary'}
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {line.content}
          </div>
        ))}
        {/* Current input line */}
        <div className="flex items-center text-neon-green">
          <span>anjosdev@os:~$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-neon-green caret-neon-green"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
