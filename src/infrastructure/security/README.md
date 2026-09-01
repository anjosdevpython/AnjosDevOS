# Security — Credential Management

Sistema de gerenciamento de credenciais que substitui o acesso direto a `localStorage` por uma abstração segura.

## Arquitetura

```
UI / Settings Page
      ↓
CredentialService
      ↓
StorageBackend (localStorage + AES-GCM)
```

## Uso

### AI Provider Keys

```typescript
import { saveAIProviderKey, getAIProviderKeyResolver } from '@/infrastructure/security';

// Salvar chave (Settings page)
await saveAIProviderKey('openai', 'sk-...');

// Usar no adapter (AI Core)
const adapter = new OpenAIAdapter({
  apiKeyResolver: getAIProviderKeyResolver('openai'),
  // ...
});
```

### GitHub PAT

```typescript
import { saveGitHubPAT, getGitHubPAT } from '@/infrastructure/security';

// Salvar
await saveGitHubPAT('ghp_...');

// Ler
const pat = await getGitHubPAT();
```

### Credential Service

```typescript
import { getCredentialService, CredentialSensitivity } from '@/infrastructure/security';

const service = getCredentialService();

// CRUD
await service.set('my_key', 'value', 'ai', CredentialSensitivity.USER_PROVIDED);
const value = await service.get('my_key');
await service.delete('my_key');
const exists = await service.has('my_key');
```

## Segurança

### Proteções Implementadas

1. **Encrypt-at-rest** — Credenciais são encriptadas com AES-GCM no localStorage
2. **Chave de sessão** — Chave de criptografia gerada por sessão (não persistida)
3. **Abstração** — Core nunca acessa localStorage diretamente
4. **Sanitização** — Logs, eventos e erros nunca expõem credenciais

### Limitações Conhecidas

1. **XSS** — Chave de sessão existe em memória JS; XSS pode acessar
2. **Browser DevTools** — localStorage pode ser inspecionado
3. **Migração** — Dados antigos (plaintext) são lidos como fallback

### Futuro (Fase Própria)

- Server-side key resolution via API routes
- OAuth flow para GitHub
- Hardware-backed keys (WebAuthn)
- Key rotation automática

## Testes

```bash
npx vitest run src/__tests__/security.test.ts
```

## Migração

O sistema atual ainda suporta leitura do formato antigo (plaintext no localStorage).
A migração é transparente: novos dados são salvos encriptografados.

Para forçar migração completa, implemente `migrateFromLegacy()` no EncryptedBrowserStorage.
