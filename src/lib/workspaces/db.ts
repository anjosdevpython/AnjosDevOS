import Dexie, { type Table } from 'dexie';
import type { Workspace, WorkspaceSnapshot } from './types';
import type { Flow, FlowRun } from '../automation/types';

export class AnjosDevOSDatabase extends Dexie {
  workspaces!: Table<Workspace, string>;
  snapshots!: Table<WorkspaceSnapshot, string>;
  flows!: Table<Flow, string>;
  flowRuns!: Table<FlowRun, string>;

  constructor() {
    super('AnjosDevOS_DB');
    this.version(2).stores({
      workspaces: 'id, name, createdAt, updatedAt, lastOpenedAt',
      snapshots: 'id, workspaceId, timestamp',
      flows: 'id, name, triggerType, createdAt, updatedAt, lastRunAt',
      flowRuns: 'id, flowId, startedAt, status',
    });
  }
}

export const db = new AnjosDevOSDatabase();
