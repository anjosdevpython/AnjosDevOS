'use client';

import { useState } from 'react';

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
  { id: '1', app: 'Chat IA', icon: '💬', title: 'Nova mensagem', body: 'Allan: Precisa de ajuda com o deploy?', time: 'agora', read: false },
  { id: '2', app: 'Orquestrador', icon: '🕸️', title: 'Agente Hermes concluiu', body: 'Raciocínio sobre arquitetura finalizado', time: '5min', read: false },
  { id: '3', app: 'Browser', icon: '🌐', title: 'Workflow detectado', body: 'Padrão de login repetido 3x - salvar?', time: '12min', read: true },
  { id: '4', app: 'Freebuff', icon: '⚡', title: 'Sessão disponível', body: 'GPT-5.6 Luna pronto para uso', time: '30min', read: true },
];

export function IOSNotificationCenter({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="fixed inset-0 z-[10001]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="absolute top-0 left-0 right-0 max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background */}
        <div className="bg-gray-900/95 backdrop-blur-2xl rounded-b-3xl shadow-2xl">
          {/* Header */}
          <div className="px-6 pt-14 pb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Notificações</h2>
            <button
              onClick={clearAll}
              className="text-[11px] text-blue-400 font-medium"
            >
              Limpar Tudo
            </button>
          </div>

          {/* Date */}
          <div className="px-6 pb-3">
            <span className="text-[11px] text-white/40 font-medium">
              Hoje — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>

          {/* Notifications */}
          <div className="px-4 pb-6 space-y-2">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-3.5 rounded-2xl transition-all ${
                  notif.read ? 'bg-white/5' : 'bg-white/10 border border-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{notif.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">
                        {notif.app}
                      </span>
                      <span className="text-[10px] text-white/30">{notif.time}</span>
                    </div>
                    <div className="text-[13px] text-white font-semibold mt-0.5">{notif.title}</div>
                    <div className="text-[12px] text-white/60 mt-0.5 line-clamp-2">{notif.body}</div>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-4">
            <div className="w-32 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
