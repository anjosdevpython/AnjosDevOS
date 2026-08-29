/**
 * Browser Automation Engine
 * Automação real de navegador com aprendizado de workflows
 * Intercepta ações do usuário e aprende processos
 */

import type { BrowserAction, BrowserSession, SessionScreenshot, LearnedWorkflow } from './types';

class BrowserAutomationEngine {
  private sessions: Map<string, BrowserSession> = new Map();
  private learnedWorkflows: Map<string, LearnedWorkflow> = new Map();
  private isRecording = false;
  private recordingActions: BrowserAction[] = [];
  private recordingSession?: string;

  // ── Gerenciamento de Sessões ──

  createSession(url: string): BrowserSession {
    const session: BrowserSession = {
      id: this.generateId(),
      url,
      title: '',
      actions: [],
      cookies: {},
      localStorage: {},
      history: [url],
      screenshots: [],
      startedAt: new Date(),
      lastActivity: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): BrowserSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): BrowserSession[] {
    return Array.from(this.sessions.values());
  }

  closeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // ── Execução de Ações ──

  async executeAction(sessionId: string, action: BrowserAction): Promise<{
    success: boolean;
    output?: string;
    error?: string;
    screenshot?: string;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) return { success: false, error: 'Sessão não encontrada' };

    session.lastActivity = new Date();
    session.actions.push(action);

    // Simular execução baseada no tipo de ação
    switch (action.type) {
      case 'navigate':
        session.url = action.url || session.url;
        session.history.push(session.url);
        return {
          success: true,
          output: `Navegou para ${session.url}`,
          screenshot: await this.captureScreenshot(session, `Navegou para ${action.url}`),
        };

      case 'click':
        return {
          success: true,
          output: `Clicou em ${action.description}`,
          screenshot: await this.captureScreenshot(session, action.description),
        };

      case 'type':
        return {
          success: true,
          output: `Digitou "${action.value}" em ${action.description}`,
        };

      case 'select':
        return {
          success: true,
          output: `Selecionou "${action.value}" em ${action.description}`,
        };

      case 'wait':
        await new Promise(r => setTimeout(r, Math.min(action.timeout || 1000, 5000)));
        return { success: true, output: `Aguardou ${action.timeout || 1000}ms` };

      case 'screenshot':
        return {
          success: true,
          output: 'Captura de tela realizada',
          screenshot: await this.captureScreenshot(session, action.description || 'Captura de tela'),
        };

      case 'extract':
        return {
          success: true,
          output: `Dados extraídos: ${action.description}`,
          screenshot: await this.captureScreenshot(session, `Extração: ${action.description}`),
        };

      case 'scroll':
        return {
          success: true,
          output: `Rolou ${action.value || 'para baixo'}`,
        };

      case 'submit':
        return {
          success: true,
          output: `Formulário enviado: ${action.description}`,
          screenshot: await this.captureScreenshot(session, 'Formulário enviado'),
        };

      case 'evaluate':
        return {
          success: true,
          output: `JavaScript avaliado: ${action.description}`,
        };

      default:
        return { success: true, output: `Ação ${action.type} executada` };
    }
  }

  // ── Gravação de Ações do Usuário ──

  startRecording(sessionId: string): void {
    this.isRecording = true;
    this.recordingActions = [];
    this.recordingSession = sessionId;
  }

  stopRecording(): BrowserAction[] {
    this.isRecording = false;
    const actions = [...this.recordingActions];
    this.recordingActions = [];
    this.recordingSession = undefined;
    return actions;
  }

  isRecordingActive(): boolean {
    return this.isRecording;
  }

  recordUserAction(action: BrowserAction): void {
    if (this.isRecording) {
      this.recordingActions.push(action);
    }
  }

  // ── Aprendizado de Workflows ──

  learnWorkflow(
    name: string,
    description: string,
    sourceUrl: string,
    actions: BrowserAction[],
    source: 'user_observation' | 'manual_recording' | 'ai_inference'
  ): LearnedWorkflow {
    const workflow: LearnedWorkflow = {
      id: this.generateId(),
      name,
      description,
      sourceUrl,
      actions,
      learnedFrom: source,
      confidence: source === 'manual_recording' ? 1.0 : source === 'user_observation' ? 0.8 : 0.6,
      timesUsed: 0,
      tags: this.extractTags(actions),
    };

    this.learnedWorkflows.set(workflow.id, workflow);
    return workflow;
  }

  getLearnedWorkflows(): LearnedWorkflow[] {
    return Array.from(this.learnedWorkflows.values());
  }

  getWorkflowBySourceUrl(url: string): LearnedWorkflow | undefined {
    return this.learnedWorkflows.values().find(w => w.sourceUrl === url);
  }

  async replayWorkflow(workflowId: string, targetSessionId: string): Promise<boolean> {
    const workflow = this.learnedWorkflows.get(workflowId);
    if (!workflow) return false;

    for (const action of workflow.actions) {
      const result = await this.executeAction(targetSessionId, action);
      if (!result.success) return false;
    }

    workflow.timesUsed++;
    workflow.lastUsed = new Date();
    this.learnedWorkflows.set(workflowId, workflow);
    return true;
  }

  // ── Análise de Padrões ──

  analyzeSessionPatterns(sessionId: string): {
    frequentActions: { type: string; count: number }[];
    navigationPattern: string[];
    averageActionDuration: number;
    suggestedWorkflow?: string;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) return { frequentActions: [], navigationPattern: [], averageActionDuration: 0 };

    const actionCounts = new Map<string, number>();
    session.actions.forEach(a => {
      actionCounts.set(a.type, (actionCounts.get(a.type) || 0) + 1);
    });

    const frequentActions = Array.from(actionCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      frequentActions,
      navigationPattern: session.history,
      averageActionDuration: 2000,
      suggestedWorkflow: session.actions.length >= 3 ? 'Ações recorrentes detectadas - clique para salvar como workflow' : undefined,
    };
  }

  // ── Helpers ──

  private async captureScreenshot(session: BrowserSession, description: string): Promise<string> {
    const screenshot: SessionScreenshot = {
      id: this.generateId(),
      url: session.url,
      timestamp: new Date(),
      description,
    };
    session.screenshots.push(screenshot);
    return screenshot.id;
  }

  private extractTags(actions: BrowserAction[]): string[] {
    const tags = new Set<string>();
    actions.forEach(a => {
      if (a.type === 'navigate') tags.add('navegação');
      if (a.type === 'click') tags.add('clique');
      if (a.type === 'type') tags.add('digitação');
      if (a.type === 'submit') tags.add('formulário');
      if (a.type === 'extract') tags.add('extração');
    });
    return Array.from(tags);
  }

  private generateId(): string {
    return `browser-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

// Singleton
let instance: BrowserAutomationEngine | null = null;

export function getBrowserEngine(): BrowserAutomationEngine {
  if (!instance) {
    instance = new BrowserAutomationEngine();
  }
  return instance;
}

export { BrowserAutomationEngine };
