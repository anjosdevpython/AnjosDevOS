# 🖥️ OS Components

> Sistema operacional web com desktop, janelas e apps.

## Visão Geral

O sistema OS simula um ambiente de desktop completo com:
- Desktop com ícones
- Sistema de janelas (mover, redimensionar, minimizar, maximizar)
- Taskbar com apps abertos
- Start Menu
- Boot screen animada

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│  OSProvider (Context)                                │
│  ┌─────────────────────────────────────────────────┐│
│  │  Desktop                                         ││
│  │  ┌───────────┬───────────────┬─────────────────┐││
│  │  │ Desktop   │   Windows     │   Taskbar       │││
│  │  │ Icons     │   (drag/resize│   (app list)    │││
│  │  │           │    minimize/  │                  │││
│  │  │           │    maximize)  │                  │││
│  │  └───────────┴───────────────┴─────────────────┘││
│  │  ┌─────────────────────────────────────────────┐││
│  │  │  Start Menu (overlay)                       │││
│  │  └─────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## Arquivos

### `OSContext.tsx`

Context provider que gerencia todo o estado do OS.

```typescript
import { useOS } from '@/components/os/OSContext';

const {
  windows,           // Array de janelas abertas
  activeWindowId,    // ID da janela ativa
  isStartMenuOpen,   // Menu iniciar aberto?
  isBooted,          // OS inicializado?
  openApp,           // Abrir app
  closeWindow,       // Fechar janela
  minimizeWindow,    // Minimizar janela
  toggleMaximize,    // Maximizar/restaurar
  focusWindow,       // Focar janela
  moveWindow,        // Mover janela
  resizeWindow,      // Redimensionar janela
  setStartMenuOpen,  // Abrir/fechar menu
  setBooted,         // Marcar como inicializado
  getAppDef          // Obter definição do app
} = useOS();
```

### `Desktop.tsx`

Componente principal que renderiza o desktop.

```tsx
// Renderiza:
// - BootScreen (se não inicializado)
// - DesktopIcons
// - Windows (iterando sobre windows[])
// - Taskbar
// - StartMenu
```

### `Window.tsx`

Janela arrastável e redimensionável.

```tsx
<Window
  windowState={win}
  icon={IconComponent}
  iconColor="text-neon-green"
>
  <MeuApp />
</Window>
```

**Features:**
- Arrastar pelo título
- Redimensionar pelas bordas
- Botões: minimizar, maximizar, fechar
- Z-index management
- Snapshot de bounds antes de maximizar

### `Taskbar.tsx`

Barra de tarefas inferior.

```tsx
// Renderiza:
// - Botão Iniciar
// - Lista de apps abertos
// - Relógio
// - Indicadores (WiFi, bateria)
```

### `StartMenu.tsx`

Menu iniciar com lista de todos os apps.

```tsx
// Renderiza:
// - Header com nome do OS
// - Lista de apps por categoria
// - Busca (opcional)
```

### `BootScreen.tsx`

Tela de inicialização animada.

```tsx
// Animação de boot com:
// - Logo
// - Barra de progresso
// - Mensagens de carregamento
```

### `DesktopIcons.tsx`

Grid de ícones no desktop.

```tsx
// Renderiza:
// - Ícones de apps com desktopIcon: true
// - Duplo clique para abrir
```

### `AppRegistry.tsx`

Mapeamento de app ID para componente.

```typescript
import { getAppContent, ICON_COMPONENTS } from '@/components/os/AppRegistry';

// Obter conteúdo do app
const content = getAppContent('chat');

// Obter componente de ícone
const Icon = ICON_COMPONENTS['MessageSquare'];
```

### `types.ts`

Tipos e definições de apps.

```typescript
import { WindowState, AppDefinition, APP_DEFINITIONS } from '@/components/os/types';

// Tipo de janela
interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  prevBounds?: { x: number; y: number; width: number; height: number };
}

// Definição de app
interface AppDefinition {
  id: string;
  title: string;
  iconName: string;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  desktopIcon: boolean;
  category: 'ai' | 'tools' | 'system';
}

// Todos os apps definidos
const APP_DEFINITIONS: AppDefinition[] = [...];
```

## Apps Disponíveis

### 🤖 AI Apps

