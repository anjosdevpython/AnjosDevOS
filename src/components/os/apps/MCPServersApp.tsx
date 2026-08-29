'use client';

import { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Globe,
  GitBranch,
  Code,
  TestTube,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plug,
  ExternalLink,
  Power,
  Activity,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOS } from '../OSContext';

interface MCPServerDef {
  id: string;
  name: string;
  description: string;
  iconName: 'Server' | 'GitBranch' | 'Globe' | 'Database' | 'TestTube' | 'Code';
  defaultEndpoint: string;
  capabilities: string[];
  color: string;
}

const MCP_SERVERS: MCPServerDef[] = [
  {
    id: 'filesystem',
    name: 'Filesystem MCP',
    description: 'Acesso a arquivos e diretórios locais do workspace e sistema',
    iconName: 'Server',
    defaultEndpoint: 'mcp://localhost:3100',
    capabilities: ['read_file', 'write_file', 'list_dir', 'file_tree', 'watch'],
    color: '#06b6d4',
  },
  {
    id: 'git',
    name: 'Git MCP',
    description: 'Versionamento avançado: commit, branch, diff, push e merge',
    iconName: 'GitBranch',
    defaultEndpoint: 'mcp://localhost:3101',
    capabilities: ['git_status', 'git_commit', 'git_diff', 'git_log', 'git_push'],
    color: '#f97316',
  },
  {
    id: 'browser',
    name: 'Browser MCP',
    description: 'Automação web completa: navegação, cliques, digitação e scraping',
    iconName: 'Globe',
    defaultEndpoint: 'mcp://localhost:3102',
    capabilities: ['navigate', 'click', 'type', 'screenshot', 'extract_dom'],
    color: '#3b82f6',
  },
  {
    id: 'database',
    name: 'Database MCP',
    description: 'Consultas SQL, schema inspection e persistência em bancos',
    iconName: 'Database',
    defaultEndpoint: 'mcp://localhost:3103',
    capabilities: ['sql_query', 'get_schema', 'run_migration', 'table_stats'],
    color: '#a855f7',
  },
  {
    id: 'api-tester',
    name: 'API Tester MCP',
    description: 'Testes de endpoints REST e GraphQL com validação de payload',
    iconName: 'TestTube',
    defaultEndpoint: 'mcp://localhost:3104',
    capabilities: ['http_request', 'validate_schema', 'mock_response', 'load_test'],
    color: '#10b981',
  },
  {
    id: 'code-search',
    name: 'Code Search MCP',
    description: 'Busca semântica em código, AST parsing e análise de referências',
    iconName: 'Code',
    defaultEndpoint: 'mcp://localhost:3105',
    capabilities: ['semantic_search', 'find_references', 'ast_grep', 'explain_symbol'],
    color: '#ec4899',
  },
];

interface ServerState {
  enabled: boolean;
  endpoint: string;
  status: 'online' | 'offline' | 'checking';
  latencyMs?: number;
  lastChecked?: string;
}

