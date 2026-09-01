# AI Core

Camada central de IA do AnjosDevOS. Abstrai provedores, modelos e roteamento para que o resto do sistema converse com IA sem depender de APIs específicas.

## Arquitetura

```
Application / UI
       ↓
   AI Core (src/core/ai/)
       ↓
  ┌────┴────┐
  │  Router  │  ← seleciona modelo/política
  └────┬────┘
       ↓
  ┌────┴────┐
  │ Provider │  ← adapta formato (OpenAI, Anthropic, Google)
  └────┬────┘
       ↓
  Provider API (externa)
```

## Componentes

### AIProvider Interface (`providers/AIProvider.ts`)

Contrato abstrato para todos os adapters:

```typescript
import { OpenAIAdapter, AnthropicAdapter, GoogleAdapter } from '@/core/ai';

const openai = new OpenAIAdapter({
  id: 'openai',
  name: 'OpenAI',
  baseUrl: 'https://api.openai.com/v1',
  apiKeyResolver: () => getProviderApiKey('openai'),
  models: [/* AIModel[] */],
});

// Chat
const response = await openai.chat({
  messages: [{ role: 'user', content: 'Olá!' }],
  model: 'gpt-4o',
});

// Streaming
for await (const chunk of openai.stream(request)) {
  process.stdout.write(chunk.content);
}
```

### Provider Adapters (`providers/adapters/`)

- **OpenAIAdapter** — formato OpenAI (usado por OpenAI, DeepSeek, Mistral, Groq, Together, etc.)
- **AnthropicAdapter** — formato Anthropic (Claude)
- **GoogleAdapter** — formato Google (Gemini)

### Model Registry (`registry/ModelRegistry.ts`)

Catálogo unificado de modelos derivado dos PROVIDERS existentes:

```typescript
import { getModelRegistry } from '@/core/ai';

const registry = getModelRegistry();
const allModels = registry.getAll();           // todos
const chatModels = registry.getByCategory('chat');
const gpt4o = registry.getById('gpt-4o');
const resolved = registry.resolve('openai/gpt-4o');  // busca parcial
```

### Model Router (`router/ModelRouter.ts`)

Seleciona o melhor modelo com base em política:

```typescript
import { ModelRouter, getModelRouter } from '@/core/ai';

const router = getModelRouter();
const result = router.select({
  messages: [{ role: 'user', content: 'Explique quantum computing' }],
  policy: 'POWERFUL',  // ou FAST, CHEAP, BALANCED, LOCAL, PRIVATE
});
// result.model → o modelo selecionado
```

**Políticas:**
| Política | Prioridade |
|----------|-----------|
| `FAST` | Velocidade |
| `CHEAP` | Custo baixo |
| `BALANCED` | Equilíbrio |
| `POWERFUL` | Raciocínio |
| `LOCAL` | Modelos locais |
| `PRIVATE` | Privacidade |

### Fallback (`providers/AIProvider.ts`)

Wrapper com retry + fallback automático:

```typescript
import { ProviderWithFallback } from '@/core/ai';

const wrapper = new ProviderWithFallback(
  primaryProvider,
  fallbackProvider,
  { maxRetries: 2, timeoutMs: 30_000 }
);

const response = await wrapper.chat(request);
// response.isFallback → true se usou o fallback
```

### Error Hierarchy (`errors.ts`)

```
AIError
  ├── AIProviderError (HTTP 4xx/5xx)
  ├── AIAuthenticationError (401, não retryable)
  ├── AIRateLimitError (429, retryable)
  ├── AITimeoutError (timeout, retryable)
  ├── AIModelUnavailableError (modelo indisponível, retryable)
  └── AIInvalidRequestError (400, não retryable)
```

### Eventos

O AI Core emite eventos via EventBus:

```typescript
'ai.request'  → { provider, model, messageCount, stream }
'ai.response' → { provider, model, tokensIn, tokensOut, finishReason }
'ai.error'    → { provider, model, message, error }
```

## Tipos Normalizados

```typescript
AIMessage       // { role, content }
AIRequest       // { messages, model?, provider?, policy?, stream? }
AIResponse      // { id, content, model, provider, finishReason, usage? }
AIStreamChunk   // { id?, content, model?, done }
AIModel         // { id, name, providerId, category, contextWindow, ... }
AIUsage         // { promptTokens, completionTokens, totalTokens }
```

## Regras de Dependência

```
UI → Application → AI Core → Infrastructure (EventBus, Logger, Config)
```

O AI Core NÃO importa React, Next.js nem `src/components`.
