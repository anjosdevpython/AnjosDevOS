'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import {
  FileCode,
  Save,
  Undo,
  Redo,
  Copy,
  Scissors,
  Clipboard,
  Search,
  Replace,
  Settings,
  Maximize2,
  Minimize2,
  ChevronDown,
  X,
  Plus,
  FolderOpen,
  Braces,
  WrapText,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Language mapping based on file extension
const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  md: 'markdown',
  txt: 'plaintext',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  sql: 'sql',
  graphql: 'graphql',
  gql: 'graphql',
  dockerfile: 'dockerfile',
  toml: 'toml',
  ini: 'ini',
  env: 'plaintext',
  gitignore: 'plaintext',
  mdx: 'markdown',
};

// Theme options
const THEMES = [
  { id: 'vs-dark', label: 'Dark', icon: Moon },
  { id: 'vs-light', label: 'Light', icon: Sun },
  { id: 'hc-black', label: 'High Contrast', icon: Eye },
];

// Font size options
const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20, 24];

interface FileTab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isModified: boolean;
}

export function CodeEditorApp() {
  const [tabs, setTabs] = useState<FileTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState<'off' | 'on'>('off');
  const [minimap, setMinimap] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Get language from filename
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return LANGUAGE_MAP[ext] || 'plaintext';
  };

  // Open a file in a new tab
  const openFile = useCallback(
    (name: string, path: string, content: string) => {
      // Check if file is already open
      const existing = tabs.find((t) => t.path === path);
      if (existing) {
        setActiveTabId(existing.id);
        return;
      }

      const newTab: FileTab = {
        id: `tab-${Date.now()}`,
        name,
        path,
        content,
        language: getLanguage(name),
        isModified: false,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    },
    [tabs]
  );

  // Close a tab
  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => prev.filter((t) => t.id !== tabId));
      if (activeTabId === tabId) {
        const remaining = tabs.filter((t) => t.id !== tabId);
        setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      }
    },
    [tabs, activeTabId]
  );

  // Handle editor mount
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add keyboard shortcuts
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        // Save current file
        if (activeTab) {
          setTabs((prev) =>
            prev.map((t) =>
              t.id === activeTab.id ? { ...t, isModified: false } : t
            )
          );
        }
      },
    });

    editor.addAction({
      id: 'close-tab',
      label: 'Close Tab',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW],
      run: () => {
        if (activeTabId) {
          closeTab(activeTabId);
        }
      },
    });
  };

  // Handle content change
  const handleContentChange: OnChange = (value) => {
    if (!activeTabId) return;

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, content: value || '', isModified: true }
          : t
      )
    );
  };

  // Save current file
  const saveFile = () => {
    if (!activeTab) return;

    // In a real app, this would save to the file system
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id ? { ...t, isModified: false } : t
      )
    );
  };

  // Save all files
  const saveAllFiles = () => {
    setTabs((prev) => prev.map((t) => ({ ...t, isModified: false })));
  };

  // Create new file
  const createNewFile = () => {
    const name = prompt('Nome do arquivo:', 'new-file.ts');
    if (!name) return;

    openFile(name, `/${name}`, '');
  };

  // Format document
  const formatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  // Toggle word wrap
  const toggleWordWrap = () => {
    setWordWrap((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S - Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      // Ctrl+Shift+S - Save All
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        saveAllFiles();
      }
      // Ctrl+N - New File
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createNewFile();
      }
      // Ctrl+W - Close Tab
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, closeTab]);

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-text-primary">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-cyber-border bg-cyber-card/50">
        {/* File Actions */}
        <button
          onClick={createNewFile}
          className="p-1.5 rounded hover:bg-cyber-hover text-text-muted hover:text-neon-green transition-colors"
          title="Novo arquivo (Ctrl+N)"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={saveFile}
          disabled={!activeTab}
          className={cn(
            'p-1.5 rounded transition-colors',
            activeTab
              ? 'hover:bg-cyber-hover text-text-muted hover:text-neon-green'
              : 'text-text-muted/30 cursor-not-allowed'
          )}
          title="Salvar (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={saveAllFiles}
          className="p-1.5 rounded hover:bg-cyber-hover text-text-muted hover:text-neon-green transition-colors"
          title="Salvar tudo (Ctrl+Shift+S)"
        >
          <Save className="w-4 h-4" />
          <span className="text-[9px] ml-0.5">All</span>
        </button>

        <div className="w-px h-5 bg-cyber-border mx-1" />

        {/* Edit Actions */}
        <button
          onClick={() => editorRef.current?.trigger('keyboard', 'undo', null)}
          className="p-1.5 rounded hover:bg-cyber-hover text-text-muted hover:text-text-primary transition-colors"
          title="Desfazer"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editorRef.current?.trigger('keyboard', 'redo', null)}
          className="p-1.5 rounded hover:bg-cyber-hover text-text-muted hover:text-text-primary transition-colors"
          title="Refazer"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-cyber-border mx-1" />

        {/* Format */}
        <button
          onClick={formatDocument}
          disabled={!activeTab}
          className={cn(
            'p-1.5 rounded transition-colors',
            activeTab
              ? 'hover:bg-cyber-hover text-text-muted hover:text-text-primary'
              : 'text-text-muted/30 cursor-not-allowed'
          )}
          title="Formatar documento"
        >
          <Braces className="w-4 h-4" />
        </button>
        <button
          onClick={toggleWordWrap}
          className={cn(
            'p-1.5 rounded transition-colors',
            wordWrap === 'on'
              ? 'bg-neon-green/10 text-neon-green'
              : 'text-text-muted hover:bg-cyber-hover hover:text-text-primary'
          )}
          title="Toggle Word Wrap"
        >
          <WrapText className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded hover:bg-cyber-hover text-text-muted hover:text-text-primary transition-colors"
            title="Configurações do editor"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-1 w-56 py-2 bg-cyber-card border border-cyber-border rounded-lg shadow-xl z-50">
              {/* Theme */}
              <div className="px-3 py-1.5">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">Tema</p>
                <div className="flex gap-1">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] rounded transition-colors',
                        theme === t.id
                          ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                          : 'text-text-muted hover:bg-cyber-hover border border-transparent'
                      )}
                    >
                      <t.icon className="w-3 h-3" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="px-3 py-1.5 border-t border-cyber-border">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">
                  Tamanho da fonte
                </p>
                <div className="flex gap-1 flex-wrap">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={cn(
                        'px-2 py-1 text-[10px] rounded transition-colors',
                        fontSize === size
                          ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                          : 'text-text-muted hover:bg-cyber-hover border border-transparent'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimap */}
              <div className="px-3 py-1.5 border-t border-cyber-border">
                <button
                  onClick={() => setMinimap(!minimap)}
                  className="flex items-center gap-2 w-full text-left text-xs text-text-secondary hover:text-text-primary"
                >
                  {minimap ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>Minimap</span>
                  <span className="ml-auto text-[10px] text-text-muted">
                    {minimap ? 'On' : 'Off'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-cyber-border bg-cyber-card/30 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r border-cyber-border min-w-[120px] max-w-[180px] group',
              activeTabId === tab.id
                ? 'bg-cyber-bg text-text-primary'
                : 'text-text-muted hover:bg-cyber-hover hover:text-text-secondary'
            )}
          >
            <FileCode className="w-3 h-3 flex-shrink-0" />
            <span className="truncate flex-1">
              {tab.name}
              {tab.isModified && <span className="text-neon-yellow ml-1">●</span>}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-cyber-hover text-text-muted hover:text-text-primary transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {tabs.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-3 text-xs text-text-muted">
            Nenhum arquivo aberto — clique em + para criar ou abra pelo Explorador
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {activeTab ? (
          <Editor
            key={activeTab.id}
            height="100%"
            language={activeTab.language}
            theme={theme}
            value={activeTab.content}
            onChange={handleContentChange}
            onMount={handleEditorMount}
            options={{
              fontSize,
              wordWrap,
              minimap: { enabled: minimap },
              padding: { top: 10, bottom: 10 },
              scrollBeyondLastLine: false,
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              bracketPairColorization: { enabled: true },
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoIndent: 'full',
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              tabSize: 2,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
            }}
            loading={
              <div className="flex items-center justify-center h-full text-text-muted">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            }
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <FileCode className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-sm mb-2">Nenhum arquivo aberto</p>
            <p className="text-xs mb-4">
              Abra um arquivo pelo Explorador ou crie um novo
            </p>
            <button
              onClick={createNewFile}
              className="flex items-center gap-2 px-4 py-2 text-xs text-neon-green bg-neon-green/10 border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo arquivo
            </button>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-cyber-border bg-cyber-card/50 text-[10px] text-text-muted">
        <div className="flex items-center gap-3">
          {activeTab && (
            <>
              <span className="flex items-center gap-1">
                <FileCode className="w-3 h-3" />
                {activeTab.language}
              </span>
              <span>UTF-8</span>
              <span>Spaces: 2</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeTab && <span>{activeTab.path}</span>}
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </div>
  );
}

// Export a function to open files from outside (e.g., File Explorer)
export function useCodeEditor() {
  return {
    openFile: (name: string, path: string, content: string) => {
      // This would be implemented with a global state or event system
      // For now, files can be opened by the File Explorer component
    },
  };
}