export function MCPServersApp() {
  const { openApp } = useOS();
  const [serversState, setServersState] = useState<Record<string, ServerState>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'enabled' | 'offline'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mcp_servers_config');
      if (saved) {
        try {
          setServersState(JSON.parse(saved));
          return;
        } catch {
          // fallback
        }
      }
      // default state
      const initial: Record<string, ServerState> = {};
      MCP_SERVERS.forEach((s) => {
        initial[s.id] = {
          enabled: true,
          endpoint: s.defaultEndpoint,
          status: 'online',
          latencyMs: Math.floor(Math.random() * 30) + 12,
          lastChecked: new Date().toLocaleTimeString('pt-BR'),
        };
      });
      setServersState(initial);
      localStorage.setItem('mcp_servers_config', JSON.stringify(initial));
    }
  }, []);

  const saveState = (updated: Record<string, ServerState>) => {
    setServersState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mcp_servers_config', JSON.stringify(updated));
    }
  };

  const toggleServer = (id: string) => {
    const current = serversState[id] || { enabled: false, endpoint: '', status: 'offline' as const };
    const nextEnabled = !current.enabled;
    const nextStatus: 'online' | 'offline' = nextEnabled ? 'online' : 'offline';
    const updated: Record<string, ServerState> = {
      ...serversState,
      [id]: {
        ...current,
        enabled: nextEnabled,
        status: nextStatus,
        lastChecked: new Date().toLocaleTimeString('pt-BR'),
      },
    };
    saveState(updated);
  };

  const updateEndpoint = (id: string, endpoint: string) => {
    const current = serversState[id] || { enabled: true, endpoint, status: 'online' as const };
    const updated: Record<string, ServerState> = {
      ...serversState,
      [id]: { ...current, endpoint },
    };
    saveState(updated);
  };

  const testConnection = (id: string) => {
    const current = serversState[id];
    if (!current) return;

    setServersState((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: 'checking' },
    }));

    setTimeout(() => {
      const isOnline = current.enabled;
      const finalStatus: 'online' | 'offline' = isOnline ? 'online' : 'offline';
      const updated: Record<string, ServerState> = {
        ...serversState,
        [id]: {
          ...current,
          status: finalStatus,
          latencyMs: isOnline ? Math.floor(Math.random() * 25) + 10 : undefined,
          lastChecked: new Date().toLocaleTimeString('pt-BR'),
        },
      };
      saveState(updated);
    }, 600);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Server':
        return <Server className="w-5 h-5" />;
      case 'GitBranch':
        return <GitBranch className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'TestTube':
        return <TestTube className="w-5 h-5" />;
      case 'Code':
        return <Code className="w-5 h-5" />;
      default:
        return <Plug className="w-5 h-5" />;
    }
  };

  const onlineCount = Object.values(serversState).filter((s) => s.enabled && s.status === 'online').length;

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#07090e] z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <Plug className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-mono">Gerenciador de Servidores MCP</h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Model Context Protocol • 6 Servidores Nativos • Interconexão de Agentes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Activity className="w-3.5 h-3.5" />
            <span>{onlineCount}/6 Conectados</span>
          </div>
          <button
            onClick={() => {
              MCP_SERVERS.forEach((s) => testConnection(s.id));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Testar Todos
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MCP_SERVERS.map((server) => {
            const state = serversState[server.id] || {
              enabled: true,
              endpoint: server.defaultEndpoint,
              status: 'online',
              latencyMs: 15,
            };

            const isOnline = state.enabled && state.status === 'online';
            const isChecking = state.status === 'checking';

            return (
              <div
                key={server.id}
                className={cn(
                  'p-5 rounded-2xl border transition-all flex flex-col justify-between',
                  state.enabled
                    ? 'bg-[#0b0e18] border-white/10 shadow-lg'
                    : 'bg-[#080a10] border-white/5 opacity-60'
                )}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${server.color}20`,
                          color: server.color,
                          border: `1px solid ${server.color}40`,
                        }}
                      >
                        {renderIcon(server.iconName)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white font-mono">{server.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isChecking ? (
                            <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-mono">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Verificando...
                            </span>
                          ) : isOnline ? (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                              <CheckCircle className="w-3 h-3" /> Online ({state.latencyMs ?? 15}ms)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                              <XCircle className="w-3 h-3" /> Desativado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleServer(server.id)}
                      className={cn(
                        'p-2 rounded-xl border transition-colors',
                        state.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10'
                      )}
                      title={state.enabled ? 'Desativar Servidor' : 'Ativar Servidor'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 mb-4">{server.description}</p>

                  {/* Endpoint Input */}
                  <div className="space-y-1 mb-4">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                      Endpoint MCP
                    </label>
                    <input
                      type="text"
                      value={state.endpoint}
                      onChange={(e) => updateEndpoint(server.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#05070c] border border-white/10 rounded-xl text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Capabilities Tags */}
                  <div className="mb-4">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">
                      Ferramentas & Ações
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {server.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 text-[9px] rounded-lg bg-white/5 text-slate-300 border border-white/10 font-mono"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {state.lastChecked ? `Checado: ${state.lastChecked}` : 'Pronto'}
                  </span>
                  <button
                    onClick={() => testConnection(server.id)}
                    disabled={isChecking}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={cn('w-3 h-3', isChecking && 'animate-spin')} />
                    Ping
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}