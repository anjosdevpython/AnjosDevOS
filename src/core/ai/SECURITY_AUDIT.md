# Security Audit — AI Core (Fase 2)

## Pontos de Entrada de Credenciais

### Status Atual (DÉBITO CONHECIDO)

As API keys dos provedores são armazenadas em `localStorage` via:

```
src/lib/ai/provider-config.ts → localStorage['anjosdev_provider_settings']
```

**Risco:** Vulnerável a XSS. Qualquer script injetado pode ler todas as credenciais.

### Pontos de Acesso Ativos

| Arquivo | Credencial | Como Acessa |
|---------|-----------|-------------|
| `src/lib/ai/provider-config.ts` | Todas as API keys | `localStorage` (read/write) |
| `src/lib/ai/api-client.ts` | Todas as API keys | `getProviderApiKey()` → `localStorage` |
| `src/lib/ai/provider-config.ts` | `NEXT_PUBLIC_NETWORK_TOOLS_BASE_URL` | `process.env` |
| `src/lib/ai/provider-config.ts` | `NEXT_PUBLIC_NETWORK_TOOLS_API_KEY` | `process.env` |
| `src/app/api/chat/route.ts` | API keys dos providers | `getProviderApiKey()` |
| `src/app/api/images/route.ts` | API keys dos providers | `getProviderApiKey()` |
| `src/app/api/models/route.ts` | API keys dos providers | `getProviderApiKey()` |
| `src/app/api/automation/generate/route.ts` | API keys dos providers | `getProviderApiKey()` |
| `src/lib/agent-swarm/llm-audit.ts` | API keys dos providers | `chatCompletion()` |
| `src/lib/automation/flowExecutor.ts` | API keys dos providers | `chatCompletion()` |
| `src/components/features/chat/ChatInterface.tsx` | API keys dos providers | `loadProviderSettings()` |

### AI Core — Garantias Implementadas

1. **AI Core não armazena secrets** — Os adapters recebem `apiKeyResolver` via injeção de dependência. A key é resolvida em runtime e nunca persistida.

2. **Logs nunca expõem secrets** — O Logger da Fase 1 sanitiza automaticamente:
   - `api_key`, `apiKey`, `secret`, `password`, `token`, `authorization`, `bearer`
   - Padrões de valor: `sk-*`, `ghp_*`, `AKIA*`, JWTs

3. **Eventos não expõem secrets** — Os eventos `ai.request`, `ai.response`, `ai.error` contêm apenas: provider, model, message, duration. Nunca API keys.

4. **AIError preserva contexto** — Erros incluem provider, model, requestId mas nunca API keys na mensagem.

### Preparação para Fase 3 (Credentials Layer)

A interface `apiKeyResolver` do AI Core já suporta a futura migração:

```typescript
// HOJE (localStorage):
new OpenAIAdapter({ apiKeyResolver: () => getProviderApiKey('openai') })

// FUTURO (Secure Credentials Layer):
new OpenAIAdapter({ apiKeyResolver: () => credentials.get('openai') })
```

A mudança será transparente — apenas o resolver muda, o adapter não é afetado.

### Ações Necessárias (Fase Própria)

1. Criar `src/infrastructure/security/CredentialsManager` com:
   - Server-side encrypted storage (ou browser vault)
   - Nunca expor chaves ao client-side
   - API route para resolver keys sob demanda

2. Migrar `provider-config.ts` para usar o novo CredentialsManager

3. Remover `NEXT_PUBLIC_*_API_KEY` de `.env`

4. Implementar CSRF/CORS adequado para as API routes

5. Audit logs de acesso a credenciais
