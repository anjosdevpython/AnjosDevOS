/**
 * AI Application Service Tests
 * Testa a camada de aplicação de IA que centraliza todas as chamadas AI.
 *
 * A partir da consolidação, o AIService delega chat/chatStream ao
 * CoreAIResolver (AI Core + ModelRouter + adapters), não mais ao api-client.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIService, getAIService, resetAIService } from '@/application/ai/AIService';
import { resetCoreAIResolver } from '@/application/ai/core-resolver';
import { resetProviderFactory } from '@/application/ai/provider-factory';

// ---------------------------------------------------------------------------
// Mock do CoreAIResolver (AI Core path)
// ---------------------------------------------------------------------------

vi.mock('@/application/ai/core-resolver', () => {
  const mockResolve = vi.fn().mockResolvedValue({
    id: 'resp-1',
    content: 'Olá! Como posso ajudar?',
    model: 'gpt-4o',
    provider: 'openai',
    finishReason: 'stop',
    usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 },
  });

  const mockStream = (async function* () {
    yield { content: 'Olá', done: false };
    yield { content: ' mundo', done: false };
    yield { content: '', done: true };
  })() as AsyncIterable<{
    id?: string;
    content: string;
    model?: string;
    finishReason?: string;
    done: boolean;
  }>;

  const makeStream = () =>
    (async function* () {
      yield { content: 'Olá', done: false };
      yield { content: ' mundo', done: false };
      yield { content: '', done: true };
    })() as AsyncIterable<{
      id?: string;
      content: string;
      model?: string;
      finishReason?: string;
      done: boolean;
    }>;

  return {
    CoreAIResolver: class {
      resolve = mockResolve;
      resolveStream = makeStream;
    },
    getCoreAIResolver: vi.fn(() => ({
      resolve: mockResolve,
      resolveStream: makeStream,
    })),
    resetCoreAIResolver: vi.fn(),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AIService', () => {
  beforeEach(() => {
    resetAIService();
    resetCoreAIResolver();
    resetProviderFactory();
  });

  afterEach(() => {
    resetAIService();
  });

  describe('Singleton', () => {
    it('deve retornar a mesma instância', () => {
      const a = getAIService();
      const b = getAIService();
      expect(a).toBe(b);
    });

    it('deve criar nova instância após reset', () => {
      const a = getAIService();
      resetAIService();
      const b = getAIService();
      expect(a).not.toBe(b);
    });
  });

  describe('chat()', () => {
    it('deve resolver via CoreAIResolver e retornar resposta OpenAI-compatível', async () => {
      const ai = getAIService();
      const result = await ai.chat({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Olá' }],
      });

      expect(result.id).toBe('resp-1');
      expect(result.object).toBe('chat.completion');
      expect(result.choices[0].message.content).toBe('Olá! Como posso ajudar?');
      expect(result.choices[0].message.role).toBe('assistant');
      expect(result.usage?.total_tokens).toBe(18);
    });

    it('deve propagar erro do resolver', async () => {
      const { getCoreAIResolver } = await import('@/application/ai/core-resolver');
      vi.mocked(getCoreAIResolver).mockReturnValueOnce({
        resolve: vi.fn().mockRejectedValue(new Error('API key inválida')),
        resolveStream: () => (async function* () {})() as AsyncIterable<never>,
      } as never);

      const ai = getAIService();
      await expect(
        ai.chat({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Teste' }],
        })
      ).rejects.toThrow('API key inválida');
    });
  });

  describe('chatStream()', () => {
    it('deve retornar um ReadableStream', async () => {
      const ai = getAIService();
      const stream = await ai.chatStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Olá' }],
        stream: true,
      });

      expect(stream).toBeInstanceOf(ReadableStream);
    });

    it('deve conter dados SSE válidos com [DONE]', async () => {
      const ai = getAIService();
      const stream = await ai.chatStream({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Olá' }],
        stream: true,
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      const chunks: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value));
      }

      const fullText = chunks.join('');
      expect(fullText).toContain('data:');
      expect(fullText).toContain('[DONE]');
      expect(fullText).toContain('Olá');
      expect(fullText).toContain('mundo');
    });
  });

  describe('generateImage()', () => {
    it('deve chamar o transport de imagem', async () => {
      const ai = getAIService();
      // Sem key configurada no resolver, image continua no transport legado
      await expect(
        ai.generateImage({
          model: 'dall-e-3',
          prompt: 'Um gato astronauta',
        })
      ).rejects.toThrow();
    });
  });

  describe('getModels()', () => {
    it('deve retornar a lista de modelos do catálogo local', async () => {
      const ai = getAIService();
      const result = await ai.getModels('openai');
      expect(result.data.length).toBeGreaterThan(0);
    });
  });
});
