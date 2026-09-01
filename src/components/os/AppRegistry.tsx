'use client';

import { ReactNode } from 'react';
import {
  MessageSquare,
  Image,
  Paintbrush,
  Video,
  Music,
  Mic,
  AudioLines,
  Wallet,
  Terminal,
  Settings,
  Info,
  Folder,
  Wrench,
  FileCode,
  Sparkles,
  Hand,
  Diamond,
  Blocks,
  Globe,
  FileText,
  Workflow,
  Users,
  Brain,
  Radio,
  Zap,
  Network,
  Bot,
  Layers,
  BarChart3,
  Plug,
} from 'lucide-react';
import { AppErrorBoundary } from './AppErrorBoundary';

// Direct imports for frequently used apps
import { ChatInterface } from '@/components/features/chat/ChatInterface';
import { TerminalApp } from './apps/TerminalApp';
import { AboutApp } from './apps/AboutApp';

// Lazy-loaded apps for better performance
import dynamic from 'next/dynamic';
const WorkspacesApp = dynamic(() => import('./apps/WorkspacesApp').then(m => ({ default: m.WorkspacesApp })), { ssr: false });
const AgentDashboardApp = dynamic(() => import('./apps/AgentDashboardApp').then(m => ({ default: m.AgentDashboardApp })), { ssr: false });
const MCPServersApp = dynamic(() => import('./apps/MCPServersApp').then(m => ({ default: m.MCPServersApp })), { ssr: false });
const FileExplorerApp = dynamic(() => import('./apps/FileExplorerApp').then(m => ({ default: m.FileExplorerApp })), { ssr: false });
const ToolsApp = dynamic(() => import('./apps/ToolsApp').then(m => ({ default: m.ToolsApp })), { ssr: false });
const CodeEditorApp = dynamic(() => import('./apps/CodeEditorApp').then(m => ({ default: m.CodeEditorApp })), { ssr: false });
const DSHApp = dynamic(() => import('./apps/DSHApp').then(m => ({ default: m.DSHApp })), { ssr: false });
const OpenHandsApp = dynamic(() => import('./apps/OpenHandsApp').then(m => ({ default: m.OpenHandsApp })), { ssr: false });
const TheiaApp = dynamic(() => import('./apps/TheiaApp').then(m => ({ default: m.TheiaApp })), { ssr: false });
const DevToolsHubApp = dynamic(() => import('./apps/DevToolsHubApp').then(m => ({ default: m.DevToolsHubApp })), { ssr: false });
const BrowserWorkbenchApp = dynamic(() => import('./apps/BrowserWorkbenchApp').then(m => ({ default: m.BrowserWorkbenchApp })), { ssr: false });
const EverythingWorkbenchApp = dynamic(() => import('./apps/EverythingWorkbenchApp').then(m => ({ default: m.EverythingWorkbenchApp })), { ssr: false });
const AutomationStudioApp = dynamic(() => import('./apps/AutomationStudioApp').then(m => ({ default: m.AutomationStudioApp })), { ssr: false });
const AgentTeamsApp = dynamic(() => import('./apps/AgentTeamsApp').then(m => ({ default: m.AgentTeamsApp })), { ssr: false });
const MemorySystemApp = dynamic(() => import('./apps/MemorySystemApp').then(m => ({ default: m.MemorySystemApp })), { ssr: false });
const ChannelGatewayApp = dynamic(() => import('./apps/ChannelGatewayApp').then(m => ({ default: m.ChannelGatewayApp })), { ssr: false });
const FreebuffApp = dynamic(() => import('./apps/FreebuffApp').then(m => ({ default: m.FreebuffApp })), { ssr: false });
const WarmwindApp = dynamic(() => import('./apps/WarmwindApp').then(m => ({ default: m.WarmwindApp })), { ssr: false });
const JupyterApp = dynamic(() => import('./apps/JupyterApp').then(m => ({ default: m.JupyterApp })), { ssr: false });
const LivePlaygroundApp = dynamic(() => import('./apps/LivePlaygroundApp').then(m => ({ default: m.LivePlaygroundApp })), { ssr: false });
const DocStudioApp = dynamic(() => import('./apps/DocStudioApp').then(m => ({ default: m.DocStudioApp })), { ssr: false });
const DatabaseStudioApp = dynamic(() => import('./apps/DatabaseStudioApp').then(m => ({ default: m.DatabaseStudioApp })), { ssr: false });
const APILabApp = dynamic(() => import('./apps/APILabApp').then(m => ({ default: m.APILabApp })), { ssr: false });
const BillingApp = dynamic(() => import('./apps/BillingApp').then(m => ({ default: m.BillingApp })), { ssr: false });
const AgentOrchestratorApp = dynamic(() => import('./apps/AgentOrchestratorApp').then(m => ({ default: m.AgentOrchestratorApp })), { ssr: false });

// Dynamic page imports
const ImagesApp = dynamic(() => import('@/app/images/page'), { ssr: false });
const EditorApp = dynamic(() => import('@/app/editor/page'), { ssr: false });
const VideoApp = dynamic(() => import('@/app/video/page'), { ssr: false });
const MusicApp = dynamic(() => import('@/app/music/page'), { ssr: false });
const TtsApp = dynamic(() => import('@/app/tts/page'), { ssr: false });
const AudioApp = dynamic(() => import('@/app/audio/page'), { ssr: false });
const BalanceApp = dynamic(() => import('@/app/balance/page'), { ssr: false });
const SettingsApp = dynamic(() => import('@/app/settings/page'), { ssr: false });

