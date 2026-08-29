'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOrchestrator } from '@/lib/agent-orchestration/orchestrator';
import { getBrowserEngine } from '@/lib/agent-orchestration/browser-engine';
import { getHermesAgent } from '@/lib/agent-orchestration/hermes-agent';
import { getWorkflowLearner } from '@/lib/agent-orchestration/workflow-learner';
import type {
  OrchestratorAgent, HermesReasoningChain, HermesDecision,
  LearnedWorkflow, Workflow, BrowserSession, BrowserAction,
} from '@/lib/agent-orchestration/types';

type TabId = 'agentes' | 'workflows' | 'navegador' | 'hermes' | 'aprendizado' | 'log';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'agentes', label: 'Agentes', icon: '🤖' },
  { id: 'workflows', label: 'Workflows', icon: '⚡' },
  { id: 'navegador', label: 'Navegador', icon: '🌐' },
  { id: 'hermes', label: 'Hermes', icon: '🧠' },
  { id: 'aprendizado', label: 'Aprendizado', icon: '📚' },
  { id: 'log', label: 'Log', icon: '📋' },
];

// Agentes pré-registrados
const DEFAULT_AGENTS: OrchestratorAgent[] = [
  {
    id: 'hermes', name: 'Hermes', type: 'ai', icon: '🧠', status: 'idle',
    capabilities: [{ name: 'reasoning', description: 'Raciocínio profundo', inputSchema: {}, outputSchema: {}, estimatedDuration: '5-15s' }],
    maxConcurrentTasks: 1, currentTasks: [], metadata: { framework: 'Chain-of-Thought' },
  },
  {
    id: 'browser', name: 'Browser Agent', type: 'tool', icon: '🌐', status: 'idle',
    capabilities: [
      { name: 'navigate', description: 'Navegar na web', inputSchema: {}, outputSchema: {}, estimatedDuration: '2-5s' },
      { name: 'automate', description: 'Automatizar ações', inputSchema: {}, outputSchema: {}, estimatedDuration: '1-10s' },
      { name: 'extract', description: 'Extrair dados', inputSchema: {}, outputSchema: {}, estimatedDuration: '2-5s' },
    ],
    maxConcurrentTasks: 3, currentTasks: [], metadata: { engine: 'Browser Automation' },
  },
  {
    id: 'coder', name: 'Desenvolvedor', type: 'ai', icon: '💻', status: 'idle',
    capabilities: [
      { name: 'code', description: 'Escrever código', inputSchema: {}, outputSchema: {}, estimatedDuration: '5-30s' },
      { name: 'review', description: 'Revisar código', inputSchema: {}, outputSchema: {}, estimatedDuration: '3-10s' },
      { name: 'debug', description: 'Depurar erros', inputSchema: {}, outputSchema: {}, estimatedDuration: '5-20s' },
    ],
    maxConcurrentTasks: 2, currentTasks: [], metadata: { languages: 'TS, Python, Rust, Go' },
  },
  {
    id: 'researcher', name: 'Pesquisador', type: 'ai', icon: '📚', status: 'idle',
    capabilities: [
      { name: 'research', description: 'Pesquisar informações', inputSchema: {}, outputSchema: {}, estimatedDuration: '3-15s' },
      { name: 'summarize', description: 'Resumir conteúdo', inputSchema: {}, outputSchema: {}, estimatedDuration: '2-5s' },
    ],
    maxConcurrentTasks: 2, currentTasks: [], metadata: { sources: 'Web, Docs, APIs' },
  },
  {
    id: 'reviewer', name: 'Revisor', type: 'ai', icon: '🔎', status: 'idle',
    capabilities: [
      { name: 'review', description: 'Revisar qualidade', inputSchema: {}, outputSchema: {}, estimatedDuration: '3-10s' },
      { name: 'test', description: 'Executar testes', inputSchema: {}, outputSchema: {}, estimatedDuration: '5-15s' },
    ],
    maxConcurrentTasks: 1, currentTasks: [], metadata: { checks: 'Lint, Type, Unit, E2E' },
  },
];

