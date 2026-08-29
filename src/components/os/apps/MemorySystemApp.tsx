'use client';

import { useState } from 'react';

interface Memory {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'task' | 'context' | 'relationship';
  tags: string[];
  source: string;
  created: string;
  lastAccessed: string;
  accessCount: number;
  importance: 'high' | 'medium' | 'low';
}

interface Entity {
  id: string;
  name: string;
  type: 'person' | 'project' | 'concept' | 'tool' | 'location';
  icon: string;
  properties: Record<string, string>;
  connections: string[];
}

interface Relationship {
  id: string;
  from: string;
  to: string;
  type: string;
  weight: number;
}

const INITIAL_MEMORIES: Memory[] = [
  { id: 'mem1', content: 'Allan prefere TypeScript sobre JavaScript em todos os projetos', type: 'preference', tags: ['allan', 'typescript'], source: 'chat', created: '2026-08-28', lastAccessed: '2026-08-28', accessCount: 5, importance: 'high' },
  { id: 'mem2', content: 'AnjosDevOS usa Next.js 15 com App Router e Tailwind CSS', type: 'fact', tags: ['anjosdevos', 'nextjs', 'tech-stack'], source: 'codebase', created: '2026-08-28', lastAccessed: '2026-08-28', accessCount: 12, importance: 'high' },
  { id: 'mem3', content: 'O projeto está no GitHub: github.com/anjosdevpython/AnjosDevOS', type: 'fact', tags: ['anjosdevos', 'github'], source: 'git', created: '2026-08-28', lastAccessed: '2026-08-28', accessCount: 3, importance: 'medium' },
  { id: 'mem4', content: 'Deploy automático configurado para branch main via CI/CD', type: 'task', tags: ['deploy', 'ci-cd'], source: 'devops', created: '2026-08-28', lastAccessed: '2026-08-28', accessCount: 1, importance: 'medium' },
  { id: 'mem5', content: 'OpenAI, Anthropic, Google, DeepSeek, xAI, Mistral, Groq são providers suportados', type: 'fact', tags: ['providers', 'ai'], source: 'codebase', created: '2026-08-28', lastAccessed: '2026-08-28', accessCount: 8, importance: 'high' },
  { id: 'mem6', content: 'Próximo passo: adicionar Monaco Editor e Agent Manager', type: 'task', tags: ['roadmap', 'next-steps'], source: 'chat', created: '2026-08-28', lastAccessed: '2026-08-28', accessCount: 2, importance: 'high' },
];

const INITIAL_ENTITIES: Entity[] = [
  { id: 'e1', name: 'Allan', type: 'person', icon: '👤', properties: { role: 'Developer', language: 'Python/TS' }, connections: ['e2', 'e3'] },
  { id: 'e2', name: 'AnjosDevOS', type: 'project', icon: '💻', properties: { framework: 'Next.js', status: 'active' }, connections: ['e1', 'e4', 'e5'] },
  { id: 'e3', name: 'Python', type: 'concept', icon: '🐍', properties: { use: 'Backend/AI' }, connections: ['e1'] },
  { id: 'e4', name: 'DeepSeek', type: 'tool', icon: '🔮', properties: { type: 'AI Provider' }, connections: ['e2'] },
  { id: 'e5', name: 'Monaco Editor', type: 'tool', icon: '📝', properties: { type: 'Code Editor' }, connections: ['e2'] },
];

const INITIAL_RELATIONSHIPS: Relationship[] = [
  { id: 'r1', from: 'e1', to: 'e2', type: 'develops', weight: 5 },
  { id: 'r2', from: 'e2', to: 'e4', type: 'integrates', weight: 3 },
  { id: 'r3', from: 'e2', to: 'e5', type: 'includes', weight: 4 },
  { id: 'r4', from: 'e1', to: 'e3', type: 'uses', weight: 4 },
];

