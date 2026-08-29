# 🕸️ Sistema de Orquestração de Agentes

Motor central de comunicação e coordenação entre agentes de IA.

## Arquitetura

```
┌─────────────────────────────────────────────────┐
│              Agent Orchestrator                  │
│         (Comunicação inter-agentes)             │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│  🧠     │  🌐     │  💻     │  📚     │  🔎     │
│ Hermes  │Browser  │Dev      │Pesquis. │Revisor  │
│Raciocínio│Automação│Código   │Dados    │QA       │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

## Módulos

### Orchestrator (`orchestrator.ts`)

```typescript
import { getOrchestrator } from '@/lib/agent-orchestration';

const orch = getOrchestrator();

// Registrar agente
orch.registerAgent({
  id: 'meu-agente',
  name: 'Meu Agente',
  type: 'ai',
  icon: '🤖',
  status: 'idle',
  capabilities: [{ name: 'code', description: 'Escrever código' }],
  maxConcurrentTasks: 3,
  currentTasks: [],
  metadata: {},
});

// Enviar mensagem
orch.sendMessage({
  from: 'agente-1',
  to: 'agente-2',
  type: 'request',
  payload: { task: 'Revisar código' },
  priority: 'high',
});

// Submeter tarefa
const result = await orch.submitTask({
  id: 'tarefa-1',
  description: 'Escrever tests',
  requiredCapabilities: ['code'],
  input: { files: ['src/utils.ts'] },
  timeout: 30000,
});
```

### Hermes Agent (`hermes-agent.ts`)

```typescript
import { getHermesAgent } from '@/lib/agent-orchestration';

const hermes = getHermesAgent();

// Raciocinar sobre um problema
const result = await hermes.solveProblem('Como otimizar o bundle?');

console.log(result.chain.conclusion);
console.log(result.recommendations);

// Criar decisão
const decision = hermes.createDecision('Qual framework usar?', [
  { label: 'React', description: 'Popular', pros: ['Ecosistema'], cons: ['Bundle'] },
  { label: 'Vue', description: 'Simples', pros: ['Leve'], cons: ['Menor ecosistema'] },
]);
await hermes.evaluateDecision(decision.id);
```

### Browser Engine (`browser-engine.ts`)

```typescript
import { getBrowserEngine } from '@/lib/agent-orchestration';

const engine = getBrowserEngine();

// Criar sessão
const session = engine.createSession('https://example.com');

// Executar ação
await engine.executeAction(session.id, {
  id: '1',
  type: 'navigate',
  url: 'https://example.com/login',
  description: 'Navegar para login',
});

// Gravar ações do usuário
engine.startRecording(session.id);
// ... usuário executa ações ...
const actions = engine.stopRecording();

// Aprender workflow
engine.learnWorkflow('Login', 'Fazer login', 'https://example.com', actions, 'manual_recording');
```

### Workflow Learner (`workflow-learner.ts`)

```typescript
import { getWorkflowLearner } from '@/lib/agent-orchestration';

const learner = getWorkflowLearner();

// Iniciar observação
learner.startWatching();

// Observar ações do usuário
learner.observeAction(action, url);
learner.observeAction(action2, url);

// Padrões detectados automaticamente
const patterns = learner.getFrequentPatterns();

// Criar workflow manualmente
const workflow = learner.createWorkflowFromActions(
  'Login Automático',
  'Fazer login automaticamente',
  actions,
  'https://example.com'
);
```

## Tipos

Veja `types.ts` para todos os tipos disponíveis:

- `AgentMessage` - Mensagem entre agentes
- `OrchestratorAgent` - Definição de agente
- `TaskRequest` - Requisição de tarefa
- `TaskResult` - Resultado de tarefa
- `Workflow` - Fluxo de trabalho
- `BrowserSession` - Sessão de navegador
- `LearnedWorkflow` - Workflow aprendido
- `HermesThought` - Pensamento do Hermes
- `HermesReasoningChain` - Cadeia de raciocínio
