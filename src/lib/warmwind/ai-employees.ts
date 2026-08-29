/**
 * AI Employees Manager
 * Sistema de Funcionários IA -Inspired by Warmwind OS
 * Cria funcionários virtuais que trabalham 24/7
 */

import type { AIEmployee, EmployeeTask, TaskStep, DashboardMetrics, ActivityLog } from './types';

const ROLE_TEMPLATES: { role: string; name: string; avatar: string; skills: string[]; specialty: string }[] = [
  { role: 'Atendente', name: 'Ana', avatar: '👩‍💼', skills: ['email', 'chat', 'whatsapp', 'resolução'], specialty: 'Atendimento ao cliente' },
  { role: 'Social Media', name: 'Marcos', avatar: '📱', skills: ['instagram', 'linkedin', 'twitter', 'conteúdo'], specialty: 'Gestão de redes sociais' },
  { role: 'Vendas', name: 'Julia', avatar: '💰', skills: ['crm', 'prospecção', 'follow-up', 'negociação'], specialty: 'Vendas e prospecção' },
  { role: 'Financeiro', name: 'Pedro', avatar: '📊', skills: ['planilhas', 'faturas', 'relatórios', 'orçamento'], specialty: 'Gestão financeira' },
  { role: 'Suporte Técnico', name: 'Carlos', avatar: '🔧', skills: ['debug', 'documentação', 'triagem', 'remoto'], specialty: 'Suporte técnico' },
  { role: 'Pesquisador', name: 'Laura', avatar: '🔍', skills: ['web', 'dados', 'análise', 'relatórios'], specialty: 'Pesquisa e análise' },
  { role: 'Assistente', name: 'Maria', avatar: '📋', skills: ['agenda', 'e-mails', 'organização', 'lembretes'], specialty: 'Assistente pessoal' },
  { role: 'Desenvolvedor', name: 'Rafael', avatar: '💻', skills: ['código', 'api', 'automação', 'deploy'], specialty: 'Desenvolvimento' },
];

class AIEmployeesManager {
  private employees: Map<string, AIEmployee> = new Map();
  private tasks: Map<string, EmployeeTask> = new Map();
  private activityLog: ActivityLog[] = [];
  private listeners: ((event: string, data: unknown) => void)[] = [];

  // ── Criar Funcionário ──

  createEmployee(roleIndex: number, customName?: string): AIEmployee {
    const template = ROLE_TEMPLATES[roleIndex % ROLE_TEMPLATES.length];
    const employee: AIEmployee = {
      id: this.generateId(),
      name: customName || template.name,
      role: template.role,
      avatar: template.avatar,
      status: 'idle',
      specialty: template.specialty,
      skills: template.skills,
      tasksCompleted: 0,
      uptime: 0,
      efficiency: 0,
      connectedApps: [],
      createdAt: new Date(),
      lastActive: new Date(),
    };

    this.employees.set(employee.id, employee);
    this.logActivity(employee.id, employee.name, 'Funcionário criado', employee.role, 'success');
    this.emit('employee:created', { employee });
    return employee;
  }

  createCustomEmployee(name: string, role: string, skills: string[]): AIEmployee {
    const employee: AIEmployee = {
      id: this.generateId(),
      name,
      role,
      avatar: '🤖',
      status: 'idle',
      specialty: role,
      skills,
      tasksCompleted: 0,
      uptime: 0,
      efficiency: 0,
      connectedApps: [],
      createdAt: new Date(),
      lastActive: new Date(),
    };

    this.employees.set(employee.id, employee);
    this.logActivity(employee.id, name, 'Funcionário personalizado criado', role, 'success');
    return employee;
  }

  // ── Gerenciar Funcionários ──

  getEmployee(id: string): AIEmployee | undefined {
    return this.employees.get(id);
  }

  getAllEmployees(): AIEmployee[] {
    return Array.from(this.employees.values());
  }

  getActiveEmployees(): AIEmployee[] {
    return this.getAllEmployees().filter(e => e.status === 'working');
  }

