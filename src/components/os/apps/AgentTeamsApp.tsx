'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  status: 'active' | 'idle' | 'error';
  model: string;
  skills: string[];
  tasksCompleted: number;
  currentTask?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  agents: string[];
  status: 'active' | 'paused';
  tasks: TeamTask[];
  messages: TeamMessage[];
}

interface TeamTask {
  id: string;
  title: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
}

interface TeamMessage {
  id: string;
  from: string;
  content: string;
  timestamp: string;
  type: 'message' | 'task' | 'status' | 'error';
}

const ALL_AGENTS: Agent[] = [
  { id: 'a1', name: 'Architect', role: 'Tech Lead', icon: '🏗️', status: 'active', model: 'claude-4-opus', skills: ['architecture', 'code-review', 'planning'], tasksCompleted: 23 },
  { id: 'a2', name: 'Developer', role: 'Senior Dev', icon: '👨‍💻', status: 'active', model: 'gpt-4o', skills: ['typescript', 'react', 'node'], tasksCompleted: 45, currentTask: 'Implementing auth flow' },
  { id: 'a3', name: 'Tester', role: 'QA Engineer', icon: '🧪', status: 'idle', model: 'claude-3.5-sonnet', skills: ['testing', 'debugging', 'e2e'], tasksCompleted: 18 },
  { id: 'a4', name: 'DevOps', role: 'Infrastructure', icon: '🔧', status: 'active', model: 'deepseek-v3', skills: ['docker', 'k8s', 'ci-cd', 'monitoring'], tasksCompleted: 12 },
  { id: 'a5', name: 'Designer', role: 'UI/UX', icon: '🎨', status: 'idle', model: 'gpt-4o', skills: ['ui-design', 'css', 'figma'], tasksCompleted: 8 },
  { id: 'a6', name: 'Scribe', role: 'Documentation', icon: '📝', status: 'active', model: 'claude-3.5-haiku', skills: ['documentation', 'markdown', 'api-docs'], tasksCompleted: 31, currentTask: 'Updating API docs' },
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 't1', name: 'Core Team', description: 'Time principal de desenvolvimento', status: 'active',
    agents: ['a1', 'a2', 'a3', 'a6'],
    tasks: [
      { id: 'tk1', title: 'Implementar auth system', assignee: 'a2', status: 'in-progress', priority: 'high' },
      { id: 'tk2', title: 'Revisar arquitetura de dados', assignee: 'a1', status: 'review', priority: 'high' },
      { id: 'tk3', title: 'Escrever testes unitários', assignee: 'a3', status: 'pending', priority: 'medium' },
      { id: 'tk4', title: 'Documentar endpoints', assignee: 'a6', status: 'in-progress', priority: 'low' },
    ],
    messages: [
      { id: 'm1', from: 'a1', content: 'Precisamos definir a estrutura do banco antes de prosseguir.', timestamp: '13:05', type: 'message' },
      { id: 'm2', from: 'a2', content: 'Entendido, vou ajustar o schema do Prisma.', timestamp: '13:08', type: 'message' },
      { id: 'm3', from: 'a3', content: 'Task tk1 está em progresso — % completado: 60%', timestamp: '13:10', type: 'status' },
      { id: 'm4', from: 'a6', content: 'Docs dos endpoints de auth atualizadas.', timestamp: '13:15', type: 'status' },
    ],
  },
  {
    id: 't2', name: 'DevOps Squad', description: 'Infraestrutura e deploy', status: 'paused',
    agents: ['a4'],
    tasks: [
      { id: 'tk5', title: 'Configurar pipeline CI/CD', assignee: 'a4', status: 'done', priority: 'high' },
      { id: 'tk6', title: 'Setup monitoring', assignee: 'a4', status: 'pending', priority: 'medium' },
    ],
    messages: [
      { id: 'm5', from: 'a4', content: 'Pipeline configurado. Deploy automático ativo na branch main.', timestamp: '12:45', type: 'status' },
    ],
  },
];

