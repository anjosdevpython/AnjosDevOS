/**
 * Model Registry
 * Catálogo unificado de modelos derivado dos PROVIDERS existentes no projeto.
 * Camada: CORE. Não depende de React, Next.js nem browser APIs.
 *
 * O registry lê a fonte estática (PROVIDERS) e enriquece cada modelo com
 * metadados de capacidade usados pelo ModelRouter para seleção.
 */

import type { AIModel, AIModelCategory } from '../types';
import { PROVIDERS, type ProviderId } from '@/lib/ai/providers';

// ---------------------------------------------------------------------------
// Tipo simplificado do catálogo legado
// ---------------------------------------------------------------------------

interface LegacyModel {
  id: string;
  name: string;
  category: string;
  maxTokens?: number;
  supportsStreaming?: boolean;
  supportsImages?: boolean;
  description?: string;
}

interface LegacyProvider {
  id: string;
  name: string;
  color: string;
  baseUrl: string;
  models: LegacyModel[];
}

type LegacyProviders = Record<string, LegacyProvider>;

// ---------------------------------------------------------------------------
// Metadata de capacidade (enriquecimento manual dos modelos mais usados)
// ---------------------------------------------------------------------------

interface ModelCapabilityMeta {
  contextWindow?: number;
  supportsVision?: boolean;
  supportsTools?: boolean;
  reasoningCapability?: number;
  costTier?: number;
  speedTier?: number;
  isLocal?: boolean;
  respectsPrivacy?: boolean;
}

const CAPABILITY_OVERRIDES: Readonly<Record<string, ModelCapabilityMeta>> = {
  // OpenAI
  'gpt-4o': { contextWindow: 128_000, supportsVision: true, supportsTools: true, reasoningCapability: 8, costTier: 7, speedTier: 6 },
  'gpt-4o-mini': { contextWindow: 128_000, supportsVision: true, supportsTools: true, reasoningCapability: 6, costTier: 3, speedTier: 8 },
  'o1': { contextWindow: 200_000, supportsVision: true, reasoningCapability: 10, costTier: 9, speedTier: 3 },
  'o1-mini': { contextWindow: 128_000, reasoningCapability: 8, costTier: 5, speedTier: 5 },
  'o3-mini': { contextWindow: 200_000, supportsVision: true, reasoningCapability: 9, costTier: 5, speedTier: 6 },
  'o4-mini': { contextWindow: 200_000, supportsVision: true, reasoningCapability: 9, costTier: 4, speedTier: 8 },

  // Anthropic
  'claude-opus-4-20250514': { contextWindow: 200_000, supportsVision: true, supportsTools: true, reasoningCapability: 10, costTier: 10, speedTier: 3 },
  'claude-sonnet-4-20250514': { contextWindow: 200_000, supportsVision: true, supportsTools: true, reasoningCapability: 9, costTier: 6, speedTier: 6 },
  'claude-haiku-4-20250514': { contextWindow: 200_000, supportsVision: true, supportsTools: true, reasoningCapability: 6, costTier: 2, speedTier: 9 },
  'claude-3-5-sonnet-20241022': { contextWindow: 200_000, supportsVision: true, supportsTools: true, reasoningCapability: 8, costTier: 6, speedTier: 6 },

  // Google
  'gemini-2.5-pro': { contextWindow: 1_000_000, supportsVision: true, supportsTools: true, reasoningCapability: 9, costTier: 6, speedTier: 6 },
  'gemini-2.5-flash': { contextWindow: 1_000_000, supportsVision: true, supportsTools: true, reasoningCapability: 7, costTier: 2, speedTier: 9 },
  'gemini-2.0-flash': { contextWindow: 1_000_000, supportsVision: true, supportsTools: true, reasoningCapability: 6, costTier: 1, speedTier: 10 },

  // DeepSeek
  'deepseek-chat': { contextWindow: 128_000, supportsTools: true, reasoningCapability: 7, costTier: 2, speedTier: 7 },
  'deepseek-reasoner': { contextWindow: 128_000, reasoningCapability: 9, costTier: 3, speedTier: 5 },
  'deepseek-coder-v2': { contextWindow: 128_000, supportsTools: true, reasoningCapability: 7, costTier: 2, speedTier: 7 },

  // Groq
  'llama-3.3-70b-versatile': { contextWindow: 128_000, supportsTools: true, reasoningCapability: 7, costTier: 2, speedTier: 10 },

  // Mistral
  'mistral-large-latest': { contextWindow: 128_000, supportsTools: true, reasoningCapability: 8, costTier: 5, speedTier: 6 },
  'codestral-latest': { contextWindow: 128_000, supportsTools: true, reasoningCapability: 7, costTier: 3, speedTier: 8 },
};

