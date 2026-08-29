'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAIEmployeesManager, ROLE_TEMPLATES } from '@/lib/warmwind/ai-employees';
import { getAppStore } from '@/lib/warmwind/app-store';
import type { AIEmployee, EmployeeTask, DashboardMetrics, ActivityLog, AppIntegration } from '@/lib/warmwind/types';

type TabId = 'funcionarios' | 'tarefas' | 'appstore' | 'dashboard' | 'ensino';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'funcionarios', label: 'Funcionários', icon: '👥' },
  { id: 'tarefas', label: 'Tarefas', icon: '📋' },
  { id: 'appstore', label: 'Loja de Apps', icon: '🏪' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'ensino', label: 'Modo Ensino', icon: '🎓' },
];

export function WarmwindApp() {
  const [activeTab, setActiveTab] = useState<TabId>('funcionarios');
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [teachingMode, setTeachingMode] = useState(false);
  const [teachingSteps, setTeachingSteps] = useState<string[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const manager = getAIEmployeesManager();
  const appStore = getAppStore();

  // Refresh data
  const refresh = useCallback(() => {
    setEmployees(manager.getAllEmployees());
    setMetrics(manager.getMetrics());
    setActivityLog(manager.getActivityLog());
  }, [manager]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  // ── Criar Funcionário ──

  const createEmployee = (roleIndex: number) => {
    const emp = manager.createEmployee(roleIndex);
    refresh();
    setShowCreateModal(false);
  };

  const createCustom = () => {
    if (!customName || !customRole) return;
    manager.createCustomEmployee(customName, customRole, ['automação', 'web', 'comunicação']);
    setCustomName('');
    setCustomRole('');
    refresh();
    setShowCreateModal(false);
  };

  // ── Atribuir Tarefa ──

  const assignTask = (empId: string) => {
    if (!newTaskTitle) return;
    const steps = [
      { id: '1', action: 'navigate' as const, description: 'Navegar para o alvo', status: 'pending' as const },
      { id: '2', action: 'click' as const, description: 'Interagir com elemento', status: 'pending' as const },
      { id: '3', action: 'type' as const, value: newTaskDesc, description: 'Preencher dados', status: 'pending' as const },
      { id: '4', action: 'screenshot' as const, description: 'Capturar resultado', status: 'pending' as const },
    ];
    manager.assignTask(empId, newTaskTitle, newTaskDesc || 'Tarefa automática', steps);
    setNewTaskTitle('');
    setNewTaskDesc('');
    refresh();
  };

  // ── Modo Ensino ──

  const startTeaching = () => {
    setTeachingMode(true);
    setTeachingSteps([]);
  };

  const addTeachingStep = (step: string) => {
    setTeachingSteps(prev => [...prev, step]);
  };

  const stopTeaching = () => {
    setTeachingMode(false);
    if (teachingSteps.length > 0) {
      // Criar funcionário com o padrão aprendido
      const emp = manager.createCustomEmployee(
        'Assistente Aprendido',
        `Tarefa: ${teachingSteps[0]}`,
        ['aprendido', 'automático']
      );
      refresh();
    }
  };

  // ── Renderização ──

  const renderFuncionarios = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">👥 Funcionários IA</h3>
          <p className="text-[10px] text-text-muted mt-0.5">{employees.length} funcionários · {employees.filter(e => e.status === 'working').length} trabalhando</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/30"
        >
          + Novo Funcionário
        </button>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 gap-3">
        {employees.map(emp => (
          <div
            key={emp.id}
            onClick={() => setSelectedEmployee(selectedEmployee?.id === emp.id ? null : emp)}
            className={`bg-surface/50 border rounded-xl p-4 cursor-pointer transition-all hover:border-neon-blue/30 ${
              selectedEmployee?.id === emp.id ? 'border-neon-blue/50 bg-neon-blue/5' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center text-2xl">
                {emp.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">{emp.name}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] rounded-full ${
                    emp.status === 'idle' ? 'bg-neon-green/20 text-neon-green' :
                    emp.status === 'working' ? 'bg-neon-blue/20 text-neon-blue animate-pulse' :
                    emp.status === 'paused' ? 'bg-neon-yellow/20 text-neon-yellow' :
                    'bg-surface text-text-muted'
                  }`}>
                    {emp.status === 'idle' ? '🟢 Disponível' :
                     emp.status === 'working' ? '🔵 Trabalhando' :
                     emp.status === 'paused' ? '🟡 Pausado' : '⚪ Inativo'}
                  </span>
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">{emp.role} · {emp.specialty}</div>
                {emp.currentTask && (
                  <div className="text-[9px] text-neon-blue mt-0.5">📋 {emp.currentTask}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-neon-green">{emp.tasksCompleted}</div>
                <div className="text-[8px] text-text-muted">tarefas</div>
              </div>
            </div>

            {/* Expanded details */}
            {selectedEmployee?.id === emp.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex flex-wrap gap-1 mb-3">
                  {emp.skills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 text-[9px] bg-surface border border-border rounded-full text-text-muted">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); assignTask(emp.id); }}
                    className="px-3 py-1.5 text-[10px] bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/30"
                  >
                    📋 Atribuir Tarefa
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); emp.status === 'paused' ? manager.resumeEmployee(emp.id) : manager.pauseEmployee(emp.id); refresh(); }}
                    className="px-3 py-1.5 text-[10px] bg-surface border border-border rounded-lg hover:bg-surface/80"
                  >
                    {emp.status === 'paused' ? '▶️ Retomar' : '⏸️ Pausar'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); manager.removeEmployee(emp.id); setSelectedEmployee(null); refresh(); }}
                    className="px-3 py-1.5 text-[10px] bg-neon-red/20 text-neon-red border border-neon-red/30 rounded-lg hover:bg-neon-red/30"
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {employees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👥</div>
            <div className="text-sm text-text-muted mb-2">Nenhum funcionário ainda</div>
            <div className="text-[10px] text-text-muted mb-4">Crie funcionários IA para automatizar seu trabalho</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-[11px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-xl hover:bg-neon-green/30"
            >
              + Criar Primeiro Funcionário
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-white mb-4">Novo Funcionário IA</h3>

            {/* Role templates */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {ROLE_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => createEmployee(i)}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-left"
                >
                  <span className="text-lg">{tpl.avatar}</span>
                  <div className="text-[11px] text-white font-medium mt-1">{tpl.role}</div>
                  <div className="text-[9px] text-white/40">{tpl.specialty}</div>
                </button>
              ))}
            </div>

            {/* Custom */}
            <div className="border-t border-white/10 pt-4">
              <div className="text-[10px] text-white/50 mb-2">Ou crie personalizado:</div>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Nome"
                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white mb-2 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                placeholder="Função (ex: Gerente de Projetos)"
                className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white mb-3 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={createCustom}
                className="w-full px-3 py-2 text-[11px] bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Criar Personalizado
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full mt-3 px-3 py-2 text-[11px] text-white/50 hover:text-white/70"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTarefas = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">📋 Tarefas</h3>
          <p className="text-[10px] text-text-muted mt-0.5">{tasks.length} tarefas · {tasks.filter(t => t.status === 'running').length} em execução</p>
        </div>
      </div>

      {/* Quick assign */}
      {employees.length > 0 && (
        <div className="bg-surface/50 border border-border rounded-xl p-4 mb-4">
          <div className="text-[10px] text-text-muted mb-2">Atribuir nova tarefa:</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Título da tarefa"
              className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-text focus:outline-none focus:border-neon-blue"
            />
            <button
              onClick={() => assignTask(employees[0].id)}
              className="px-3 py-1.5 text-[10px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg"
            >
              ⚡ Atribuir
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map(task => {
          const emp = employees.find(e => e.id === task.employeeId);
          return (
            <div key={task.id} className="bg-surface/50 border border-border rounded-xl p-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{emp?.avatar || '📋'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text">{task.title}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded-full ${
                      task.status === 'completed' ? 'bg-neon-green/20 text-neon-green' :
                      task.status === 'running' ? 'bg-neon-blue/20 text-neon-blue' :
                      task.status === 'failed' ? 'bg-neon-red/20 text-neon-red' :
                      'bg-surface text-text-muted'
                    }`}>
                      {task.status === 'completed' ? '✅ Concluída' :
                       task.status === 'running' ? '🔵 Rodando' :
                       task.status === 'failed' ? '❌ Falhou' : '⏳ Fila'}
                    </span>
                  </div>
                  <div className="text-[9px] text-text-muted mt-0.5">{emp?.name} · {task.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-neon-blue">{task.progress}%</div>
                </div>
              </div>
              {/* Progress bar */}
              {task.status === 'running' && (
                <div className="mt-2 h-1 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-neon-blue rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                </div>
              )}
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-sm text-text-muted">Nenhuma tarefa ainda</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAppStore = () => {
    const stats = appStore.getStats();
    const categories = ['email', 'crm', 'social', 'ecommerce', 'productivity', 'communication', 'erp', 'analytics'] as const;
    const catLabels: Record<string, string> = {
      email: '📧 E-mail', crm: '💼 CRM', social: '📱 Social', ecommerce: '🛒 E-commerce',
      productivity: '📝 Produtividade', communication: '💬 Comunicação', erp: '📦 ERP', analytics: '📈 Analytics',
    };

    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text">🏪 Loja de Apps</h3>
            <p className="text-[10px] text-text-muted mt-0.5">{stats.connected}/{stats.total} conectados</p>
          </div>
        </div>

        {categories.map(cat => {
          const apps = appStore.getByCategory(cat);
          if (apps.length === 0) return null;
          return (
            <div key={cat} className="mb-4">
              <div className="text-[10px] text-text-muted mb-2 font-semibold">{catLabels[cat]}</div>
              <div className="grid grid-cols-2 gap-2">
                {apps.map(app => (
                  <div
                    key={app.id}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      app.connected
                        ? 'bg-neon-green/5 border-neon-green/30'
                        : 'bg-surface/50 border-border hover:border-neon-blue/30'
                    }`}
                    onClick={() => {
                      if (app.connected) {
                        appStore.disconnect(app.id);
                      } else {
                        appStore.connect(app.id);
                      }
                      refresh();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{app.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-text truncate">{app.name}</div>
                        <div className="text-[9px] text-text-muted truncate">{app.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                        app.connected ? 'bg-neon-green/20 text-neon-green' : 'bg-surface text-text-muted'
                      }`}>
                        {app.connected ? '🟢 Conectado' : '⚪ Desconectado'}
                      </span>
                      <span className="text-[8px] text-text-muted">
                        {app.setupDifficulty === 'easy' ? 'Fácil' : app.setupDifficulty === 'medium' ? 'Médio' : 'Difícil'}
                      </span>
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

  const renderDashboard = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text">📊 Dashboard em Tempo Real</h3>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-neon-blue">{metrics.totalEmployees}</div>
            <div className="text-[10px] text-text-muted">Funcionários</div>
          </div>
          <div className="bg-gradient-to-br from-neon-green/10 to-neon-cyan/10 border border-neon-green/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-neon-green">{metrics.activeEmployees}</div>
            <div className="text-[10px] text-text-muted">Ativos</div>
          </div>
          <div className="bg-gradient-to-br from-neon-yellow/10 to-neon-orange/10 border border-neon-yellow/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-neon-yellow">{metrics.tasksRunning}</div>
            <div className="text-[10px] text-text-muted">Em Execução</div>
          </div>
          <div className="bg-gradient-to-br from-neon-purple/10 to-neon-pink/10 border border-neon-purple/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-neon-purple">{metrics.tasksCompletedToday}</div>
            <div className="text-[10px] text-text-muted">Concluídas</div>
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="text-[10px] text-text-muted mb-2 font-semibold">📋 Atividade Recente</div>
      <div className="space-y-1.5">
        {activityLog.slice(-10).reverse().map(log => (
          <div key={log.id} className="flex items-center gap-2 p-2 bg-surface/30 rounded-lg">
            <span className={`w-1.5 h-1.5 rounded-full ${
              log.status === 'success' ? 'bg-neon-green' :
              log.status === 'error' ? 'bg-neon-red' : 'bg-neon-blue'
            }`} />
            <span className="text-[10px] text-text-secondary flex-1">{log.action}</span>
            <span className="text-[9px] text-text-muted">{log.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
        {activityLog.length === 0 && (
          <div className="text-center py-8 text-[10px] text-text-muted">Nenhuma atividade ainda</div>
        )}
      </div>
    </div>
  );

  const renderEnsino = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text">🎓 Modo Ensino</h3>
        <p className="text-[10px] text-text-muted mt-0.5">Ensine o funcionário IA como executar uma tarefa</p>
      </div>

      {!teachingMode ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎓</div>
          <div className="text-sm text-text-muted mb-2">Modo de Ensino</div>
          <div className="text-[10px] text-text-muted mb-6 max-w-sm mx-auto">
            Grave seus passos enquanto executa uma tarefa. O funcionário IA aprende e repete automaticamente.
          </div>

          <div className="bg-surface/50 border border-border rounded-xl p-4 mb-6 text-left max-w-sm mx-auto">
            <div className="text-[10px] text-text-muted mb-3 font-semibold">Como funciona:</div>
            <div className="space-y-2">
              {[
                '1. Clique em "Iniciar Gravação"',
                '2. Execute os passos da tarefa',
                '3. O sistema grava cada ação',
                '4. Pare a gravação quando terminar',
                '5. O funcionário aprende o padrão',
              ].map((step, i) => (
                <div key={i} className="text-[10px] text-text-secondary">{step}</div>
              ))}
            </div>
          </div>

          <button
            onClick={startTeaching}
            className="px-6 py-3 text-[11px] bg-neon-red/20 text-neon-red border border-neon-red/30 rounded-xl hover:bg-neon-red/30 animate-pulse"
          >
            🔴 Iniciar Gravação
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4 p-3 bg-neon-red/10 border border-neon-red/30 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-neon-red animate-pulse" />
            <span className="text-xs text-neon-red font-medium">Gravando...</span>
            <span className="text-[10px] text-text-muted ml-auto">{teachingSteps.length} passos</span>
          </div>

          {/* Simulated recording steps */}
          <div className="space-y-2 mb-4">
            {teachingSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-surface/30 rounded-lg">
                <span className="text-[9px] text-neon-blue font-mono">#{i + 1}</span>
                <span className="text-[10px] text-text">{step}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            {['Clicar no botão', 'Digitar texto', 'Navegar para URL', 'Aguardar elemento', 'Tirar screenshot'].map(action => (
              <button
                key={action}
                onClick={() => addTeachingStep(action)}
                className="px-2 py-1 text-[9px] bg-surface border border-border rounded-lg hover:bg-surface/80"
              >
                + {action}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={stopTeaching}
              className="px-4 py-2 text-[11px] bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-xl"
            >
              ⏹️ Parar e Salvar
            </button>
            <button
              onClick={() => { setTeachingMode(false); setTeachingSteps([]); }}
              className="px-4 py-2 text-[11px] bg-surface border border-border rounded-xl"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background text-text">
      {/* Tab Bar */}
      <div className="flex border-b border-border bg-surface/30 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 whitespace-nowrap ${
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
        {activeTab === 'funcionarios' && renderFuncionarios()}
        {activeTab === 'tarefas' && renderTarefas()}
        {activeTab === 'appstore' && renderAppStore()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'ensino' && renderEnsino()}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1.5 border-t border-border bg-surface/30 flex items-center gap-4 text-[10px] text-text-muted">
        <span>👥 {employees.length} funcionários</span>
        <span>📋 {tasks.length} tarefas</span>
        <span>🏪 {appStore.getStats().connected} apps conectados</span>
        <span className="ml-auto">Warmwind Style v1.0</span>
      </div>
    </div>
  );
}
