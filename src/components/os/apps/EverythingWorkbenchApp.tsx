'use client';

import { useState } from 'react';

type WorkbenchTab = 'docs' | 'sheets' | 'slides' | 'whiteboard' | 'kanban' | 'charts';

interface DocFile { id: string; name: string; content: string; updated: string; }
interface SheetData { id: string; name: string; headers: string[]; rows: string[][]; }
interface Slide { id: string; title: string; content: string; layout: string; }
interface KanbanTask { id: string; title: string; column: 'backlog' | 'todo' | 'doing' | 'done'; tags: string[]; }

const INITIAL_DOCS: DocFile[] = [
  { id: '1', name: 'Projeto README', content: '# AnjosDevOS\n\nSistema operacional de IA para desenvolvedores.\n\n## Funcionalidades\n\n- Chat com múltiplos providers\n- Code Editor com Monaco\n- File Explorer\n- AI Tools & Skills', updated: '2026-08-28' },
  { id: '2', name: 'Reunião Notas', content: '## Notas da Reunião - 28/08/2026\n\n### Pauta\n1. Sprint Planning\n2. Review de features\n3. Próximos passos\n\n### Decisões\n- Priorizar mobile\n- Adicionar mais providers', updated: '2026-08-28' },
];

const INITIAL_SHEETS: SheetData[] = [
  { id: '1', name: 'Orçamento', headers: ['Item', 'Qtd', 'Preço Unit.', 'Total'], rows: [['Servidor', '1', '$50', '$50'], ['API Key OpenAI', '1', '$20', '$20'], ['Domínio', '1', '$12', '$12']] },
  { id: '2', name: 'Task Tracker', headers: ['Task', 'Assignee', 'Status', 'Priority'], rows: [['Implementar Auth', 'Allan', 'In Progress', 'High'], ['Criar Dashboard', 'AI Agent', 'Todo', 'Medium'], ['Deploy', 'Allan', 'Done', 'Low']] },
];

const INITIAL_SLIDES: Slide[] = [
  { id: '1', title: 'AnjosDevOS', content: 'Sistema Operacional de IA\n\nRevolucionando a forma como desenvolvedores trabalham com IA.', layout: 'title' },
  { id: '2', title: 'Features', content: '• Multi-Provider AI\n• Code Editor\n• File Explorer\n• AI Tools & Skills\n• MCP Integrations\n• Mobile Support', layout: 'content' },
  { id: '3', title: 'Roadmap', content: 'Q3 2026: Lançamento v1.0\nQ4 2026: Marketplace de Plugins\nQ1 2027: Enterprise Edition', layout: 'content' },
];

const INITIAL_KANBAN: KanbanTask[] = [
  { id: 'k1', title: 'Adicionar testes E2E', column: 'backlog', tags: ['testing'] },
  { id: 'k2', title: 'Otimizar bundle size', column: 'todo', tags: ['performance'] },
  { id: 'k3', title: 'Implementar dark mode', column: 'doing', tags: ['ui'] },
  { id: 'k4', title: 'Setup CI/CD', column: 'done', tags: ['devops'] },
  { id: 'k5', title: 'Documentar API', column: 'todo', tags: ['docs'] },
  { id: 'k6', title: 'Review PRs pendentes', column: 'doing', tags: ['review'] },
];

