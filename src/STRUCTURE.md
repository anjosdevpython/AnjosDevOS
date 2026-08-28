# AnjosDevOS Project Structure

## Directory Overview

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── chat/              # Chat page
│   ├── images/            # Image generation page
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── ui/                # Reusable UI components (Button, Input, Modal, etc.)
│   ├── layout/            # Layout components (Desktop, Taskbar, StartMenu)
│   ├── features/          # Feature-specific components
│   │   ├── chat/          # Chat-related components
│   │   ├── editor/        # Code editor components
│   │   ├── explorer/      # File explorer components
│   │   └── tools/         # AI tools components
│   ├── mobile/            # Mobile-specific components
│   └── os/                # OS core components
│       ├── apps/          # Individual app components
│       └── ...
│
├── config/                # Configuration files
│   └── app.ts            # App configuration constants
│
├── hooks/                 # Custom React hooks
│   ├── useDevice.ts      # Device detection hook
│   └── ...
│
├── lib/                   # Utility libraries
│   ├── ai/                # AI providers and models
│   │   ├── providers.ts   # Provider definitions
│   │   ├── provider-config.ts  # Provider configuration
│   │   ├── models.ts      # Model definitions
│   │   └── api-client.ts  # API client
│   ├── integrations/      # External integrations
│   │   ├── deepseek-harness.ts
│   │   ├── openhands.ts
│   │   └── theia.ts
│   ├── tools/             # Developer tools
│   │   ├── tools.ts       # Tools registry
│   │   └── devtools.ts    # DevTools registry
│   └── utils.ts           # General utilities
│
├── types/                 # TypeScript type definitions
│   └── index.ts           # Centralized types
│
└── public/                # Static assets
    ├── manifest.json      # PWA manifest
    └── ...
```

## Import Paths

The project uses TypeScript path aliases for clean imports:

```typescript
// Instead of relative paths like:
import { providers } from '../../../lib/ai/providers';

// Use path aliases:
import { providers } from '@/lib/ai/providers';
import { Button } from '@/components/ui/Button';
import { useDevice } from '@/hooks/useDevice';
import { APP_CONFIG } from '@/config/app';
```

## Module Organization

### AI Module (`lib/ai/`)
- `providers.ts` - Provider definitions (OpenAI, Anthropic, etc.)
- `provider-config.ts` - Provider configuration and settings
- `models.ts` - Model definitions and metadata
- `api-client.ts` - API client for all providers

### Integrations Module (`lib/integrations/`)
- `deepseek-harness.ts` - DeepSeek Harness integration
- `openhands.ts` - OpenHands integration
- `theia.ts` - Theia IDE integration

### Tools Module (`lib/tools/`)
- `tools.ts` - AI tools and skills registry
- `devtools.ts` - Developer tools registry

### Components (`components/`)
- `ui/` - Reusable, generic UI components
- `layout/` - Layout and navigation components
- `features/` - Feature-specific components
- `mobile/` - Mobile-optimized components
- `os/` - Core OS components

## Adding New Features

1. **New AI Provider**: Add to `lib/ai/providers.ts`
2. **New Integration**: Create new file in `lib/integrations/`
3. **New Tool**: Add to `lib/tools/tools.ts` or `devtools.ts`
4. **New App**: Create component in `components/os/apps/` and register in `types.ts`
5. **New UI Component**: Add to `components/ui/`
6. **New Hook**: Add to `hooks/`

## Best Practices

1. **Imports**: Always use path aliases (`@/...`)
2. **Types**: Import from `@/types` when possible
3. **Config**: Use values from `@/config/app`
4. **Components**: Keep components small and focused
5. **Hooks**: Extract reusable logic into custom hooks
6. **Exports**: Use named exports for better tree-shaking