const DEFAULT_CAPABILITIES: ModelCapabilityMeta = {
  supportsVision: false,
  supportsTools: false,
  reasoningCapability: 5,
  costTier: 5,
  speedTier: 5,
  isLocal: false,
  respectsPrivacy: false,
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export class ModelRegistry {
  private models: AIModel[];

  /**
   * @param externalProviders Providers injetados para testes. Quando não
   *   fornecido, usa os PROVIDERS do projeto legado.
   */
  constructor(externalProviders?: LegacyProviders) {
    this.models = this.buildCatalog(externalProviders);
  }

  getAll(): AIModel[] {
    return this.models;
  }

  getByCategory(category: AIModelCategory): AIModel[] {
    return this.models.filter((m) => m.category === category);
  }

  getById(id: string): AIModel | undefined {
    return this.models.find((m) => m.id === id);
  }

  resolve(modelId: string): AIModel | undefined {
    const exact = this.getById(modelId);
    if (exact) return exact;

    const parts = modelId.split('/');
    const partial = parts[parts.length - 1];
    if (partial && partial !== modelId) {
      return this.getById(partial);
    }

    return undefined;
  }

  getProviderIds(): string[] {
    return [...new Set(this.models.map((m) => m.providerId))];
  }

  getByProvider(providerId: string): AIModel[] {
    return this.models.filter((m) => m.providerId === providerId);
  }

  get count(): number {
    return this.models.length;
  }

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------

  private buildCatalog(externalProviders?: LegacyProviders): AIModel[] {
    const models: AIModel[] = [];
    const providers: LegacyProviders = externalProviders ?? (PROVIDERS as unknown as LegacyProviders);

    for (const provider of Object.values(providers)) {
      for (const model of provider.models) {
        const override = CAPABILITY_OVERRIDES[model.id] ?? {};
        const defaults = DEFAULT_CAPABILITIES;

        models.push({
          id: model.id,
          name: model.name,
          providerId: provider.id,
          providerName: provider.name,
          providerColor: provider.color,
          category: model.category as AIModelCategory,
          contextWindow: override.contextWindow ?? model.maxTokens,
          supportsStreaming: model.supportsStreaming ?? true,
          supportsVision: override.supportsVision ?? defaults.supportsVision,
          supportsTools: override.supportsTools ?? defaults.supportsTools,
          reasoningCapability: override.reasoningCapability ?? defaults.reasoningCapability,
          costTier: override.costTier ?? defaults.costTier,
          speedTier: override.speedTier ?? defaults.speedTier,
          isLocal: override.isLocal ?? defaults.isLocal,
          respectsPrivacy: override.respectsPrivacy ?? defaults.respectsPrivacy,
          description: model.description,
        });
      }
    }

    return models;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let registryInstance: ModelRegistry | null = null;

export function getModelRegistry(): ModelRegistry {
  if (!registryInstance) {
    registryInstance = new ModelRegistry();
  }
  return registryInstance;
}

export function resetModelRegistry(): void {
  registryInstance = null;
}
