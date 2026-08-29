'use client';

import { useState } from 'react';

interface Channel {
  id: string;
  name: string;
  icon: string;
  type: 'whatsapp' | 'telegram' | 'discord' | 'slack' | 'email' | 'sms';
  status: 'connected' | 'disconnected' | 'error';
  messagesCount: number;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface Message {
  id: string;
  channel: string;
  from: string;
  content: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  aiProcessed: boolean;
}

const INITIAL_CHANNELS: Channel[] = [
  { id: 'ch1', name: 'WhatsApp Business', icon: '💬', type: 'whatsapp', status: 'connected', messagesCount: 234, unreadCount: 5, lastMessage: 'Olá, preciso de ajuda com...', lastMessageTime: '13:20' },
  { id: 'ch2', name: 'Telegram Bot', icon: '✈️', type: 'telegram', status: 'connected', messagesCount: 156, unreadCount: 2, lastMessage: '/status relatório diário', lastMessageTime: '13:15' },
  { id: 'ch3', name: 'Discord Server', icon: '🎮', type: 'discord', status: 'connected', messagesCount: 89, unreadCount: 12, lastMessage: '@bot resumo da reunião', lastMessageTime: '13:10' },
  { id: 'ch4', name: 'Slack Workspace', icon: '💼', type: 'slack', status: 'disconnected', messagesCount: 0, unreadCount: 0 },
  { id: 'ch5', name: 'Email (Gmail)', icon: '📧', type: 'email', status: 'connected', messagesCount: 45, unreadCount: 3, lastMessage: 'RE: Deploy checklist', lastMessageTime: '12:50' },
  { id: 'ch6', name: 'SMS Gateway', icon: '📱', type: 'sms', status: 'error', messagesCount: 12, unreadCount: 0 },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 'msg1', channel: 'ch1', from: 'Cliente X', content: 'Olá, preciso de ajuda com a integração da API', timestamp: '13:20', direction: 'inbound', status: 'read', aiProcessed: true },
  { id: 'msg2', channel: 'ch1', from: 'Bot', content: 'Claro! Vou verificar a documentação da API e te enviar um guia em seguida.', timestamp: '13:21', direction: 'outbound', status: 'delivered', aiProcessed: true },
  { id: 'msg3', channel: 'ch2', from: 'Allan', content: '/status relatório diário', timestamp: '13:15', direction: 'inbound', status: 'read', aiProcessed: true },
  { id: 'msg4', channel: 'ch2', from: 'Bot', content: '📊 Relatório Diário:\n• 23 mensagens processadas\n• 5 tickets resolvidos\n• 99.9% uptime', timestamp: '13:15', direction: 'outbound', status: 'sent', aiProcessed: true },
  { id: 'msg5', channel: 'ch3', from: 'Dev Team', content: '@bot resumo da reunião de hoje', timestamp: '13:10', direction: 'inbound', status: 'read', aiProcessed: true },
  { id: 'msg6', channel: 'ch3', from: 'Bot', content: '📋 Resumo:\n1. Sprint review completa\n2. Próximo deploy na sexta\n3. Novo integrante na equipe', timestamp: '13:12', direction: 'outbound', status: 'delivered', aiProcessed: true },
];

