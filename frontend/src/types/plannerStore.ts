/**
 * Shared Planner Store Types
 *
 * This file defines the common interface that both planner stores
 * (localStorage and API-integrated) must implement. This ensures
 * type safety when using the unified usePlanner hook.
 */

import type { PlannerWeek, PlannerTask, PlannerSwimlaneKey } from './planner'
import type { PlannerSnapshot } from './persistence'

type PlannerViewMode = 'weekly' | 'list'

/**
 * Common read-only state shared by both stores
 */
export interface BasePlannerState {
  mode: PlannerViewMode
  activeWeek: PlannerWeek
  tasks: PlannerTask[]
  floatingTasks: PlannerTask[]
  isHydrated: boolean
  isSaving: boolean
  lastSavedAt?: string
  snapshotSource?: PlannerSnapshot['source']
}

/**
 * Common actions shared by both stores
 * Note: Some stores may return Promises while others are synchronous
 */
export interface BasePlannerActions {
  setMode: (mode: PlannerViewMode) => void
  setTheme: (dayId: string, theme?: string) => void | Promise<void>
  setFocusMetric: (dayId: string, focusMetric?: string) => void | Promise<void>
  hydrateFromDate: (date: Date) => void
  goToPreviousWeek: () => void
  goToNextWeek: () => void
  resetToCurrentWeek: () => void
  moveTask: (payload: {
    taskId: string
    dayId: string
    swimlaneId: PlannerSwimlaneKey
    index: number
  }) => void | Promise<void>
  createFloatingTask: (
    task: Omit<PlannerTask, 'id' | 'order' | 'status'> &
      Partial<Pick<PlannerTask, 'status'>>
  ) => PlannerTask | Promise<PlannerTask>
  reorderFloatingTask: (taskId: string, index: number) => void
  scheduleFloatingTask: (payload: {
    taskId: string
    dayId: string
    swimlaneId: PlannerSwimlaneKey
    index: number
  }) => void | Promise<void>
  unscheduleTask: (payload: { taskId: string; index?: number }) => void | Promise<void>
  loadInitialSnapshot: () => Promise<void>
  persistSnapshot: () => Promise<void>
}

/**
 * Combined base interface that all planner stores must satisfy
 */
export type BasePlannerStore = BasePlannerState & BasePlannerActions

/**
 * Type helper to extract the return type from a Zustand store
 */
export type StoreState<T> = T extends { getState: () => infer S } ? S : never
