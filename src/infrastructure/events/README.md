# Event Bus

Sistema Pub/Sub tipado para comunicação desacoplada entre módulos do AnjosDevOS.

## Uso Básico

```typescript
import { getEventBus } from '@/infrastructure/events';

const eventBus = getEventBus();

// Publicar evento
eventBus.publish('task.created', { taskId: '123' }, {
  traceId: 'trace-abc',
  taskId: 'task-123',
});

// Subscrever a evento
const subscription = eventBus.subscribe('task.started', (event) => {
  console.log('Task started:', event.payload);
});

// Unsubscribe
subscription.unsubscribe();
```

## Eventos Disponíveis

- `task.created`, `task.started`, `task.completed`, `task.failed`
- `agent.started`, `agent.completed`, `agent.failed`
- `tool.called`, `tool.completed`, `tool.failed`
- `memory.created`, `memory.updated`
- `ai.request`, `ai.response`
- `system.error`

## Características

- **Type-safe:** Tipos TypeScript para eventos e payloads
- **Error isolation:** Erros em handlers não afetam outros subscribers
- **Memory leak prevention:** Unsubscribe automático com limpeza de listeners vazios
- **Metadata support:** traceId, requestId, taskId, agentId para correlação