export function MemorySystemApp() {
  const [memories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [entities] = useState<Entity[]>(INITIAL_ENTITIES);
  const [relationships] = useState<Relationship[]>(INITIAL_RELATIONSHIPS);
  const [activeTab, setActiveTab] = useState<'memories' | 'graph' | 'entities' | 'search'>('memories');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  const typeColors = {
    fact: 'neon-blue',
    preference: 'neon-purple',
    task: 'neon-yellow',
    context: 'neon-green',
    relationship: 'neon-orange',
  };

  const entityColors = {
    person: 'neon-green',
    project: 'neon-blue',
    concept: 'neon-purple',
    tool: 'neon-yellow',
    location: 'neon-red',
  };

  const filteredMemories = memories.filter(m => {
    const matchesSearch = searchQuery === '' || m.content.toLowerCase().includes(searchQuery.toLowerCase()) || m.tags.some(t => t.includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const renderMemories = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Buscar memórias..."
          className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded text-text focus:outline-none focus:border-neon-blue"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2 py-1.5 text-[10px] bg-background border border-border rounded text-text"
        >
          <option value="all">Todos</option>
          <option value="fact">Fatos</option>
          <option value="preference">Preferências</option>
          <option value="task">Tasks</option>
          <option value="context">Contexto</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredMemories.map(mem => (
          <div key={mem.id} className="bg-surface/50 border border-border rounded-lg p-3 hover:border-neon-blue/30 transition-colors">
            <div className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 bg-${typeColors[mem.type]}`} />
              <div className="flex-1">
                <div className="text-[11px] text-text">{mem.content}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-1.5 py-0.5 text-[8px] rounded bg-${typeColors[mem.type]}/20 text-${typeColors[mem.type]}`}>{mem.type}</span>
                  {mem.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 text-[8px] bg-surface border border-border rounded text-text-muted">{tag}</span>
                  ))}
                  <span className="text-[8px] text-text-muted ml-auto">via {mem.source} · {mem.accessCount}x acessos</span>
                </div>
              </div>
              <span className={`px-1 py-0.5 text-[8px] rounded ${
                mem.importance === 'high' ? 'bg-neon-red/20 text-neon-red' :
                mem.importance === 'medium' ? 'bg-neon-yellow/20 text-neon-yellow' :
                'bg-surface text-text-muted'
              }`}>
                {mem.importance}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGraph = () => (
    <div className="flex-1 relative overflow-hidden bg-[#0a0a0f]">
      {/* Grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, #1a1a2e 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      {/* Entity Nodes */}
      <div className="relative w-full h-full">
        {entities.map((entity, i) => {
          const positions = [
            { x: '25%', y: '20%' }, { x: '55%', y: '15%' }, { x: '15%', y: '55%' },
            { x: '65%', y: '50%' }, { x: '40%', y: '70%' },
          ];
          const pos = positions[i % positions.length];
          return (
            <div
              key={entity.id}
              onClick={() => setSelectedEntity(entity)}
              className="absolute cursor-pointer hover:scale-110 transition-transform"
              style={{ left: pos.x, top: pos.y }}
            >
              <div className={`w-20 h-20 rounded-full bg-${entityColors[entity.type]}/10 border-2 border-${entityColors[entity.type]}/50 flex flex-col items-center justify-center shadow-lg`}>
                <span className="text-xl">{entity.icon}</span>
                <span className="text-[9px] text-text mt-0.5">{entity.name}</span>
              </div>
            </div>
          );
        })}

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {relationships.map(rel => {
            const fromIdx = entities.findIndex(e => e.id === rel.from);
            const toIdx = entities.findIndex(e => e.id === rel.to);
            const positions = [
              { x: 25, y: 20 }, { x: 55, y: 15 }, { x: 15, y: 55 },
              { x: 65, y: 50 }, { x: 40, y: 70 },
            ];
            if (fromIdx === -1 || toIdx === -1) return null;
            const from = positions[fromIdx];
            const to = positions[toIdx];
            return (
              <line
                key={rel.id}
                x1={`${from.x + 4}%`} y1={`${from.y + 4}%`}
                x2={`${to.x + 4}%`} y2={`${to.y + 4}%`}
                stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" opacity="0.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Entity Detail Panel */}
      {selectedEntity && (
        <div className="absolute right-4 top-4 w-56 bg-surface/95 backdrop-blur border border-border rounded-lg p-3 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedEntity.icon}</span>
              <span className="text-xs font-medium text-text">{selectedEntity.name}</span>
            </div>
            <button onClick={() => setSelectedEntity(null)} className="text-text-muted hover:text-text text-xs">✕</button>
          </div>
          <div className="text-[9px] text-text-muted mb-2 capitalize">Tipo: {selectedEntity.type}</div>
          <div className="space-y-1">
            {Object.entries(selectedEntity.properties).map(([key, val]) => (
              <div key={key} className="flex justify-between text-[9px]">
                <span className="text-text-muted">{key}:</span>
                <span className="text-text">{val}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[9px] text-text-muted">
            🔗 {selectedEntity.connections.length} conexões
          </div>
        </div>
      )}
    </div>
  );

  const renderEntities = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {entities.map(entity => (
        <div key={entity.id} className="bg-surface/50 border border-border rounded-lg p-3 hover:border-neon-blue/30 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xl">{entity.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text">{entity.name}</span>
                <span className={`px-1.5 py-0.5 text-[8px] rounded bg-${entityColors[entity.type]}/20 text-${entityColors[entity.type]}`}>{entity.type}</span>
              </div>
              <div className="flex gap-1 mt-1">
                {Object.entries(entity.properties).map(([k, v]) => (
                  <span key={k} className="text-[8px] text-text-muted">{k}: {v}</span>
                ))}
              </div>
            </div>
            <span className="text-[9px] text-text-muted">🔗 {entity.connections.length}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSearch = () => (
    <div className="flex-1 p-4">
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Busca semântica por memórias, entidades e relacionamentos..."
          className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-lg text-text focus:outline-none focus:border-neon-blue"
        />
      </div>

      {searchQuery && (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-text-muted mb-2">📋 Memórias ({filteredMemories.length})</div>
            {filteredMemories.map(mem => (
              <div key={mem.id} className="bg-surface/50 border border-border rounded p-2 mb-2 text-[11px] text-text">{mem.content}</div>
            ))}
          </div>
          <div>
            <div className="text-[10px] text-text-muted mb-2">🤖 Entidades</div>
            {entities.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).map(e => (
              <div key={e.id} className="bg-surface/50 border border-border rounded p-2 mb-2 text-[11px] text-text">{e.icon} {e.name}</div>
            ))}
          </div>
        </div>
      )}

      {!searchQuery && (
        <div className="text-center mt-20">
          <div className="text-4xl mb-3">🧠</div>
          <div className="text-sm text-text-muted">Digite para buscar na memória</div>
          <div className="text-[10px] text-text-muted mt-1">Busca semântica por memórias, entidades e relacionamentos</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background text-text">
      <div className="flex border-b border-border bg-surface/30">
        {(['memories', 'graph', 'entities', 'search'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-neon-blue border-neon-blue bg-neon-blue/5'
                : 'text-text-muted border-transparent hover:text-text hover:bg-surface/50'
            }`}
          >
            {tab === 'memories' ? '🧠 Memórias' : tab === 'graph' ? '🕸️ Grafo' : tab === 'entities' ? '🔗 Entidades' : '🔍 Buscar'}
          </button>
        ))}
      </div>

      {activeTab === 'memories' && renderMemories()}
      {activeTab === 'graph' && renderGraph()}
      {activeTab === 'entities' && renderEntities()}
      {activeTab === 'search' && renderSearch()}

      <div className="px-3 py-1.5 border-t border-border bg-surface/30 flex items-center gap-4 text-[10px] text-text-muted">
        <span>🧠 {memories.length} memórias</span>
        <span>🔗 {entities.length} entidades</span>
        <span>🕸️ {relationships.length} relações</span>
        <span className="ml-auto">Memory System v0.5.52</span>
      </div>
    </div>
  );
}
