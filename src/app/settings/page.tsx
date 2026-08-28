'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Globe,
  Save,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Zap,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROVIDERS, ProviderId, ProviderConfig } from '@/lib/providers';
import {
  loadProviderSettings,
  saveProviderSettings,
  ProviderSettings,
  ProviderKeyConfig,
} from '@/lib/provider-config';

interface ProviderCardProps {
  provider: ProviderConfig;
  config: ProviderKeyConfig;
  onUpdate: (providerId: ProviderId, config: Partial<ProviderKeyConfig>) => void;
}

function ProviderCard({ provider, config, onUpdate }: ProviderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className={cn(
      'glass-card overflow-hidden transition-all duration-200',
      config.isEnabled && 'border-neon-green/30'
    )}>
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-cyber-hover/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-2xl">{provider.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">{provider.name}</h3>
            {config.isEnabled && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-neon-green/10 text-neon-green border border-neon-green/20">
                Ativo
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted">
            {provider.models.length} modelos • {provider.apiFormat.toUpperCase()} format
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(provider.id, { isEnabled: !config.isEnabled });
            }}
            className={cn(
              'relative w-10 h-5 rounded-full transition-colors duration-200',
              config.isEnabled ? 'bg-neon-green/30' : 'bg-cyber-border'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200',
                config.isEnabled
                  ? 'left-5.5 bg-neon-green'
                  : 'left-0.5 bg-text-muted'
              )}
              style={{ left: config.isEnabled ? '22px' : '2px' }}
            />
          </button>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-cyber-border">
          {/* API Key */}
          <div className="mt-4">
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => onUpdate(provider.id, { apiKey: e.target.value })}
                placeholder={provider.apiKeyPlaceholder}
                className="input-cyber font-mono text-sm pr-10"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div className="mt-3">
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              Base URL
            </label>
            <input
              type="url"
              value={config.baseUrl}
              onChange={(e) => onUpdate(provider.id, { baseUrl: e.target.value })}
              placeholder={provider.baseUrl}
              className="input-cyber font-mono text-sm"
            />
          </div>

          {/* Models Preview */}
          <div className="mt-3">
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              Modelos ({provider.models.length})
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {provider.models.slice(0, 12).map((model) => (
                <span
                  key={model.id}
                  className="px-2 py-0.5 text-[10px] rounded bg-cyber-bg border border-cyber-border text-text-muted"
                >
                  {model.name}
                </span>
              ))}
              {provider.models.length > 12 && (
                <span className="px-2 py-0.5 text-[10px] rounded text-text-muted">
                  +{provider.models.length - 12} mais
                </span>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-3 flex items-center gap-3">
            <a
              href={getProviderUrl(provider.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-neon-blue hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Obter API Key
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(provider.baseUrl);
              }}
              className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-secondary"
            >
              <Copy className="w-3 h-3" />
              Copiar URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getProviderUrl(providerId: ProviderId): string {
  const urls: Record<ProviderId, string> = {
    openai: 'https://platform.openai.com/api-keys',
    anthropic: 'https://console.anthropic.com/settings/keys',
    google: 'https://aistudio.google.com/app/apikey',
    deepseek: 'https://platform.deepseek.com/api_keys',
    xai: 'https://console.x.ai/team/default/api-keys',
    mistral: 'https://console.mistral.ai/api-keys',
    groq: 'https://console.groq.com/keys',
    together: 'https://api.together.xyz/settings/api-keys',
    networktools: 'https://t.me/GPT4_Unlimit_bot?start=api',
    custom: '#',
  };
  return urls[providerId] || '#';
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'general'>('providers');

  useEffect(() => {
    setSettings(loadProviderSettings());
  }, []);

  const handleProviderUpdate = (providerId: ProviderId, update: Partial<ProviderKeyConfig>) => {
    if (!settings) return;

    setSettings({
      ...settings,
      providers: {
        ...settings.providers,
        [providerId]: {
          ...settings.providers[providerId],
          ...update,
        },
      },
    });
  };

  const handleSave = () => {
    if (!settings) return;
    saveProviderSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-lg bg-text-muted/10">
          <Settings className="w-5 h-5 text-text-secondary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Configurações</h1>
          <p className="text-sm text-text-muted">Configure seus provedores de IA e preferências</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-cyber-card rounded-lg border border-cyber-border">
        <button
          onClick={() => setActiveTab('providers')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            activeTab === 'providers'
              ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Provedores
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            activeTab === 'general'
              ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Geral
        </button>
      </div>

      {activeTab === 'providers' ? (
        <div className="space-y-4">
          {/* Status Summary */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-cyber-card/50 border border-cyber-border">
            <div className="flex-1">
              <div className="text-xs text-text-muted mb-1">Provedores ativos</div>
              <div className="text-lg font-bold text-text-primary">
                {Object.values(settings.providers).filter((p) => p.isEnabled && p.apiKey).length}
                <span className="text-sm font-normal text-text-muted ml-1">
                  de {Object.keys(PROVIDERS).length}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-text-muted mb-1">Modelos disponíveis</div>
              <div className="text-lg font-bold text-text-primary">
                {Object.entries(settings.providers)
                  .filter(([_, p]) => p.isEnabled && p.apiKey)
                  .reduce((acc, [id]) => {
                    const provider = PROVIDERS[id as ProviderId];
                    return acc + (provider?.models.length || 0);
                  }, 0)}
              </div>
            </div>
          </div>

          {/* Provider Cards */}
          <div className="space-y-3">
            {Object.values(PROVIDERS)
              .filter((p) => p.id !== 'custom')
              .map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  config={settings.providers[provider.id]}
                  onUpdate={handleProviderUpdate}
                />
              ))}
          </div>

          {/* Quick Setup */}
          <div className="p-4 rounded-xl bg-neon-yellow/5 border border-neon-yellow/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-neon-yellow flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-neon-yellow font-medium">Configuração rápida</p>
                <p className="text-xs text-text-muted mt-1">
                  Para usar múltiplos provedores, adicione suas API keys acima. Cada provedor tem seu próprio
                  endpoint e formatação de API. Suas chaves são salvas localmente no navegador.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Default Provider */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-neon-green" />
              <h2 className="text-sm font-semibold text-text-primary">Provedor Padrão</h2>
            </div>
            <select
              value={settings.selectedProvider}
              onChange={(e) => {
                const providerId = e.target.value as ProviderId;
                const provider = PROVIDERS[providerId];
                setSettings({
                  ...settings,
                  selectedProvider: providerId,
                  selectedModel: provider.models[0]?.id || '',
                });
              }}
              className="select-cyber"
            >
              {Object.values(PROVIDERS)
                .filter((p) => settings.providers[p.id]?.isEnabled && settings.providers[p.id]?.apiKey)
                .map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.icon} {provider.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Default Model */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-neon-blue" />
              <h2 className="text-sm font-semibold text-text-primary">Modelo Padrão</h2>
            </div>
            <select
              value={settings.selectedModel}
              onChange={(e) => setSettings({ ...settings, selectedModel: e.target.value })}
              className="select-cyber"
            >
              {PROVIDERS[settings.selectedProvider]?.models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-neon-purple" />
              <h2 className="text-sm font-semibold text-text-primary">Temperatura Padrão</h2>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                className="flex-1 accent-neon-green"
              />
              <span className="text-sm font-mono text-text-primary w-8">{settings.temperature}</span>
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              Temperatura mais baixa = respostas mais determinísticas. Mais alta = mais criativa.
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8">
        <button
          onClick={handleSave}
          className={cn(
            'neon-button w-full flex items-center justify-center gap-2 py-3',
            saved && 'bg-neon-green/20 border-neon-green/50'
          )}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Salvo com sucesso!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  );
}