export function AgentOrchestratorApp() {
  const [activeTab, setActiveTab] = useState<TabId>('agentes');
  const [agents, setAgents] = useState<OrchestratorAgent[]>(DEFAULT_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<OrchestratorAgent | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [learnedWorkflows, setLearnedWorkflows] = useState<LearnedWorkflow[]>([]);
  const [hermesChains, setHermesChains] = useState<HermesReasoningChain[]>([]);
  const [hermesDecision, setHermesDecision] = useState<HermesDecision | null>(null);
  const [hermesInput, setHermesInput] = useState('');
  const [browserSessions, setBrowserSessions] = useState<BrowserSession[]>([]);
  const [browserUrl, setBrowserUrl] = useState('https://');
  const [isRecording, setIsRecording] = useState(false);
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [learnerStats, setLearnerStats] = useState({ totalPatterns: 0, frequentPatterns: 0, isWatching: false, unresolvedPrompts: 0 });
  const [orchestratorStats, setOrchestratorStats] = useState({ totalAgents: 0, availableAgents: 0, activeTasks: 0, totalMessages: 0, totalWorkflows: 0 });

  const addLog = useCallback((msg: string) => {
    setLogEntries(prev => [...prev, `[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`]);
  }, []);

  // Inicializar orquestrador
  useEffect(() => {
    const orch = getOrchestrator();
    DEFAULT_AGENTS.forEach(a => orch.registerAgent(a));
    setOrchestratorStats(orch.getStats());
    addLog('🚀 Orquestrador de agentes inicializado');
    addLog(`🤖 ${DEFAULT_AGENTS.length} agentes registrados`);

    orch.on((event, data) => {
      addLog(`📡 Evento: ${event}`);
      setOrchestratorStats(orch.getStats());
    });
  }, [addLog]);

  // ── Ações de Agentes ──

  const toggleAgentStatus = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const newStatus = a.status === 'offline' ? 'idle' : 'offline';
        addLog(`${a.icon} ${a.name} agora está ${newStatus === 'idle' ? 'online' : 'offline'}`);
        return { ...a, status: newStatus as OrchestratorAgent['status'] };
      }
      return a;
    }));
  };

  const runHermesReasoning = async () => {
    if (!hermesInput.trim()) return;
    const hermes = getHermesAgent();
    addLog(`🧠 Hermes iniciando raciocínio: "${hermesInput}"`);

    const result = await hermes.solveProblem(hermesInput);
    setHermesChains(prev => [...prev, result.chain]);
    if (result.decision) setHermesDecision(result.decision);

    addLog(`🧠 Hermes concluiu: ${result.chain.conclusion || 'Raciocínio em andamento'}`);
    setHermesInput('');
  };

  const startBrowserSession = () => {
    if (!browserUrl.trim() || browserUrl === 'https://') return;
    const engine = getBrowserEngine();
    const session = engine.createSession(browserUrl);
    setBrowserSessions(prev => [...prev, session]);
    addLog(`🌐 Sessão de navegador iniciada: ${browserUrl}`);

    // Simular automação
    setTimeout(() => {
      engine.executeAction(session.id, { id: '1', type: 'navigate', url: browserUrl, description: `Navegou para ${browserUrl}` });
      engine.executeAction(session.id, { id: '2', type: 'screenshot', description: 'Captura inicial' });
      addLog(`📸 Captura de tela realizada para ${browserUrl}`);
    }, 1500);
  };

  const toggleRecording = () => {
    const engine = getBrowserEngine();
    if (isRecording) {
      engine.stopRecording();
      setIsRecording(false);
      addLog('⏹️ Gravação de ações parada');
    } else {
      const session = browserSessions[0];
      if (session) {
        engine.startRecording(session.id);
        setIsRecording(true);
        addLog('🔴 Gravação de ações iniciada');
      }
    }
  };

  const simulateUserAction = (type: string) => {
    const engine = getBrowserEngine();
    const learner = getWorkflowLearner();
    const session = browserSessions[0];
    if (!session) return;

    const action: BrowserAction = {
      id: Date.now().toString(),
      type: type as BrowserAction['type'],
      description: `Ação simulada: ${type}`,
      url: session.url,
    };

    engine.executeAction(session.id, action);
    learner.observeAction(action, session.url);
    setLearnerStats(learner.getStats());
    addLog(`👆 Ação registrada: ${type}`);
  };

  const saveLearnedWorkflow = () => {
    const learner = getWorkflowLearner();
    const patterns = learner.getFrequentPatterns();
    if (patterns.length > 0) {
      const pattern = patterns[0];
      const workflow = learner.createWorkflowFromActions(
        `Workflow: ${pattern.context}`,
        `Processo aprendido - ${pattern.actions.length} passos`,
        pattern.actions,
        pattern.url
      );
      setWorkflows(prev => [...prev, workflow]);
      addLog(`💾 Workflow salvo: ${workflow.name}`);
    }
  };

  // ── Renderização ──

  const renderAgentes = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">🤖 Agentes Disponíveis</h3>
          <p className="text-[10px] text-text-muted mt-0.5">{agents.length} agentes · {agents.filter(a => a.status === 'idle').length} disponíveis</p>
        </div>
        <div className="flex gap-2 text-[10px] text-text-muted">
          <span>📊 {orchestratorStats.activeTasks} tarefas</span>
          <span>💬 {orchestratorStats.totalMessages} msgs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {agents.map(agent => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
            className={`bg-surface/50 border rounded-lg p-4 cursor-pointer transition-all hover:border-neon-blue/30 ${
              selectedAgent?.id === agent.id ? 'border-neon-blue/50 bg-neon-blue/5' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{agent.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">{agent.name}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] rounded ${
                    agent.status === 'idle' ? 'bg-neon-green/20 text-neon-green' :
                    agent.status === 'busy' ? 'bg-neon-yellow/20 text-neon-yellow' :
                    agent.status === 'offline' ? 'bg-surface text-text-muted' :
                    'bg-neon-red/20 text-neon-red'
                  }`}>
                    {agent.status === 'idle' ? '🟢 Pronto' :
                     agent.status === 'busy' ? '🟡 Ocupado' :
                     agent.status === 'offline' ? '⚪ Offline' : '🔴 Erro'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {agent.capabilities.map(c => (
                    <span key={c.name} className="px-1.5 py-0.5 text-[8px] bg-surface border border-border rounded text-text-muted">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleAgentStatus(agent.id); }}
                className={`px-2 py-1 text-[9px] border rounded ${
                  agent.status === 'offline' ? 'border-neon-green/30 text-neon-green' : 'border-neon-yellow/30 text-neon-yellow'
                }`}
              >
                {agent.status === 'offline' ? '▶️ Iniciar' : '⏸️ Parar'}
              </button>
            </div>

            {selectedAgent?.id === agent.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-3 gap-2 text-[9px]">
                  <div className="bg-surface/50 rounded p-2 text-center">
                    <div className="text-neon-blue font-bold">{agent.capabilities.length}</div>
                    <div className="text-text-muted">Capacidades</div>
                  </div>
                  <div className="bg-surface/50 rounded p-2 text-center">
                    <div className="text-neon-green font-bold">{agent.maxConcurrentTasks}</div>
                    <div className="text-text-muted">Max Tarefas</div>
                  </div>
                  <div className="bg-surface/50 rounded p-2 text-center">
                    <div className="text-neon-purple font-bold">{agent.currentTasks.length}</div>
                    <div className="text-text-muted">Em Execução</div>
                  </div>
                </div>
                <div className="mt-2 text-[9px] text-text-muted">
                  Tipo: {agent.type} · Framework: {agent.metadata.framework || agent.metadata.engine || agent.metadata.languages || 'N/A'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderWorkflows = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">⚡ Workflows</h3>
          <p className="text-[10px] text-text-muted mt-0.5">{workflows.length} workflows · {workflows.filter(w => w.active).length} ativos</p>
        </div>
        <button className="px-3 py-1.5 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/30">
          + Criar Workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⚡</div>
          <div className="text-sm text-text-muted">Nenhum workflow ainda</div>
          <div className="text-[10px] text-text-muted mt-1">Workflows são criados automaticamente quando padrões são detectados</div>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map(wf => (
            <div key={wf.id} className="bg-surface/50 border border-border rounded-lg p-4 hover:border-neon-blue/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${wf.active ? 'bg-neon-green animate-pulse' : 'bg-text-muted'}`} />
                    <span className="text-sm font-medium text-text">{wf.name}</span>
                    <span className="text-[9px] text-text-muted">({wf.createdBy})</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 ml-4">{wf.description}</p>
                  <div className="flex gap-3 mt-1.5 ml-4 text-[9px] text-text-muted">
                    <span>📦 {wf.steps.length} passos</span>
                    <span>🚀 {wf.runs} execuções</span>
                    <span>⚡ {wf.triggers.length} triggers</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNavegador = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* URL Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface/30 border-b border-border">
        <input
          type="text"
          value={browserUrl}
          onChange={(e) => setBrowserUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && startBrowserSession()}
          placeholder="Digite uma URL..."
          className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded text-text focus:outline-none focus:border-neon-blue"
        />
        <button onClick={startBrowserSession} className="px-3 py-1.5 text-[10px] bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30">
          🌐 Navegar
        </button>
        <button
          onClick={toggleRecording}
          className={`px-3 py-1.5 text-[10px] border rounded ${isRecording ? 'bg-neon-red/20 text-neon-red border-neon-red/30 animate-pulse' : 'bg-surface border-border'}`}
        >
          {isRecording ? '🔴 Gravando...' : '⏺️ Gravar'}
        </button>
      </div>

      {/* Simulação de Ações */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface/20">
        <span className="text-[9px] text-text-muted">Simular:</span>
        {['click', 'type', 'extract', 'scroll', 'screenshot', 'submit'].map(action => (
          <button
            key={action}
            onClick={() => simulateUserAction(action)}
            className="px-2 py-0.5 text-[9px] bg-surface border border-border rounded hover:bg-surface/80"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Sessões */}
      <div className="flex-1 overflow-y-auto p-4">
        {browserSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🌐</div>
            <div className="text-sm text-text-muted">Nenhuma sessão de navegador</div>
            <div className="text-[10px] text-text-muted mt-1">Digite uma URL e clique em Navegar para iniciar</div>
          </div>
        ) : (
          <div className="space-y-3">
            {browserSessions.map(session => (
              <div key={session.id} className="bg-surface/50 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🌐</span>
                  <span className="text-xs font-medium text-text">{session.url}</span>
                  <span className="text-[9px] text-text-muted">{session.actions.length} ações</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {session.actions.slice(-10).map(action => (
                    <span key={action.id} className="px-1.5 py-0.5 text-[8px] bg-surface border border-border rounded text-text-muted">
                      {action.type}: {action.description}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[9px] text-text-muted">
                  📸 {session.screenshots.length} capturas · 📜 {session.history.length} URLs visitadas
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderHermes = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Input */}
      <div className="px-4 py-3 border-b border-border bg-surface/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🧠</span>
          <span className="text-xs font-medium text-text">Hermes — Raciocínio Profundo</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={hermesInput}
            onChange={(e) => setHermesInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runHermesReasoning()}
            placeholder="Descreva um problema para Hermes raciocinar..."
            className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded text-text focus:outline-none focus:border-neon-purple"
          />
          <button
            onClick={runHermesReasoning}
            className="px-3 py-1.5 text-[10px] bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded hover:bg-neon-purple/30"
          >
            🧠 Raciocinar
          </button>
        </div>
      </div>

      {/* Cadeias de Raciocínio */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hermesChains.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🧠</div>
            <div className="text-sm text-text-muted">Nenhum raciocínio ainda</div>
            <div className="text-[10px] text-text-muted mt-1">Descreva um problema para Hermes analisar</div>
          </div>
        ) : (
          hermesChains.map(chain => (
            <div key={chain.id} className="bg-surface/50 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-1.5 py-0.5 text-[8px] rounded ${
                  chain.status === 'completed' ? 'bg-neon-green/20 text-neon-green' :
                  chain.status === 'exploring' ? 'bg-neon-yellow/20 text-neon-yellow' :
                  chain.status === 'converged' ? 'bg-neon-blue/20 text-neon-blue' :
                  'bg-surface text-text-muted'
                }`}>{chain.status}</span>
                <span className="text-xs font-medium text-text">{chain.problem}</span>
              </div>

              {/* Árvore de Pensamentos */}
              <div className="space-y-2 ml-4">
                {chain.thoughts.map(thought => (
                  <div key={thought.id} className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">
                      {thought.type === 'observation' ? '👁️' :
                       thought.type === 'reasoning' ? '🔄' :
                       thought.type === 'hypothesis' ? '💡' :
                       thought.type === 'conclusion' ? '✅' :
                       thought.type === 'action' ? '⚡' : '🪞'}
                    </span>
                    <div className="flex-1">
                      <div className="text-[10px] text-text">{thought.content}</div>
                      <div className="text-[8px] text-text-muted mt-0.5">
                        {thought.type} · confiança: {(thought.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {chain.conclusion && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-[10px] text-neon-green font-medium">✅ Conclusão: {chain.conclusion}</div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Decisão */}
        {hermesDecision && (
          <div className="bg-surface/50 border border-neon-purple/30 rounded-lg p-4">
            <div className="text-xs font-medium text-text mb-3">🎯 Decisão: {hermesDecision.question}</div>
            <div className="space-y-2">
              {hermesDecision.options.map((opt, i) => (
                <div key={i} className={`p-2 rounded border ${
                  hermesDecision.selectedOption === i ? 'border-neon-green bg-neon-green/5' : 'border-border'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-text">{opt.label}</span>
                    <span className="text-[8px] text-neon-green">Score: {opt.score}/10</span>
                  </div>
                  <div className="text-[9px] text-text-muted mt-0.5">{opt.description}</div>
                </div>
              ))}
            </div>
            {hermesDecision.reasoning && (
              <div className="mt-2 text-[9px] text-text-muted">💡 {hermesDecision.reasoning}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAprendizado = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">📚 Aprendizado de Workflows</h3>
          <p className="text-[10px] text-text-muted mt-0.5">O sistema observa suas ações e cria processos reutilizáveis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const learner = getWorkflowLearner();
              if (learner.isWatchingActive()) {
                learner.stopWatching();
                addLog('⏹️ Observação parada');
              } else {
                learner.startWatching();
                addLog('👁️ Observação iniciada - o sistema está aprendendo seus processos');
              }
              setLearnerStats(learner.getStats());
            }}
            className={`px-3 py-1.5 text-[10px] border rounded ${
              learnerStats.isWatching ? 'bg-neon-red/20 text-neon-red border-neon-red/30 animate-pulse' : 'bg-neon-green/20 text-neon-green border-neon-green/30'
            }`}
          >
            {learnerStats.isWatching ? '⏹️ Parar Observação' : '👁️ Iniciar Observação'}
          </button>
          <button onClick={saveLearnedWorkflow} className="px-3 py-1.5 text-[10px] bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30">
            💾 Salvar Workflow
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-surface/50 border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-neon-blue">{learnerStats.totalPatterns}</div>
          <div className="text-[9px] text-text-muted">Padrões Detectados</div>
        </div>
        <div className="bg-surface/50 border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-neon-green">{learnerStats.frequentPatterns}</div>
          <div className="text-[9px] text-text-muted">Frequentes</div>
        </div>
        <div className="bg-surface/50 border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-neon-yellow">{learnerStats.unresolvedPrompts}</div>
          <div className="text-[9px] text-text-muted">Perguntas Pendentes</div>
        </div>
      </div>

      {/* Perguntas Pendentes */}
      {getWorkflowLearner().getUnresolvedPrompts().length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] text-text-muted mb-2">❓ Perguntas para você:</div>
          {getWorkflowLearner().getUnresolvedPrompts().map(prompt => (
            <div key={prompt.id} className="bg-surface/50 border border-neon-yellow/30 rounded-lg p-3 mb-2">
              <div className="text-[10px] text-text font-medium">{prompt.question}</div>
              <div className="text-[9px] text-text-muted mt-0.5">{prompt.context}</div>
              <div className="flex gap-2 mt-2">
                {prompt.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      getWorkflowLearner().resolvePrompt(prompt.id, opt.value);
                      setLearnerStats(getWorkflowLearner().getStats());
                      addLog(`✅ Resposta: ${opt.label}`);
                    }}
                    className="px-2 py-1 text-[9px] bg-surface border border-border rounded hover:bg-surface/80"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Padrões Detectados */}
      <div>
        <div className="text-[10px] text-text-muted mb-2">🔍 Padrões Detectados:</div>
        {getWorkflowLearner().getPatterns().length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-xs text-text-muted">Nenhum padrão detectado ainda</div>
            <div className="text-[10px] text-text-muted mt-1">Inicie a observação e faça ações no navegador</div>
          </div>
        ) : (
          <div className="space-y-2">
            {getWorkflowLearner().getPatterns().map((pattern, i) => (
              <div key={i} className="bg-surface/50 border border-border rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-text">{pattern.context}</span>
                  <span className="text-[9px] text-text-muted">x{pattern.frequency}</span>
                </div>
                <div className="text-[9px] text-text-muted mt-0.5">{pattern.url}</div>
                <div className="flex gap-1 mt-1">
                  {pattern.actions.map((a, j) => (
                    <span key={j} className="px-1 py-0.5 text-[8px] bg-surface border border-border rounded text-text-muted">{a.type}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderLog = () => (
    <div className="flex-1 overflow-y-auto p-4 font-mono">
      <div className="text-[10px] text-text-muted mb-3">📋 Log do Sistema</div>
      <div className="space-y-1">
        {logEntries.length === 0 ? (
          <div className="text-[10px] text-text-muted">Nenhuma atividade registrada</div>
        ) : (
          logEntries.map((entry, i) => (
            <div key={i} className="text-[10px] text-text-secondary">{entry}</div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background text-text">
      {/* Tab Bar */}
      <div className="flex border-b border-border bg-surface/30 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-neon-blue border-neon-blue bg-neon-blue/5'
                : 'text-text-muted border-transparent hover:text-text hover:bg-surface/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'agentes' && renderAgentes()}
        {activeTab === 'workflows' && renderWorkflows()}
        {activeTab === 'navegador' && renderNavegador()}
        {activeTab === 'hermes' && renderHermes()}
        {activeTab === 'aprendizado' && renderAprendizado()}
        {activeTab === 'log' && renderLog()}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1.5 border-t border-border bg-surface/30 flex items-center gap-4 text-[10px] text-text-muted">
        <span>🤖 {agents.filter(a => a.status === 'idle').length}/{agents.length} agentes</span>
        <span>⚡ {workflows.length} workflows</span>
        <span>🧠 {hermesChains.length} raciocínios</span>
        <span>🌐 {browserSessions.length} sessões</span>
        <span className="ml-auto">Orquestrador de Agentes v1.0</span>
      </div>
    </div>
  );
}
