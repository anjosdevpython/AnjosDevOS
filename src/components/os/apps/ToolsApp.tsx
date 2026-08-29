'use client';

import { useState, useEffect } from 'react';
import {
  Wrench,
  Sparkles,
  Play,
  Copy,
  Check,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Zap,
  BookOpen,
  Code,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SKILL_DEFINITIONS,
  SkillDefinition,
  SkillsExecutor,
  SkillExecutionResult,
} from '@/lib/tools/skills-executor';
import { getAllModels } from '@/lib/ai/providers';

export function ToolsApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gsd' | 'ai-hero'>('all');
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [executing, setExecuting] = useState(false);
  const [currentResult, setCurrentResult] = useState<SkillExecutionResult | null>(null);
  const [history, setHistory] = useState<SkillExecutionResult[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHist = localStorage.getItem('skills_execution_history');
      if (savedHist) {
        try {
          setHistory(JSON.parse(savedHist));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const openSkillModal = (skill: SkillDefinition) => {
    setSelectedSkill(skill);
    setInputPrompt('');
    setCurrentResult(null);
  };

  const handleExecute = async () => {
    if (!selectedSkill || !inputPrompt.trim()) return;

    setExecuting(true);
    setCurrentResult(null);

    const result = await SkillsExecutor.execute(
      selectedSkill.id,
      inputPrompt.trim(),
      selectedModel
    );

    setCurrentResult(result);
    setExecuting(false);

    if (!result.error) {
      const updated = [result, ...history.slice(0, 9)];
      setHistory(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('skills_execution_history', JSON.stringify(updated));
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSkills = SKILL_DEFINITIONS.filter((skill) => {
    const matchesCat = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const chatModels = getAllModels().filter((m) => m.category === 'chat');

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#07090e] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-mono">Skills & AI Engine Hub</h1>
            <p className="text-[10px] text-slate-400 font-mono">
              21 Skills Especializadas • GSD & AI Hero • Execução Real via LLM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-[#0b0e18] p-1 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-3 py-1 rounded-lg transition-colors',
                selectedCategory === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Todas ({SKILL_DEFINITIONS.length})
            </button>
            <button
              onClick={() => setSelectedCategory('gsd')}
              className={cn(
                'px-3 py-1 rounded-lg transition-colors',
                selectedCategory === 'gsd'
                  ? 'bg-orange-500/20 text-orange-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              GSD (8)
            </button>
            <button
              onClick={() => setSelectedCategory('ai-hero')}
              className={cn(
                'px-3 py-1 rounded-lg transition-colors',
                selectedCategory === 'ai-hero'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              AI Hero (13)
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-2.5 border-b border-white/10 bg-[#090d16] flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou descrição da skill..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#05070c] border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono ml-auto">
          {filteredSkills.length} skills disponíveis
        </span>
      </div>

      {/* Main Content Grid & Execution Modal */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-2xl bg-[#0b0e18] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10">
                      {skill.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">
                        {skill.name}
                      </h3>
                      <span className={cn('text-[9px] px-2 py-0.5 rounded-full font-mono border uppercase tracking-wider', skill.badgeColor)}>
                        {skill.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {skill.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => openSkillModal(skill)}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Executar Skill
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Execution History */}
        {history.length > 0 && (
          <div className="p-5 rounded-2xl bg-[#0b0e18] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-white font-mono">Histórico Recente de Execuções</h2>
            </div>
            <div className="space-y-2">
              {history.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#07090e] border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-cyan-400 font-bold truncate">{item.skillName}</span>
                    <span className="text-slate-500 truncate max-w-xs">{item.userInput}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-white/5">{item.model}</span>
                    <button
                      onClick={() => handleCopy(item.output)}
                      className="p-1 rounded hover:bg-white/10 text-slate-300"
                      title="Copiar resultado"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Execution Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0b0f1a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#080b12]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedSkill.icon}</span>
                <div>
                  <h2 className="text-base font-bold text-white font-mono">{selectedSkill.name}</h2>
                  <p className="text-xs text-slate-400 font-mono">{selectedSkill.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 font-mono"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Model Selector */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" /> Modelo de IA Executor
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#05070c] border border-white/10 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                >
                  {chatModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.providerName})
                    </option>
                  ))}
                </select>
              </div>

              {/* User Input Prompt */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-mono">Entrada da Tarefa</label>
                <textarea
                  rows={4}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder={selectedSkill.inputPlaceholder}
                  className="w-full p-3 text-xs bg-[#05070c] border border-white/10 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Execution Result */}
              {currentResult && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Resultado da Skill
                    </span>
                    <button
                      onClick={() => handleCopy(currentResult.output)}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>

                  {currentResult.error ? (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
                      {currentResult.error}
                    </div>
                  ) : (
                    <pre className="p-4 rounded-xl bg-[#05070c] border border-white/10 text-xs text-slate-200 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                      {currentResult.output}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#080b12] flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                {executing ? 'Processando com LLM...' : 'Pronto para executar'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={handleExecute}
                  disabled={executing || !inputPrompt.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs font-mono hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {executing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Executando...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Executar Agora
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}