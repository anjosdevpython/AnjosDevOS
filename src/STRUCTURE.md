# AnjosDevOS — Estrutura Completa do Projeto

## Visão Geral dos Diretórios

```
src/
├── app/                        # Next.js App Router (Páginas e APIs)
│   ├── api/                   # Rotas de API (chat, models, images, health)
│   ├── chat/                  # Página dedicada do Chat IA
│   ├── editor/                # Página do Editor Monaco
│   ├── images/                # Página de Geração de Imagens
│   ├── settings/              # Configurações do Sistema e Provedores
│   ├── layout.tsx             # Root Layout com metadados e ícones
│   ├── page.tsx               # Desktop Principal com alternância de tema
│   └── globals.css            # Estilos globais e temas Cyberpunk/iOS
│
├── components/                # Componentes React do Sistema Operacional
│   ├── features/              # Componentes de funcionalidades (chat, editor)
│   ├── ios/                   # Modo iOS (HomeScreen, Dock, StatusBar, Dynamic Island)
│   ├── mobile/                # Modo Mobile com suporte a gestos touch
│   ├── os/                    # Núcleo do Sistema Operacional
│   │   ├── apps/              # 27 Aplicações Nativas
│   │   │   ├── CodeEditorApp.tsx         # Monaco IDE com IA Swarm Integrada
│   │   │   ├── AutomationStudioApp.tsx   # Builder Visual de Fluxos & Execução
│   │   │   ├── AgentTeamsApp.tsx         # Painel de Enxame e Feed Inter-Agentes
│   │   │   ├── AgentOrchestratorApp.tsx  # Orquestrador de Raciocínio
│   │   │   ├── TerminalApp.tsx           # Shell com comandos de agentes
│   │   │   ├── AboutApp.tsx              # Informações e Logo Oficial
│   │   │   └── ...
│   │   ├── BootScreen.tsx     # Tela de boot com a logo oficial e efeitos de glow
│   │   ├── Desktop.tsx        # Gerenciador de janelas e ícones
│   │   ├── StartMenu.tsx      # Menu Iniciar com categorias
│   │   ├── Taskbar.tsx        # Barra de tarefas com miniatura da logo
│   │   └── OSContext.tsx      # Estado global do SO
│   └── ui/                    # Componentes UI reutilizáveis
│
├── lib/                       # Bibliotecas e Motores Centrais
│   ├── agent-swarm/           # 🧠 MOTOR DE ENXAME DE AGENTES AUTÔNOMOS
│   │   ├── types.ts           # Tipos TypeScript de agentes, mensagens e auditoria
│   │   ├── agent-specialists.ts # Definição dos 7 especialistas
│   │   ├── collaboration-protocols.ts # Protocolos de cooperação e auditoria OWASP
│   │   ├── swarm-engine.ts    # Motor central de execução e barramento
│   │   └── index.ts           # Ponto de entrada do módulo
│   ├── agent-orchestration/   # Orquestração e aprendizado de workflows
│   ├── ai/                    # Conectores de provedores de IA e modelos
│   ├── integrations/          # Integrações com DevTools e IDEs
│   ├── tools/                 # Registro de skills e ferramentas
│   └── utils.ts               # Funções utilitárias
│
├── config/                    # Configurações globais
│   └── app.ts                 # Constantes do AnjosDevOS
│
├── hooks/                     # Custom React Hooks (useDevice, etc.)
│
├── types/                     # Definições TypeScript globais
│
└── public/                    # Ativos Estáticos
    ├── logo.png               # Logo oficial AnjosDevOS
    ├── anjosdevos-logo.png    # Variante em alta resolução
    ├── icon-192.png           # Ícone PWA 192x192
    ├── icon-512.png           # Ícone PWA 512x512
    ├── favicon.png            # Favicon oficial
    └── manifest.json          # Manifesto de Web App
```
