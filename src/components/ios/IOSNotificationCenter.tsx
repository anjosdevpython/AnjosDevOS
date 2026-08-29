'use client';

import { useState } from 'react';
import { Sparkles, X, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  app: string;
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', app: 'AnjosArchitect', icon: '🧠', title: 'Arquitetura Decomposta', body: 'Plano de execução para microsserviços gerado com sucesso.', time: 'agora', read: false },
  { id: '2', app: 'AnjosReviewer', icon: '🔍', title: 'Auditoria OWASP Aprovada', body: 'Score de segurança 99/100. 0 vulnerabilidades críticas.', time: '3min', read: false },
  { id: '3', app: 'Automation Studio', icon: '⚡', title: 'Pipeline CI/CD Executado', body: 'Build de produção e testes Vitest concluídos com sucesso.', time: '10min', read: true },
  { id: '4', app: 'AnjosDocs', icon: '📝', title: 'Documentação Viva Atualizada', body: 'JSDoc e OpenAPI gerados para novos endpoints.', time: '25min', read: true },
];

export function IOSNotificationCenter({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const now = new Date();

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div
      className="fixed inset-0 z-[10008] bg-black/70 backdrop-blur-3xl flex flex-col items-center p-4 pt-12 overflow-y-auto select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Lockscreen Large Clock */}
        <div className="flex flex-col items-center mt-4 mb-8 text-center">
          <p className="text-sm font-semibold text-slate-300 font-sans tracking-wide">
            {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-6xl font-black text-white font-sans tracking-tighter my-1 drop-shadow-md">
            {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-cyan-300 font-mono mt-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AnjosDevOS Swarm v2.0</span>
          </div>
        </div>

        {/* Notifications Header */}
        <div className="w-full flex items-center justify-between px-2 mb-3">
          <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Notificações ({notifications.filter((n) => !n.read).length})
          </span>
          <button
            onClick={clearAll}
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Limpar Tudo
          </button>
        </div>

        {/* Notifications Stack */}
        <div className="w-full space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-3.5 rounded-[22px] backdrop-blur-2xl transition-all border cursor-pointer ${
                notif.read
                  ? 'bg-white/[0.08] border-white/10 text-slate-300'
                  : 'bg-white/[0.15] border-white/25 text-white shadow-lg'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{notif.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-300 font-mono uppercase">
                      {notif.app}
                    </span>
                    <span className="text-[10px] text-slate-400">{notif.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5">{notif.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{notif.body}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,1)] mt-2 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold font-sans tracking-wide transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
