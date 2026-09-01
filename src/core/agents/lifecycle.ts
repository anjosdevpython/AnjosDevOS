/**
 * Agent Lifecycle
 * Máquina de estados para o ciclo de vida de um agente.
 *
 * Camada: CORE. Sem dependências externas.
 *
 * Garante que apenas transições válidas são permitidas.
 * Cada transição é auditável e registered.
 */

import type { AgentState } from './types';
import { VALID_TRANSITIONS } from './types';
import { AgentStateError } from './errors';

// ---------------------------------------------------------------------------
// Transition Record
// ---------------------------------------------------------------------------

export interface StateTransition {
  from: AgentState;
  to: AgentState;
  timestamp: number;
  reason?: string;
}

// ---------------------------------------------------------------------------
// AgentLifecycle
// ---------------------------------------------------------------------------

export class AgentLifecycle {
  private state: AgentState;
  private history: StateTransition[] = [];

  constructor(initialState: AgentState = 'CREATED') {
    this.state = initialState;
    this.history.push({
      from: initialState,
      to: initialState,
      timestamp: Date.now(),
      reason: 'initial',
    });
  }

  /** Estado atual. */
  getCurrentState(): AgentState {
    return this.state;
  }

  /** Histórico de transições. */
  getHistory(): readonly StateTransition[] {
    return this.history;
  }

  /**
   * Tenta uma transição de estado.
   * Lança AgentStateError se a transição for inválida.
   */
  transition(to: AgentState, reason?: string): void {
    const validNext = VALID_TRANSITIONS[this.state];

    if (!validNext.includes(to)) {
      throw new AgentStateError(
        `Transição inválida: ${this.state} → ${to}. Transições permitidas: [${validNext.join(', ')}]`,
        {
          currentState: this.state,
          attemptedTransition: to,
        }
      );
    }

    const transition: StateTransition = {
      from: this.state,
      to,
      timestamp: Date.now(),
      reason,
    };

    this.state = to;
    this.history.push(transition);
  }

  /**
   * Verifica se uma transição é válida sem executá-la.
   */
  canTransition(to: AgentState): boolean {
    const validNext = VALID_TRANSITIONS[this.state];
    return validNext.includes(to);
  }

  /**
   * Verifica se o agente está em estado terminal.
   */
  isTerminal(): boolean {
    return this.state === 'COMPLETED' || this.state === 'FAILED' || this.state === 'CANCELLED' || this.state === 'TIMEOUT';
  }

  /**
   * Reinicia o agente a partir de um estado terminal.
   * Só funciona se estiver em COMPLETED, FAILED, CANCELLED ou TIMEOUT.
   */
  reset(): void {
    if (!this.isTerminal()) {
      throw new AgentStateError(
        `Não é possível reiniciar: estado atual é ${this.state}`,
        { currentState: this.state, attemptedTransition: 'READY' }
      );
    }
    this.transition('READY', 'reset after terminal state');
  }
}