export function EverythingWorkbenchApp() {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('docs');
  const [docs] = useState<DocFile[]>(INITIAL_DOCS);
  const [sheets] = useState<SheetData[]>(INITIAL_SHEETS);
  const [slides] = useState<Slide[]>(INITIAL_SLIDES);
  const [kanban] = useState<KanbanTask[]>(INITIAL_KANBAN);
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(docs[0]);
  const [docContent, setDocContent] = useState(docs[0]?.content || '');
  const [selectedSheet, setSelectedSheet] = useState<SheetData | null>(sheets[0]);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const TABS: { id: WorkbenchTab; label: string; icon: string }[] = [
    { id: 'docs', label: 'Docs', icon: '📄' },
    { id: 'sheets', label: 'Sheets', icon: '📊' },
    { id: 'slides', label: 'Slides', icon: '🎞️' },
    { id: 'whiteboard', label: 'Whiteboard', icon: '🎨' },
    { id: 'kanban', label: 'Kanban', icon: '📋' },
    { id: 'charts', label: 'Charts', icon: '📈' },
  ];

  const filteredDocs = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderDocs = () => (
    <div className="flex h-full">
      <div className="w-56 border-r border-border flex flex-col bg-surface/30">
        <div className="p-2 border-b border-border">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar docs..."
            className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded text-text focus:outline-none focus:border-neon-blue"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredDocs.map(doc => (
            <button
              key={doc.id}
              onClick={() => { setSelectedDoc(doc); setDocContent(doc.content); }}
              className={`w-full text-left px-3 py-2 text-xs border-b border-border hover:bg-surface/50 transition-colors ${selectedDoc?.id === doc.id ? 'bg-neon-blue/10 border-l-2 border-l-neon-blue' : ''}`}
            >
              <div className="text-text font-medium truncate">📄 {doc.name}</div>
              <div className="text-text-muted mt-0.5">{doc.updated}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <span className="text-text font-medium text-sm">{selectedDoc?.name || 'Selecionar documento'}</span>
          <button className="ml-auto px-2 py-0.5 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/30">Salvar</button>
          <button className="px-2 py-0.5 text-[10px] bg-surface border border-border rounded hover:bg-surface/80">Exportar</button>
        </div>
        <textarea
          value={docContent}
          onChange={(e) => setDocContent(e.target.value)}
          className="flex-1 p-4 bg-transparent text-text text-sm font-mono resize-none focus:outline-none"
          placeholder="Comece a escrever..."
        />
      </div>
    </div>
  );

  const renderSheets = () => (
    <div className="flex h-full">
      <div className="w-44 border-r border-border flex flex-col bg-surface/30">
        <div className="p-2 border-b border-border text-[10px] text-text-muted uppercase tracking-wide font-semibold">Planilhas</div>
        <div className="flex-1 overflow-y-auto">
          {sheets.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSheet(s)}
              className={`w-full text-left px-3 py-2 text-xs border-b border-border hover:bg-surface/50 transition-colors ${selectedSheet?.id === s.id ? 'bg-neon-green/10 border-l-2 border-l-neon-green' : ''}`}
            >
              📊 {s.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {selectedSheet && (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-text-muted font-semibold bg-surface/50">#</th>
                {selectedSheet.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left text-text-muted font-semibold bg-surface/50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedSheet.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/50 hover:bg-surface/30">
                  <td className="px-3 py-2 text-text-muted">{ri + 1}</td>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-text">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-2 text-[10px] text-text-muted">
          📊 {selectedSheet?.rows.length || 0} linhas · {selectedSheet?.headers.length || 0} colunas
        </div>
      </div>
    </div>
  );

  const renderSlides = () => (
    <div className="flex h-full">
      <div className="w-44 border-r border-border flex flex-col bg-surface/30 overflow-y-auto">
        <div className="p-2 border-b border-border text-[10px] text-text-muted uppercase tracking-wide font-semibold">Slides</div>
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSelectedSlide(i)}
            className={`w-full text-left px-3 py-2 text-xs border-b border-border hover:bg-surface/50 transition-colors ${selectedSlide === i ? 'bg-neon-purple/10 border-l-2 border-l-neon-purple' : ''}`}
          >
            <div className="text-text-muted">#{i + 1}</div>
            <div className="text-text truncate">{s.title}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background/50">
        <div className="w-full max-w-2xl aspect-[16/9] bg-surface border border-border rounded-lg shadow-2xl p-8 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-text mb-2">{slides[selectedSlide]?.title}</div>
          <div className="text-sm text-text-muted whitespace-pre-line text-center">{slides[selectedSlide]?.content}</div>
        </div>
      </div>
    </div>
  );

  const renderWhiteboard = () => (
    <div className="flex-1 flex items-center justify-center bg-surface/20">
      <div className="text-center">
        <div className="text-6xl mb-4">🎨</div>
        <div className="text-text font-medium">Whiteboard</div>
        <div className="text-text-muted text-xs mt-2">Área de desenho livre com shapes, textos e sticky notes</div>
        <div className="mt-4 flex gap-2 justify-center">
          {['✏️ Caneta', '⬜ Retângulo', '⭕ Círculo', '📝 Texto', '📌 Sticky', '🔗 Seta'].map(tool => (
            <button key={tool} className="px-3 py-1.5 text-[10px] bg-surface border border-border rounded hover:bg-surface/80">{tool}</button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderKanban = () => {
    const columns = ['backlog', 'todo', 'doing', 'done'] as const;
    const colLabels = { backlog: '📦 Backlog', todo: '📝 To Do', doing: '🔄 Doing', done: '✅ Done' };
    const colColors = { backlog: 'text-text-muted', todo: 'text-neon-yellow', doing: 'text-neon-blue', done: 'text-neon-green' };

    return (
      <div className="flex gap-3 p-3 overflow-x-auto h-full">
        {columns.map(col => {
          const tasks = kanban.filter(t => t.column === col);
          return (
            <div key={col} className="w-64 flex-shrink-0 bg-surface/50 border border-border rounded-lg p-3">
              <div className={`text-xs font-semibold ${colColors[col]} mb-3`}>{colLabels[col]} ({tasks.length})</div>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="bg-background border border-border rounded p-2.5 hover:border-neon-blue/30 transition-colors cursor-pointer">
                    <div className="text-xs text-text font-medium">{task.title}</div>
                    <div className="flex gap-1 mt-1.5">
                      {task.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 text-[9px] bg-surface border border-border rounded text-text-muted">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCharts = () => {
    const data = [
      { label: 'Jan', value: 65 }, { label: 'Fev', value: 45 },
      { label: 'Mar', value: 80 }, { label: 'Abr', value: 55 },
      { label: 'Mai', value: 90 }, { label: 'Jun', value: 70 },
    ];
    const max = Math.max(...data.map(d => d.value));

    return (
      <div className="flex-1 p-6 bg-surface/20">
        <div className="text-sm font-semibold text-text mb-4">📊 Métricas do Mês</div>
        <div className="flex items-end gap-3 h-64">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-text-muted">{d.value}%</span>
              <div
                className="w-full bg-neon-blue/60 border border-neon-blue/30 rounded-t transition-all hover:bg-neon-blue/80"
                style={{ height: `${(d.value / max) * 100}%` }}
              />
              <span className="text-[10px] text-text-muted">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background text-text">
      {/* Tab Bar */}
      <div className="flex border-b border-border bg-surface/30">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-neon-blue border-neon-blue bg-neon-blue/5'
                : 'text-text-muted border-transparent hover:text-text hover:bg-surface/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'docs' && renderDocs()}
        {activeTab === 'sheets' && renderSheets()}
        {activeTab === 'slides' && renderSlides()}
        {activeTab === 'whiteboard' && renderWhiteboard()}
        {activeTab === 'kanban' && renderKanban()}
        {activeTab === 'charts' && renderCharts()}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1.5 border-t border-border bg-surface/30 flex items-center gap-4 text-[10px] text-text-muted">
        <span>📋 {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
        <span>{activeTab === 'docs' ? `${docs.length} documentos` : activeTab === 'sheets' ? `${sheets.length} planilhas` : activeTab === 'kanban' ? `${kanban.length} tasks` : activeTab === 'slides' ? `${slides.length} slides` : 'Canvas'}</span>
        <span className="ml-auto">CoWork Workbench v0.5.52</span>
      </div>
    </div>
  );
}
