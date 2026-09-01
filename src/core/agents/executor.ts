/**
 * Agent Executor
 * Executa uma unidade de trabalho do agente via AI Core.
 *
 * Camada: CORE. Depende apenas de interfaces (AI Core types).
 *
 * Arquitetura:
 *
 * ```
 * AgentRuntime
 *      ↓
 * AgentExecutor ← você está aqui
 *      ↓
 * AI Core (AIProvider.chat / AIProvider.stream)
 *      ↓
 * ModelRouter
 *      ↓
 * Provider
 * ```
 *
 * O Executor NÃO conhece:
 * - Credenciais (usa AIProvider abstração)
 * - Storage (usa AgentContext)
 * - UI
 */

import type { AIRequest, AIResponse, AIStreamChunk } from '../ai/types';
import type { AgentContext, AgentDefinition, AgentExecutionPolicy } from './types';
import { DEFAULT_EXECUTION_POLICY } from './types';

// ---------------------------------------------------------------------------
// Executor Interface
// ---------------------------------------------------------------------------

/**
 * Interface para o resolvedor de AI requests.
 * Implementada pelo AgentRuntime, que conecta ao AI Core.
 */
export interface AIRequestResolver {
  /** Resolve um AIRequest usando o AI Core + ModelRouter. */
  resolve(request: AIRequest): Promise<AIResponse>;
  /** Resolve um AIRequest com streaming. */
  resolveStream(request: AIRequest): AsyncIterable<AIStreamChunk>;
}

// ---------------------------------------------------------------------------
// AgentExecutor
// ---------------------------------------------------------------------------

export class AgentExecutor {
  private readonly aiResolver: AIRequestResolver;

  constructor(aiResolver: AIRequestResolver) {
    this.aiResolver = aiResolver;
  }

  /**
   * Executa uma iteração do agente.
   *
   * Recebe o contexto atual e a definição do agente,
   * constrói o AI request e retorna a resposta.
   */
  async execute(
    context: AgentContext,
    definition: AgentDefinition,
    policy?: Partial<AgentExecutionPolicy>
  ): Promise<AgentExecutionResult> {
    const resolvedPolicy: AgentExecutionPolicy = {
      ...DEFAULT_EXECUTION_POLICY,
      ...definition.executionPolicy,
      ...policy,
    };

    const startTime = Date.now();

    // Construir o AI request
    const aiRequest: AIRequest = {
      requestId: context.requestId,
      traceId: context.traceId,
      messages: [
        { role: 'system', content: definition.systemPrompt },
        { role: 'user', content: context.input },
      ],
      policy: definition.modelPolicy,
      maxTokens: resolvedPolicy.maxTokens,
      stream: false,
      timeout: resolvedPolicy.timeoutMs,
    };

    try {
      const response = await this.aiResolver.resolve(aiRequest);

      return {
        output: response.content,
        duration: Date.now() - startTime,
        iterations: 1,
        model: response.model,
        provider: response.provider,
        usage: response.usage ? {
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
        } : undefined,
        isFallback: response.isFallback,
      };
    } catch (error: unknown) {
      return {
        output: '',
        duration: Date.now() - startTime,
        iterations: 1,
        error: error instanceof Error ? error.message : 'Erro desconhecido na execução',
      };
    }
  }

  /**
   * Executa com streaming.
   */
  async *executeStream(
    context: AgentContext,
    definition: AgentDefinition,
    policy?: Partial<AgentExecutionPolicy>
  ): AsyncIterable<AIStreamChunk> {
    const resolvedPolicy: AgentExecutionPolicy = {
      ...DEFAULT_EXECUTION_POLICY,
      ...definition.executionPolicy,
      ...policy,
    };

    const aiRequest: AIRequest = {
      requestId: context.requestId,
      traceId: context.traceId,
      messages: [
        { role: 'system', content: definition.systemPrompt },
        { role: 'user', content: context.input },
      ],
      policy: definition.modelPolicy,
      maxTokens: resolvedPolicy.maxTokens,
      stream: true,
      timeout: resolvedPolicy.timeoutMs,
    };

    yield* this.aiResolver.resolveStream(aiRequest);
  }
}

// ---------------------------------------------------------------------------
// Result Type
// ---------------------------------------------------------------------------

export interface AgentExecutionResult {
  output: string;
  duration: number;
  iterations: number;
  model?: string;
  provider?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
  isFallback?: boolean;
}
