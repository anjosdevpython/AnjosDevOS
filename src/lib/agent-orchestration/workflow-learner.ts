/**
 * Workflow Learner
 * Sistema de aprendizado de processos do usuário
 * Observa ações no navegador e cria workflows reutilizáveis
 * Pergunta ao usuário quando não tem certeza
 */

import type { BrowserAction, LearnedWorkflow, Workflow, WorkflowTrigger } from './types';
import { getBrowserEngine } from './browser-engine';
import { getOrchestrator } from './orchestrator';

interface UserActionPattern {
  url: string;
  actions: BrowserAction[];
  frequency: number;
  lastSeen: Date;
  context: string;
}

interface LearningPrompt {
  id: string;
  question: string;
  context: string;
  options: { label: string; value: string }[];
  timestamp: Date;
  resolved: boolean;
  answer?: string;
}

class WorkflowLearner {
  private patterns: Map<string, UserActionPattern> = new Map();
  private prompts: LearningPrompt[] = [];
  private isWatching = false;
  private currentUrl = '';
  private actionBuffer: BrowserAction[] = [];

  // ── Observação de Ações ──

  startWatching(): void {
    this.isWatching = true;
    this.actionBuffer = [];
  }

  stopWatching(): BrowserAction[] {
    this.isWatching = false;
    const actions = [...this.actionBuffer];
    this.actionBuffer = [];
    return actions;
  }

  isWatchingActive(): boolean {
    return this.isWatching;
  }

  observeAction(action: BrowserAction, url: string, context?: string): void {
    if (!this.isWatching) return;

    this.currentUrl = url;
    this.actionBuffer.push(action);

    // Verificar padrão recorrente
    const patternKey = this.getPatternKey(url, this.actionBuffer);
    const existing = this.patterns.get(patternKey);

    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date();
      this.patterns.set(patternKey, existing);

      // Se o padrão apareceu 3+ vezes, sugerir salvar como workflow
      if (existing.frequency >= 3) {
        this.suggestWorkflowFromPattern(existing);
      }
    } else if (this.actionBuffer.length >= 2) {
      // Criar novo padrão com pelo menos 2 ações
      const pattern: UserActionPattern = {
        url: this.normalizeUrl(url),
        actions: [...this.actionBuffer],
        frequency: 1,
        lastSeen: new Date(),
        context: context || this.inferContext(this.actionBuffer),
      };
      this.patterns.set(patternKey, pattern);
    }
  }

  // ── Geração de Perguntas ao Usuário ──

  askUser(
    question: string,
    context: string,
    options: { label: string; value: string }[]
  ): LearningPrompt {
    const prompt: LearningPrompt = {
      id: this.generateId(),
      question,
      context,
      options,
      timestamp: new Date(),
      resolved: false,
    };

    this.prompts.push(prompt);
    return prompt;
  }

  resolvePrompt(promptId: string, answer: string): void {
    const prompt = this.prompts.find(p => p.id === promptId);
    if (prompt) {
      prompt.resolved = true;
      prompt.answer = answer;
    }
  }

  getUnresolvedPrompts(): LearningPrompt[] {
    return this.prompts.filter(p => !p.resolved);
  }

  getAllPrompts(): LearningPrompt[] {
    return [...this.prompts];
  }

  // ── Criação de Workflows ──

  suggestWorkflowFromPattern(pattern: UserActionPattern): Workflow {
    const workflow: Workflow = {
      id: this.generateId(),
      name: `Workflow: ${pattern.context}`,
      description: `Processo aprendido automaticamente - ${pattern.actions.length} passos`,
      steps: pattern.actions.map((action, idx) => ({
        id: `step-${idx}`,
        agentId: 'browser',
        capability: action.type,
        input: { action, url: pattern.url },
      })),
      triggers: [
        { type: 'url_pattern', config: { pattern: pattern.url } },
        { type: 'manual', config: {} },
      ],
      active: false,
      createdBy: 'learned',
      runs: 0,
    };

    return workflow;
  }

  createWorkflowFromActions(
    name: string,
    description: string,
    actions: BrowserAction[],
    url: string
  ): Workflow {
    const workflow: Workflow = {
      id: this.generateId(),
      name,
      description,
      steps: actions.map((action, idx) => ({
        id: `step-${idx}`,
        agentId: 'browser',
        capability: action.type,
        input: { action, url },
      })),
      triggers: [
        { type: 'url_pattern', config: { pattern: this.normalizeUrl(url) } },
        { type: 'manual', config: {} },
      ],
      active: true,
      createdBy: 'user',
      runs: 0,
    };

    // Registrar no orquestrador
    const orchestrator = getOrchestrator();
    orchestrator.registerWorkflow(workflow);

    return workflow;
  }

  // ── Análise de Padrões ──

  getPatterns(): UserActionPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  getFrequentPatterns(minFrequency = 2): UserActionPattern[] {
    return this.getPatterns().filter(p => p.frequency >= minFrequency);
  }

  getPatternsByUrl(url: string): UserActionPattern[] {
    const normalized = this.normalizeUrl(url);
    return this.getPatterns().filter(p => p.url.includes(normalized));
  }

  // ── Inferência de Contexto ──

  private inferContext(actions: BrowserAction[]): string {
    const types = actions.map(a => a.type);
    const hasLogin = types.includes('type') && types.includes('submit');
    const hasNavigate = types.includes('navigate');
    const hasExtract = types.includes('extract');
    const hasClick = types.includes('click');

    if (hasLogin) return 'Login/Autenticação';
    if (hasExtract && hasNavigate) return 'Pesquisa/Coleta de dados';
    if (hasClick && hasNavigate) return 'Navegação';
    if (types.includes('type') && hasClick) return 'Preenchimento de formulário';
    return 'Processo manual';
  }

  private getPatternKey(url: string, actions: BrowserAction[]): string {
    const normalized = this.normalizeUrl(url);
    const actionTypes = actions.map(a => a.type).join('-');
    return `${normalized}::${actionTypes}`;
  }

  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname}`;
    } catch {
      return url.split('?')[0];
    }
  }

  private suggestWorkflowFromPatternLearned(pattern: UserActionPattern): void {
    this.askUser(
      `Detectei que você repete esse processo em ${pattern.url}: ${pattern.context}`,
      `Padrão visto ${pattern.frequency} vezes. Quer salvar como workflow?`,
      [
        { label: 'Sim, salvar como workflow', value: 'save' },
        { label: 'Não, é apenas uma coincidência', value: 'ignore' },
        { label: 'Editar antes de salvar', value: 'edit' },
      ]
    );
  }

  private generateId(): string {
    return `learner-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  getStats(): {
    totalPatterns: number;
    frequentPatterns: number;
    totalPrompts: number;
    unresolvedPrompts: number;
    isWatching: boolean;
  } {
    return {
      totalPatterns: this.patterns.size,
      frequentPatterns: this.getFrequentPatterns().length,
      totalPrompts: this.prompts.length,
      unresolvedPrompts: this.getUnresolvedPrompts().length,
      isWatching: this.isWatching,
    };
  }
}

// Singleton
let instance: WorkflowLearner | null = null;

export function getWorkflowLearner(): WorkflowLearner {
  if (!instance) {
    instance = new WorkflowLearner();
  }
  return instance;
}

export { WorkflowLearner };
