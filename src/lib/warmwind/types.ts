/**
 * Warmwind OS Integration Types
 * Funcionários IA, Modo Ensino, Runner Visual de Tarefas
 */

// ── Funcionários IA ──

export interface AIEmployee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'idle' | 'working' | 'learning' | 'paused' | 'error';
  specialty: string;
  skills: string[];
  tasksCompleted: number;
  currentTask?: string;
  uptime: number; // hours
  efficiency: number; // tasks per hour
  connectedApps: string[];
  createdAt: Date;
  lastActive: Date;
}

export interface EmployeeTask {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  steps: TaskStep[];
  currentStep: number;
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  result?: string;
  error?: string;
}

export interface TaskStep {
  id: string;
  action: 'click' | 'type' | 'navigate' | 'scroll' | 'extract' | 'wait' | 'screenshot' | 'decide' | 'communicate';
  target?: string;
  value?: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'skipped';
  screenshot?: string;
  perception?: ScreenPerception;
}

// ── Percepção de Tela (Vision-based) ──

export interface ScreenPerception {
  timestamp: Date;
  url: string;
  title: string;
  elements: ScreenElement[];
  screenshot?: string;
}

export interface ScreenElement {
  id: string;
  type: 'button' | 'input' | 'text' | 'link' | 'image' | 'menu' | 'dropdown' | 'checkbox' | 'icon';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactive: boolean;
  confidence: number;
}

// ── Modo Ensino (Teaching Mode) ──

export interface TeachingSession {
  id: string;
  name: string;
  description: string;
  status: 'recording' | 'paused' | 'completed' | 'reviewing';
  recordedActions: RecordedAction[];
  learnedPattern?: LearnedPattern;
  employeeId?: string;
  startedAt: Date;
  endedAt?: Date;
}

export interface RecordedAction {
  id: string;
  type: 'click' | 'type' | 'navigate' | 'select' | 'scroll' | 'wait' | 'screenshot';
  target?: ScreenElement;
  value?: string;
  url?: string;
  description: string;
  timestamp: Date;
  screenshot?: string;
  context: string;
}

export interface LearnedPattern {
  id: string;
  name: string;
  description: string;
  steps: RecordedAction[];
  triggers: PatternTrigger[];
  confidence: number;
  timesUsed: number;
}

export interface PatternTrigger {
  type: 'url_match' | 'element_found' | 'schedule' | 'event' | 'manual';
  config: Record<string, string>;
}

// ── App Store ──

export interface AppIntegration {
  id: string;
  name: string;
  icon: string;
  category: 'email' | 'crm' | 'social' | 'ecommerce' | 'productivity' | 'erp' | 'communication' | 'analytics';
  description: string;
  connected: boolean;
  features: string[];
  setupDifficulty: 'easy' | 'medium' | 'hard';
  popular: boolean;
}

// ── Dashboard ──

export interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  tasksRunning: number;
  tasksCompletedToday: number;
  tasksFailedToday: number;
  avgTaskDuration: number; // seconds
  productivity: number; // tasks per hour
  uptime: number; // percentage
}

export interface ActivityLog {
  id: string;
  employeeId: string;
  employeeName: string;
  action: string;
  target: string;
  status: 'success' | 'error' | 'info';
  timestamp: Date;
  details?: string;
}
