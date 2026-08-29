'use client';

import { useState } from 'react';
import {
  FREEBUFF_PRODUCTS,
  FREEBUFF_MODELS,
  FREEBUFF_AGENTS,
  getFreebuffSetupInstructions,
  type FreebuffProduct,
  type FreebuffModel,
  type FreebuffAgent,
} from '@/lib/integrations/freebuff';

type TabId = 'produtos' | 'modelos' | 'agentes' | 'terminal';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'produtos', label: 'Produtos', icon: '📦' },
  { id: 'modelos', label: 'Modelos', icon: '🧠' },
  { id: 'agentes', label: 'Agentes', icon: '🤖' },
  { id: 'terminal', label: 'Terminal', icon: '⌨️' },
];

export function FreebuffApp() {
  const [activeTab, setActiveTab] = useState<TabId>('produtos');
  const [selectedProduct, setSelectedProduct] = useState<FreebuffProduct | null>(null);
  const [selectedModel, setSelectedModel] = useState<FreebuffModel | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<FreebuffAgent | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '⚡ Freebuff Terminal v1.0',
    'Digite "help" para ver os comandos disponíveis.\n',
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  const handleTerminalCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newOutput = [...terminalOutput, `> ${trimmed}`];

    switch (trimmed.toLowerCase()) {
      case 'help':
        newOutput.push(
          'Comandos disponíveis:',
          '  help        - Mostra esta ajuda',
          '  products    - Lista produtos Freebuff',
          '  models      - Lista modelos disponíveis',
          '  agents      - Lista agentes disponíveis',
          '  setup       - Instruções de instalação',
          '  status      - Status do Freebuff',
          '  clear       - Limpa o terminal',
          ''
        );
        break;
      case 'products':
        newOutput.push(...FREEBUFF_PRODUCTS.map(p => `  ${p.icon} ${p.name} — ${p.description}`), '');
        break;
      case 'models':
        newOutput.push(...FREEBUFF_MODELS.map(m => `  ${m.icon} ${m.name} (${m.provider}) [${m.access}] — ${m.bestFor}`), '');
        break;
      case 'agents':
        newOutput.push(...FREEBUFF_AGENTS.map(a => `  ${a.icon} ${a.name} — ${a.role}`), '');
        break;
      case 'setup':
        newOutput.push(
          '',
          '📦 Instalação:',
          '  npm install -g freebuff',
          '',
          '🚀 Iniciar:',
          '  cd ~/meu-projeto',
          '  freebuff',
          '',
          '🌐 Produtos:',
          '  Freebuff Desktop — Agentes paralelos locais',
          '  Freebuff CLI — Código do terminal',
          '  Freebuff Web — Apps full-stack',
          '  Freebuff Cloud — Agentes no GitHub',
          '  Freebuff Chat — Pesquisa com IA',
          ''
        );
        break;
      case 'status':
        newOutput.push(
          '',
          '📊 Status do Freebuff:',
          `  Produtos: ${FREEBUFF_PRODUCTS.length} disponíveis`,
          `  Modelos: ${FREEBUFF_MODELS.length} no catálogo`,
          `  Agentes: ${FREEBUFF_AGENTS.length} especializados`,
          '  Framework: Codebuff (open-source)',
          '  Acesso: Gratuito (com anúncios de texto)',
          ''
        );
        break;
      case 'clear':
        setTerminalOutput([]);
        setTerminalInput('');
        return;
      default:
        newOutput.push(`comando não encontrado: ${trimmed}. Digite "help" para ajuda.`);
    }

    newOutput.push('');
    setTerminalOutput(newOutput);
    setTerminalInput('');
  };

  const renderProdutos = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text">📦 Produtos Freebuff</h3>
        <p className="text-[10px] text-text-muted mt-0.5">Cinco produtos gratuitos para codar, construir e pesquisar</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {FREEBUFF_PRODUCTS.map(product => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
            className={`bg-surface/50 border rounded-lg p-4 cursor-pointer transition-all hover:border-neon-blue/30 ${
              selectedProduct?.id === product.id ? 'border-neon-blue/50 bg-neon-blue/5' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{product.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">{product.name}</span>
                  <span className="px-1.5 py-0.5 text-[8px] rounded bg-neon-green/20 text-neon-green">Gratuito</span>
                </div>
                <p className="text-[10px] text-text-muted mt-0.5">{product.description}</p>
              </div>
            </div>

            {selectedProduct?.id === product.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[10px] text-text-muted mb-2 font-semibold">Funcionalidades:</div>
                <div className="flex flex-wrap gap-1">
                  {product.features.map(feature => (
                    <span key={feature} className="px-2 py-0.5 text-[9px] bg-surface border border-border rounded text-text-muted">
                      {feature}
                    </span>
                  ))}
                </div>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-[10px] bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded hover:bg-neon-blue/30"
                >
                  🌐 Acessar {product.name}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderModelos = () => {
    const accessColors = {
      full: 'neon-green',
      limited: 'neon-yellow',
      earned: 'neon-purple',
    };

    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-text">🧠 Catálogo de Modelos</h3>
          <p className="text-[10px] text-text-muted mt-0.5">{FREEBUFF_MODELS.length} modelos incluídos · Sem assinatura ou API key</p>
        </div>

        <div className="space-y-2">
          {FREEBUFF_MODELS.map(model => (
            <div
              key={model.id}
              onClick={() => setSelectedModel(selectedModel?.id === model.id ? null : model)}
              className={`bg-surface/50 border rounded-lg p-3 cursor-pointer transition-all hover:border-neon-blue/30 ${
                selectedModel?.id === model.id ? 'border-neon-blue/50 bg-neon-blue/5' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{model.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text">{model.name}</span>
                    <span className="text-[9px] text-text-muted">({model.provider})</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded bg-${accessColors[model.access]}/20 text-${accessColors[model.access]}`}>
                      {model.access === 'full' ? 'Acesso Total' : model.access === 'limited' ? 'Acesso Limitado' : 'Conquistado'}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">{model.bestFor}</p>
                </div>
              </div>

              {selectedModel?.id === model.id && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex gap-4 text-[9px] text-text-muted">
                    {model.contextWindow && <span>📐 Contexto: {model.contextWindow}</span>}
                    {model.dailyLimit && <span>⏰ Limite: {model.dailyLimit}</span>}
                    <span>🔓 Acesso: {model.access === 'full' ? 'Total' : model.access === 'limited' ? 'Limitado' : 'Conquistado'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-surface/50 border border-border rounded-lg">
          <div className="text-[10px] text-text-muted mb-2">
            💡 <strong className="text-text">Como funciona o acesso:</strong>
          </div>
          <div className="text-[9px] text-text-muted space-y-1">
            <p>• <span className="text-neon-green">Acesso Total:</span> Sem limite diário de sessões</p>
            <p>• <span className="text-neon-yellow">Acesso Limitado:</span> MiMo 2.5 — padrão no modo limitado, sem custo de sessão</p>
            <p>• <span className="text-neon-purple">Conquistado:</span> GLM 5.2 — disponível por sessões conquistadas</p>
            <p>• GLM 5.3 Flash — 2 sessões/dia (raciocínio profundo)</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAgentes = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text">🤖 Agentes Especializados</h3>
        <p className="text-[10px] text-text-muted mt-0.5">{FREEBUFF_AGENTS.length} agentes · Baseados no framework Codebuff</p>
      </div>

      <div className="space-y-3">
        {FREEBUFF_AGENTS.map(agent => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
            className={`bg-surface/50 border rounded-lg p-4 cursor-pointer transition-all hover:border-neon-blue/30 ${
              selectedAgent?.id === agent.id ? 'border-neon-blue/50 bg-neon-blue/5' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{agent.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">{agent.name}</span>
                  <span className="text-[9px] text-text-muted">({agent.role})</span>
                </div>
                <p className="text-[10px] text-text-muted mt-0.5">{agent.description}</p>
              </div>
            </div>

            {selectedAgent?.id === agent.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[10px] text-text-muted mb-2 font-semibold">Capacidades:</div>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map(cap => (
                    <span key={cap} className="px-2 py-0.5 text-[9px] bg-surface border border-border rounded text-text-muted">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-surface/50 border border-border rounded-lg">
        <div className="text-[10px] text-text-muted mb-2">
          🏗️ <strong className="text-text">Arquitetura Freebuff:</strong>
        </div>
        <div className="text-[9px] text-text-muted space-y-1">
          <p>• <span className="text-neon-blue">Contexto:</span> Agentes mapeiam partes relevantes antes de editar</p>
          <p>• <span className="text-neon-green">Implementação:</span> Agentes dividem trabalho e executam comandos</p>
          <p>• <span className="text-neon-purple">Revisão:</span> Agentes verificam qualidade e sugerem melhorias</p>
          <p>• <span className="text-neon-yellow">Pesquisa:</span> Agentes investigam docs e testam em navegador</p>
          <p>• <span className="text-neon-orange">Navegador:</span> Agentes interagem com apps web reais</p>
        </div>
      </div>
    </div>
  );

  const renderTerminal = () => (
    <div className="flex-1 flex flex-col bg-black">
      <div className="px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-[10px] text-white/60 font-mono">⌨️ Freebuff CLI — Terminal Interativo</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-sm">
        {terminalOutput.map((line, i) => (
          <div key={i} className={`${line.startsWith('>') ? 'text-neon-green' : 'text-white/70'}`} style={{ whiteSpace: 'pre-wrap' }}>
            {line}
          </div>
        ))}
        <div className="flex items-center text-neon-green mt-1">
          <span>freebuff&gt; </span>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTerminalCommand(terminalInput);
            }}
            className="flex-1 bg-transparent outline-none text-neon-green caret-neon-green"
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>
      <div className="px-3 py-1.5 border-t border-white/10 bg-white/5 flex items-center gap-4 text-[9px] text-white/40 font-mono">
        <span>npm install -g freebuff</span>
        <span>freebuff</span>
        <span className="ml-auto">Codebuff Framework</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background text-text">
      {/* Tab Bar */}
      <div className="flex border-b border-border bg-surface/30">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
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
        {activeTab === 'produtos' && renderProdutos()}
        {activeTab === 'modelos' && renderModelos()}
        {activeTab === 'agentes' && renderAgentes()}
        {activeTab === 'terminal' && renderTerminal()}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1.5 border-t border-border bg-surface/30 flex items-center gap-4 text-[10px] text-text-muted">
        <span>📦 {FREEBUFF_PRODUCTS.length} produtos</span>
        <span>🧠 {FREEBUFF_MODELS.length} modelos</span>
        <span>🤖 {FREEBUFF_AGENTS.length} agentes</span>
        <span>🆓 Gratuito (com anúncios)</span>
        <span className="ml-auto">Freebuff by Codebuff AI</span>
      </div>
    </div>
  );
}
