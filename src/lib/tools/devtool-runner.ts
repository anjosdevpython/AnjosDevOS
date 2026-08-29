/**
 * DevTool Runner — Launch tools in terminal, browser, or editor
 * Connects DevToolsHub catalog to real actions in the OS
 */

export type DevToolAction = 'terminal' | 'browser' | 'editor' | 'info';

export interface DevToolLaunchConfig {
  toolId: string;
  action: DevToolAction;
  command?: string;
  url?: string;
  editorConfig?: string;
}

const TOOL_CONFIGS: Record<string, {
  installCmd: string;
  runCmd: string;
  docsUrl: string;
  repoUrl: string;
  editorConfigSnippet?: string;
}> = {
  'continue': {
    installCmd: 'code --install-extension Continue.continue',
    runCmd: 'npx continue --version',
    docsUrl: 'https://continue.dev/docs',
    repoUrl: 'https://github.com/continuedev/continue',
    editorConfigSnippet: JSON.stringify({
      "models": [{ "title": "AnjosDevOS", "provider": "openai", "model": "gpt-4o" }],
      "tabAutocompleteModel": { "title": "Autocomplete", "provider": "ollama", "model": "starcoder2:3b" }
    }, null, 2),
  },
  'aider': {
    installCmd: 'pip install aider-chat',
    runCmd: 'aider --help',
    docsUrl: 'https://aider.chat/docs',
    repoUrl: 'https://github.com/Aider-AI/aider',
  },
  'cline': {
    installCmd: 'code --install-extension saoudrizwan.claude-dev',
    runCmd: 'echo "Cline instalado via extensao VS Code"',
    docsUrl: 'https://cline.bot',
    repoUrl: 'https://github.com/cline/cline',
  },
  'openclaw': {
    installCmd: 'npm install -g @openclaw/cli',
    runCmd: 'openclaw --version',
    docsUrl: 'https://openclaw.ai/docs',
    repoUrl: 'https://github.com/openclaw/openclaw',
  },
  'cursor': {
    installCmd: 'echo "Baixe em https://cursor.sh"',
    runCmd: 'cursor --version',
    docsUrl: 'https://cursor.sh',
    repoUrl: 'https://cursor.sh',
  },
  'windsurf': {
    installCmd: 'echo "Baixe em https://windsurf.com"',
    runCmd: 'windsurf --version',
    docsUrl: 'https://windsurf.com',
    repoUrl: 'https://windsurf.com',
  },
  'copilot': {
    installCmd: 'code --install-extension GitHub.copilot',
    runCmd: 'echo "GitHub Copilot instalado como extensao VS Code"',
    docsUrl: 'https://github.com/features/copilot',
    repoUrl: 'https://github.com/features/copilot',
  },
  'codium': {
    installCmd: 'code --install-extension Codium.codium',
    runCmd: 'echo "Codium instalado"',
    docsUrl: 'https://codeium.com',
    repoUrl: 'https://github.com/Exafunction/codeium',
  },
  'tabby': {
    installCmd: 'docker run -it --gpus all -p 8080:8080 tabbyml/tabby serve --model TabbyML/StarCoder-1B',
    runCmd: 'curl http://localhost:8080/v1/health',
    docsUrl: 'https://tabby.tabbyml.com',
    repoUrl: 'https://github.com/TabbyML/tabby',
  },
};

export class DevToolRunner {
  /**
   * Gera o comando de instalacao para rodar no terminal do AnjosDevOS
   */
  static getInstallCommand(toolId: string): string {
    return TOOL_CONFIGS[toolId]?.installCmd ?? `echo "Sem comando de instalacao para ${toolId}"`;
  }

  /**
   * Gera o comando de execucao/verificacao
   */
  static getRunCommand(toolId: string): string {
    return TOOL_CONFIGS[toolId]?.runCmd ?? `echo "${toolId} instalado"`;
  }

  /**
   * Retorna URL de documentacao
   */
  static getDocsUrl(toolId: string): string {
    return TOOL_CONFIGS[toolId]?.docsUrl ?? `https://github.com/search?q=${toolId}`;
  }

  /**
   * Retorna URL do repositorio
   */
  static getRepoUrl(toolId: string): string {
    return TOOL_CONFIGS[toolId]?.repoUrl ?? `https://github.com/search?q=${toolId}`;
  }

  /**
   * Retorna snippet de configuracao para o editor (se disponivel)
   */
  static getEditorConfig(toolId: string): string | undefined {
    return TOOL_CONFIGS[toolId]?.editorConfigSnippet;
  }

  /**
   * Verifica status da ferramenta no localStorage
   */
  static getStatus(toolId: string): 'installed' | 'available' | 'running' {
    if (typeof window === 'undefined') return 'available';
    const installed = JSON.parse(localStorage.getItem('devtools_installed') ?? '[]') as string[];
    return installed.includes(toolId) ? 'installed' : 'available';
  }

  /**
   * Marca uma ferramenta como instalada no localStorage
   */
  static markAsInstalled(toolId: string): void {
    if (typeof window === 'undefined') return;
    const installed = JSON.parse(localStorage.getItem('devtools_installed') ?? '[]') as string[];
    if (!installed.includes(toolId)) {
      installed.push(toolId);
      localStorage.setItem('devtools_installed', JSON.stringify(installed));
    }
  }
}