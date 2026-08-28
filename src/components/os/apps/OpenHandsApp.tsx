'use client';

import { useState } from 'react';
import {
  Search,
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Terminal,
  Brain,
  Zap,
  Server,
  Bot,
  Clock,
  Workflow,
  Settings,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Globe,
  Cpu,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AGENT_SERVERS,
  OPENHANDS_AGENTS,
  AUTOMATIONS,
  AgentServer,
  OpenHandsAgent,
  Automation,
  AgentBackend,
  BACKEND_LABELS,
  BACKEND_COLORS,
} from '@/lib/integrations/openhands';

type TabId = 'canvas' | 'agents' | 'automations' | 'settings';

export function OpenHandsApp() {
  const [activeTab, setActiveTab] = useState<TabId>('canvas');
  const [servers, setServers] = useState(AGENT_SERVERS);
  const [agents, setAgents] = useState(OPENHANDS_AGENTS);
  const [automations, setAutomations] = useState(AUTOMATIONS);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [expandedAutomation, setExpandedAutomation] = useState<string | null>(null);

  // Connect to server
  const connectServer = (serverId: string) => {
    setServers((prev) =>
      prev.map((s) =>
        s.id === serverId ? { ...s, status: 'connected' } : s
      )
    );
  };

  // Disconnect from server
  const disconnectServer = (serverId: string) => {
    setServers((prev) =>
      prev.map((s) =>
        s.id === serverId ? { ...s, status: 'disconnected' } : s
      )
    );
  };

  // Toggle agent status
  const toggleAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, status: a.status === 'running' ? 'paused' : 'running', lastActive: new Date() }
          : a
      )
    );
  };

  // Stop agent
  const stopAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: 'idle' } : a))
    );
  };

  // Toggle automation
  const toggleAutomation = (automationId: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === automationId
          ? { ...a, status: a.status === 'active' ? 'paused' : 'active' }
          : a
      )
    );
  };

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-text-primary">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-border bg-cyber-card/50">
        <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 border border-[#f97316]/30 flex items-center justify-center">
          <span className="text-lg">🙌</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-text-primary">OpenHands</h1>
          <p className="text-[10px] text-text-muted font-mono">AI-Driven Development</p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/20">
            {servers.filter((s) => s.status === 'connected').length} connected
          </span>
          <span className="px-2 py-0.5 rounded bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20">
            {agents.filter((a) => a.status === 'running').length} running
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border">
        {[
          { id: 'canvas' as TabId, label: 'Agent Canvas', icon: Cpu },
          { id: 'agents' as TabId, label: 'Agents', icon: Bot },
          { id: 'automations' as TabId, label: 'Automations', icon: Workflow },
          { id: 'settings' as TabId, label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2',
              activeTab === tab.id
                ? 'text-[#f97316] border-[#f97316] bg-[#f97316]/5'
                : 'text-text-muted border-transparent hover:text-text-secondary hover:bg-cyber-hover'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'canvas' && (
          <div className="h-full overflow-y-auto p-4">
            {/* Servers Grid */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-text-primary mb-3">Agent Servers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {servers.map((server) => (
                  <div
                    key={server.id}
                    className={cn(
                      'glass-card p-4 cursor-pointer transition-all',
                      selectedServer === server.id && 'border-[#f97316]/50'
                    )}
                    onClick={() => setSelectedServer(server.id)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${BACKEND_COLORS[server.backend]}15`,
                          borderColor: `${BACKEND_COLORS[server.backend]}30`,
                          borderWidth: 1,
                        }}
                      >
                        <Server
                          className="w-5 h-5"
                          style={{ color: BACKEND_COLORS[server.backend] }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-text-primary">
                          {server.name}
                        </h3>
                        <p className="text-[10px] text-text-muted">{BACKEND_LABELS[server.backend]}</p>
                      </div>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-[9px] rounded-full font-medium',
                          server.status === 'connected'
                            ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                            : 'bg-cyber-bg text-text-muted border border-cyber-border'
                        )}
                      >
                        {server.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-text-muted mb-3">
                      {server.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-text-muted">
                        {server.agents.length} agents
                      </span>
                      <div className="flex-1" />
                      {server.status === 'connected' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            disconnectServer(server.id);
                          }}
                          className="px-2 py-1 text-[10px] text-neon-red bg-neon-red/10 border border-neon-red/30 rounded hover:bg-neon-red/20 transition-colors"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            connectServer(server.id);
                          }}
                          className="px-2 py-1 text-[10px] text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/30 rounded hover:bg-[#f97316]/20 transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Agents */}
            <div>
              <h2 className="text-sm font-bold text-text-primary mb-3">Active Agents</h2>
              <div className="space-y-2">
                {agents
                  .filter((a) => a.status === 'running')
                  .map((agent) => (
                    <div
                      key={agent.id}
                      className="glass-card p-3 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-neon-green" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-semibold text-text-primary">
                          {agent.name}
                        </h3>
                        <p className="text-[10px] text-text-muted">
                          {agent.model} • {agent.capabilities.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <div className="typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  ))}

                {agents.filter((a) => a.status === 'running').length === 0 && (
                  <div className="text-center py-8 text-text-muted">
                    <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Nenhum agent rodando</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-text-primary">Agents</h2>
              <div className="flex-1" />
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/30 rounded-lg hover:bg-[#f97316]/20 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Novo Agent
              </button>
            </div>

            <div className="space-y-3">
              {agents.map((agent) => {
                const server = servers.find((s) => s.id === agent.serverId);
                return (
                  <div
                    key={agent.id}
                    className={cn(
                      'glass-card p-4 transition-all',
                      selectedAgent === agent.id && 'border-[#f97316]/50'
                    )}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          agent.status === 'running'
                            ? 'bg-neon-green/10 border border-neon-green/30'
                            : 'bg-cyber-bg border border-cyber-border'
                        )}
                      >
                        <Brain
                          className={cn(
                            'w-5 h-5',
                            agent.status === 'running' ? 'text-neon-green' : 'text-text-muted'
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-semibold text-text-primary">
                            {agent.name}
                          </h3>
                          <span
                            className={cn(
                              'px-1.5 py-0.5 text-[9px] rounded-full font-medium',
                              agent.status === 'running'
                                ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                                : agent.status === 'paused'
                                ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20'
                                : 'bg-cyber-bg text-text-muted border border-cyber-border'
                            )}
                          >
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted">
                          {agent.model} • {server?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAgent(agent.id);
                          }}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            agent.status === 'running'
                              ? 'text-neon-yellow hover:bg-neon-yellow/10'
                              : 'text-neon-green hover:bg-neon-green/10'
                          )}
                        >
                          {agent.status === 'running' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            stopAgent(agent.id);
                          }}
                          className="p-1.5 rounded text-text-muted hover:text-neon-red hover:bg-neon-red/10 transition-colors"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-1.5 py-0.5 text-[9px] rounded bg-cyber-bg text-text-muted border border-cyber-border"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'automations' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-text-primary">Automations</h2>
              <div className="flex-1" />
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/30 rounded-lg hover:bg-[#f97316]/20 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Nova Automação
              </button>
            </div>

            <div className="space-y-3">
              {automations.map((automation) => (
                <div key={automation.id} className="glass-card overflow-hidden">
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-cyber-hover/50 transition-colors"
                    onClick={() =>
                      setExpandedAutomation(
                        expandedAutomation === automation.id ? null : automation.id
                      )
                    }
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        automation.status === 'active'
                          ? 'bg-neon-green/10 border border-neon-green/30'
                          : 'bg-cyber-bg border border-cyber-border'
                      )}
                    >
                      <Workflow
                        className={cn(
                          'w-4 h-4',
                          automation.status === 'active' ? 'text-neon-green' : 'text-text-muted'
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-text-primary">
                          {automation.name}
                        </h3>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[9px] rounded-full font-medium',
                            automation.status === 'active'
                              ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                              : automation.status === 'paused'
                              ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20'
                              : 'bg-cyber-bg text-text-muted border border-cyber-border'
                          )}
                        >
                          {automation.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        {automation.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAutomation(automation.id);
                      }}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        automation.status === 'active'
                          ? 'text-neon-yellow hover:bg-neon-yellow/10'
                          : 'text-neon-green hover:bg-neon-green/10'
                      )}
                    >
                      {automation.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    {expandedAutomation === automation.id ? (
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    )}
                  </div>

                  {/* Automation Details */}
                  {expandedAutomation === automation.id && (
                    <div className="border-t border-cyber-border p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-text-muted mb-1">Trigger</p>
                          <span className="px-2 py-1 text-[10px] rounded bg-cyber-bg border border-cyber-border text-text-secondary">
                            {automation.trigger.type}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted mb-1">Actions</p>
                          <div className="flex flex-wrap gap-1">
                            {automation.actions.map((action, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-[10px] rounded bg-cyber-bg border border-cyber-border text-text-secondary"
                              >
                                {action.type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto p-4">
            <h2 className="text-sm font-bold text-text-primary mb-4">Settings</h2>
            
            <div className="space-y-4">
              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-text-primary mb-2">Default Model</h3>
                <select className="w-full text-xs bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-text-primary">
                  <option>gpt-4o</option>
                  <option>claude-sonnet-4-20250514</option>
                  <option>gemini-2.5-pro</option>
                  <option>deepseek-chat</option>
                </select>
              </div>

              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-text-primary mb-2">Sandbox Image</h3>
                <input
                  type="text"
                  defaultValue="ghcr.io/openhands/app:latest"
                  className="w-full text-xs font-mono bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-text-primary"
                />
              </div>

              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-text-primary mb-2">Max Tokens</h3>
                <input
                  type="number"
                  defaultValue={4096}
                  className="w-full text-xs bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-text-primary"
                />
              </div>

              <div className="glass-card p-4">
                <h3 className="text-xs font-semibold text-text-primary mb-2">Temperature</h3>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue={0.7}
                  className="w-full accent-[#f97316]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
