'use client';

import { useState, useCallback } from 'react';

interface FlowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'output';
  label: string;
  icon: string;
  x: number;
  y: number;
  config: Record<string, string>;
}

interface FlowConnection {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
}

interface Flow {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
  active: boolean;
  lastRun?: string;
  runs: number;
}

const TRIGGER_TEMPLATES = [
  { label: 'Schedule', icon: '⏰', desc: 'Executar em horário definido' },
  { label: 'Webhook', icon: '🔗', desc: 'Quando receber HTTP request' },
  { label: 'File Change', icon: '📁', desc: 'Quando arquivo mudar' },
  { label: 'Git Push', icon: '🔀', desc: 'Quando fazer push' },
  { label: 'PR Created', icon: '📋', desc: 'Quando criar PR' },
  { label: 'Issue Created', icon: '🐛', desc: 'Quando issue for criada' },
  { label: 'Chat Command', icon: '💬', desc: 'Comando no chat' },
  { label: 'Manual', icon: '▶️', desc: 'Executar manualmente' },
];

const ACTION_TEMPLATES = [
  { label: 'Run Code', icon: '💻', desc: 'Executar código' },
  { label: 'API Call', icon: '🌐', desc: 'Fazer requisição HTTP' },
  { label: 'AI Agent', icon: '🤖', desc: 'Chamar agente de IA' },
  { label: 'Send Email', icon: '📧', desc: 'Enviar email' },
  { label: 'File Operation', icon: '📂', desc: 'Ler/escrever arquivo' },
  { label: 'Git Commit', icon: '📝', desc: 'Fazer commit' },
  { label: 'Deploy', icon: '🚀', desc: 'Deploy da aplicação' },
  { label: 'Database', icon: '🗄️', desc: 'Query no banco' },
  { label: 'Slack Message', icon: '💬', desc: 'Enviar mensagem Slack' },
  { label: 'GitHub Action', icon: '⚡', desc: 'Trigger GitHub Action' },
];

const INITIAL_FLOWS: Flow[] = [
  {
    id: 'f1', name: 'Auto Deploy', description: 'Deploy automático quando push na main',
    active: true, runs: 47, lastRun: '2026-08-28 12:30',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Git Push (main)', icon: '🔀', x: 50, y: 150, config: {} },
      { id: 'n2', type: 'condition', label: 'Build OK?', icon: '❓', x: 250, y: 150, config: {} },
      { id: 'n3', type: 'action', label: 'Run Tests', icon: '🧪', x: 450, y: 100, config: {} },
      { id: 'n4', type: 'action', label: 'Deploy to Prod', icon: '🚀', x: 450, y: 200, config: {} },
      { id: 'n5', type: 'output', label: 'Notify Team', icon: '📢', x: 650, y: 150, config: {} },
    ],
    connections: [
      { id: 'c1', from: 'n1', to: 'n2', fromPort: 'out', toPort: 'in' },
      { id: 'c2', from: 'n2', to: 'n3', fromPort: 'yes', toPort: 'in' },
      { id: 'c3', from: 'n2', to: 'n4', fromPort: 'yes', toPort: 'in' },
      { id: 'c4', from: 'n3', to: 'n5', fromPort: 'out', toPort: 'in' },
    ],
  },
  {
    id: 'f2', name: 'Daily Report', description: 'Gerar relatório diário com IA',
    active: true, runs: 30, lastRun: '2026-08-28 08:00',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Schedule (8:00)', icon: '⏰', x: 50, y: 150, config: {} },
      { id: 'n2', type: 'action', label: 'Collect Metrics', icon: '📊', x: 250, y: 150, config: {} },
      { id: 'n3', type: 'action', label: 'AI Analysis', icon: '🤖', x: 450, y: 150, config: {} },
      { id: 'n4', type: 'output', label: 'Send Report', icon: '📧', x: 650, y: 150, config: {} },
    ],
    connections: [
      { id: 'c1', from: 'n1', to: 'n2', fromPort: 'out', toPort: 'in' },
      { id: 'c2', from: 'n2', to: 'n3', fromPort: 'out', toPort: 'in' },
      { id: 'c3', from: 'n3', to: 'n4', fromPort: 'out', toPort: 'in' },
    ],
  },
  {
    id: 'f3', name: 'PR Review Bot', description: 'Review automático de PRs com IA',
    active: false, runs: 12, lastRun: '2026-08-25 16:45',
    nodes: [
      { id: 'n1', type: 'trigger', label: 'PR Created', icon: '📋', x: 50, y: 150, config: {} },
      { id: 'n2', type: 'action', label: 'AI Code Review', icon: '🤖', x: 250, y: 150, config: {} },
      { id: 'n3', type: 'output', label: 'Post Comments', icon: '💬', x: 450, y: 150, config: {} },
    ],
    connections: [
      { id: 'c1', from: 'n1', to: 'n2', fromPort: 'out', toPort: 'in' },
      { id: 'c2', from: 'n2', to: 'n3', fromPort: 'out', toPort: 'in' },
    ],
  },
];

