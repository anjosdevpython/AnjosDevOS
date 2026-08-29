# 🤖 Sistema de Funcionários IA (Warmwind Style)

Inspired by [Warmwind OS](https://warmwind.com/) - Funcionários virtuais que trabalham 24/7.

## Como Funciona

```
┌─────────────────────────────────────────────────┐
│              Warmwind App                        │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│ 👥      │ 📋      │ 🏪      │ 📊      │ 🎓      │
│Funcion. │Tarefas  │App Store│Dashboard│ Modo    │
│  IA     │         │  (20+)  │         │ Ensino  │
└────┬────┴────┬────┴────┬────┴────┬────┴────┬────┘
     │         │         │         │         │
     ▼         ▼         ▼         ▼         ▼
┌─────────────────────────────────────────────────┐
│           AI Employees Manager                   │
│     (Cria, gerencia e executa tarefas)          │
└─────────────────────────────────────────────────┘
```

## Uso

### Criar Funcionário

```typescript
import { getAIEmployeesManager, ROLE_TEMPLATES } from '@/lib/warmwind/ai-employees';

const manager = getAIEmployeesManager();

// Usar template pré-definido
const ana = manager.createEmployee(0); // Ana - Atendente

// Criar personalizado
const custom = manager.createCustomEmployee(
  'Gerente de Projetos',
  'Gerenciar projetos e equipes',
  ['gestão', 'comunicação', 'planejamento']
);
```

### Atribuir Tarefa

```typescript
const task = manager.assignTask(ana.id, 'Responder e-mails', 'Verificar inbox e responder', [
  { id: '1', action: 'navigate', description: 'Abrir Gmail', status: 'pending' },
  { id: '2', action: 'click', description: 'Clicar em responder', status: 'pending' },
  { id: '3', action: 'type', description: 'Escrever resposta', status: 'pending' },
  { id: '4', action: 'screenshot', description: 'Capturar resultado', status: 'pending' },
]);
```

### Dashboard

```typescript
const metrics = manager.getMetrics();
// { totalEmployees: 5, activeEmployees: 2, tasksRunning: 3, ... }

const log = manager.getActivityLog();
// [{ employeeName: 'Ana', action: 'Tarefa concluída', ... }]
```

## App Store

```typescript
import { getAppStore } from '@/lib/warmwind/app-store';

const store = getAppStore();

// Listar todos
const all = store.getAll();

// Filtrar por categoria
const social = store.getByCategory('social');

// Conectar
store.connect('gmail');
store.connect('instagram');

// Buscar
const results = store.search('whatsapp');
```

## Funcionários Pré-configurados

| Nome | Função | Habilidades |
|------|--------|-------------|
| 👩‍💼 Ana | Atendente | email, chat, whatsapp, resolução |
| 📱 Marcos | Social Media | instagram, linkedin, twitter, conteúdo |
| 💰 Julia | Vendas | crm, prospecção, follow-up, negociação |
| 📊 Pedro | Financeiro | planilhas, faturas, relatórios, orçamento |
| 🔧 Carlos | Suporte Técnico | debug, documentação, triagem, remoto |
| 🔍 Laura | Pesquisador | web, dados, análise, relatórios |
| 📋 Maria | Assistente | agenda, e-mails, organização, lembretes |
| 💻 Rafael | Desenvolvedor | código, api, automação, deploy |

## Integrações Disponíveis

### Email
- Gmail · Outlook

### CRM
- HubSpot · Salesforce · Pipedrive

### Social
- Instagram · LinkedIn · Twitter · TikTok

### E-commerce
- Shopify · Mercado Livre · Magalu

### Produtividade
- Google Sheets · Notion

### Comunicação
- Slack · WhatsApp Business

### ERP
- Bling · Tiny

### Analytics
- Google Analytics · Meta Ads

## Modo Ensino

O modo de ensino permite gravar ações do usuário e criar funcionários automaticamente:

1. **Gravar**: Clique "Iniciar Gravação"
2. **Executar**: Faça os passos da tarefa
3. **Parar**: Clique "Parar e Salvar"
4. **Aprender**: O sistema cria um funcionário com o padrão
