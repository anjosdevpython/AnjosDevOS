import { db } from './db';
import type { Workspace, WorkspaceSnapshot } from './types';

const ACTIVE_WORKSPACE_KEY = 'anjosdev_active_workspace_id';

const STARTER_TEMPLATES: Record<string, Record<string, string>> = {
  'ai-swarm': {
    'src/index.ts': `// AnjosDevOS — AI Swarm Application
import { getSwarmEngine } from '@/lib/agent-swarm';

async function main() {
  console.log("⚡ Inicializando AnjosDevOS Swarm Engine...");
  const swarm = getSwarmEngine();
  console.log("👥 7 Agentes Especialistas prontos para colaborar.");
}

main().catch(console.error);
`,
    'src/agent-task.ts': `export interface TaskConfig {
  goal: string;
  leadAgent: 'AnjosArchitect' | 'AnjosCoder';
  securityAudit: boolean;
}

export const task: TaskConfig = {
  goal: "Construir API REST com autenticação JWT e validação Zod",
  leadAgent: "AnjosArchitect",
  securityAudit: true
};
`,
    'package.json': JSON.stringify(
      {
        name: 'anjosdev-swarm-project',
        version: '1.0.0',
        main: 'src/index.ts',
        scripts: {
          start: 'node src/index.ts',
          test: 'vitest run',
        },
      },
      null,
      2
    ),
    'README.md': `# AnjosDevOS Swarm Project
Projeto inicial integrado ao enxame de agentes de codificação e automação.
`,
  },
  node: {
    'index.js': `const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Servidor AnjosDevOS rodando com sucesso!',
    timestamp: new Date().toISOString(),
    status: 'online'
  }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(\`🚀 Servidor HTTP rodando na porta \${PORT}\`);
});
`,
    'package.json': JSON.stringify(
      {
        name: 'nodejs-api',
        version: '1.0.0',
        main: 'index.js',
        scripts: {
          start: 'node index.js',
        },
      },
      null,
      2
    ),
    'README.md': '# Node.js Server\nProjeto Node.js self-contained.\n',
  },
  react: {
    'src/App.tsx': `export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>✨ AnjosDevOS React App</h1>
      <p>Desenvolvimento ágil com agentes de IA em tempo real.</p>
    </div>
  );
}
`,
    'package.json': JSON.stringify(
      {
        name: 'react-app',
        version: '1.0.0',
        scripts: {
          start: 'vite',
          build: 'vite build',
        },
      },
      null,
      2
    ),
  },
};

export class WorkspaceRepository {
  static async getAllWorkspaces(): Promise<Workspace[]> {
    try {
      const workspaces = await db.workspaces.orderBy('lastOpenedAt').reverse().toArray();
      if (workspaces.length === 0) {
        // Criar workspace padrão inicial se não existir nenhum
        const defaultWs = await this.createWorkspace('Meu Projeto Principal', 'ai-swarm', 'Workspace padrão com Swarm Engine');
        return [defaultWs];
      }
      return workspaces;
    } catch (e) {
      console.warn('Falha ao ler IndexedDB, fallback para memória:', e);
      return [];
    }
  }

  static async getWorkspace(id: string): Promise<Workspace | null> {
    try {
      const ws = await db.workspaces.get(id);
      return ws || null;
    } catch (e) {
      console.error(`Erro ao buscar workspace ${id}:`, e);
      return null;
    }
  }

  static async createWorkspace(
    name: string,
    template: 'empty' | 'node' | 'react' | 'ai-swarm' = 'ai-swarm',
    description: string = 'Workspace AnjosDevOS'
  ): Promise<Workspace> {
    const id = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = Date.now();
    const files = STARTER_TEMPLATES[template] || {
      'src/index.ts': '// Inicie seu código aqui\nconsole.log("Olá do AnjosDevOS!");\n',
      'README.md': `# ${name}\nWorkspace criado em ${new Date().toLocaleDateString('pt-BR')}\n`,
    };

    const firstFile = Object.keys(files)[0] || 'src/index.ts';

    const workspace: Workspace = {
      id,
      name,
      description,
      template,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      files,
      activeFilePath: firstFile,
      openTabs: [firstFile],
      cursorPosition: { lineNumber: 1, column: 1 },
      terminalHistory: [],
    };

    try {
      await db.workspaces.put(workspace);
      this.setActiveWorkspaceId(id);
    } catch (e) {
      console.warn('Erro ao salvar no Dexie:', e);
    }

    return workspace;
  }

  static async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<void> {
    try {
      await db.workspaces.update(id, {
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.error(`Erro ao atualizar workspace ${id}:`, e);
    }
  }

  static async saveFile(workspaceId: string, filePath: string, content: string): Promise<void> {
    const ws = await this.getWorkspace(workspaceId);
    if (!ws) return;

    const files = { ...ws.files, [filePath]: content };
    await this.updateWorkspace(workspaceId, { files });
  }

  static async deleteFile(workspaceId: string, filePath: string): Promise<void> {
    const ws = await this.getWorkspace(workspaceId);
    if (!ws) return;

    const files = { ...ws.files };
    delete files[filePath];

    const openTabs = ws.openTabs?.filter((tab) => tab !== filePath) || [];
    const activeFilePath = ws.activeFilePath === filePath ? openTabs[0] || Object.keys(files)[0] || '' : ws.activeFilePath;

    await this.updateWorkspace(workspaceId, { files, openTabs, activeFilePath });
  }

  static async deleteWorkspace(id: string): Promise<void> {
    try {
      await db.workspaces.delete(id);
      if (this.getActiveWorkspaceId() === id) {
        const remaining = await db.workspaces.toArray();
        if (remaining.length > 0) {
          this.setActiveWorkspaceId(remaining[0].id);
        } else {
          localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
        }
      }
    } catch (e) {
      console.error(`Erro ao deletar workspace ${id}:`, e);
    }
  }

  static getActiveWorkspaceId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  }

  static setActiveWorkspaceId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
  }
}
