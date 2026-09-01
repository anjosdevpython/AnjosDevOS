# Structured Logger

Sistema de logging estruturado com níveis, contexto e sanitização automática de secrets.

## Uso Básico

```typescript
import { getLogger, LogLevel } from '@/infrastructure/observability/logger';

const logger = getLogger(LogLevel.DEBUG);

// Log com contexto
logger.info('Agent started', {
  agentId: 'agent-1',
  taskId: 'task-123',
  traceId: 'trace-abc',
});

// Log de erro
logger.error('Failed to execute tool', { toolId: 'tool-1' }, error);

// Debug (só em desenvolvimento)
logger.debug('Processing request', { requestId: 'req-123' });
```

## Níveis

- `DEBUG`: Informações detalhadas para debugging
- `INFO`: Informações gerais
- `WARN`: Avisos que não são críticos
- `ERROR`: Erros que precisam de atenção
- `FATAL`: Erros críticos que param o sistema

## Sanitização de Secrets

O logger automaticamente sanitiza:
- API keys (`api_key`, `apiKey`, `sk-...`)
- Secrets (`secret`, `password`)
- Tokens (`token`, `authorization`, `bearer`)
- GitHub PATs (`ghp_...`)
- E outros padrões sensíveis

Secrets são substituídos por `[REDACTED]` automaticamente.

## Contexto

Contexto opcional para correlação:
- `traceId`: ID de rastreamento distribuído
- `requestId`: ID da requisição
- `taskId`: ID da tarefa
- `agentId`: ID do agente
- `toolId`: ID da ferramenta
- `provider`: Provedor de IA
- `model`: Modelo usado
- `duration`: Duração da operação
