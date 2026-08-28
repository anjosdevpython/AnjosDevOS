import { ChatInterface } from '@/components/features/chat/ChatInterface';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-cyber-border bg-cyber-card/50 backdrop-blur-sm">
        <div className="p-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
          <MessageSquare className="w-5 h-5 text-neon-green" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Chat IA</h1>
          <p className="text-xs text-text-muted">Converse com 50+ modelos de inteligência artificial</p>
        </div>
      </div>
      {/* Chat Interface */}
      <ChatInterface />
    </div>
  );
}
