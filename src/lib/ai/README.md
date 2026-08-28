# 🤖 AI Module

> Sistema multi-provider para integração com APIs de IA.

## Visão Geral

O módulo AI fornece uma camada de abstração unificada para trabalhar com múltiplos provedores de IA, suportando diferentes formatos de API.

## Providers Suportados

| Provider | API Format | Streaming | Imagens |
|----------|------------|-----------|---------|
| OpenAI | OpenAI | ✅ | ✅ |
| Anthropic | Anthropic | ✅ | ❌ |
| Google AI | Google | ✅ | ✅ |
| DeepSeek | OpenAI | ✅ | ❌ |
| xAI (Grok) | OpenAI | ✅ | ❌ |
| Mistral AI | OpenAI | ✅ | ❌ |
| Groq | OpenAI | ✅ | ❌ |
| Together AI | OpenAI | ✅ | ❌ |
| NetworkTools | OpenAI | ✅ | ✅ |

## Arquivos

### `providers.ts`

Define todos os providers e seus modelos.

```typescript
import { PROVIDERS, getAllModels, findProviderByModel } from '@/lib/ai/providers';

// Obter todos os modelos
const allModels = getAllModels();

// Encontrar provider por model ID
const provider = findProviderByModel('gpt-4o');
```

### `provider-config.ts`

Gerencia configurações de providers (API keys, URLs).

```typescript
import { providerConfig } from '@/lib/ai/provider-config';

// Obter config de um provider
const config = providerConfig.get('openai');

// Salvar config
providerConfig.set('openai', {
  apiKey: 'sk-...',
  baseUrl: 'https://api.openai.com/v1',
  isEnabled: true
});
```

### `api-client.ts`

Cliente API unificado que suporta diferentes formatos.

```typescript
import { createChatCompletion } from '@/lib/ai/api-client';

// Criar completion
const response = await createChatCompletion({
  provider: 'openai',
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
  stream: true
});
```

### `models.ts`

Registry de modelos com metadados.

```typescript
import { MODEL_CATEGORIES, getModelById } from '@/lib/ai/models';

// Categorias disponíveis
// 'chat' | 'image' | 'video' | 'music' | 'tts' | 'audio'

// Obter modelo por ID
const model = getModelById('gpt-4o');
```

## Adicionar Novo Provider

1. **Defina o provider** em `providers.ts`:

```typescript
export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  // ... existing providers
  myprovider: {
    id: 'myprovider',
    name: 'My Provider',
    icon: '🆕',
    color: '#ff0000',
    baseUrl: 'https://api.myprovider.com/v1',
    apiKeyEnv: 'MY_PROVIDER_API_KEY',
    apiKeyPlaceholder: 'mp-...',
    supportsStreaming: true,
    supportsImages: false,
    maxTokens: 128000,
    apiFormat: 'openai', // ou 'anthropic', 'google'
    models: [
      {
        id: 'my-model',
        name: 'My Model',
        category: 'chat',
        maxTokens: 128000,
        supportsStreaming: true
      }
    ]
  }
};
```

2. **Adicione o tipo** em `providers.ts`:

```typescript
export type ProviderId =
  | 'openai'
  | 'anthropic'
  // ... existing
  | 'myprovider';
```

3. **Atualize o API client** se o formato for diferente

4. **Adicione na UI** em `src/app/settings/page.tsx`

## Formatos de API

### OpenAI Format

```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "stream": true,
  "temperature": 0.7
}
```

### Anthropic Format

```json
{
  "model": "claude-sonnet-4-20250514",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "max_tokens": 4096,
  "system": "You are a helpful assistant."
}
```

### Google Format

```json
{
  "contents": [
    {
      "parts": [
        { "text": "Hello!" }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7
  }
}
```

## Variáveis de Ambiente

```env
# NetworkTools (padrão)
NETWORK_TOOLS_API_KEY=sk-...

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google AI
GOOGLE_AI_API_KEY=AIza...

# DeepSeek
DEEPSEEK_API_KEY=sk-...

# xAI
XAI_API_KEY=xai-...

# Mistral
MISTRAL_API_KEY=...

# Groq
GROQ_API_KEY=gsk_...

# Together AI
TOGETHER_API_KEY=...
```
