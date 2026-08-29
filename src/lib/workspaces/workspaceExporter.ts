import JSZip from 'jszip';
import type { Workspace } from './types';
import { WorkspaceRepository } from './workspaceRepository';

export class WorkspaceExporter {
  /**
   * Compacta todos os arquivos do Workspace em um arquivo ZIP
   */
  public static async exportToZip(workspace: Workspace): Promise<Blob> {
    const zip = new JSZip();

    for (const [filePath, content] of Object.entries(workspace.files || {})) {
      zip.file(filePath, content);
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Baixa o arquivo ZIP do workspace diretamente no navegador
   */
  public static async downloadZip(workspace: Workspace): Promise<void> {
    if (typeof window === 'undefined') return;

    const blob = await this.exportToZip(workspace);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-workspace.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Importa um arquivo ZIP para criar um novo Workspace
   */
  public static async importFromZip(file: File, customName?: string): Promise<Workspace> {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    const files: Record<string, string> = {};

    for (const [filename, fileObj] of Object.entries(loadedZip.files)) {
      if (!fileObj.dir) {
        files[filename] = await fileObj.async('string');
      }
    }

    const name = customName || file.name.replace(/\.zip$/i, '');
    const ws = await WorkspaceRepository.createWorkspace(name, 'empty', `Importado de ${file.name}`);
    await WorkspaceRepository.updateWorkspace(ws.id, { files });

    return { ...ws, files };
  }
}
