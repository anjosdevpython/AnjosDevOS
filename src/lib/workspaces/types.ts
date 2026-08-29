export interface WorkspaceFile {
  path: string;
  content: string;
  isDir?: boolean;
  updatedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  template?: 'empty' | 'node' | 'react' | 'ai-swarm' | 'python';
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
  files: Record<string, string>; // path -> content
  activeFilePath?: string;
  openTabs?: string[];
  cursorPosition?: { lineNumber: number; column: number };
  terminalHistory?: string[];
}

export interface WorkspaceSnapshot {
  id: string;
  workspaceId: string;
  timestamp: number;
  message: string;
  files: Record<string, string>;
}