| ID | Título | Ícone | Cor |
|----|--------|-------|-----|
| `chat` | Chat IA | MessageSquare | neon-green |
| `images` | Gerador de Imagens | Image | neon-blue |
| `editor` | Editor de Imagens | Paintbrush | neon-purple |
| `video` | Gerador de Vídeo | Video | neon-red |
| `music` | Gerador de Música | Music | neon-yellow |
| `tts` | Text-to-Speech | Mic | cyan-400 |
| `audio` | Efeitos Sonoros | AudioLines | orange-400 |

### 💻 System Apps

| ID | Título | Ícone | Cor |
|----|--------|-------|-----|
| `codeeditor` | Code Editor | FileCode | neon-blue |
| `fileexplorer` | Explorador | Folder | neon-yellow |
| `terminal` | Terminal | Terminal | neon-green |
| `tools` | AI Tools | Wrench | neon-green |
| `devtools-hub` | DevTools Hub | Blocks | neon-purple |
| `openhands` | OpenHands | Hand | neon-orange |
| `theia` | Theia IDE | Diamond | neon-blue |
| `deepseek-harness` | DeepSeek Harness | Sparkles | neon-blue |
| `settings` | Configurações | Settings | text-secondary |
| `about` | Sobre o Sistema | Info | neon-blue |

## Criar Novo App

### 1. Criar Componente

```tsx
// src/components/os/apps/MeuApp.tsx
'use client';

export function MeuApp() {
  return (
    <div className="h-full p-4 bg-cyber-bg">
      <h1 className="text-xl font-bold text-neon-green mb-4">
        Meu App
      </h1>
      {/* Conteúdo do app */}
    </div>
  );
}
```

### 2. Registrar em types.ts

```typescript
// Adicionar ao array APP_DEFINITIONS
{
  id: 'meuapp',
  title: 'Meu App',
  iconName: 'Star', // nome do ícone Lucide
  color: 'neon-green',
  defaultWidth: 800,
  defaultHeight: 600,
  minWidth: 400,
  minHeight: 350,
  desktopIcon: true,
  category: 'tools'
}
```

### 3. Registrar em AppRegistry.tsx

```typescript
// Adicionar case no switch
case 'meuapp':
  return <MeuApp />;

// Adicionar ícone no ICON_MAP
import { Star } from 'lucide-react';
ICON_COMPONENTS['Star'] = Star;
```

### 4. Adicionar Ícone

Em cada arquivo, adicionar ao ICON_MAP:

```typescript
// Taskbar.tsx
import { Star } from 'lucide-react';
ICON_MAP['Star'] = Star;

// DesktopIcons.tsx
import { Star } from 'lucide-react';
ICON_MAP['Star'] = Star;

// StartMenu.tsx
import { Star } from 'lucide-react';
ICON_MAP['Star'] = Star;
```

## Gerenciamento de Janelas

### Abrir App

```typescript
const { openApp } = useOS();

// Abre o app (ou foca se já aberto)
openApp('chat');
```

### Fechar Janela

```typescript
const { closeWindow } = useOS();

closeWindow('window-1234567890-1');
```

### Minimizar

```typescript
const { minimizeWindow } = useOS();

minimizeWindow('window-1234567890-1');
```

### Maximizar/Restaurar

```typescript
const { toggleMaximize } = useOS();

// Alterna entre maximizado e tamanho anterior
toggleMaximize('window-1234567890-1');
```

### Focar Janela

```typescript
const { focusWindow } = useOS();

// Trai para frente e foca
focusWindow('window-1234567890-1');
```

### Mover Janela

```typescript
const { moveWindow } = useOS();

moveWindow('window-1234567890-1', 100, 200);
```

### Redimensionar

```typescript
const { resizeWindow } = useOS();

// Respeita minWidth e minHeight
resizeWindow('window-1234567890-1', 800, 600);
```

## Estilos

### Cores Neon

```css
/* Definidas em globals.css */
.neon-green { color: #00ff88; }
.neon-blue { color: #00d4ff; }
.neon-purple { color: #a855f7; }
.neon-red { color: #ff4444; }
.neon-yellow { color: #ffcc00; }
.neon-orange { color: #ff8800; }
```

### Background

```css
.bg-cyber-bg { background: #0a0a0f; }
.bg-grid-pattern { 
  background-image: 
    linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
```
