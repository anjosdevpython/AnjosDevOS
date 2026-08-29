/**
 * Hermes Agent
 * Agente de raciocínio profundo, planejamento e tomada de decisão
 * Chain-of-thought avançado com árvore de pensamentos
 */

import type { HermesThought, HermesReasoningChain, HermesDecision } from './types';
import { getOrchestrator } from './orchestrator';

class HermesAgent {
  private chains: Map<string, HermesReasoningChain> = new Map();
  private decisions: Map<string, HermesDecision> = new Map();

  // ── Cadeias de Raciocínio ──

  startReasoningChain(problem: string): HermesReasoningChain {
    const chain: HermesReasoningChain = {
      id: this.generateId(),
      problem,
      thoughts: [],
      status: 'exploring',
      startedAt: new Date(),
      alternativeChains: [],
    };

    // Thought inicial: observação do problema
    const observation: HermesThought = {
      id: this.generateId(),
      content: `Problema identificado: ${problem}`,
      type: 'observation',
      confidence: 1.0,
      timestamp: new Date(),
      childThoughtIds: [],
    };

    chain.thoughts.push(observation);
    this.chains.set(chain.id, chain);
    return chain;
  }

  addThought(
    chainId: string,
    content: string,
    type: HermesThought['type'],
    confidence: number,
    parentThoughtId?: string
  ): HermesThought | null {
    const chain = this.chains.get(chainId);
    if (!chain) return null;

    const thought: HermesThought = {
      id: this.generateId(),
      content,
      type,
      confidence,
      timestamp: new Date(),
      parentThoughtId,
      childThoughtIds: [],
    };

    // Vincular ao pai
    if (parentThoughtId) {
      const parent = chain.thoughts.find(t => t.id === parentThoughtId);
      if (parent) {
        parent.childThoughtIds.push(thought.id);
      }
    }

    chain.thoughts.push(thought);
    this.chains.set(chainId, chain);
    return thought;
  }

  async reasonChainOfThought(chainId: string): Promise<HermesReasoningChain | null> {
    const chain = this.chains.get(chainId);
    if (!chain) return null;

    // Simular raciocínio com múltiplos passos
    const lastThought = chain.thoughts[chain.thoughts.length - 1];

    if (lastThought.type === 'observation') {
      // Gerar raciocínio
      this.addThought(chainId,
        `Analisando o problema: "${chain.problem}". Considerando abordagens possíveis.`,
        'reasoning', 0.85, lastThought.id
      );
    }

    const currentThought = chain.thoughts[chain.thoughts.length - 1];

    if (currentThought.type === 'reasoning') {
      // Gerar hipóteses
      this.addThought(chainId,
        `Hipótese: A melhor abordagem envolve decompor o problema em sub-tarefas menores.`,
        'hypothesis', 0.75, currentThought.id
      );
    }

    const hypThought = chain.thoughts[chain.thoughts.length - 1];

    if (hypThought.type === 'hypothesis') {
      // Gerar conclusão
      this.addThought(chainId,
        `Conclusão: Recomendo abordar o problema passo a passo, priorizando Impacto x Esforço.`,
        'conclusion', 0.9, hypThought.id
      );
      chain.status = 'converged';
      chain.conclusion = 'Decompor em sub-tarefas e priorizar por impacto';
      chain.completedAt = new Date();
    }

    this.chains.set(chainId, chain);
    return chain;
  }

  getChain(chainId: string): HermesReasoningChain | undefined {
    return this.chains.get(chainId);
  }

  getAllChains(): HermesReasoningChain[] {
    return Array.from(this.chains.values());
  }

  // ── Tomada de Decisão ──

  createDecision(
    question: string,
    options: { label: string; description: string; pros: string[]; cons: string[] }[]
  ): HermesDecision {
    const scoredOptions = options.map(opt => ({
      ...opt,
      score: this.calculateOptionScore(opt),
    }));

    const decision: HermesDecision = {
      id: this.generateId(),
      question,
      options: scoredOptions,
      reasoning: '',
      confidence: 0,
    };

    this.decisions.set(decision.id, decision);
    return decision;
  }

  async evaluateDecision(decisionId: string): Promise<HermesDecision | null> {
    const decision = this.decisions.get(decisionId);
    if (!decision) return null;

    // Encontrar melhor opção
    const bestIdx = decision.options.reduce((best, opt, idx, arr) =>
      opt.score > arr[best].score ? idx : best, 0);

    decision.selectedOption = bestIdx;
    decision.confidence = decision.options[bestIdx].score / 10;
    decision.reasoning = `Opção "${decision.options[bestIdx].label}" selecionada com score ${decision.options[bestIdx].score}/10. ${decision.options[bestIdx].pros.length} prós vs ${decision.options[bestIdx].cons.length} contras.`;

    this.decisions.set(decisionId, decision);
    return decision;
  }

  private calculateOptionScore(option: { pros: string[]; cons: string[] }): number {
    return Math.min(10, Math.max(1, option.pros.length * 2 - option.cons.length));
  }

  // ── Resolução de Problemas ──

  async solveProblem(problem: string): Promise<{
    chain: HermesReasoningChain;
    decision?: HermesDecision;
    recommendations: string[];
  }> {
    // Iniciar cadeia de raciocínio
    const chain = this.startReasoningChain(problem);

    // Raciocinar
    await this.reasonChainOfThought(chain.id);
    await this.reasonChainOfThought(chain.id);
    await this.reasonChainOfThought(chain.id);

    // Criar decisão se aplicável
    let decision: HermesDecision | undefined;
    if (problem.toLowerCase().includes('escolher') || problem.toLowerCase().includes('decidir')) {
      decision = this.createDecision(problem, [
        { label: 'Abordagem A', description: 'Solução rápida e direta', pros: ['Rápido', 'Simples'], cons: ['Pode não ser escalável'] },
        { label: 'Abordagem B', description: 'Solução robusta e escalável', pros: ['Escalável', 'Manutenível'], cons: ['Mais complexo', 'Mais lento'] },
      ]);
      await this.evaluateDecision(decision.id);
    }

    const recommendations = [
      'Decompor o problema em sub-tarefas',
      'Priorizar por impacto vs esforço',
      'Validar com dados quando possível',
      'Iterar e refinar a solução',
    ];

    return { chain, decision, recommendations };
  }

  // ── Pergunta ao Usuário ──

  askUser(question: string, options?: string[]): {
    question: string;
    options: string[];
    timestamp: Date;
  } {
    return {
      question,
      options: options || ['Sim', 'Não', 'Preciso de mais informações'],
      timestamp: new Date(),
    };
  }

  // ── Utilidades ──

  private generateId(): string {
    return `hermes-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  getStats(): {
    totalChains: number;
    activeChains: number;
    totalDecisions: number;
    totalThoughts: number;
  } {
    const chains = this.getAllChains();
    return {
      totalChains: chains.length,
      activeChains: chains.filter(c => c.status === 'exploring').length,
      totalDecisions: this.decisions.size,
      totalThoughts: chains.reduce((sum, c) => sum + c.thoughts.length, 0),
    };
  }
}

// Singleton
let instance: HermesAgent | null = null;

export function getHermesAgent(): HermesAgent {
  if (!instance) {
    instance = new HermesAgent();
  }
  return instance;
}

export { HermesAgent };
