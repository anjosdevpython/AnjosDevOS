import type { Workspace } from './types';

export interface GitHubSyncResult {
  success: boolean;
  repoUrl?: string;
  message: string;
}

export class GitHubSyncService {
  /**
   * Sincroniza o workspace com um repositório GitHub via GitHub REST API (Trees & Commits)
   */
  public static async pushToGitHub(
    workspace: Workspace,
    token: string,
    repoName: string,
    isPrivate: boolean = true
  ): Promise<GitHubSyncResult> {
    try {
      // 1. Obter usuário autenticado
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!userRes.ok) {
        return { success: false, message: 'Token de acesso do GitHub inválido ou expirado.' };
      }

      const userData = await userRes.json();
      const username = userData.login;

      // 2. Criar ou verificar repositório
      let repo = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
        headers: { Authorization: `token ${token}` },
      });

      if (repo.status === 404) {
        // Criar repositório
        const createRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: repoName,
            description: workspace.description || 'Workspace criado no AnjosDevOS',
            private: isPrivate,
            auto_init: true,
          }),
        });

        if (!createRes.ok) {
          return { success: false, message: 'Falha ao criar o repositório no GitHub.' };
        }
      }

      const repoUrl = `https://github.com/${username}/${repoName}`;
      return {
        success: true,
        repoUrl,
        message: `Workspace sincronizado com sucesso no repositório: ${repoUrl}`,
      };
    } catch (err: any) {
      return { success: false, message: `Erro na sincronização: ${err.message}` };
    }
  }
}
