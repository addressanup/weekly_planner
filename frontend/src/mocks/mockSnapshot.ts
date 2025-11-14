import { buildFloatingSeed, buildSeedTasks, buildWeeklySkeleton } from '../lib/plannerSeed'
import type { PlannerSnapshot } from '../types/persistence'

const week = buildWeeklySkeleton(new Date())
const tasks = buildSeedTasks(week)
const floatingTasks = buildFloatingSeed()

export const mockPlannerSnapshot: PlannerSnapshot = {
  id: 'mock-snapshot',
  capturedAtISO: new Date().toISOString(),
  activeWeek: week,
  tasks,
  floatingTasks,
  source: 'mock',
}