export function AutomationStudioApp() {
  const [flows, setFlows] = useState<Flow[]>(INITIAL_FLOWS);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(flows[0]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateTab, setTemplateTab] = useState<'triggers' | 'actions'>('triggers');

  const toggleFlow = useCallback((flowId: string) => {
    setFlows(prev => prev.map(f => f.id === flowId ? { ...f, active: !f.active } : f));
    setSelectedFlow(prev => prev && prev.id === flowId ? { ...prev, active: !prev.active } : prev);
  }, []);

  const runFlow = useCallback((flowId: string) => {
    setFlows(prev => prev.map(f => f.id === flowId ? { ...f, runs: f.runs + 1, lastRun: new Date().toISOString().slice(0, 16).replace('T', ' ') } : f));
  }, []);

  const renderFlowList = () => (
    <div className="p-4 space-y-3 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-text">⚡ Automações</h3>
          <p className="text-[10px] text-text-muted mt-0.5">{flows.length} fluxos · {flows.filter(f => f.active).length} ativos</p>
        </div>
        <button className="px-3 py-1.5 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/30 transition-colors">
          + Novo Fluxo
        </button>
      </div>

      {flows.map(flow => (
        <div
          key={flow.id}
          onClick={() => { setSelectedFlow(flow); setView('editor'); }}
          className="bg-surface/50 border border-border rounded-lg p-4 hover:border-neon-blue/30 transition-colors cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${flow.active ? 'bg-neon-green animate-pulse' : 'bg-text-muted'}`} />
                <span className="text-sm font-medium text-text">{flow.name}</span>
                <span className={`px-1.5 py-0.5 text-[9px] rounded ${flow.active ? 'bg-neon-green/20 text-neon-green' : 'bg-surface text-text-muted'}`}>
                  {flow.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-[10px] text-text-muted mt-1">{flow.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[9px] text-text-muted">
                <span>📊 {flow.runs} execuções</span>
                {flow.lastRun && <span>🕐 Última: {flow.lastRun}</span>}
                <span>🔗 {flow.nodes.length} nodes</span>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); toggleFlow(flow.id); }}
                className="px-2 py-1 text-[9px] border border-border rounded hover:bg-surface/80"
              >
                {flow.active ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); runFlow(flow.id); }}
                className="px-2 py-1 text-[9px] bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30"
              >
                ⚡ Run
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFlowEditor = () => {
    if (!selectedFlow) return null;

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Header */}
        <div className="px-4 py-2 border-b border-border flex items-center gap-3 bg-surface/30">
          <button onClick={() => setView('list')} className="text-text-muted hover:text-text text-xs">← Voltar</button>
          <div className="w-px h-4 bg-border" />
          <span className="text-sm font-medium text-text">{selectedFlow.name}</span>
          <span className={`px-1.5 py-0.5 text-[9px] rounded ${selectedFlow.active ? 'bg-neon-green/20 text-neon-green' : 'bg-surface text-text-muted'}`}>
            {selectedFlow.active ? '🟢 Ativo' : '⏸️ Inativo'}
          </span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-2 py-1 text-[10px] bg-surface border border-border rounded hover:bg-surface/80"
            >
              🧩 Templates
            </button>
            <button
              onClick={() => toggleFlow(selectedFlow.id)}
              className={`px-2 py-1 text-[10px] border rounded ${selectedFlow.active ? 'border-neon-yellow/30 text-neon-yellow' : 'border-neon-green/30 text-neon-green'}`}
            >
              {selectedFlow.active ? '⏸️ Pausar' : '▶️ Ativar'}
            </button>
            <button
              onClick={() => runFlow(selectedFlow.id)}
              className="px-2 py-1 text-[10px] bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded"
            >
              ⚡ Executar
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-auto bg-[#0a0a0f]">
          {/* Grid Background */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #1a1a2e 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />

          {/* Flow Nodes */}
          <div className="relative w-full h-full min-h-[400px]">
            {selectedFlow.nodes.map(node => {
              const typeColors = {
                trigger: 'border-neon-green/50 bg-neon-green/5',
                action: 'border-neon-blue/50 bg-neon-blue/5',
                condition: 'border-neon-yellow/50 bg-neon-yellow/5',
                output: 'border-neon-purple/50 bg-neon-purple/5',
              };
              return (
                <div
                  key={node.id}
                  className={`absolute w-40 border rounded-lg p-3 ${typeColors[node.type]} hover:scale-105 transition-transform cursor-move shadow-lg`}
                  style={{ left: node.x, top: node.y }}
                >
                  <div className="text-lg mb-1">{node.icon}</div>
                  <div className="text-[10px] font-medium text-text">{node.label}</div>
                  <div className="text-[9px] text-text-muted capitalize mt-0.5">{node.type}</div>
                  {/* Connection ports */}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rounded-full bg-border border border-text-muted" />
                  <div className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 w-2 h-2 rounded-full bg-neon-blue border border-neon-blue" />
                </div>
              );
            })}

            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {selectedFlow.connections.map(conn => {
                const fromNode = selectedFlow.nodes.find(n => n.id === conn.from);
                const toNode = selectedFlow.nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;
                const x1 = fromNode.x + 160;
                const y1 = fromNode.y + 30;
                const x2 = toNode.x;
                const y2 = toNode.y + 30;
                return (
                  <path
                    key={conn.id}
                    d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })}
            </svg>
          </div>

          {/* Templates Panel */}
          {showTemplates && (
            <div className="absolute right-0 top-0 w-56 h-full bg-surface/95 backdrop-blur border-l border-border p-3 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text">🧩 Templates</span>
                <button onClick={() => setShowTemplates(false)} className="text-text-muted hover:text-text text-xs">✕</button>
              </div>
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setTemplateTab('triggers')}
                  className={`flex-1 px-2 py-1 text-[10px] rounded ${templateTab === 'triggers' ? 'bg-neon-green/20 text-neon-green' : 'bg-surface text-text-muted'}`}
                >
                  Triggers
                </button>
                <button
                  onClick={() => setTemplateTab('actions')}
                  className={`flex-1 px-2 py-1 text-[10px] rounded ${templateTab === 'actions' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-surface text-text-muted'}`}
                >
                  Actions
                </button>
              </div>
              <div className="space-y-1.5">
                {(templateTab === 'triggers' ? TRIGGER_TEMPLATES : ACTION_TEMPLATES).map((tpl, i) => (
                  <div key={i} className="px-2.5 py-2 bg-background border border-border rounded hover:border-neon-blue/30 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{tpl.icon}</span>
                      <div>
                        <div className="text-[10px] font-medium text-text">{tpl.label}</div>
                        <div className="text-[9px] text-text-muted">{tpl.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-3 py-1.5 border-t border-border bg-surface/30 flex items-center gap-4 text-[10px] text-text-muted">
          <span>🔗 {selectedFlow.connections.length} conexões</span>
          <span>📦 {selectedFlow.nodes.length} nodes</span>
          <span>📊 {selectedFlow.runs} execuções</span>
          <span className="ml-auto">Automation Studio v0.5.52</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background text-text">
      {view === 'list' ? renderFlowList() : renderFlowEditor()}
    </div>
  );
}