  pauseEmployee(id: string): void {
    const emp = this.employees.get(id);
    if (emp) {
      emp.status = 'paused';
      this.employees.set(id, emp);
      this.logActivity(id, emp.name, 'Funcionário pausado', '', 'info');
    }
  }

  resumeEmployee(id: string): void {
    const emp = this.employees.get(id);
    if (emp) {
      emp.status = 'idle';
      this.employees.set(id, emp);
      this.logActivity(id, emp.name, 'Funcionário retomado', '', 'info');
    }
  }

  removeEmployee(id: string): void {
    const emp = this.employees.get(id);
    if (emp) {
      this.employees.delete(id);
      this.logActivity(id, emp.name, 'Funcionário removido', '', 'info');
    }
  }

  // ── Atribuir Tarefas ──

  assignTask(employeeId: string, title: string, description: string, steps: TaskStep[]): EmployeeTask | null {
    const employee = this.employees.get(employeeId);
    if (!employee || employee.status === 'paused') return null;

    const task: EmployeeTask = {
      id: this.generateId(),
      employeeId,
      title,
      description,
      status: 'queued',
      steps,
      currentStep: 0,
      progress: 0,
    };

    this.tasks.set(task.id, task);
    employee.status = 'working';
    employee.currentTask = title;
    this.employees.set(employeeId, employee);

    this.logActivity(employeeId, employee.name, `Tarefa atribuída: ${title}`, description, 'info');
    this.emit('task:assigned', { task });

    // Simular execução
    this.simulateTaskExecution(task);

    return task;
  }

  private async simulateTaskExecution(task: EmployeeTask): Promise<void> {
    task.status = 'running';
    task.startedAt = new Date();

    for (let i = 0; i < task.steps.length; i++) {
      task.currentStep = i;
      task.steps[i].status = 'running';

      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

      task.steps[i].status = 'completed';
      task.progress = Math.round(((i + 1) / task.steps.length) * 100);

      this.emit('task:progress', { taskId: task.id, progress: task.progress });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.result = `Tarefa "${task.title}" concluída com sucesso`;

    const employee = this.employees.get(task.employeeId);
    if (employee) {
      employee.tasksCompleted++;
      employee.status = 'idle';
      employee.currentTask = undefined;
      employee.lastActive = new Date();
      this.employees.set(task.employeeId, employee);
    }

    this.logActivity(task.employeeId, employee?.name || '', `Tarefa concluída: ${task.title}`, '', 'success');
    this.emit('task:completed', { task });
  }

  // ── Dashboard ──

  getMetrics(): DashboardMetrics {
    const employees = this.getAllEmployees();
    const allTasks = Array.from(this.tasks.values());

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === 'working').length,
      tasksRunning: allTasks.filter(t => t.status === 'running').length,
      tasksCompletedToday: allTasks.filter(t => t.status === 'completed').length,
      tasksFailedToday: allTasks.filter(t => t.status === 'failed').length,
      avgTaskDuration: 12,
      productivity: employees.length > 0 ? Math.round(allTasks.filter(t => t.status === 'completed').length / Math.max(1, employees.length)) : 0,
      uptime: 99.5,
    };
  }

  getActivityLog(limit = 50): ActivityLog[] {
    return this.activityLog.slice(-limit);
  }

  private logActivity(employeeId: string, employeeName: string, action: string, target: string, status: ActivityLog['status']): void {
    this.activityLog.push({
      id: this.generateId(),
      employeeId,
      employeeName,
      action,
      target,
      status,
      timestamp: new Date(),
    });
  }

  // ── Eventos ──

  on(listener: (event: string, data: unknown) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(event: string, data: unknown): void {
    this.listeners.forEach(l => l(event, data));
  }

  private generateId(): string {
    return `emp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

// Singleton
let instance: AIEmployeesManager | null = null;

export function getAIEmployeesManager(): AIEmployeesManager {
  if (!instance) instance = new AIEmployeesManager();
  return instance;
}

export { AIEmployeesManager, ROLE_TEMPLATES };
