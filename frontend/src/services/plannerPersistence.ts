import type { PlannerTask, PlannerWeek } from '../types/planner'
import type { PlannerSnapshot, PlannerSnapshotEnvelope } from '../types/persistence'
import { mockPlannerSnapshot } from '../mocks/mockSnapshot'

const STORAGE_KEY = 'weekly-planner:snapshot:v1'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const loadSnapshot = async (): Promise<PlannerSnapshot | null> => {
  if (typeof window === 'undefined') {
    return null
  }

  await sleep(120)

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const envelope = JSON.parse(raw) as PlannerSnapshotEnvelope
    return envelope.snapshot
  } catch (error) {
    console.warn('Failed to parse planner snapshot, falling back to mock data.', error)
    return null
  }
}

export const saveSnapshot = async (snapshot: PlannerSnapshot): Promise<void> => {
  if (typeof window === 'undefined') {
    return
  }

  await sleep(80)

  try {
    const envelope: PlannerSnapshotEnvelope = {
      version: 1,
      snapshot,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch (error) {
    console.error('Failed to save planner snapshot:', error)
    throw new Error('Failed to save planner data')
  }
}

export const loadOrCreateSnapshot = async (): Promise<PlannerSnapshot> => {
  const existing = await loadSnapshot()
  if (existing) {
    return {
      ...existing,
      source: 'local-storage',
    }
  }

  return mockPlannerSnapshot
}

export const createSnapshotFromState = (
  week: PlannerWeek,
  tasks: PlannerTask[],
  floatingTasks: PlannerTask[],
): PlannerSnapshot => ({
  id: `snapshot-${Date.now().toString(36)}`,
  capturedAtISO: new Date().toISOString(),
  activeWeek: week,
  tasks,
  floatingTasks,
  source: 'local-storage',
})

