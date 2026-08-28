'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  Zap,
  Target,
  Terminal,
  Brain,
  Send,
  Copy,
  Check,
  AlertCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  Wrench,
  GitBranch,
  Database,
  Globe,
  FileCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SKILLS,
  MCP_SERVERS,
  Skill,
  SkillCategory,
  SkillExecution,
  MCPServer,
  MCPTool,
  getSkillsByCategory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/lib/tools/tools';
import { PROVIDERS, ProviderId } from '@/lib/ai/providers';
import { loadProviderSettings, getAvailableModels } from '@/lib/ai/provider-config';
import { chatCompletionStream } from '@/lib/ai/api-client';

type TabId = 'skills' | 'gsd' | 'mcp' | 'executions';

interface ExecutionLog {
  id: string;
  skillName: string;
  status: 'running' | 'completed' | 'error';
  input: string;
  output?: string;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

export function ToolsApp() {
  const [activeTab, setActiveTab] = useState<TabId>('skills');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);
  const [expandedServer, setExpandedServer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const outputRef = useRef<HTMLDivElement>(null);

  // Load available models from enabled providers
  const availableModels = getAvailableModels();
  const chatModels = availableModels.filter((m) => m.category === 'chat');

  // Filter skills
  const filteredSkills = SKILLS.filter((skill) => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // GSD Workflow steps
  const gsdSteps = [
    { id: 'plan', name: 'Plan', icon: '📝', color: '#3b82f6', skill: 'gsd-plan' },
    { id: 'execute', name: 'Execute', icon: '🚀', color: '#22c55e', skill: 'gsd-execute' },
    { id: 'verify', name: 'Verify', icon: '✅', color: '#10b981', skill: 'gsd-verify' },
  ];
  const [gsdStep, setGsdStep] = useState(0);
  const [gsdInput, setGsdInput] = useState('');
  const [gsdOutput, setGsdOutput] = useState('');

  const executeSkill = async (skill: Skill, input: string) => {
    if (!input.trim()) return;

    const settings = loadProviderSettings();
    const enabledProviders = Object.entries(settings.providers).filter(
      ([_, p]) => p.isEnabled && p.apiKey
    );

    if (enabledProviders.length === 0) {
      const execution: ExecutionLog = {
        id: crypto.randomUUID(),
        skillName: skill.name,
        status: 'error',
        input,
        error: 'Nenhum provedor de IA configurado. Vá em Configurações para adicionar.',
        startTime: new Date(),
        endTime: new Date(),
      };
      setExecutions((prev) => [execution, ...prev]);
      return;
    }

    const execution: ExecutionLog = {
      id: crypto.randomUUID(),
      skillName: skill.name,
      status: 'running',
      input,
      startTime: new Date(),
    };

    setExecutions((prev) => [execution, ...prev]);
    setIsExecuting(true);

    try {
      const systemPrompt = `Você é um assistente de IA executando a skill "${skill.name}".

Descrição: ${skill.description}

Execute a tarefa conforme as instruções abaixo. Seja detalhado e prático.
Forneça o resultado em formato markdown bem estruturado.

Categoria: ${skill.category}
Tags: ${skill.tags.join(', ')}`;

      const stream = await chatCompletionStream({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input },
        ],
        temperature: 0.7,
        provider: selectedProvider,
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                // Update execution output in real-time
                setExecutions((prev) =>
                  prev.map((e) =>
                    e.id === execution.id ? { ...e, output: fullContent } : e
                  )
                );
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Mark as completed
      setExecutions((prev) =>
        prev.map((e) =>
          e.id === execution.id
            ? { ...e, status: 'completed', output: fullContent, endTime: new Date() }
            : e
        )
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setExecutions((prev) =>
        prev.map((e) =>
          e.id === execution.id
            ? { ...e, status: 'error', error: errorMsg, endTime: new Date() }
            : e
        )
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const executeGSDStep = async () => {
    const skill = SKILLS.find((s) => s.id === gsdSteps[gsdStep].skill);
    if (!skill || !gsdInput.trim()) return;

    await executeSkill(skill, gsdInput);
    const lastExecution = executions[0];

    // Wait a bit for state to update
    await new Promise((r) => setTimeout(r, 100));

    if (gsdStep < gsdSteps.length - 1) {
      setGsdStep(gsdStep + 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-text-primary">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-border bg-cyber-card/50">
        <Wrench className="w-5 h-5 text-neon-green" />
        <h1 className="text-sm font-bold gradient-text">AI Tools & Skills</h1>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="px-2 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/20">
            {SKILLS.length} skills
          </span>
          <span className="px-2 py-0.5 rounded bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
            {MCP_SERVERS.filter((s) => s.status === 'connected').length} MCP servers
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border">
        {[
          { id: 'skills' as TabId, label: 'Skills', icon: Zap },
          { id: 'gsd' as TabId, label: 'GSD Workflow', icon: Target },
          { id: 'mcp' as TabId, label: 'MCP Tools', icon: Terminal },
          { id: 'executions' as TabId, label: 'Histórico', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2',
              activeTab === tab.id
                ? 'text-neon-green border-neon-green bg-neon-green/5'
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
        {activeTab === 'skills' && (
          <div className="flex h-full">
            {/* Skills Sidebar */}
            <div className="w-64 border-r border-cyber-border overflow-y-auto">
              {/* Search */}
              <div className="p-3 border-b border-cyber-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar skills..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-cyber-bg border border-cyber-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-green/50"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="p-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs rounded-lg mb-1 transition-colors',
                    selectedCategory === 'all'
                      ? 'bg-neon-green/10 text-neon-green'
                      : 'text-text-muted hover:bg-cyber-hover'
                  )}
                >
                  Todas ({SKILLS.length})
                </button>
                {Object.entries(CATEGORY_LABELS)
                  .filter(([key]) => key !== 'mcp')
                  .map(([key, label]) => {
                    const count = getSkillsByCategory(key as SkillCategory).length;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key as SkillCategory)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-xs rounded-lg mb-1 transition-colors',
                          selectedCategory === key
                            ? 'bg-neon-green/10 text-neon-green'
                            : 'text-text-muted hover:bg-cyber-hover'
                        )}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
              </div>

              {/* Skills List */}
              <div className="p-2 space-y-1">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => {
                      setSelectedSkill(skill);
                      setSkillInput('');
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg transition-colors',
                      selectedSkill?.id === skill.id
                        ? 'bg-neon-green/10 border border-neon-green/30'
                        : 'hover:bg-cyber-hover border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{skill.icon}</span>
                      <span className="text-xs font-medium text-text-primary truncate">
                        {skill.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                      {skill.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Detail */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedSkill ? (
                <>
                  {/* Skill Header */}
                  <div className="p-4 border-b border-cyber-border">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{selectedSkill.icon}</span>
                      <div>
                        <h2 className="text-sm font-bold text-text-primary">
                          {selectedSkill.name}
                        </h2>
                        <p className="text-xs text-text-muted">{selectedSkill.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span
                        className="px-2 py-0.5 text-[10px] rounded-full font-medium"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[selectedSkill.category]}20`,
                          color: CATEGORY_COLORS[selectedSkill.category],
                          border: `1px solid ${CATEGORY_COLORS[selectedSkill.category]}30`,
                        }}
                      >
                        {CATEGORY_LABELS[selectedSkill.category]}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyber-bg text-text-muted border border-cyber-border font-mono">
                        {selectedSkill.command}
                      </span>
                      {selectedSkill.model && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                          {selectedSkill.model}
                        </span>
                      )}
                    </div>
                    {selectedSkill.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedSkill.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-[9px] rounded bg-cyber-bg text-text-muted border border-cyber-border"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <label className="text-xs font-medium text-text-secondary mb-2 block">
                      Entrada
                    </label>
                    <textarea
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder={
                        selectedSkill.inputs?.[0]?.placeholder || 'Descreva o que deseja...'
                      }
                      className="w-full h-32 p-3 text-xs bg-cyber-bg border border-cyber-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 resize-none"
                    />

                    {/* Model Selection */}
                    <div className="flex items-center gap-3 mt-3">
                      <select
                        value={selectedProvider}
                        onChange={(e) => {
                          const providerId = e.target.value as ProviderId;
                          setSelectedProvider(providerId);
                          const firstModel = chatModels.find((m) => m.providerId === providerId);
                          if (firstModel) setSelectedModel(firstModel.id);
                        }}
                        className="text-xs bg-cyber-bg border border-cyber-border rounded-lg px-2 py-1.5 text-text-primary"
                      >
                        {[...new Set(chatModels.map((m) => m.providerId))].map((providerId) => (
                          <option key={providerId} value={providerId}>
                            {PROVIDERS[providerId as ProviderId]?.icon}{' '}
                            {PROVIDERS[providerId as ProviderId]?.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="text-xs bg-cyber-bg border border-cyber-border rounded-lg px-2 py-1.5 text-text-primary flex-1"
                      >
                        {chatModels
                          .filter((m) => m.providerId === selectedProvider)
                          .map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <button
                      onClick={() => executeSkill(selectedSkill, skillInput)}
                      disabled={!skillInput.trim() || isExecuting}
                      className={cn(
                        'mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all',
                        skillInput.trim() && !isExecuting
                          ? 'bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20'
                          : 'bg-cyber-bg text-text-muted border border-cyber-border cursor-not-allowed'
                      )}
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Executando...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Executar Skill
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted">
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Selecione uma skill para executar</p>
                    <p className="text-xs mt-1">
                      Escolha uma skill na barra lateral para começar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'gsd' && (
          <div className="h-full flex flex-col p-6">
            {/* GSD Header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold gradient-text mb-2">GSD Workflow</h2>
              <p className="text-xs text-text-muted">
                Get Stuff Done — Planeje, Execute e Verifique com IA
              </p>
            </div>

            {/* Steps */}
            <div className="flex items-center gap-2 mb-6">
              {gsdSteps.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setGsdStep(idx)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                      idx === gsdStep
                        ? 'border-2 shadow-lg'
                        : idx < gsdStep
                        ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                        : 'bg-cyber-bg text-text-muted border border-cyber-border'
                    )}
                    style={
                      idx === gsdStep
                        ? { borderColor: step.color, color: step.color, backgroundColor: `${step.color}10` }
                        : {}
                    }
                  >
                    <span>{step.icon}</span>
                    <span>{step.name}</span>
                    {idx < gsdStep && <CheckCircle className="w-3 h-3" />}
                  </button>
                  {idx < gsdSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-text-muted mx-1" />
                  )}
                </div>
              ))}
            </div>

            {/* Current Step Content */}
            <div className="flex-1 flex gap-6 overflow-hidden">
              {/* Input */}
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium text-text-secondary mb-2">
                  {gsdSteps[gsdStep].icon} {gsdSteps[gsdStep].name} — Input
                </label>
                <textarea
                  value={gsdInput}
                  onChange={(e) => setGsdInput(e.target.value)}
                  placeholder={
                    gsdStep === 0
                      ? 'Descreva o que você quer construir...'
                      : gsdStep === 1
                      ? 'Cole a spec gerada na fase anterior...'
                      : 'Liste os critérios de aceitação...'
                  }
                  className="flex-1 p-3 text-xs bg-cyber-bg border border-cyber-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 resize-none"
                />
                <button
                  onClick={executeGSDStep}
                  disabled={!gsdInput.trim() || isExecuting}
                  className={cn(
                    'mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all',
                    gsdInput.trim() && !isExecuting
                      ? 'text-white border-2'
                      : 'bg-cyber-bg text-text-muted border border-cyber-border cursor-not-allowed'
                  )}
                  style={
                    gsdInput.trim() && !isExecuting
                      ? { backgroundColor: gsdSteps[gsdStep].color, borderColor: gsdSteps[gsdStep].color }
                      : {}
                  }
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Executar {gsdSteps[gsdStep].name}
                    </>
                  )}
                </button>
              </div>

              {/* Output */}
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium text-text-secondary mb-2">
                  📄 Output
                </label>
                <div
                  ref={outputRef}
                  className="flex-1 p-3 text-xs bg-cyber-bg border border-cyber-border rounded-lg overflow-y-auto prose-cyber whitespace-pre-wrap"
                >
                  {executions.length > 0 ? (
                    executions[0].output || executions[0].error || (
                      <div className="typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                    )
                  ) : (
                    <span className="text-text-muted">A saída aparecerá aqui...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mcp' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-text-primary mb-1">MCP Servers</h2>
              <p className="text-xs text-text-muted">
                Model Context Protocol — Integrações com ferramentas externas
              </p>
            </div>

            <div className="space-y-3">
              {MCP_SERVERS.map((server) => (
                <div
                  key={server.id}
                  className="glass-card overflow-hidden"
                >
                  {/* Server Header */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-cyber-hover/50 transition-colors"
                    onClick={() =>
                      setExpandedServer(expandedServer === server.id ? null : server.id)
                    }
                  >
                    <span className="text-xl">{server.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-text-primary">
                          {server.name}
                        </h3>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[9px] rounded-full font-medium',
                            server.status === 'connected'
                              ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                              : 'bg-cyber-bg text-text-muted border border-cyber-border'
                          )}
                        >
                          {server.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted">{server.description}</p>
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {server.tools.filter((t) => t.isEnabled).length}/{server.tools.length} tools
                    </span>
                    {expandedServer === server.id ? (
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    )}
                  </div>

                  {/* Tools List */}
                  {expandedServer === server.id && (
                    <div className="border-t border-cyber-border p-3 space-y-2">
                      {server.tools.map((tool) => (
                        <div
                          key={tool.id}
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-lg',
                            tool.isEnabled
                              ? 'bg-cyber-bg/50'
                              : 'bg-cyber-bg/20 opacity-50'
                          )}
                        >
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              tool.isEnabled ? 'bg-neon-green' : 'bg-text-muted'
                            )}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-text-primary">
                              {tool.name}
                            </p>
                            <p className="text-[10px] text-text-muted">{tool.description}</p>
                          </div>
                          <span className="text-[9px] font-mono text-text-muted px-1.5 py-0.5 rounded bg-cyber-bg border border-cyber-border">
                            {tool.id}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'executions' && (
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-text-primary mb-1">Histórico de Execuções</h2>
              <p className="text-xs text-text-muted">
                {executions.length} execuções realizadas
              </p>
            </div>

            {executions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                <Clock className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Nenhuma execução ainda</p>
                <p className="text-xs mt-1">Execute uma skill para ver o histórico aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {executions.map((exec) => (
                  <div key={exec.id} className="glass-card p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {exec.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                      ) : exec.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-neon-red" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-neon-yellow animate-spin" />
                      )}
                      <span className="text-xs font-semibold text-text-primary">
                        {exec.skillName}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {exec.startTime.toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mb-2 line-clamp-2">
                      Input: {exec.input}
                    </p>
                    {exec.output && (
                      <div className="p-2 text-[11px] bg-cyber-bg rounded border border-cyber-border max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {exec.output}
                      </div>
                    )}
                    {exec.error && (
                      <div className="p-2 text-[11px] bg-neon-red/5 text-neon-red rounded border border-neon-red/20">
                        {exec.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
