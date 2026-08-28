'use client';

import { useState } from 'react';
import { Wallet, RefreshCw, TrendingUp, Clock, Loader2, ExternalLink } from 'lucide-react';

export default function BalancePage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    setIsLoading(true);
    // Would call real API
    setTimeout(() => {
      setBalance(0.85);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-lg bg-emerald-400/10 border border-emerald-400/30">
          <Wallet className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Saldo & Uso</h1>
          <p className="text-sm text-text-muted">Monitore seus créditos e histórico de uso</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-8 mb-6 text-center">
        <p className="text-sm text-text-muted mb-2">Saldo Disponível</p>
        <p className="text-5xl font-bold gradient-text mb-1">
          {balance !== null ? `${balance.toFixed(2)}` : '---'}
        </p>
        <p className="text-sm text-text-muted mb-6">Credits (1 Credit = 100₽)</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={fetchBalance}
            disabled={isLoading}
            className="neon-button flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Atualizar Saldo
          </button>
          <a
            href="https://t.me/GPT4_Unlimit_bot?start=api"
            target="_blank"
            rel="noopener noreferrer"
            className="neon-button-blue flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Recarregar
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-text-muted">Total de Requisições</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">---</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-neon-blue" />
            <span className="text-xs text-text-muted">Última Atividade</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">---</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-neon-purple" />
            <span className="text-xs text-text-muted">Gasto Total</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">---</p>
        </div>
      </div>

      {/* Info */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Informações</h2>
        <div className="space-y-2 text-xs text-text-muted">
          <p>• Clique em "Atualizar Saldo" para consultar seu saldo atual via API</p>
          <p>• Configure sua API Key em <span className="text-neon-green font-mono">Configurações</span> para ativar esta funcionalidade</p>
          <p>• 1 Credit = 100₽ — Obtenha créditos pelo <a href="https://t.me/GPT4_Unlimit_bot?start=api" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">Telegram Bot</a></p>
        </div>
      </div>
    </div>
  );
}
