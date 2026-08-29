'use client';

import { TerminalPanel } from '../panels/Terminal';

export function TerminalApp() {
  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 overflow-hidden">
      <TerminalPanel />
    </div>
  );
}
