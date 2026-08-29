'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Cpu,
  Zap,
  AlertTriangle,
  Activity,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  GitBranch,
} from 'lucide-react';

interface ModelStats {
  requests: number;
  tokensIn: number;
  tokensOut: number;
}

interface RecentCall {
  ts: number;
  model: string;
  provider: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
}

interface StatsData {
  totalRequests: number;
  totalTokensIn: number;
  totalTokensOut: number;
  byModel: Record<string, ModelStats>;
  byProvider: Record<string, { requests: number }>;
  recentCalls: RecentCall[];
  errors: number;
  auditRuns: number;
  flowRuns: number;
}

function StatCard({ label, value, sub, icon, color }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-2xl bg-[#0b0e18] border border-white/10 flex items-start gap-3`}>
      <div className={`p-2.5 rounded-xl ${color} flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-white font-mono">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-300 font-mono truncate max-w-[140px]">{label}</span>
        <span className="text-xs text-slate-400 font-mono">{value} reqs</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function fmtTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function AgentDashboardApp() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [uptime, setUptime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const data = await res.json() as { stats: StatsData; uptime: number };
      setStats(data.stats);
      setUptime(data.uptime);
      setLastRefresh(new Date());
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchStats]);

  const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
  const totalTokens = (stats?.totalTokensIn ?? 0) + (stats?.totalTokensOut ?? 0);

  const modelEntries = Object.entries(stats?.byModel ?? {}).sort((a, b) => b[1].requests - a[1].requests);
  const providerEntries = Object.entries(stats?.byProvider ?? {}).sort((a, b) => b[1].requests - a[1].requests);
  const maxModelReqs = modelEntries[0]?.[1].requests ?? 1;
  const maxProviderReqs = providerEntries[0]?.[1].requests ?? 1;

  const modelColors = ['bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-yellow-500'];
  const providerColors = ['bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'];

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#07090e] z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-mono">Dashboard de Agentes</h1>
            <p className="text-[10px] text-slate-400">
              Tokens · Modelos · Latência · Sessão atual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">
            Atualizado: {lastRefresh.toLocaleTimeString('pt-BR')}
          </span>
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            {autoRefresh ? 'Live ●' : 'Paused ○'}
          </button>
          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
            title="Atualizar agora"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Carregando métricas...
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Requisições"
              value={stats?.totalRequests ?? 0}
              sub="nesta sessão"
              icon={<Activity className="w-4 h-4" />}
              color="bg-cyan-500/20 text-cyan-400"
            />
            <StatCard
              label="Tokens Totais"
              value={fmtTokens(totalTokens)}
              sub={`↑ ${fmtTokens(stats?.totalTokensIn ?? 0)} ↓ ${fmtTokens(stats?.totalTokensOut ?? 0)}`}
              icon={<Zap className="w-4 h-4" />}
              color="bg-yellow-500/20 text-yellow-400"
            />
            <StatCard
              label="Auditorias LLM"
              value={stats?.auditRuns ?? 0}
              sub="análises de código"
              icon={<CheckCircle className="w-4 h-4" />}
              color="bg-emerald-500/20 text-emerald-400"
            />
            <StatCard
              label="Flows Executados"
              value={stats?.flowRuns ?? 0}
              sub={`${stats?.errors ?? 0} erros`}
              icon={<GitBranch className="w-4 h-4" />}
              color="bg-purple-500/20 text-purple-400"
            />
          </div>

          {/* Uptime */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400 font-mono">Servidor ativo há: <span className="text-white">{uptimeStr}</span></span>
            {(stats?.errors ?? 0) > 0 && (
              <>
                <span className="text-slate-600 mx-2">·</span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-mono">{stats?.errors} erro(s)</span>
              </>
            )}
          </div>

          {/* Models + Providers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Model */}
            <div className="p-5 rounded-2xl bg-[#0b0e18] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white font-mono">Por Modelo</h2>
              </div>
              {modelEntries.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">Nenhuma requisição ainda nesta sessão.</p>
              ) : (
                <div className="space-y-3">
                  {modelEntries.slice(0, 8).map(([model, data], i) => (
                    <Bar
                      key={model}
                      label={model}
                      value={data.requests}
                      max={maxModelReqs}
                      color={modelColors[i % modelColors.length]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* By Provider */}
            <div className="p-5 rounded-2xl bg-[#0b0e18] border border-white/10 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-bold text-white font-mono">Por Provedor</h2>
              </div>
              {providerEntries.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">Nenhum provedor ativo nesta sessão.</p>
              ) : (
                <div className="space-y-3">
                  {providerEntries.slice(0, 8).map(([provider, data], i) => (
                    <Bar
                      key={provider}
                      label={provider}
                      value={data.requests}
                      max={maxProviderReqs}
                      color={providerColors[i % providerColors.length]}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Calls */}
          <div className="p-5 rounded-2xl bg-[#0b0e18] border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white font-mono">Chamadas Recentes</h2>
              <span className="ml-auto text-[10px] text-slate-500 font-mono">últimas 50</span>
            </div>
            {(stats?.recentCalls ?? []).length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">Nenhuma chamada registrada ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono">
                  <thead>
                    <tr className="text-slate-500 border-b border-white/5">
                      <th className="text-left pb-2 pr-4">Hora</th>
                      <th className="text-left pb-2 pr-4">Modelo</th>
                      <th className="text-left pb-2 pr-4">Provedor</th>
                      <th className="text-right pb-2 pr-4">Tokens ↑</th>
                      <th className="text-right pb-2 pr-4">Tokens ↓</th>
                      <th className="text-right pb-2">Latência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentCalls ?? []).slice(0, 20).map((call, i) => (
                      <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="py-1.5 pr-4 text-slate-400">{fmtTime(call.ts)}</td>
                        <td className="py-1.5 pr-4 text-cyan-300 truncate max-w-[120px]">{call.model}</td>
                        <td className="py-1.5 pr-4 text-orange-300">{call.provider}</td>
                        <td className="py-1.5 pr-4 text-right text-slate-300">{fmtTokens(call.tokensIn)}</td>
                        <td className="py-1.5 pr-4 text-right text-slate-300">{fmtTokens(call.tokensOut)}</td>
                        <td className="py-1.5 text-right text-slate-400">
                          {call.latencyMs > 0 ? `${call.latencyMs}ms` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Empty state hint */}
          {(stats?.totalRequests ?? 0) === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <BarChart3 className="w-10 h-10 text-slate-700" />
              <p className="text-sm text-slate-500 font-mono">Nenhuma requisição de IA nesta sessão ainda.</p>
              <p className="text-xs text-slate-600">Abra o Chat IA ou execute um Flow para ver métricas aqui.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}