export function AgentTeamsApp() {
  const [teams] = useState<Team[]>(INITIAL_TEAMS);
  const [agents] = useState<Agent[]>(ALL_AGENTS);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams[0]);
  const [activeTab, setActiveTab] = useState<'teams' | 'agents' | 'chat'>('teams');
  const [chatMessage, setChatMessage] = useState('');

  const getAgent = (id: string) => agents.find(a => a.id === id);

  const renderTeamsList = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-text">👥 Agent Teams</h3>
          <p className="text-[10px] text-text-muted mt-0.5">{teams.length} times · {teams.filter(t => t.status === 'active').length} ativos</p>
        </div>
        <button className="px-3 py-1.5 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/30">
          + Novo Time
        </button>
      </div>

      {teams.map(team => (
        <div
          key={team.id}
          onClick={() => { setSelectedTeam(team); setActiveTab('chat'); }}
          className={`bg-surface/50 border rounded-lg p-4 cursor-pointer transition-all hover:border-neon-blue/30 ${
            selectedTeam?.id === team.id ? 'border-neon-blue/50 bg-neon-blue/5' : 'border-border'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${team.status === 'active' ? 'bg-neon-green animate-pulse' : 'bg-text-muted'}`} />
                <span className="text-sm font-medium text-text">{team.name}</span>
              </div>
              <p className="text-[10px] text-text-muted mt-1 ml-4">{team.description}</p>
              <div className="flex items-center gap-2 mt-2 ml-4">
                {team.agents.map(aid => {
                  const agent = getAgent(aid);
                  return agent ? (
                    <span key={aid} className="text-sm" title={agent.name}>{agent.icon}</span>
                  ) : null;
                })}
                <span className="text-[9px] text-text-muted ml-1">{team.agents.length} agentes</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-text-muted">{team.tasks.filter(t => t.status === 'done').length}/{team.tasks.length} tasks</div>
              <div className="text-[9px] text-text-muted mt-0.5">💬 {team.messages.length} msgs</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAgentsList = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-text">🤖 Agents</h3>
        <p className="text-[10px] text-text-muted mt-0.5">{agents.length} agents · {agents.filter(a => a.status === 'active').length} ativos</p>
      </div>
      {agents.map(agent => (
        <div key={agent.id} className="bg-surface/50 border border-border rounded-lg p-3 hover:border-neon-blue/30 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xl">{agent.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text">{agent.name}</span>
                <span className="text-[9px] text-text-muted">({agent.role})</span>
                <span className={`px-1.5 py-0.5 text-[8px] rounded ${
                  agent.status === 'active' ? 'bg-neon-green/20 text-neon-green' :
                  agent.status === 'error' ? 'bg-neon-red/20 text-neon-red' :
                  'bg-surface text-text-muted'
                }`}>
                  {agent.status}
                </span>
              </div>
              <div className="text-[9px] text-text-muted mt-0.5">Model: {agent.model}</div>
              {agent.currentTask && (
                <div className="text-[9px] text-neon-blue mt-0.5">🔄 {agent.currentTask}</div>
              )}
              <div className="flex gap-1 mt-1.5">
                {agent.skills.map(skill => (
                  <span key={skill} className="px-1.5 py-0.5 text-[8px] bg-surface border border-border rounded text-text-muted">{skill}</span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-neon-green">{agent.tasksCompleted}</div>
              <div className="text-[8px] text-text-muted">tasks</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderChat = () => {
    if (!selectedTeam) return <div className="flex-1 flex items-center justify-center text-text-muted text-xs">Selecione um time</div>;

    const taskColumns = ['pending', 'in-progress', 'review', 'done'] as const;
    const colLabels = { pending: '📝 Pending', 'in-progress': '🔄 In Progress', review: '👀 Review', done: '✅ Done' };

    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Tasks Panel */}
        <div className="w-72 border-r border-border overflow-y-auto p-3 bg-surface/20">
          <div className="text-[10px] font-semibold text-text mb-3">📋 Tasks ({selectedTeam.tasks.length})</div>
          <div className="space-y-3">
            {taskColumns.map(col => {
              const tasks = selectedTeam.tasks.filter(t => t.status === col);
              if (tasks.length === 0) return null;
              return (
                <div key={col}>
                  <div className="text-[9px] text-text-muted mb-1.5">{colLabels[col]} ({tasks.length})</div>
                  {tasks.map(task => (
                    <div key={task.id} className="bg-background border border-border rounded p-2 mb-1.5 hover:border-neon-blue/30 transition-colors">
                      <div className="text-[10px] text-text font-medium">{task.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-text-muted">{getAgent(task.assignee)?.icon} {getAgent(task.assignee)?.name}</span>
                        <span className={`px-1 py-0.5 text-[8px] rounded ml-auto ${
                          task.priority === 'high' ? 'bg-neon-red/20 text-neon-red' :
                          task.priority === 'medium' ? 'bg-neon-yellow/20 text-neon-yellow' :
                          'bg-surface text-text-muted'
                        }`}>{task.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 border-b border-border bg-surface/30">
            <span className="text-xs font-medium text-text">💬 {selectedTeam.name} Chat</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {selectedTeam.messages.map(msg => {
              const agent = getAgent(msg.from);
              return (
                <div key={msg.id} className="flex gap-2">
                  <span className="text-sm mt-0.5">{agent?.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-text">{agent?.name}</span>
                      <span className="text-[9px] text-text-muted">{msg.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-text mt-0.5">{msg.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-2 border-t border-border flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Enviar mensagem para o time..."
              className="flex-1 px-3 py-1.5 text-[11px] bg-background border border-border rounded text-text focus:outline-none focus:border-neon-blue"
            />
            <button className="px-3 py-1.5 text-[10px] bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30">
              📨
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background text-text">
      {/* Tab Bar */}
      <div className="flex border-b border-border bg-surface/30">
        {(['teams', 'agents', 'chat'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-neon-blue border-neon-blue bg-neon-blue/5'
                : 'text-text-muted border-transparent hover:text-text hover:bg-surface/50'
            }`}
          >
            {tab === 'teams' ? '👥 Times' : tab === 'agents' ? '🤖 Agents' : '💬 Chat'}
          </button>
        ))}
      </div>

      {activeTab === 'teams' && renderTeamsList()}
      {activeTab === 'agents' && renderAgentsList()}
      {activeTab === 'chat' && renderChat()}

      {/* Status Bar */}
      <div className="px-3 py-1.5 border-t border-border bg-surface/30 flex items-center gap-4 text-[10px] text-text-muted">
        <span>👥 {teams.length} times</span>
        <span>🤖 {agents.length} agents</span>
        <span>🟢 {agents.filter(a => a.status === 'active').length} ativos</span>
        <span className="ml-auto">Agent Teams v0.5.52</span>
      </div>
    </div>
  );
}
