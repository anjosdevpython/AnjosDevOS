'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileJson,
  FileCog,
  ChevronRight,
  Home,
  Plus,
  Trash2,
  Edit3,
  FolderPlus,
  RefreshCw,
  MoreVertical,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Virtual File System Types
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  extension?: string;
  createdAt: Date;
  modifiedAt: Date;
}

// Initial file system structure
const INITIAL_FS: FileNode = {
  id: 'root',
  name: '~',
  type: 'folder',
  createdAt: new Date(),
  modifiedAt: new Date(),
  children: [
    {
      id: 'projects',
      name: 'projects',
      type: 'folder',
      createdAt: new Date(),
      modifiedAt: new Date(),
      children: [
        {
          id: 'my-app',
          name: 'my-app',
          type: 'folder',
          createdAt: new Date(),
          modifiedAt: new Date(),
          children: [
            {
              id: 'src-folder',
              name: 'src',
              type: 'folder',
              createdAt: new Date(),
              modifiedAt: new Date(),
              children: [
                {
                  id: 'app-tsx',
                  name: 'App.tsx',
                  type: 'file',
                  extension: 'tsx',
                  content: "import React from 'react';\n\nexport function App() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n    </div>\n  );\n}",
                  createdAt: new Date(),
                  modifiedAt: new Date(),
                },
                {
                  id: 'main-ts',
                  name: 'main.ts',
                  type: 'file',
                  extension: 'ts',
                  content: "import { App } from './App';\n\nconst app = new App();\napp.mount('#root');",
                  createdAt: new Date(),
                  modifiedAt: new Date(),
                },
                {
                  id: 'styles-css',
                  name: 'styles.css',
                  type: 'file',
                  extension: 'css',
                  content: "body {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}",
                  createdAt: new Date(),
                  modifiedAt: new Date(),
                },
              ],
            },
            {
              id: 'package-json',
              name: 'package.json',
              type: 'file',
              extension: 'json',
              content: '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}',
              createdAt: new Date(),
              modifiedAt: new Date(),
            },
            {
              id: 'readme-md',
              name: 'README.md',
              type: 'file',
              extension: 'md',
              content: '# My App\n\nThis is a sample project.',
              createdAt: new Date(),
              modifiedAt: new Date(),
            },
          ],
        },
      ],
    },
    {
      id: 'documents',
      name: 'documents',
      type: 'folder',
      createdAt: new Date(),
      modifiedAt: new Date(),
      children: [
        {
          id: 'notes-txt',
          name: 'notes.txt',
          type: 'file',
          extension: 'txt',
          content: 'My notes...',
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    },
    {
      id: 'downloads',
      name: 'downloads',
      type: 'folder',
      createdAt: new Date(),
      modifiedAt: new Date(),
      children: [],
    },
  ],
};

// Helper to find a node by path
function findNode(root: FileNode, path: string[]): FileNode | null {
  let current = root;
  for (const segment of path) {
    if (current.type !== 'folder' || !current.children) return null;
    const child = current.children.find((c) => c.name === segment);
    if (!child) return null;
    current = child;
  }
  return current;
}

// Helper to find parent node
function findParent(root: FileNode, path: string[]): FileNode | null {
  if (path.length === 0) return null;
  return findNode(root, path.slice(0, -1));
}

// Generate unique ID
function generateId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get file icon based on extension
function getFileIcon(extension?: string, isOpen?: boolean) {
  const iconClass = 'w-4 h-4';
  switch (extension) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode className={cn(iconClass, 'text-neon-blue')} />;
    case 'json':
      return <FileJson className={cn(iconClass, 'text-neon-yellow')} />;
    case 'md':
    case 'txt':
      return <FileText className={cn(iconClass, 'text-text-secondary')} />;
    case 'css':
    case 'scss':
    case 'html':
      return <FileCode className={cn(iconClass, 'text-neon-purple')} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImage className={cn(iconClass, 'text-neon-green')} />;
    case 'mp4':
    case 'mov':
    case 'avi':
      return <FileVideo className={cn(iconClass, 'text-neon-red')} />;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <FileAudio className={cn(iconClass, 'text-orange-400')} />;
    case 'yaml':
    case 'yml':
    case 'toml':
    case 'env':
      return <FileCog className={cn(iconClass, 'text-text-muted')} />;
    default:
      return <File className={cn(iconClass, 'text-text-muted')} />;
  }
}

// Context Menu Component
interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
  isFolder: boolean;
}

