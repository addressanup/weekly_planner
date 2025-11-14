import type { PlannerTask, PlannerWeek } from './planner'

export interface PlannerSnapshot {
  id: string
  capturedAtISO: string
  activeWeek: PlannerWeek
  tasks: PlannerTask[]
  floatingTasks: PlannerTask[]
  source: 'mock' | 'local-storage' | 'backend-api'
}

export interface PlannerSnapshotEnvelope {
  snapshot: PlannerSnapshot
  version: number
}

