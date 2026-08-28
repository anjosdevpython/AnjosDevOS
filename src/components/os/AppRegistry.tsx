'use client';

import { ReactNode } from 'react';
import { MessageSquare, Image, Paintbrush, Video, Music, Mic, AudioLines, Wallet, Terminal, Settings, Info, Folder, Wrench, FileCode, Sparkles, Hand, Diamond, Blocks } from 'lucide-react';

// Import existing page components as app contents
import { ChatInterface } from '@/components/features/chat/ChatInterface';
import { TerminalApp } from './apps/TerminalApp';
import { AboutApp } from './apps/AboutApp';
import { FileExplorerApp } from './apps/FileExplorerApp';
import { ToolsApp } from './apps/ToolsApp';
import { CodeEditorApp } from './apps/CodeEditorApp';
import { DSHApp } from './apps/DSHApp';
import { OpenHandsApp } from './apps/OpenHandsApp';
import { TheiaApp } from './apps/TheiaApp';
import { DevToolsHubApp } from './apps/DevToolsHubApp';

// Lazy-load heavy page components to avoid importing all at once
import dynamic from 'next/dynamic';
const ImagesApp = dynamic(() => import('@/app/images/page'), { ssr: false });
const EditorApp = dynamic(() => import('@/app/editor/page'), { ssr: false });
const VideoApp = dynamic(() => import('@/app/video/page'), { ssr: false });
const MusicApp = dynamic(() => import('@/app/music/page'), { ssr: false });
const TtsApp = dynamic(() => import('@/app/tts/page'), { ssr: false });
const AudioApp = dynamic(() => import('@/app/audio/page'), { ssr: false });
const BalanceApp = dynamic(() => import('@/app/balance/page'), { ssr: false });
const SettingsApp = dynamic(() => import('@/app/settings/page'), { ssr: false });

export const ICON_COMPONENTS: Record<string, ReactNode> = {
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
};

export function getAppContent(appId: string): ReactNode {
  switch (appId) {
    case 'chat':
      return (
        <div className="flex flex-col h-full">
          <ChatInterface />
        </div>
      );
    case 'images':
      return <div className="overflow-auto h-full"><ImagesApp /></div>;
    case 'editor':
      return <div className="overflow-auto h-full"><EditorApp /></div>;
    case 'video':
      return <div className="overflow-auto h-full"><VideoApp /></div>;
    case 'music':
      return <div className="overflow-auto h-full"><MusicApp /></div>;
    case 'tts':
      return <div className="overflow-auto h-full"><TtsApp /></div>;
    case 'audio':
      return <div className="overflow-auto h-full"><AudioApp /></div>;
    case 'balance':
      return <div className="overflow-auto h-full"><BalanceApp /></div>;
    case 'settings':
      return <div className="overflow-auto h-full"><SettingsApp /></div>;
    case 'terminal':
      return <TerminalApp />;
    case 'devtools-hub':
      return <DevToolsHubApp />;
    case 'openhands':
      return <OpenHandsApp />;
    case 'theia':
      return <TheiaApp />;
    case 'deepseek-harness':
      return <DSHApp />;
    case 'codeeditor':
      return <CodeEditorApp />;
    case 'tools':
      return <ToolsApp />;
    case 'fileexplorer':
      return <FileExplorerApp />;
    case 'about':
      return <AboutApp />;
    default:
      return <div className="flex items-center justify-center h-full text-text-muted">App não encontrado</div>;
  }
}