export function ChannelGatewayApp() {
  const [channels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [messages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeTab, setActiveTab] = useState<'channels' | 'messages' | 'analytics'>('channels');
  const [messageInput, setMessageInput] = useState('');

  const channelColors = {
    whatsapp: 'neon-green',
    telegram: 'neon-blue',
    discord: 'neon-purple',
    slack: 'neon-yellow',
    email: 'neon-red',
    sms: 'neon-orange',
  };

  const renderChannelsList = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-text">🌐 Canais</h3>
          <p className="text-[10px] text-text-muted mt-0.5">{channels.length} canais · {channels.filter(c => c.status === 'connected').length} conectados</p>
        </div>
        <button className="px-3 py-1.5 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/30">
          + Conectar Canal
        </button>
      </div>

      {channels.map(channel => (
        <div
          key={channel.id}
          onClick={() => { setSelectedChannel(channel); setActiveTab('messages'); }}
          className={`bg-surface/50 border rounded-lg p-4 cursor-pointer transition-all hover:border-neon-blue/30 ${
            selectedChannel?.id === channel.id ? 'border-neon-blue/50 bg-neon-blue/5' : 'border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{channel.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text">{channel.name}</span>
                <span className={`px-1.5 py-0.5 text-[8px] rounded ${
                  channel.status === 'connected' ? 'bg-neon-green/20 text-neon-green' :
                  channel.status === 'error' ? 'bg-neon-red/20 text-neon-red' :
                  'bg-surface text-text-muted'
                }`}>
                  {channel.status === 'connected' ? '🟢 Conectado' : channel.status === 'error' ? '🔴 Erro' : '⚪ Desconectado'}
                </span>
              </div>
              {channel.lastMessage && (
                <div className="text-[10px] text-text-muted mt-1 truncate">{channel.lastMessage}</div>
              )}
            </div>
            <div className="text-right">
              {channel.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] bg-neon-red/20 text-neon-red rounded-full">
                  {channel.unreadCount}
                </span>
              )}
              <div className="text-[9px] text-text-muted mt-1">{channel.messagesCount} msgs</div>
              {channel.lastMessageTime && <div className="text-[8px] text-text-muted">{channel.lastMessageTime}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMessages = () => {
    const channelMessages = selectedChannel
      ? messages.filter(m => m.channel === selectedChannel.id)
      : messages;

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Channel Header */}
        {selectedChannel && (
          <div className="px-4 py-2 border-b border-border bg-surface/30 flex items-center gap-3">
            <span className="text-lg">{selectedChannel.icon}</span>
            <div>
              <span className="text-xs font-medium text-text">{selectedChannel.name}</span>
              <span className={`ml-2 px-1.5 py-0.5 text-[8px] rounded ${
                selectedChannel.status === 'connected' ? 'bg-neon-green/20 text-neon-green' : 'bg-surface text-text-muted'
              }`}>{selectedChannel.status}</span>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="px-2 py-1 text-[9px] bg-surface border border-border rounded hover:bg-surface/80">⚙️ Configurar</button>
              <button className="px-2 py-1 text-[9px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded">🤖 Resposta Automática IA</button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {channelMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                msg.direction === 'outbound'
                  ? 'bg-neon-blue/10 border border-neon-blue/30'
                  : 'bg-surface/50 border border-border'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-medium text-text">{msg.from}</span>
                  {msg.aiProcessed && <span className="text-[8px]">🤖</span>}
                  <span className="text-[8px] text-text-muted ml-auto">{msg.timestamp}</span>
                </div>
                <div className="text-[11px] text-text whitespace-pre-line">{msg.content}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[8px] ${
                    msg.status === 'read' ? 'text-neon-blue' :
                    msg.status === 'delivered' ? 'text-neon-green' :
                    msg.status === 'failed' ? 'text-neon-red' : 'text-text-muted'
                  }`}>
                    {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : msg.status === 'sent' ? '✓' : '❌'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-2 border-t border-border flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={selectedChannel ? `Enviar para ${selectedChannel.name}...` : 'Selecione um canal...'}
            className="flex-1 px-3 py-1.5 text-[11px] bg-background border border-border rounded text-text focus:outline-none focus:border-neon-blue"
          />
          <button className="px-3 py-1.5 text-[10px] bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30">📨</button>
          <button className="px-3 py-1.5 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/30">🤖</button>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const totalMsgs = channels.reduce((sum, c) => sum + c.messagesCount, 0);
    const totalUnread = channels.reduce((sum, c) => sum + c.unreadCount, 0);
    const connected = channels.filter(c => c.status === 'connected').length;

    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-surface/50 border border-border rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-neon-blue">{totalMsgs}</div>
            <div className="text-[9px] text-text-muted">Total Mensagens</div>
          </div>
          <div className="bg-surface/50 border border-border rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-neon-red">{totalUnread}</div>
            <div className="text-[9px] text-text-muted">Não Lidas</div>
          </div>
          <div className="bg-surface/50 border border-border rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-neon-green">{connected}/{channels.length}</div>
            <div className="text-[9px] text-text-muted">Conectados</div>
          </div>
        </div>

        <div className="text-xs font-medium text-text mb-3">📊 Mensagens por Canal</div>
        {channels.map(ch => (
          <div key={ch.id} className="flex items-center gap-2 mb-2">
            <span className="text-sm">{ch.icon}</span>
            <span className="text-[10px] text-text w-28">{ch.name}</span>
            <div className="flex-1 h-3 bg-surface/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${channelColors[ch.type]}/60 rounded-full`}
                style={{ width: `${(ch.messagesCount / 250) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-text-muted w-10 text-right">{ch.messagesCount}</span>
          </div>
        ))}

        <div className="mt-6 text-xs font-medium text-text mb-3">🤖 AI Processing</div>
        <div className="bg-surface/50 border border-border rounded-lg p-3">
          <div className="flex justify-between text-[10px] mb-2">
            <span className="text-text-muted">Mensagens processadas por IA</span>
            <span className="text-neon-green">87%</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-neon-green/60 rounded-full" style={{ width: '87%' }} />
          </div>
          <div className="flex justify-between text-[9px] text-text-muted mt-2">
            <span>Respostas automáticas: 156</span>
            <span>Encaminhadas: 23</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background text-text">
      <div className="flex border-b border-border bg-surface/30">
        {(['channels', 'messages', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-neon-blue border-neon-blue bg-neon-blue/5'
                : 'text-text-muted border-transparent hover:text-text hover:bg-surface/50'
            }`}
          >
            {tab === 'channels' ? '🌐 Canais' : tab === 'messages' ? '💬 Mensagens' : '📊 Análises'}
          </button>
        ))}
      </div>

      {activeTab === 'channels' && renderChannelsList()}
      {activeTab === 'messages' && renderMessages()}
      {activeTab === 'analytics' && renderAnalytics()}

      <div className="px-3 py-1.5 border-t border-border bg-surface/30 flex items-center gap-4 text-[10px] text-text-muted">
        <span>🌐 {channels.filter(c => c.status === 'connected').length} canais ativos</span>
        <span>💬 {channels.reduce((s, c) => s + c.messagesCount, 0)} mensagens</span>
        <span className="ml-auto">Gateway de Canais v0.5.52</span>
      </div>
    </div>
  );
}
