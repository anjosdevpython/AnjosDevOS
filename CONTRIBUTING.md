# 🤝 Contribuindo para o AnjosDevOS

Obrigado pelo seu interesse em contribuir para o **AnjosDevOS**! Este guia explica como desenvolver, testar e criar novos aplicativos, agentes autônomos e nós de automação.

---

## 📋 Primeiros Passos

### 1. Fork e Clone

```bash
# Fork no GitHub, depois clone
git clone https://github.com/SEU_USUARIO/AnjosDevOS.git
cd AnjosDevOS

# Adicionar remote upstream
git remote add upstream https://github.com/anjosdevpython/AnjosDevOS.git
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Criar Branch

```bash
git checkout -b feature/minha-feature
```

---

## 🧠 Como Adicionar um Novo Agente ao Enxame (`SwarmEngine`)

Para registrar um novo especialista autônomo:

1. Abra `src/lib/agent-swarm/agent-specialists.ts`.
2. Adicione uma nova definição ao array `SWARM_SPECIALISTS`:

```typescript
{
  id: 'anjos-security-ninja',
  name: 'AnjosSecNinja',
  role: 'reviewer',
  title: 'Especialista em Pentesting e Zero-Days',
  avatar: '🥷',
  color: '#e11d48',
  badge: 'SEC-OPS',
  systemPrompt: `Você é o AnjosSecNinja. Sua missão é caçar vulnerabilidades avançadas...`,
  model: 'claude-sonnet-4-20250514',
  skills: ['Pentesting', 'Fuzzing', 'SAST/DAST', 'Zero-Day Audit'],
  tools: ['vulnerability_scanner', 'payload_tester'],
  status: 'idle',
  tasksCompleted: 0,
  rating: 100,
}
```

3. O `SwarmEngine` carregará o agente automaticamente no barramento de eventos.

---

## ⚡ Como Adicionar Nós ao Automation Studio

1. Abra `src/components/os/apps/AutomationStudioApp.tsx`.
2. Adicione o template do nó em `TRIGGER_TEMPLATES` ou `ACTION_TEMPLATES`:

```typescript
const ACTION_TEMPLATES = [
  // ...
  { label: 'Meu Nó Customizado', icon: '💎', desc: 'Executa transformação de dados' },
];
```

---

## 🖥️ Como Criar um Novo App no Sistema Operacional

1. Crie o componente em `src/components/os/apps/MeuApp.tsx`.
2. Registre a definição em `src/components/os/types.ts` (`APP_DEFINITIONS`).
3. Registre o lazy loading em `src/components/os/AppRegistry.tsx`.
4. Adicione o ícone correspondente no `Taskbar.tsx`, `DesktopIcons.tsx` e `StartMenu.tsx`.

---

## 🧪 Validação e Testes

Antes de submeter o seu Pull Request, execute:

```bash
# Checagem estrita de tipos TypeScript
npx tsc --noEmit

# Build de produção do Next.js
npm run build
```

---

## 📬 Padrões de Commit

Recomendamos o uso de [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

- `feat(swarm): adiciona novo especialista em performance`
- `fix(editor): corrige cursor no Monaco ao aplicar auto-patch`
- `docs: atualiza manual de automação e colaboração`

---

> Desenvolvido com 💙 por [Allan Anjos](https://allananjos.dev.br)
