/**
 * Agent Core Types
 * Tipos centrais do sistema unificado de agentes.
 *
 * Camada: CORE. Sem dependências externas.
 *
 * Um agente é uma unidade autônoma que pode:
 * - Receber input
 * - Processar via AI Core
 * - Retornar output
 *
 * Um agente NÃO pode:
 * - Acessar credenciais diretamente
 * - Executar shell arbitrário
 * - Acessar filesystem
 * - Fazer requests HTTP arbitrários
 */

// ---------------------------------------------------------------------------
// Agent State Machine
// ---------------------------------------------------------------------------

export type AgentState =
  | 'CREATED'    // Instanciado, não inicializado
  | 'READY'      // Configurado e pronto para executar
  | 'RUNNING'    // Em execução ativa
  | 'WAITING'    // Aguardando input externo
  | 'COMPLETED'  // Execução finalizada com sucesso
  | 'FAILED'     // Execução falhou
  | 'CANCELLED'  // Cancelado pelo usuário/sistema
  | 'TIMEOUT';   // Excedeu timeout

/** Transições válidas de estado. */
export const VALID_TRANSITIONS: Readonly<Record<AgentState, readonly AgentState[]>> = {
  CREATED:   ['READY'],
  READY:     ['RUNNING', 'CANCELLED'],
  RUNNING:   ['WAITING', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT'],
  WAITING:   ['RUNNING', 'CANCELLED', 'TIMEOUT'],
  COMPLETED: ['READY'],  // pode ser reinicializado via reset()
  FAILED:    ['READY'],  // pode ser reinicializado
  CANCELLED: ['READY'],  // pode ser reinicializado
  TIMEOUT:   ['READY'],  // pode ser reinicializado
};

// ---------------------------------------------------------------------------
// Agent Capabilities
// ---------------------------------------------------------------------------

/**
 * Capacidades declaradas por um agente.
 * Define o que o agente PODE fazer (não implementação).
 */
export type AgentCapability =
  | 'CHAT'              // Conversação com o usuário
  | 'ANALYZE'           // Análise de código, dados, contexto
  | 'PLAN'              // Planejamento e decomposição
  | 'GENERATE'          // Geração de código, texto, estruturas
  | 'REVIEW'            // Revisão e auditoria
  | 'DEBUG'             // Diagnóstico e correção
  | 'ORCHESTRATE';      // Coordenação de outros agentes

// Capacidades que NÃO são permitidas nesta fase
export const RESTRICTED_CAPABILITIES: readonly AgentCapability[] = [
  'CHAT',  // Reservado para UI direta
] as const;

// ---------------------------------------------------------------------------
// Agent Definition
// ---------------------------------------------------------------------------

export interface AgentDefinition {
  /** Identificador único do agente. */
  id: string;
  /** Nome amigável. */
  name: string;
  /** Descrição do que o agente faz. */
  description: string;
  /** Capacidades declaradas. */
  capabilities: AgentCapability[];
  /** Política de modelo preferido. */
  modelPolicy: import('../ai/types').RoutingPolicy;
  /** System prompt para o agente. */
  systemPrompt: string;
  /** Configurações de execução. */
  executionPolicy: AgentExecutionPolicy;
  /** Metadados livres. */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Agent Execution Policy
// ---------------------------------------------------------------------------

export interface AgentExecutionPolicy {
  /** Timeout em milissegundos (0 = sem timeout). */
  timeoutMs: number;
  /** Máximo de iterações (loops de thinking). */
  maxIterations: number;
  /** Máximo de tokens na resposta. */
  maxTokens: number;
  /** Máximo de retries em caso de falha retryable. */
  maxRetries: number;
  /** Delay base para backoff em ms. */
  retryBaseDelayMs: number;
  /** Se true, pode usar streaming. */
  stream: boolean;
}

export const DEFAULT_EXECUTION_POLICY: AgentExecutionPolicy = {
  timeoutMs: 60_000,
  maxIterations: 5,
  maxTokens: 4096,
  maxRetries: 2,
  retryBaseDelayMs: 1000,
  stream: false,
};

// ---------------------------------------------------------------------------
// Agent Context
// ---------------------------------------------------------------------------

/**
 * Contexto de execução de um agente.
 * Contém apenas dados de correlação — NUNCA credenciais.
 */
export interface AgentContext {
  /** ID do agente. */
  agentId: string;
  /** ID da execução (run). */
  runId: string;
  /** ID de trace ponta a ponta. */
  traceId: string;
  /** ID da requisição. */
  requestId: string;
  /** Input do usuário. */
  input: string;
  /** Metadata de correlação. */
  metadata?: Record<string, unknown>;
  /** Signal para cancelamento. */
  signal?: AbortSignal;
}

// ---------------------------------------------------------------------------
// Agent Run Result
// ---------------------------------------------------------------------------

export interface AgentRunResult {
  /** ID da execução. */
  runId: string;
  /** ID do agente. */
  agentId: string;
  /** Estado final. */
  state: AgentState;
  /** Output do agente. */
  output: string;
  /** Duração em milissegundos. */
  duration: number;
  /** Número de iterações executadas. */
  iterations: number;
  /** Modelo utilizado. */
  model?: string;
  /** Provider utilizado. */
  provider?: string;
  /** Uso de tokens. */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Erro, se houver. */
  error?: string;
  /** Se a resposta veio de fallback. */
  isFallback?: boolean;
}

// ---------------------------------------------------------------------------
// Agent Status (for registry/display)
// ---------------------------------------------------------------------------

export type AgentDisplayStatus = 'idle' | 'thinking' | 'generating' | 'reviewing' | 'error';

// ---------------------------------------------------------------------------
// Runtime Policy
// ---------------------------------------------------------------------------

export interface RuntimePolicy {
  /** Máximo de agentes concorrentes. */
  maxConcurrentAgents: number;
  /** Timeout global do runtime. */
  globalTimeoutMs: number;
  /** Se true, agentes podem ser pausados. */
  allowPause: boolean;
}

export const DEFAULT_RUNTIME_POLICY: RuntimePolicy = {
  maxConcurrentAgents: 5,
  globalTimeoutMs: 300_000,
  allowPause: true,
};
