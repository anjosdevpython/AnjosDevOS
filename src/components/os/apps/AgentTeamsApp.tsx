'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSwarmEngine } from '@/lib/agent-swarm/swarm-engine';
import { SwarmAgentDefinition, SwarmMessage } from '@/lib/agent-swarm/types';
import {
  Users,
  MessageSquare,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Code,
  Zap,
  Send,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamTask {
  id: string;
  title: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
}

const INITIAL_TASKS: TeamTask[] = [
  { id: 't1', title: 'Decompor microsserviço de autenticação JWT', assignee: 'anjos-architect', status: 'done', priority: 'high' },
  { id: 't2', title: 'Implementar endpoints de autenticação e refresh token', assignee: 'anjos-coder', status: 'in-progress', priority: 'high' },
  { id: 't3', title: 'Auditoria de segurança OWASP e sanitização', assignee: 'anjos-reviewer', status: 'in-progress', priority: 'high' },
  { id: 't4', title: 'Testes de carga e regressão automática', assignee: 'anjos-debugger', status: 'pending', priority: 'medium' },
  { id: 't5', title: 'Configurar pipeline de CI/CD no GitHub Actions', assignee: 'anjos-devops', status: 'done', priority: 'high' },
  { id: 't6', title: 'Gerar documentação viva OpenAPI/Swagger', assignee: 'anjos-docs', status: 'pending', priority: 'low' },
];

export function AgentTeamsApp() {
  const [agents, setAgents] = useState<SwarmAgentDefinition[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgentDefinition | null>(null);
  const [tasks, setTasks] = useState<TeamTask[]>(INITIAL_TASKS);
  const [messages, setMessages] = useState<SwarmMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [targetAgentId, setTargetAgentId] = useState<string>('anjos-architect');
  const [activeTab, setActiveTab] = useState<'chat' | 'agents' | 'tasks'>('chat');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const engine = getSwarmEngine();
    const allAgents = engine.getAllAgents();
    setAgents(allAgents);
    if (allAgents.length > 0) {
      setSelectedAgent(allAgents[0]);
    }
    setMessages(engine.getMessages());

    // Se inscreve para atualizações
    const unsubscribe = engine.on((event, data) => {
      if (event === 'message:new') {
        setMessages(engine.getMessages());
      } else if (event === 'agent:status_change') {
        setAgents(engine.getAllAgents());
      }
    });

    return unsubscribe;
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    setIsProcessing(true);
    const engine = getSwarmEngine();

    // Mensagem do usuário
    engine.postMessage(
      'user',
      targetAgentId,
      'user_query',
      'Solicitação Direta',
      inputMessage
    );

    const userPrompt = inputMessage;
    setInputMessage('');

    // Dispara resposta autônoma do agente
    setTimeout(() => {
      const targetAgent = agents.find((a) => a.id === targetAgentId);
      const agentName = targetAgent?.name || 'Agente';

      engine.postMessage(
        targetAgentId,
        'user',
        'task_delegation',
        `Resposta de ${agentName}`,
        `Entendido! Como ${agentName}, estou processando sua solicitação: "${userPrompt}". ` +
          `Colaborando com o enxame para entregar a melhor solução com tipagem segura e validações de qualidade.`
      );

      // Simula encaminhamento de colaboração
      if (targetAgentId === 'anjos-architect') {
        setTimeout(() => {
          engine.postMessage(
            'anjos-architect',
            'anjos-coder',
            'task_delegation',
            'Delegação de Implementação',
            `AnjosCoder, por favor implemente o código referente a "${userPrompt}". Siga os padrões Clean Architecture.`
          );
        }, 800);
      }

      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-text-primary">
      {/* Top Header */}
      <div className="p-3 border-b border-cyber-border bg-cyber-card/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-blue/20 text-neon-blue">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              AnjosDevOS Agent Teams
              <span className="text-[10px] px-2 py-0.5 bg-neon-green/15 text-neon-green border border-neon-green/30 rounded-full font-mono">
                {agents.length} Especialistas Ativos
              </span>
            </h2>
            <p className="text-[10px] text-text-muted">Enxame Autônomo Colaborativo para Desenvolvimento</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-cyber-bg p-1 rounded-lg border border-cyber-border text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              'px-3 py-1 rounded-md font-medium transition-colors',
              activeTab === 'chat' ? 'bg-neon-blue text-black font-bold' : 'text-text-muted hover:text-white'
            )}
          >
            💬 Feed Inter-Agentes
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={cn(
              'px-3 py-1 rounded-md font-medium transition-colors',
              activeTab === 'agents' ? 'bg-neon-blue text-black font-bold' : 'text-text-muted hover:text-white'
            )}
          >
            🤖 Time ({agents.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={cn(
              'px-3 py-1 rounded-md font-medium transition-colors',
              activeTab === 'tasks' ? 'bg-neon-blue text-black font-bold' : 'text-text-muted hover:text-white'
            )}
          >
            📋 Quadro de Tarefas
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: INTER-AGENT LIVE FEED */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Agent Selection List */}
            <div className="w-64 border-r border-cyber-border bg-cyber-card/30 flex flex-col">
              <div className="p-2.5 border-b border-cyber-border text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                Especialistas do Enxame
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setTargetAgentId(agent.id);
                    }}
                    className={cn(
                      'p-2 rounded-xl text-xs cursor-pointer transition-all border flex items-center gap-2.5',
                      selectedAgent?.id === agent.id
                        ? 'bg-neon-blue/15 border-neon-blue/40 text-white'
                        : 'bg-cyber-bg/40 border-cyber-border/60 text-text-muted hover:text-text-secondary'
                    )}
                  >
                    <span className="text-xl">{agent.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-white text-[11px]">{agent.name}</p>
                      <p className="text-[9px] text-text-muted truncate">{agent.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Message Stream & Input */}
            <div className="flex-1 flex flex-col bg-cyber-bg">
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                    <p>Nenhuma mensagem no barramento ainda.</p>
                    <p className="text-[10px]">Envie uma instrução abaixo para iniciar o diálogo entre agentes.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.from === 'user';
                    const fromAgent = agents.find((a) => a.id === msg.from);
                    const toAgent = agents.find((a) => a.id === msg.to);

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'p-3 rounded-2xl border text-xs max-w-2xl space-y-1',
                          isUser
                            ? 'ml-auto bg-neon-green/10 border-neon-green/30 text-white'
                            : 'mr-auto bg-cyber-card border-cyber-border text-text-primary'
                        )}
                      >
                        <div className="flex items-center justify-between text-[10px] text-text-muted border-b border-white/5 pb-1">
                          <span className="font-bold text-neon-cyan flex items-center gap-1">
                            {isUser ? '👤 Você' : `${fromAgent?.avatar || '🤖'} ${fromAgent?.name || msg.from}`}
                            <span className="text-text-muted font-normal">➔</span>
                            {msg.to === '*' ? '🌐 Todos (Broadcast)' : `${toAgent?.avatar || '🤖'} ${toAgent?.name || msg.to}`}
                          </span>
                          <span className="font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="font-semibold text-white text-[11px] pt-0.5">{msg.subject}</p>
                        <p className="text-text-secondary leading-relaxed">{msg.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-cyber-border bg-cyber-card/60 flex items-center gap-2">
                <select
                  value={targetAgentId}
                  onChange={(e) => setTargetAgentId(e.target.value)}
                  className="text-xs px-2.5 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-neon-cyan outline-none font-bold"
                >
                  <option value="*">🌐 Enxame Completo (*)</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.avatar} {a.name} ({a.badge})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Enviar mensagem ou ordem para o agente..."
                  className="flex-1 text-xs px-3 py-2 bg-cyber-bg border border-cyber-border rounded-lg text-white focus:border-neon-blue outline-none"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !inputMessage.trim()}
                  className="px-4 py-2 bg-neon-blue text-black font-bold text-xs rounded-lg hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AGENTS GRID */}
        {activeTab === 'agents' && (
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 rounded-2xl bg-cyber-card border border-cyber-border flex flex-col justify-between hover:border-cyber-border-hover transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.avatar}</span>
                      <div>
                        <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                        <p className="text-[10px] text-text-muted">{agent.title}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-neon-blue/20 text-neon-blue border border-neon-blue/30 font-bold">
                      {agent.badge}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary mb-3 line-clamp-3 leading-relaxed">
                    {agent.systemPrompt.slice(0, 180)}...
                  </p>

                  <div className="space-y-1 mb-4">
                    <p className="text-[10px] font-mono text-text-muted uppercase">Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[9px] px-1.5 py-0.5 bg-cyber-bg border border-cyber-border rounded text-text-muted"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-cyber-border flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span>Tarefas: {agent.tasksCompleted}</span>
                  <span className="text-neon-green font-bold">Precisão: {agent.rating}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: TASKS BOARD */}
        {activeTab === 'tasks' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['pending', 'in-progress', 'done'].map((status) => {
                const filteredTasks = tasks.filter(
                  (t) => (status === 'done' ? t.status === 'done' : t.status === status)
                );
                return (
                  <div key={status} className="rounded-2xl bg-cyber-card/60 border border-cyber-border p-3 flex flex-col">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyber-border">
                      <span className="text-xs font-bold uppercase text-white font-mono">
                        {status === 'pending' ? '⏳ Pendente' : status === 'in-progress' ? '⚡ Em Progresso' : '✅ Concluído'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-cyber-bg rounded-full font-mono text-text-muted">
                        {filteredTasks.length}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1">
                      {filteredTasks.map((t) => {
                        const assigned = agents.find((a) => a.id === t.assignee);
                        return (
                          <div
                            key={t.id}
                            className="p-3 rounded-xl bg-cyber-bg border border-cyber-border text-xs space-y-1.5"
                          >
                            <p className="font-semibold text-white">{t.title}</p>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-neon-cyan flex items-center gap-1 font-mono">
                                {assigned?.avatar} {assigned?.name}
                              </span>
                              <span
                                className={cn(
                                  'px-1.5 py-0.2 rounded font-mono uppercase text-[9px]',
                                  t.priority === 'high'
                                    ? 'bg-neon-red/20 text-neon-red'
                                    : 'bg-neon-yellow/20 text-neon-yellow'
                                )}
                              >
                                {t.priority}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