function ContextMenu({ x, y, onClose, onNewFile, onNewFolder, onRename, onDelete, isFolder }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[99999] w-48 py-1 bg-cyber-card border border-cyber-border rounded-lg shadow-xl"
      style={{ left: x, top: y }}
    >
      {isFolder && (
        <>
          <button
            onClick={() => { onNewFile(); onClose(); }}
            className="w-full px-3 py-1.5 text-left text-xs text-text-secondary hover:bg-cyber-hover hover:text-text-primary flex items-center gap-2"
          >
            <File className="w-3.5 h-3.5" />
            Novo arquivo
          </button>
          <button
            onClick={() => { onNewFolder(); onClose(); }}
            className="w-full px-3 py-1.5 text-left text-xs text-text-secondary hover:bg-cyber-hover hover:text-text-primary flex items-center gap-2"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Nova pasta
          </button>
          <div className="my-1 border-t border-cyber-border" />
        </>
      )}
      <button
        onClick={() => { onRename(); onClose(); }}
        className="w-full px-3 py-1.5 text-left text-xs text-text-secondary hover:bg-cyber-hover hover:text-text-primary flex items-center gap-2"
      >
        <Edit3 className="w-3.5 h-3.5" />
        Renomear
      </button>
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full px-3 py-1.5 text-left text-xs text-neon-red hover:bg-neon-red/10 flex items-center gap-2"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Excluir
      </button>
    </div>
  );
}

// Inline Rename Input
function InlineRenameInput({
  defaultValue,
  onSave,
  onCancel,
}: {
  defaultValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(value);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(value)}
        className="flex-1 px-1 py-0.5 text-xs bg-cyber-bg border border-neon-green/50 rounded text-text-primary outline-none"
      />
      <button onClick={() => onSave(value)} className="p-0.5 text-neon-green hover:bg-neon-green/10 rounded">
        <Check className="w-3 h-3" />
      </button>
      <button onClick={onCancel} className="p-0.5 text-neon-red hover:bg-neon-red/10 rounded">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// Tree Item Component
function TreeItem({
  node,
  depth,
  currentPath,
  selectedId,
  expandedFolders,
  renamingId,
  onToggle,
  onSelect,
  onContextMenu,
  onRenameSave,
  onRenameCancel,
}: {
  node: FileNode;
  depth: number;
  currentPath: string[];
  selectedId: string | null;
  expandedFolders: Set<string>;
  renamingId: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: FileNode, path: string[]) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode, path: string[]) => void;
  onRenameSave: (id: string, newName: string) => void;
  onRenameCancel: () => void;
}) {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = selectedId === node.id;
  const isRenaming = renamingId === node.id;
  const nodePath = [...currentPath, node.name];

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-2 text-xs cursor-pointer select-none group',
          isSelected ? 'bg-neon-green/10 text-neon-green' : 'text-text-secondary hover:bg-cyber-hover hover:text-text-primary'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            onToggle(node.id);
          }
          onSelect(node, nodePath);
        }}
        onContextMenu={(e) => onContextMenu(e, node, nodePath)}
      >
        {/* Expand arrow */}
        {isFolder ? (
          <ChevronRight
            className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-90')}
          />
        ) : (
          <span className="w-3" />
        )}

        {/* Icon */}
        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-neon-yellow" />
          ) : (
            <Folder className="w-4 h-4 text-neon-yellow" />
          )
        ) : (
          getFileIcon(node.extension)
        )}

        {/* Name */}
        {isRenaming ? (
          <InlineRenameInput
            defaultValue={node.name}
            onSave={(newName) => onRenameSave(node.id, newName)}
            onCancel={onRenameCancel}
          />
        ) : (
          <span className="truncate">{node.name}</span>
        )}
      </div>

      {/* Children */}
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              // Folders first, then files
              if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <TreeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                currentPath={nodePath}
                selectedId={selectedId}
                expandedFolders={expandedFolders}
                renamingId={renamingId}
                onToggle={onToggle}
                onSelect={onSelect}
                onContextMenu={onContextMenu}
                onRenameSave={onRenameSave}
                onRenameCancel={onRenameCancel}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// Main FileExplorerApp Component
