# 🤝 Contribuindo para o AnjosDevOS

Obrigado por interesse em contribuir! Este guia explica como participar do projeto.

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
git checkout -b feature/sua-feature
```

---

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
src/
├── components/os/apps/    ← Novos apps vão aqui
├── lib/ai/                ← Providers de IA
├── lib/integrations/      ← Integrações externas
├── lib/agent-orchestration/ ← Sistema de agentes
└── lib/warmwind/          ← Funcionários IA
```

### Criar um Novo App

#### 1. Criar componente

```tsx
// src/components/os/apps/MeuApp.tsx
'use client';

export function MeuApp() {
  return (
    <div className="h-full p-4">
      <h1 className="text-lg font-bold">Meu App</h1>
      {/* Conteúdo do app */}
    </div>
  );
}
```

#### 2. Registrar em types.ts

```ts
// src/components/os/types.ts
{ id: 'meu-app', title: 'Meu App', iconName: 'Star', color: 'neon-blue',
  defaultWidth: 800, defaultHeight: 600, minWidth: 400, minHeight: 300,
  desktopIcon: true, category: 'system' }
```

#### 3. Registrar em AppRegistry.tsx

```tsx
// Import
const MeuApp = dynamic(() => import('./apps/MeuApp').then(m => ({ default: m.MeuApp })), { ssr: false });

// No switch case
case 'meu-app':
  return wrapInBoundary(<MeuApp />, 'Meu App');

// No ICON_COMPONENTS
Star: <Star className="w-4 h-4" />,
```

#### 4. Adicionar ícone nos ICON_MAPs

- `Taskbar.tsx`
- `DesktopIcons.tsx`
- `StartMenu.tsx`

### Criar um Novo Provider de IA

#### 1. Adicionar definição

```ts
// src/lib/ai/providers.ts
export const PROVIDERS: Provider[] = [
  // ... existentes
  {
    id: 'meu-provider',
    name: 'Meu Provider',
    icon: '🤖',
    baseUrl: 'https://api.meuprovider.com/v1',
    format: 'openai',
    models: ['model-1', 'model-2'],
    color: 'neon-blue',
  },
];
```

#### 2. Configurar no settings

O provider aparecerá automaticamente na página de configurações.

### Criar uma Integração

#### 1. Criar arquivo de definição

```ts
// src/lib/integrations/minha-integracao.ts
export interface MinhaIntegracao {
  id: string;
  name: string;
  // ... tipos
}

export const INTEGRACOES: MinhaIntegracao[] = [
  // ... dados
];
```

#### 2. Criar componente de app

```tsx
// src/components/os/apps/MinhaIntegracaoApp.tsx
'use client';
import { INTEGRACOES } from '@/lib/integrations/minha-integracao';

export function MinhaIntegracaoApp() {
  return <div>{/* UI */}</div>;
}
```

---

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ BOM - Tipagem explícita
interface Props {
  title: string;
  count: number;
}

function MeuComponente({ title, count }: Props): ReactNode {
  return <div>{title}: {count}</div>;
}

// ❌ RUIM - Sem tipagem
function MeuComponente(props) {
  return <div>{props.title}: {props.count}</div>;
}
```

### Componentes

```tsx
// ✅ BOM - Componente funcional com hooks
'use client';

import { useState } from 'react';

export function MeuComponente() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}
```

### Estilos

```tsx
// ✅ BOM - Tailwind CSS
<div className="flex items-center gap-2 p-4 bg-surface/50 rounded-xl">

// ❌ RUIM - Estilos inline
<div style={{ display: 'flex', padding: '16px' }}>
```

---

## 🧪 Testes

```bash
# Type checking
npx tsc --noEmit

# Build
npm run build

# Lint
npm run lint
```

---

## 📋 Template de Commit

```
tipo(escopo): descrição curta

Descrição mais detalhada se necessário.

🤖 Generated with Codebuff
Co-Authored-By: Codebuff <noreply@codebuff.com>
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### Exemplos

```
feat(chat): adicionar suporte a Claude
fix(file-explorer): corrigir navegação em pastas vazias
docs: atualizar README com novos apps
refactor(providers): simplificar lógica de fallback
```

---

## 🔀 Pull Request

1. Manter a branch atualizada:
```bash
git fetch upstream
git rebase upstream/master
```

2. Push das alterações:
```bash
git push origin feature/sua-feature
```

3. Abrir PR com:
- Título descritivo
- Descrição do que foi feito
- Screenshots se aplicável
- Checklist de verificação

### Checklist do PR

- [ ] `npx tsc --noEmit` passa
- [ ] `npm run build` passa
- [ ] Código segue os padrões do projeto
- [ ] Documentação atualizada se necessário
- [ ] Commit messages seguem o padrão

---

## 🐛 Reportar Bugs

1. Verificar se o bug já foi reportado
2. Criar issue com:
- Título descritivo
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots se possível
- Versão do Node.js e navegador

---

## 💡 Sugerir Funcionalidades

1. Criar issue com label "enhancement"
2. Descrever:
- Problema que resolve
- Como resolveria
- Prioridade (alta/média/baixa)

---

## 📞 Contato

- **Issues**: https://github.com/anjosdevpython/AnjosDevOS/issues
- **Discussions**: https://github.com/anjosdevpython/AnjosDevOS/discussions
- **Email**: allan@allananjos.dev.br

---

> Obrigado por contribuir! 🚀
