export type FlowNodeType =
  | 'trigger'
  | 'llm'
  | 'code'
  | 'http'
  | 'condition'
  | 'transform'
  | 'notification'
  | 'log'
  | 'action';

export interface FlowNode {
  id: string;
  name: string;
  type: FlowNodeType;
  x: number;
  y: number;
  config: {
    prompt?: string;
    model?: string;
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: string;
    code?: string;
    conditionExpression?: string;
    cronExpression?: string;
    webhookSecret?: string;
    channel?: string;
    message?: string;
    timeoutMs?: number;
    retries?: number;
  };
  status?: 'idle' | 'running' | 'success' | 'failed' | 'skipped';
  lastOutput?: unknown;
  durationMs?: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  conditionValue?: boolean;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  triggerType: 'manual' | 'cron' | 'webhook' | 'git_push';
  cronSchedule?: string;
  webhookId?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: number;
  updatedAt: number;
  lastRunAt?: number;
  lastRunStatus?: 'success' | 'failed' | 'running';
}

export interface FlowRunLogItem {
  timestamp: string;
  nodeId: string;
  nodeName: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: unknown;
}

export interface FlowRun {
  id: string;
  flowId: string;
  flowName: string;
  startedAt: number;
  completedAt?: number;
  status: 'running' | 'success' | 'failed';
  durationMs?: number;
  logs: FlowRunLogItem[];
  nodeOutputs: Record<string, unknown>;
  triggerContext?: unknown;
}
