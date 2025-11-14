/**
 * API Mappers
 *
 * Utility functions to convert between frontend and backend data formats.
 * The frontend uses lowercase string literals while the backend uses uppercase enums.
 */

import type { PlannerTask, PlannerCategory, PlannerEnergy, PlannerStatus, PlannerSwimlaneKey } from '../types/planner';
import type { Task, Week, Day, CreateTaskRequest, UpdateTaskRequest } from '../api/types';
import {
  PlannerCategory as ApiCategory,
  PlannerEnergy as ApiEnergy,
  PlannerStatus as ApiStatus,
  SwimlaneType as ApiSwimlane,
} from '../api/types';

// ============================================================================
// Type Converters: Frontend -> Backend
// ============================================================================

export function toApiCategory(category: PlannerCategory): typeof ApiCategory[keyof typeof ApiCategory] {
  const map: Record<PlannerCategory, typeof ApiCategory[keyof typeof ApiCategory]> = {
    work: ApiCategory.WORK,
    health: ApiCategory.HEALTH,
    personal: ApiCategory.PERSONAL,
    learning: ApiCategory.LEARNING,
    admin: ApiCategory.ADMIN,
  };
  return map[category];
}

export function toApiEnergy(energy: PlannerEnergy): typeof ApiEnergy[keyof typeof ApiEnergy] {
  const map: Record<PlannerEnergy, typeof ApiEnergy[keyof typeof ApiEnergy]> = {
    high: ApiEnergy.HIGH,
    medium: ApiEnergy.MEDIUM,
    low: ApiEnergy.LOW,
  };
  return map[energy];
}

export function toApiStatus(status: PlannerStatus): typeof ApiStatus[keyof typeof ApiStatus] {
  const map: Record<PlannerStatus, typeof ApiStatus[keyof typeof ApiStatus]> = {
    'planned': ApiStatus.PLANNED,
    'in-progress': ApiStatus.IN_PROGRESS,
    'completed': ApiStatus.COMPLETED,
    'skipped': ApiStatus.SKIPPED,
  };
  return map[status];
}

export function toApiSwimlane(swimlane: PlannerSwimlaneKey): typeof ApiSwimlane[keyof typeof ApiSwimlane] {
  const map: Record<PlannerSwimlaneKey, typeof ApiSwimlane[keyof typeof ApiSwimlane]> = {
    'focus': ApiSwimlane.FOCUS,
    'collaboration': ApiSwimlane.COLLABORATION,
    'self-care': ApiSwimlane.SELF_CARE,
    'life-admin': ApiSwimlane.LIFE_ADMIN,
  };
  return map[swimlane];
}

// ============================================================================
// Type Converters: Backend -> Frontend
// ============================================================================

export function fromApiCategory(category: string): PlannerCategory {
  const map: Record<string, PlannerCategory> = {
    WORK: 'work',
    HEALTH: 'health',
    PERSONAL: 'personal',
    LEARNING: 'learning',
    ADMIN: 'admin',
  };
  return map[category] || 'work';
}

export function fromApiEnergy(energy: string): PlannerEnergy {
  const map: Record<string, PlannerEnergy> = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  };
  return map[energy] || 'medium';
}

export function fromApiStatus(status: string): PlannerStatus {
  const map: Record<string, PlannerStatus> = {
    PLANNED: 'planned',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    SKIPPED: 'skipped',
  };
  return map[status] || 'planned';
}

export function fromApiSwimlane(swimlane: string | null): PlannerSwimlaneKey | undefined {
  if (!swimlane) return undefined;

  const map: Record<string, PlannerSwimlaneKey> = {
    FOCUS: 'focus',
    COLLABORATION: 'collaboration',
    SELF_CARE: 'self-care',
    LIFE_ADMIN: 'life-admin',
  };
  return map[swimlane];
}

// ============================================================================
// Object Mappers
// ============================================================================

/**
 * Convert backend Task to frontend PlannerTask
 */
export function taskFromApi(apiTask: Task): PlannerTask {
  return {
    id: apiTask.id,
    title: apiTask.title,
    category: fromApiCategory(apiTask.category),
    energy: fromApiEnergy(apiTask.energy),
    status: fromApiStatus(apiTask.status),
    durationMinutes: apiTask.durationMinutes,
    order: apiTask.order,
    assignedDayId: apiTask.dayId || undefined,
    swimlaneId: fromApiSwimlane(apiTask.swimlane),
    targetOccurrencesPerWeek: apiTask.targetOccurrencesPerWeek || undefined,
    notes: apiTask.notes || undefined,
  };
}

/**
 * Convert frontend PlannerTask to backend CreateTaskRequest
 */
export function taskToApiCreate(
  task: Omit<PlannerTask, 'id' | 'order' | 'status'> & Partial<Pick<PlannerTask, 'status'>>
): CreateTaskRequest {
  return {
    title: task.title,
    category: toApiCategory(task.category),
    energy: toApiEnergy(task.energy),
    durationMinutes: task.durationMinutes,
    notes: task.notes,
    targetOccurrencesPerWeek: task.targetOccurrencesPerWeek,
    dayId: task.assignedDayId,
    swimlane: task.swimlaneId ? toApiSwimlane(task.swimlaneId) : undefined,
  };
}

/**
 * Convert frontend PlannerTask changes to backend UpdateTaskRequest
 */
export function taskToApiUpdate(updates: Partial<PlannerTask>): UpdateTaskRequest {
  const apiUpdate: UpdateTaskRequest = {};

  if (updates.title !== undefined) apiUpdate.title = updates.title;
  if (updates.category !== undefined) apiUpdate.category = toApiCategory(updates.category);
  if (updates.energy !== undefined) apiUpdate.energy = toApiEnergy(updates.energy);
  if (updates.status !== undefined) apiUpdate.status = toApiStatus(updates.status);
  if (updates.durationMinutes !== undefined) apiUpdate.durationMinutes = updates.durationMinutes;
  if (updates.notes !== undefined) apiUpdate.notes = updates.notes;
  if (updates.targetOccurrencesPerWeek !== undefined) {
    apiUpdate.targetOccurrencesPerWeek = updates.targetOccurrencesPerWeek;
  }

  return apiUpdate;
}

/**
 * Convert backend Week to frontend week data structure
 */
export function weekFromApi(apiWeek: Week) {
  return {
    id: apiWeek.id,
    weekNumber: apiWeek.weekNumber,
    startISO: apiWeek.startDate,
    endISO: apiWeek.endDate,
    theme: apiWeek.theme || undefined,
    days: apiWeek.days.map((day: Day) => ({
      id: day.id,
      date: day.date,
      label: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      theme: day.theme || undefined,
      focusMetric: day.focusMetric || undefined,
    })),
  };
}
