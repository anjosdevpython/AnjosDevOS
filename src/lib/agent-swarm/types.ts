/**
 * AnjosDevOS - Autonomous Agent Swarm Types
 * Tipos do motor de enxame de agentes colaborativos e autônomos
 */

export type SwarmAgentRole =
  | 'architect'    // Líder Técnico, decomposição de tarefas e arquitetura
  | 'coder'        // Engenheiro Fullstack, implementação de código e refatoração
  | 'reviewer'     // Auditor de Código, QA e Segurança (OWASP, Clean Code)
  | 'debugger'     // Especialista em diagnóstico de erros, stack traces e auto-patch
  | 'autopilot'    // Engenheiro de Automação, fluxos, scraping, APIs e pipelines
  | 'devops'       // Especialista em infraestrutura, Docker, CI/CD e deploy
  | 'docs';        // Redator Técnico, documentação viva e manuais

export type SwarmAgentStatus = 'idle' | 'thinking' | 'coding' | 'reviewing' | 'debugging' | 'automating' | 'error';

export type SwarmMessageType =
  | 'task_delegation'     // Agente A passa subtarefa para Agente B
  | 'code_submission'     // Coder envia código para Reviewer
  | 'review_feedback'     // Reviewer envia feedback (aprovação ou reprovação)
  | 'bug_report'          // Reviewer/Tester envia relatório de bug para Debugger
  | 'patch_proposal'      // Debugger propõe correção para Coder
  | 'automation_trigger'  // Agente dispara fluxo de automação para AutoPilot
  | 'deploy_request'      // Agente solicita deploy para DevOps
  | 'docs_update'         // Agente solicita atualização de documentação para Docs
  | 'broadcast'           // Mensagem geral para todos os agentes
  | 'user_query';         // Requisição direta do usuário

export interface SwarmMessage {
  id: string;
  from: string;               // ID do agente remetente (ou 'user')
  to: string;                 // ID do agente destinatário (ou '*' para broadcast)
  type: SwarmMessageType;
  subject: string;
  content: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  status: 'sent' | 'processing' | 'resolved' | 'rejected';
}

export interface SwarmAgentDefinition {
  id: string;
  name: string;
  role: SwarmAgentRole;
  title: string;
  avatar: string;
  color: string;
  badge: string;
  systemPrompt: string;
  model: string;
  skills: string[];
  tools: string[];
  status: SwarmAgentStatus;
  currentActivity?: string;
  tasksCompleted: number;
  rating: number; // 0-100% de precisão histórica
}

export interface SwarmTaskStep {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  inputSummary: string;
  outputSummary?: string;
  codeSnippet?: string;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface SwarmCollaborationSession {
  id: string;
  goal: string;
  contextCode?: string;
  contextFile?: string;
  status: 'planning' | 'executing' | 'reviewing' | 'completed' | 'failed';
  initiatorAgent: string;
  assignedAgents: string[];
  steps: SwarmTaskStep[];
  messages: SwarmMessage[];
  finalResult?: {
    code?: string;
    diff?: string;
    summary: string;
    reviewScore?: number;
    testsGenerated?: string;
    automationStatus?: string;
  };
  startedAt: Date;
  completedAt?: Date;
}

export interface CodeAuditResult {
  file: string;
  score: number; // 0-100
  passed: boolean;
  issues: {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    line?: number;
    title: string;
    description: string;
    suggestion: string;
    fixedCode?: string;
  }[];
  securityAnalysis: {
    vulnerabilitiesFound: number;
    owaspTop10Checked: boolean;
    sanitizeInputsChecked: boolean;
    authIssuesChecked: boolean;
  };
  summary: string;
  reviewedBy: string;
  timestamp: Date;
}

export interface AutomationExecutionStep {
  id: string;
  nodeId: string;
  nodeName: string;
  type: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  log: string[];
  durationMs: number;
  output?: unknown;
}
