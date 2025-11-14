export type PlannerCategory = 'work' | 'health' | 'personal' | 'learning' | 'admin'

export type PlannerEnergy = 'high' | 'medium' | 'low'

export type PlannerStatus = 'planned' | 'in-progress' | 'completed' | 'skipped'

export type PlannerSwimlaneKey = 'focus' | 'collaboration' | 'self-care' | 'life-admin'

export interface PlannerSwimlane {
  id: PlannerSwimlaneKey
  label: string
  description: string
}

export interface PlannerDay {
  id: string
  date: string
  label: string
  theme?: string
  focusMetric?: string
}

export interface PlannerTask {
  id: string
  title: string
  category: PlannerCategory
  energy: PlannerEnergy
  status: PlannerStatus
  durationMinutes: number
  order: number
  assignedDayId?: string
  swimlaneId?: PlannerSwimlaneKey
  targetOccurrencesPerWeek?: number
  notes?: string
}

export interface PlannerWeek {
  weekNumber: number
  startISO: string
  endISO: string
  days: PlannerDay[]
  swimlanes: PlannerSwimlane[]
}

