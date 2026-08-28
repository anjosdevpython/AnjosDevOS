# 🤝 Contribuindo para o AnjosDevOS

Obrigado por interesse em contribuir! Este guia explica como participar do projeto.

## 📋 Índice

- [Primeiros Passos](#primeiros-passos)
- [Desenvolvimento](#desenvolvimento)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Padrões de Código](#padrões-de-código)
- [Adicionar Features](#adicionar-features)
- [Pull Requests](#pull-requests)
- [Issues](#issues)
- [Licença](#licença)

---

## Primeiros Passos

### 1. Fork o Repositório

```bash
# No GitHub, clique em "Fork"
# Clone seu fork
git clone https://github.com/SEU_USUARIO/AnjosDevOS.git
cd AnjosDevOS
```

### 2. Configure o Ambiente

```bash
# Instale dependências
npm install

# Copie .env.example para .env.local
cp .env.example .env.local

# Configure suas API keys (opcional para desenvolvimento)
# Edite .env.local com suas chaves
```

### 3. Inicie o Servidor

```bash
npm run dev
```

Acesse http://localhost:3000

---

## Desenvolvimento

### Comandos Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento com hot reload
npm run build    # Build de produção
npm run start    # Iniciar servidor de produção
npm run lint     # Verificação de código (ESLint)
```

### Branches

- `main` - Branch principal (produção)
- `develop` - Branch de desenvolvimento
- `feature/*` - Features novas
- `fix/*` - Correções de bugs
- `docs/*` - Documentação

### Criar Feature Branch

```bash
# Atualize o main
git checkout main
git pull origin main

# Crie feature branch
git checkout -b feature/minha-feature
```

---

## Estrutura do Projeto

```
src/
├── app/                    # Pages e API Routes
├── components/
│   ├── os/                 # Componentes do OS
│   │   ├── apps/          # Apps individuais
│   │   └── ...            # Desktop, Window, Taskbar
│   ├── features/          # Componentes de features
│   ├── mobile/            # Layout mobile
│   └── ui/                # UI reutilizável
├── lib/
│   ├── ai/                # Providers de IA
│   ├── integrations/      # Integrações externas
│   └── tools/             # Ferramentas de dev
├── hooks/                 # Custom hooks
├── config/                # Configurações
└── types/                 # Tipos TypeScript
```

---

## Padrões de Código

### TypeScript

- Use `interface` para objetos, `type` para unions
- Evite `any` - use `unknown` quando necessário
- Prefira tipos explícitos em funções públicas

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Ruim
function getUser(id) {
  // ...
}
```

### React Components

- Use `'use client'` para components interativos
- Prefira function components
- Use hooks para estado e efeitos

```tsx
// ✅ Bom
'use client';

import { useState } from 'react';

export function MeuComponent({ titulo }: { titulo: string }) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{titulo}</h1>
      <p>Contagem: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Incrementar
      </button>
    </div>
  );
}
```

### Imports

- Use path aliases (`@/...`)
- Agrupe imports: externos, internos, componentes, tipos

```typescript
// ✅ Bom
import React from 'react';
import { useState } from 'react';

import { useOS } from '@/components/os/OSContext';
import { Window } from '@/components/os/Window';
import { APP_DEFINITIONS } from '@/components/os/types';
import type { WindowState } from '@/components/os/types';
```

### Estilos

- Use Tailwind CSS
- Prefira classes utilitárias
- Use variáveis CSS para temas

```tsx
// ✅ Bom
<div className="flex items-center gap-2 p-4 bg-cyber-bg text-white">

// ❌ Ruim
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
```

### Naming

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Componente | PascalCase | `MeuComponente` |
| Hook | camelCase com `use` | `useMeuHook` |
| Função | camelCase | `minhaFuncao` |
| Constante | UPPER_SNAKE_CASE | `MINHA_CONSTANTE` |
| Arquivo | PascalCase (componentes) | `MeuComponente.tsx` |
| Arquivo | camelCase (outros) | `minhaFuncao.ts` |

---

## Adicionar Features

### Adicionar Novo App

1. **Crie o componente** em `src/components/os/apps/MeuApp.tsx`:

```tsx
'use client';

export function MeuApp() {
  return (
    <div className="h-full p-4 bg-cyber-bg">
      <h1 className="text-xl font-bold text-neon-green mb-4">
        Meu App
      </h1>
      {/* Conteúdo */}
    </div>
  );
}
```

2. **Registre em `src/components/os/types.ts`**:

```typescript
{
  id: 'meuapp',
  title: 'Meu App',
  iconName: 'Star',
  color: 'neon-green',
  defaultWidth: 800,
  defaultHeight: 600,
  minWidth: 400,
  minHeight: 350,
  desktopIcon: true,
  category: 'tools'
}
```

3. **Adicione ao AppRegistry** em `src/components/os/AppRegistry.tsx`:

```typescript
import { MeuApp } from './apps/MeuApp';

// No switch
case 'meuapp':
  return <MeuApp />;
```

4. **Adicione o ícone** em `Taskbar.tsx`, `DesktopIcons.tsx`, `StartMenu.tsx`:

```typescript
import { Star } from 'lucide-react';

// No ICON_MAP
ICON_MAP['Star'] = Star;
```

### Adicionar Novo Provider de IA

1. **Edite `src/lib/ai/providers.ts`**:

```typescript
export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  // ... existing
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
    apiFormat: 'openai',
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

2. **Adicione o tipo**:

```typescript
export type ProviderId =
  | 'openai'
  // ...
  | 'myprovider';
```

3. **Atualize a UI** em `src/app/settings/page.tsx` se necessário

### Adicionar Nova Skill

1. **Edite `src/lib/tools/tools.ts`**:

```typescript
export const SKILLS: Skill[] = [
  // ... existing
  {
    id: 'my-skill',
    name: 'My Skill',
    description: 'Descrição da skill',
    category: 'development',
    icon: '🆕',
    color: '#ff0000',
    command: '/my-skill',
    inputs: [
      { name: 'input1', type: 'text', placeholder: 'Digite...', required: true }
    ],
    outputs: ['Output esperado'],
    model: 'claude-sonnet-4-20250514',
    tags: ['tag1', 'tag2']
  }
];
```

---

## Pull Requests

### Processo

1. **Crie uma branch** para sua feature/fix
2. **Implemente** as mudanças
3. **Teste** localmente
4. **Commit** com mensagem descritiva
5. **Push** para seu fork
6. **Abra PR** para `main` ou `develop`

### Formato de Commit

```
tipo(escopo): descrição

Corpo opcional com mais detalhes.

Footer opcional com issues referenciadas.
```

**Tipos:**
- `feat` - Nova feature
- `fix` - Correção de bug
- `docs` - Documentação
- `style` - Formatação (sem mudança de código)
- `refactor` - Refatoração
- `test` - Testes
- `chore` - Tarefas de manutenção

**Exemplos:**
```
feat(os): add new Calculator app
fix(chat): fix streaming connection issue
docs(readme): update setup instructions
refactor(providers): extract API client logic
```

### Checklist do PR

- [ ] Código segue os padrões do projeto
- [ ] Não quebra build (`npm run build`)
- [ ] Não tem erros de lint (`npm run lint`)
- [ ] Documentação atualizada (se aplicável)
- [ ] Commit messages são descritivos
- [ ] PR tem título claro

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Nova feature
- [ ] Correção de bug
- [ ] Documentação
- [ ] Refatoração
- [ ] Outro

## Como Testar
1. Passo 1
2. Passo 2
3. Passo 3

## Screenshots (se aplicável)
[Adicionar screenshots]

## Issues Relacionadas
- Fixes #123
- Closes #456
```

---

## Issues

### Reportar Bug

Use o template de bug report:

```markdown
## Descrição do Bug
Descrição clara do problema.

## Passos para Reproduzir
1. Ir para '...'
2. Clicar em '...'
3. Scrollar para '...'
4. Ver erro

## Comportamento Esperado
O que deveria acontecer.

## Screenshots
[Adicionar screenshots se aplicável]

## Ambiente
- OS: [ex: Windows 11]
- Browser: [ex: Chrome 120]
- Node: [ex: 18.17]
```

### Solicitar Feature

Use o template de feature request:

```markdown
## Descrição da Feature
Descrição claca do que você quer.

## Caso de Uso
Por que isso seria útil?

## Solução Proposta
Como você imagina que funcionaria.

## Alternativas Consideradas
Outras formas de resolver.

## Contexto
Informações adicionais.
```

---

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a MIT License.
