/**
 * API Types
 *
 * Type definitions for all API requests and responses.
 * These types match the backend DTOs to ensure type safety.
 */

// ============================================================================
// Types (matching Prisma enums)
// ============================================================================

export const PlannerCategory = {
  WORK: 'WORK',
  HEALTH: 'HEALTH',
  PERSONAL: 'PERSONAL',
  LEARNING: 'LEARNING',
  ADMIN: 'ADMIN',
} as const;

export type PlannerCategory = typeof PlannerCategory[keyof typeof PlannerCategory];

export const PlannerEnergy = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export type PlannerEnergy = typeof PlannerEnergy[keyof typeof PlannerEnergy];

export const PlannerStatus = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
} as const;

export type PlannerStatus = typeof PlannerStatus[keyof typeof PlannerStatus];

export const SwimlaneType = {
  FOCUS: 'FOCUS',
  COLLABORATION: 'COLLABORATION',
  SELF_CARE: 'SELF_CARE',
  LIFE_ADMIN: 'LIFE_ADMIN',
} as const;

export type SwimlaneType = typeof SwimlaneType[keyof typeof SwimlaneType];

// ============================================================================
// Authentication Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

// ============================================================================
// Task Types
// ============================================================================

export interface CreateTaskRequest {
  title: string;
  category: PlannerCategory;
  energy: PlannerEnergy;
  durationMinutes: number;
  notes?: string;
  targetOccurrencesPerWeek?: number;
  dayId?: string;
  swimlane?: SwimlaneType;
}

export interface UpdateTaskRequest {
  title?: string;
  category?: PlannerCategory;
  energy?: PlannerEnergy;
  status?: PlannerStatus;
  durationMinutes?: number;
  notes?: string;
  targetOccurrencesPerWeek?: number;
}

export interface AssignTaskRequest {
  swimlane?: SwimlaneType;
  dayId?: string;
  order?: number;
}

export interface ReorderTaskRequest {
  position: number;
}

export interface Task {
  id: string;
  userId: string;
  weekId?: string;
  dayId: string | null;
  title: string;
  notes: string | null;
  category: PlannerCategory;
  energy: PlannerEnergy;
  status: PlannerStatus;
  durationMinutes: number;
  swimlane: SwimlaneType | null;
  order: number;
  targetOccurrencesPerWeek: number | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatistics {
  total: number;
  completed: number;
  inProgress: number;
  planned: number;
  skipped: number;
  completionRate: number;
}

// ============================================================================
// Week Types
// ============================================================================

export interface CreateWeekRequest {
  startDate: string;
  endDate: string;
  theme?: string;
}

export interface UpdateWeekRequest {
  theme?: string;
  reflection?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateDayRequest {
  theme?: string;
  focusMetric?: string;
}

export interface Day {
  id: string;
  weekId: string;
  date: string;
  dayOfWeek: number;
  theme: string | null;
  focusMetric: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Week {
  id: string;
  userId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  theme: string | null;
  reflection: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  days: Day[];
}

export interface WeekStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  plannedTasks: number;
  totalDuration: number;
  completionRate: number;
}

export interface WeekWithStats extends Week {
  statistics: WeekStatistics;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface TasksQueryParams {
  dayId?: string;
  swimlane?: SwimlaneType;
  unassigned?: boolean;
}

export interface WeeksQueryParams {
  startDate?: string;
  endDate?: string;
}