export const ICON_COMPONENTS: Record<string, ReactNode> = {
  BarChart3: <BarChart3 className="w-4 h-4" />,
  Plug: <Plug className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Image: <Image className="w-4 h-4" />,
  Paintbrush: <Paintbrush className="w-4 h-4" />,
  Video: <Video className="w-4 h-4" />,
  Music: <Music className="w-4 h-4" />,
  Mic: <Mic className="w-4 h-4" />,
  AudioLines: <AudioLines className="w-4 h-4" />,
  Wallet: <Wallet className="w-4 h-4" />,
  Terminal: <Terminal className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
  Info: <Info className="w-4 h-4" />,
  Folder: <Folder className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  FileCode: <FileCode className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Hand: <Hand className="w-4 h-4" />,
  Diamond: <Diamond className="w-4 h-4" />,
  Blocks: <Blocks className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Workflow: <Workflow className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Brain: <Brain className="w-4 h-4" />,
  Radio: <Radio className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Network: <Network className="w-4 h-4" />,
  Bot: <Bot className="w-4 h-4" />,
};

function wrapInBoundary(app: ReactNode, name: string): ReactNode {
  return <AppErrorBoundary appName={name}>{app}</AppErrorBoundary>;
}

export function getAppContent(appId: string): ReactNode {
  switch (appId) {
    case 'workspaces':
      return wrapInBoundary(<WorkspacesApp />, 'Workspaces');
    case 'dashboard':
      return wrapInBoundary(<AgentDashboardApp />, 'Dashboard');
    case 'mcp-servers':
      return wrapInBoundary(<MCPServersApp />, 'MCP Servers');
    case 'chat':
      return wrapInBoundary(
        <div className="flex flex-col h-full">
          <ChatInterface />
        </div>,
        'Chat IA'
      );
    case 'images':
      return wrapInBoundary(<div className="overflow-auto h-full"><ImagesApp /></div>, 'Gerador de Imagens');
    case 'editor':
      return wrapInBoundary(<div className="overflow-auto h-full"><EditorApp /></div>, 'Editor de Imagens');
    case 'video':
      return wrapInBoundary(<div className="overflow-auto h-full"><VideoApp /></div>, 'Gerador de Vídeo');
    case 'music':
      return wrapInBoundary(<div className="overflow-auto h-full"><MusicApp /></div>, 'Gerador de Música');
    case 'tts':
      return wrapInBoundary(<div className="overflow-auto h-full"><TtsApp /></div>, 'Text-to-Speech');
    case 'audio':
      return wrapInBoundary(<div className="overflow-auto h-full"><AudioApp /></div>, 'Efeitos Sonoros');
    case 'balance':
      return wrapInBoundary(<BillingApp />, 'Planos & Faturamento');
    case 'jupyter-lab':
      return wrapInBoundary(<JupyterApp />, 'Jupyter Notebook');
    case 'live-playground':
      return wrapInBoundary(<LivePlaygroundApp />, 'Live Playground');
    case 'doc-studio':
      return wrapInBoundary(<DocStudioApp />, 'Doc Studio');
    case 'database-studio':
      return wrapInBoundary(<DatabaseStudioApp />, 'Database SQL Studio');
    case 'api-lab':
      return wrapInBoundary(<APILabApp />, 'API Lab');
    case 'settings':
      return wrapInBoundary(<div className="overflow-auto h-full"><SettingsApp /></div>, 'Configurações');
    case 'terminal':
      return wrapInBoundary(<TerminalApp />, 'Terminal');
    case 'devtools-hub':
      return wrapInBoundary(<DevToolsHubApp />, 'DevTools Hub');
    case 'openhands':
      return wrapInBoundary(<OpenHandsApp />, 'OpenHands');
    case 'theia':
      return wrapInBoundary(<TheiaApp />, 'Theia IDE');
    case 'deepseek-harness':
      return wrapInBoundary(<DSHApp />, 'DeepSeek Harness');
    case 'codeeditor':
      return wrapInBoundary(<CodeEditorApp />, 'Code Editor');
    case 'tools':
      return wrapInBoundary(<ToolsApp />, 'AI Tools');
    case 'fileexplorer':
      return wrapInBoundary(<FileExplorerApp />, 'Explorador');
    case 'browser-workbench':
      return wrapInBoundary(<BrowserWorkbenchApp />, 'Browser');
    case 'everything-workbench':
      return wrapInBoundary(<EverythingWorkbenchApp />, 'Workbench');
    case 'automation-studio':
      return wrapInBoundary(<AutomationStudioApp />, 'Automação');
    case 'agent-teams':
      return wrapInBoundary(<AgentTeamsApp />, 'Agent Teams');
    case 'memory-system':
      return wrapInBoundary(<MemorySystemApp />, 'Memória');
    case 'channel-gateway':
      return wrapInBoundary(<ChannelGatewayApp />, 'Canais');
    case 'freebuff':
      return wrapInBoundary(<FreebuffApp />, 'Freebuff');
    case 'orchestrator':
      return wrapInBoundary(<AgentOrchestratorApp />, 'Orquestrador');
    case 'warmwind':
      return wrapInBoundary(<WarmwindApp />, 'Funcionários IA');
    case 'about':
      return wrapInBoundary(<AboutApp />, 'Sobre');
    default:
      return <div className="flex items-center justify-center h-full text-text-muted">App não encontrado</div>;
  }
}