export function FileExplorerApp() {
  const [fs, setFs] = useState<FileNode>(INITIAL_FS);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['root', 'projects', 'my-app', 'src-folder'])
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: FileNode;
    path: string[];
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [creatingInFolder, setCreatingInFolder] = useState<{ type: 'file' | 'folder'; parentId: string } | null>(null);

  const currentNode = findNode(fs, currentPath) || fs;

  // Toggle folder expansion
  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Navigate to path
  const navigateTo = useCallback((path: string[]) => {
    setCurrentPath(path);
    setSelectedId(null);
  }, []);

  // Navigate up
  const navigateUp = useCallback(() => {
    setCurrentPath((prev) => prev.slice(0, -1));
    setSelectedId(null);
  }, []);

  // Navigate to breadcrumb
  const navigateToBreadcrumb = useCallback((index: number) => {
    setCurrentPath((prev) => prev.slice(0, index));
    setSelectedId(null);
  }, []);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode, path: string[]) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node, path });
  }, []);

  // Create new file/folder
  const handleCreate = useCallback((type: 'file' | 'folder', parentId: string) => {
    const parent = findNode(fs, parentId === 'root' ? [] : (() => {
      // Find path to parent
      const findPath = (node: FileNode, targetId: string, path: string[]): string[] | null => {
        if (node.id === targetId) return path;
        if (node.children) {
          for (const child of node.children) {
            const result = findPath(child, targetId, [...path, child.name]);
            if (result) return result;
          }
        }
        return null;
      };
      return findPath(fs, parentId, []) || [];
    })());

    if (!parent || parent.type !== 'folder') return;

    const newName = type === 'file' ? 'new-file.txt' : 'new-folder';
    const newNode: FileNode = {
      id: generateId(),
      name: newName,
      type,
      extension: type === 'file' ? 'txt' : undefined,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    // Update fs immutably
    const updateNode = (node: FileNode): FileNode => {
      if (node.id === parent.id) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
          modifiedAt: new Date(),
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode),
        };
      }
      return node;
    };

    setFs(updateNode(fs));
    setExpandedFolders((prev) => new Set([...prev, parent.id]));
    setRenamingId(newNode.id);
  }, [fs]);

  // Rename node
  const handleRename = useCallback((id: string, newName: string) => {
    if (!newName.trim()) {
      setRenamingId(null);
      return;
    }

    const updateNode = (node: FileNode): FileNode => {
      if (node.id === id) {
        return {
          ...node,
          name: newName,
          extension: node.type === 'file' ? newName.split('.').pop() : node.extension,
          modifiedAt: new Date(),
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode),
        };
      }
      return node;
    };

    setFs(updateNode(fs));
    setRenamingId(null);
  }, [fs]);

  // Delete node
  const handleDelete = useCallback((id: string) => {
    if (id === 'root') return;

    const updateNode = (node: FileNode): FileNode => {
      if (node.children) {
        return {
          ...node,
          children: node.children.filter((c) => c.id !== id).map(updateNode),
        };
      }
      return node;
    };

    setFs(updateNode(fs));
    setSelectedId(null);
  }, [fs]);

  // Get breadcrumb items
  const breadcrumbs = currentPath.map((name, index) => ({
    name,
    path: currentPath.slice(0, index + 1),
  }));

  // Count items in current folder
  const itemCount = currentNode.children?.length || 0;

  return (
    <div className="h-full flex flex-col bg-cyber-bg text-text-primary">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-cyber-border bg-cyber-card/50">
        {/* Navigation buttons */}
        <button
          onClick={navigateUp}
          disabled={currentPath.length === 0}
          className="p-1.5 rounded hover:bg-cyber-hover disabled:opacity-30 disabled:cursor-not-allowed text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <button
          onClick={() => navigateTo([])}
          className={cn(
            'p-1.5 rounded transition-colors',
            currentPath.length === 0
              ? 'bg-neon-green/10 text-neon-green'
              : 'hover:bg-cyber-hover text-text-muted hover:text-text-primary'
          )}
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex-1 flex items-center gap-1 text-xs overflow-x-auto">
          <span className="text-text-muted font-mono">~</span>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-text-muted" />
              <button
                onClick={() => navigateToBreadcrumb(i + 1)}
                className={cn(
                  'px-1.5 py-0.5 rounded font-mono transition-colors',
                  i === breadcrumbs.length - 1
                    ? 'text-text-primary bg-cyber-hover'
                    : 'text-text-muted hover:text-text-primary hover:bg-cyber-hover'
                )}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setCreatingInFolder({ type: 'file', parentId: currentNode.id });
              handleCreate('file', currentNode.id);
            }}
            className="p-1.5 rounded hover:bg-cyber-hover text-text-muted hover:text-neon-green transition-colors"
            title="Novo arquivo"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCreatingInFolder({ type: 'folder', parentId: currentNode.id });
              handleCreate('folder', currentNode.id);
            }}
            className="p-1.5 rounded hover:bg-cyber-hover text-text-muted hover:text-neon-yellow transition-colors"
            title="Nova pasta"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              // Refresh - just re-trigger state
              setFs({ ...fs });
            }}
            className="p-1.5 rounded hover:bg-cyber-hover text-text-muted hover:text-text-primary transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Tree View */}
        <div className="w-56 border-r border-cyber-border overflow-y-auto bg-cyber-card/30">
          <div className="py-2">
            <TreeItem
              node={fs}
              depth={0}
              currentPath={[]}
              selectedId={selectedId}
              expandedFolders={expandedFolders}
              renamingId={renamingId}
              onToggle={toggleFolder}
              onSelect={(node, path) => {
                setSelectedId(node.id);
                if (node.type === 'folder') {
                  navigateTo(path);
                }
              }}
              onContextMenu={handleContextMenu}
              onRenameSave={handleRename}
              onRenameCancel={() => setRenamingId(null)}
            />
          </div>
        </div>

        {/* Main Content - Grid/List View */}
        <div className="flex-1 overflow-y-auto">
          {currentNode.type === 'folder' && currentNode.children ? (
            <div className="p-4">
              {/* Grid view */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                {currentNode.children
                  .sort((a, b) => {
                    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((child) => (
                    <div
                      key={child.id}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-150',
                        selectedId === child.id
                          ? 'bg-neon-green/10 border border-neon-green/30'
                          : 'border border-transparent hover:bg-cyber-hover hover:border-cyber-border'
                      )}
                      onClick={() => {
                        setSelectedId(child.id);
                        if (child.type === 'folder') {
                          navigateTo([...currentPath, child.name]);
                        }
                      }}
                      onDoubleClick={() => {
                        if (child.type === 'folder') {
                          navigateTo([...currentPath, child.name]);
                          setExpandedFolders((prev) => new Set([...prev, child.id]));
                        }
                      }}
                      onContextMenu={(e) => handleContextMenu(e, child, [...currentPath, child.name])}
                    >
                      {child.type === 'folder' ? (
                        <Folder className="w-10 h-10 text-neon-yellow" />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center">
                          {getFileIcon(child.extension)}
                        </div>
                      )}
                      <span className="text-[11px] text-text-secondary text-center leading-tight break-all line-clamp-2">
                        {child.name}
                      </span>
                    </div>
                  ))}
              </div>

              {currentNode.children.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                  <Folder className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Pasta vazia</p>
                  <p className="text-xs mt-1">Clique em + para criar um arquivo ou pasta</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <File className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Selecione uma pasta para ver seu conteúdo</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-cyber-border bg-cyber-card/50 text-[10px] text-text-muted">
        <span>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
        <span className="font-mono">~/{
          currentPath.length > 0 ? currentPath.join('/') : ''
        }</span>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNewFile={() => handleCreate('file', contextMenu.node.id)}
          onNewFolder={() => handleCreate('folder', contextMenu.node.id)}
          onRename={() => {
            setRenamingId(contextMenu.node.id);
            setContextMenu(null);
          }}
          onDelete={() => {
            handleDelete(contextMenu.node.id);
            setContextMenu(null);
          }}
          isFolder={contextMenu.node.type === 'folder'}
        />
      )}
    </div>
  );
}
