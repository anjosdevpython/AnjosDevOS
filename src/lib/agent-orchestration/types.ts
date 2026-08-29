/**
 * Tipos do Sistema de Orquestração de Agentes
 */

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'task' | 'result' | 'error' | 'broadcast';
  payload: Record<string, unknown>;
  timestamp: Date;
  correlationId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  estimatedDuration: string;
  requiredAgents?: string[];
}

export interface OrchestratorAgent {
  id: string;
  name: string;
  type: 'ai' | 'tool' | 'human' | 'hybrid';
  icon: string;
  status: 'idle' | 'busy' | 'offline' | 'error';
  capabilities: AgentCapability[];
  maxConcurrentTasks: number;
  currentTasks: string[];
  metadata: Record<string, string>;
}

export interface TaskRequest {
  id: string;
  description: string;
  requiredCapabilities: string[];
  preferredAgent?: string;
  input: Record<string, unknown>;
  timeout: number;
  callbacks?: {
    onStart?: string;
    onProgress?: string;
    onComplete?: string;
    onError?: string;
  };
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  status: 'completed' | 'failed' | 'partial' | 'cancelled';
  output: Record<string, unknown>;
  error?: string;
  duration: number;
  stepsExecuted: number;
  artifacts?: TaskArtifact[];
}

export interface TaskArtifact {
  id: string;
  type: 'file' | 'code' | 'screenshot' | 'report' | 'data' | 'url';
  name: string;
  content: string;
  mimeType: string;
  url?: string;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  capability: string;
  input: Record<string, unknown>;
  dependsOn?: string[];
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  active: boolean;
  createdBy: 'user' | 'agent' | 'learned';
  runs: number;
  lastRun?: Date;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'event' | 'url_pattern' | 'element_change';
  config: Record<string, string>;
}

export interface BrowserAction {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'select' | 'wait' | 'screenshot' | 'extract' | 'scroll' | 'hover' | 'submit' | 'evaluate' | 'wait_for_element' | 'drag' | 'upload';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  description: string;
  screenshot?: string;
  extractedData?: string;
}

export interface BrowserSession {
  id: string;
  url: string;
  title: string;
  actions: BrowserAction[];
  cookies: Record<string, string>;
  localStorage: Record<string, string>;
  history: string[];
  screenshots: SessionScreenshot[];
  startedAt: Date;
  lastActivity: Date;
}

export interface SessionScreenshot {
  id: string;
  url: string;
  timestamp: Date;
  base64?: string;
  description?: string;
}

export interface LearnedWorkflow {
  id: string;
  name: string;
  description: string;
  sourceUrl: string;
  actions: BrowserAction[];
  learnedFrom: 'user_observation' | 'manual_recording' | 'ai_inference';
  confidence: number;
  timesUsed: number;
  lastUsed?: Date;
  tags: string[];
}

export interface HermesThought {
  id: string;
  content: string;
  type: 'observation' | 'reasoning' | 'hypothesis' | 'conclusion' | 'action' | 'reflection';
  confidence: number;
  timestamp: Date;
  parentThoughtId?: string;
  childThoughtIds: string[];
}

export interface HermesReasoningChain {
  id: string;
  problem: string;
  thoughts: HermesThought[];
  conclusion?: string;
  status: 'exploring' | 'converged' | 'stuck' | 'completed';
  startedAt: Date;
  completedAt?: Date;
  alternativeChains: string[];
}

export interface HermesDecision {
  id: string;
  question: string;
  options: { label: string; description: string; pros: string[]; cons: string[]; score: number }[];
  selectedOption?: number;
  reasoning: string;
  confidence: number;
}
