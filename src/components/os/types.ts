import { ReactNode } from 'react';

export interface WindowState {
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
  // stored pre-maximize bounds to restore
  prevBounds?: { x: number; y: number; width: number; height: number };
}

export interface AppDefinition {
  id: string;
  title: string;
  iconName: string; // lucide icon name for reference
  color: string; // tailwind color like 'neon-green'
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  desktopIcon: boolean;
  category: 'ai' | 'tools' | 'system';
}

export const APP_DEFINITIONS: AppDefinition[] = [
  { id: 'chat', title: 'Chat IA', iconName: 'MessageSquare', color: 'neon-green', defaultWidth: 800, defaultHeight: 600, minWidth: 400, minHeight: 350, desktopIcon: true, category: 'ai' },
  { id: 'images', title: 'Gerador de Imagens', iconName: 'Image', color: 'neon-blue', defaultWidth: 850, defaultHeight: 650, minWidth: 500, minHeight: 400, desktopIcon: true, category: 'ai' },
  { id: 'editor', title: 'Editor de Imagens', iconName: 'Paintbrush', color: 'neon-purple', defaultWidth: 900, defaultHeight: 600, minWidth: 500, minHeight: 400, desktopIcon: true, category: 'ai' },
  { id: 'video', title: 'Gerador de Vídeo', iconName: 'Video', color: 'neon-red', defaultWidth: 600, defaultHeight: 550, minWidth: 400, minHeight: 350, desktopIcon: true, category: 'ai' },
  { id: 'music', title: 'Gerador de Música', iconName: 'Music', color: 'neon-yellow', defaultWidth: 600, defaultHeight: 550, minWidth: 400, minHeight: 350, desktopIcon: true, category: 'ai' },
  { id: 'tts', title: 'Text-to-Speech', iconName: 'Mic', color: 'cyan-400', defaultWidth: 600, defaultHeight: 500, minWidth: 400, minHeight: 300, desktopIcon: true, category: 'ai' },
  { id: 'audio', title: 'Efeitos Sonoros', iconName: 'AudioLines', color: 'orange-400', defaultWidth: 600, defaultHeight: 500, minWidth: 400, minHeight: 300, desktopIcon: false, category: 'ai' },
  { id: 'devtools-hub', title: 'DevTools Hub', iconName: 'Blocks', color: 'neon-purple', defaultWidth: 1200, defaultHeight: 800, minWidth: 800, minHeight: 500, desktopIcon: true, category: 'system' },
  { id: 'openhands', title: 'OpenHands', iconName: 'Hand', color: 'neon-orange', defaultWidth: 1100, defaultHeight: 700, minWidth: 600, minHeight: 450, desktopIcon: true, category: 'system' },
  { id: 'theia', title: 'Theia IDE', iconName: 'Diamond', color: 'neon-blue', defaultWidth: 1200, defaultHeight: 800, minWidth: 800, minHeight: 500, desktopIcon: true, category: 'system' },
  { id: 'deepseek-harness', title: 'DeepSeek Harness', iconName: 'Sparkles', color: 'neon-blue', defaultWidth: 1100, defaultHeight: 700, minWidth: 600, minHeight: 450, desktopIcon: true, category: 'system' },
  { id: 'codeeditor', title: 'Code Editor', iconName: 'FileCode', color: 'neon-blue', defaultWidth: 1000, defaultHeight: 700, minWidth: 600, minHeight: 450, desktopIcon: true, category: 'system' },
  { id: 'tools', title: 'AI Tools', iconName: 'Wrench', color: 'neon-green', defaultWidth: 1000, defaultHeight: 700, minWidth: 600, minHeight: 450, desktopIcon: true, category: 'system' },
  { id: 'fileexplorer', title: 'Explorador', iconName: 'Folder', color: 'neon-yellow', defaultWidth: 900, defaultHeight: 600, minWidth: 500, minHeight: 400, desktopIcon: true, category: 'system' },
  { id: 'terminal', title: 'Terminal', iconName: 'Terminal', color: 'neon-green', defaultWidth: 700, defaultHeight: 450, minWidth: 400, minHeight: 250, desktopIcon: true, category: 'system' },
  { id: 'balance', title: 'Saldo & Uso', iconName: 'Wallet', color: 'emerald-400', defaultWidth: 700, defaultHeight: 500, minWidth: 400, minHeight: 300, desktopIcon: false, category: 'tools' },
  { id: 'browser-workbench', title: 'Browser', iconName: 'Globe', color: 'neon-cyan', defaultWidth: 1100, defaultHeight: 700, minWidth: 600, minHeight: 450, desktopIcon: true, category: 'tools' },
  { id: 'everything-workbench', title: 'Workbench', iconName: 'FileText', color: 'neon-purple', defaultWidth: 1200, defaultHeight: 800, minWidth: 700, minHeight: 500, desktopIcon: true, category: 'tools' },
  { id: 'automation-studio', title: 'Automação', iconName: 'Workflow', color: 'neon-orange', defaultWidth: 1200, defaultHeight: 800, minWidth: 700, minHeight: 500, desktopIcon: true, category: 'tools' },
  { id: 'agent-teams', title: 'Agent Teams', iconName: 'Users', color: 'neon-blue', defaultWidth: 1100, defaultHeight: 700, minWidth: 600, minHeight: 450, desktopIcon: true, category: 'ai' },
  { id: 'memory-system', title: 'Memória', iconName: 'Brain', color: 'neon-purple', defaultWidth: 1100, defaultHeight: 700, minWidth: 600, minHeight: 450, desktopIcon: true, category: 'ai' },
  { id: 'channel-gateway', title: 'Canais', iconName: 'Radio', color: 'neon-green', defaultWidth: 1100, defaultHeight: 700, minWidth: 600, minHeight: 450, desktopIcon: true, category: 'tools' },
  { id: 'freebuff', title: 'Freebuff', iconName: 'Zap', color: 'neon-green', defaultWidth: 1100, defaultHeight: 700, minWidth: 600, minHeight: 450, desktopIcon: true, category: 'ai' },
  { id: 'settings', title: 'Configurações', iconName: 'Settings', color: 'text-secondary', defaultWidth: 550, defaultHeight: 500, minWidth: 400, minHeight: 350, desktopIcon: false, category: 'system' },
  { id: 'about', title: 'Sobre o Sistema', iconName: 'Info', color: 'neon-blue', defaultWidth: 450, defaultHeight: 350, minWidth: 350, minHeight: 250, desktopIcon: false, category: 'system' },
];
