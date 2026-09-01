# Config Manager

Sistema de configuração centralizada e tipo-safe para o AnjosDevOS.

## Uso Básico

```typescript
import { getConfigManager } from '@/infrastructure/config';

const config = getConfigManager();

// Acessar configuração completa
const allConfig = config.getAll();

// Acessar seção específica
const appConfig = config.getApp();
const aiConfig = config.getAI();
const securityConfig = config.getSecurity();

// Acessar configuração genérica
const databaseConfig = config.get('database');

// Helpers de ambiente
if (config.isDevelopment()) {
  // Lógica específica de desenvolvimento
}

if (config.isProduction()) {
  // Lógica específica de produção
}
```

## Seções de Configuração

### App Config
- `name`: Nome da aplicação
- `version`: Versão atual
- `environment`: development | staging | production
- `debug`: Debug mode habilitado

### AI Config
- `defaultProvider`: Provedor padrão
- `defaultModel`: Modelo padrão
- `maxTokens`: Máximo de tokens
- `temperature`: Temperatura padrão
- `timeout`: Timeout em ms
- `retryAttempts`: Tentativas de retry

### Security Config
- `rateLimitEnabled`: Rate limiting habilitado
- `rateLimitPerMinute`: Limite por minuto
- `csrfEnabled`: CSRF protection habilitado
- `cspEnabled`: CSP habilitado
- `auditLogEnabled`: Audit logging habilitado

### Database Config
- `provider`: dexie | indexeddb
- `maxWorkspaces`: Máximo de workspaces
- `maxFlows`: Máximo de flows
- `maxFlowRuns`: Máximo de execuções de flow

### Runtime Config
- `webContainersEnabled`: WebContainers habilitados
- `terminalEnabled`: Terminal habilitado
- `vitestEnabled`: Vitest habilitado

### Feature Flags
- `newAgentSystem`: Novo sistema de agentes
- `unifiedMemory`: Memória unificada
- `toolPermissions`: Permissões de ferramentas
- `modelRouter`: Router de modelos

## Variáveis de Ambiente

O Config Manager lê configurações de variáveis de ambiente:

- `NEXT_PUBLIC_APP_VERSION`
- `NEXT_PUBLIC_DEFAULT_PROVIDER`
- `NEXT_PUBLIC_DEFAULT_MODEL`
- `AI_MAX_TOKENS`
- `AI_TEMPERATURE`
- `AI_TIMEOUT`
- `AI_RETRY_ATTEMPTS`
- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_PER_MINUTE`
- `CSRF_ENABLED`
- `CSP_ENABLED`
- `AUDIT_LOG_ENABLED`
- `MAX_WORKSPACES`
- `MAX_FLOWS`
- `MAX_FLOW_RUNS`
- `WEBCONTAINERS_ENABLED`
- `TERMINAL_ENABLED`
- `VITEST_ENABLED`
- `FEATURE_NEW_AGENT_SYSTEM`
- `FEATURE_UNIFIED_MEMORY`
- `FEATURE_TOOL_PERMISSIONS`
- `FEATURE_MODEL_ROUTER`
