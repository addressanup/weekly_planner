import { addDays, formatISO, startOfWeek } from 'date-fns'

import type {
  PlannerDay,
  PlannerSwimlane,
  PlannerTask,
  PlannerWeek,
} from '../types/planner'

export const swimlaneDefinitions: PlannerSwimlane[] = [
  {
    id: 'focus',
    label: 'Deep Work',
    description: 'High-value, high-focus work that moves goals forward.',
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    description: 'Meetings, pair sessions, and communication-heavy work.',
  },
  {
    id: 'self-care',
    label: 'Self Care',
    description: 'Wellness, rest, reflection, and personal growth.',
  },
  {
    id: 'life-admin',
    label: 'Life Admin',
    description: 'Logistics, errands, and household responsibilities.',
  },
]

export const buildWeeklySkeleton = (anchor: Date = new Date()): PlannerWeek => {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })

  const days: PlannerDay[] = [...Array(7)].map((_, index) => {
    const date = addDays(start, index)

    return {
      id: formatISO(date, { representation: 'date' }),
      date: formatISO(date),
      label: date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      theme: index === 0 ? 'Deep Work Monday' : undefined,
    }
  })

  return {
    weekNumber: Number(formatISO(start, { representation: 'date' }).replace(/-/g, '').slice(0, 6)),
    startISO: formatISO(start),
    endISO: formatISO(addDays(start, 6)),
    days,
    swimlanes: swimlaneDefinitions,
  }
}

export const buildSeedTasks = (week: PlannerWeek): PlannerTask[] => {
  const [monday, tuesday, wednesday, thursday, friday] = week.days

  return [
    {
      id: 'task-1',
      title: 'Strategic Planning Deep Work',
      category: 'work',
      energy: 'high',
      status: 'planned',
      durationMinutes: 120,
      order: 0,
      assignedDayId: monday.id,
      swimlaneId: 'focus',
      notes: 'Outline OKRs and highlight key initiatives.',
    },
    {
      id: 'task-2',
      title: 'Client Standup + Roadmap Review',
      category: 'work',
      energy: 'medium',
      status: 'planned',
      durationMinutes: 60,
      order: 0,
      assignedDayId: monday.id,
      swimlaneId: 'collaboration',
    },
    {
      id: 'task-3',
      title: 'Strength Training',
      category: 'health',
      energy: 'high',
      status: 'planned',
      durationMinutes: 75,
      order: 0,
      assignedDayId: tuesday.id,
      swimlaneId: 'self-care',
    },
    {
      id: 'task-4',
      title: 'Content Calendar Refresh',
      category: 'work',
      energy: 'medium',
      status: 'planned',
      durationMinutes: 90,
      order: 0,
      assignedDayId: wednesday.id,
      swimlaneId: 'focus',
    },
    {
      id: 'task-5',
      title: 'Team Sync + Retro Prep',
      category: 'work',
      energy: 'low',
      status: 'planned',
      durationMinutes: 45,
      order: 1,
      assignedDayId: wednesday.id,
      swimlaneId: 'collaboration',
    },
    {
      id: 'task-6',
      title: 'Family Logistics & Meal Plan',
      category: 'personal',
      energy: 'low',
      status: 'planned',
      durationMinutes: 60,
      order: 0,
      assignedDayId: thursday.id,
      swimlaneId: 'life-admin',
    },
    {
      id: 'task-7',
      title: 'Weekly Reflection & Wins',
      category: 'learning',
      energy: 'low',
      status: 'planned',
      durationMinutes: 45,
      order: 0,
      assignedDayId: friday.id,
      swimlaneId: 'self-care',
    },
  ]
}

export const buildFloatingSeed = (): PlannerTask[] => [
  {
    id: 'floating-1',
    title: '3x Midday Walk',
    category: 'health',
    energy: 'low',
    status: 'planned',
    durationMinutes: 30,
    order: 0,
    targetOccurrencesPerWeek: 3,
  },
  {
    id: 'floating-2',
    title: 'Inbox Zero Sweep',
    category: 'admin',
    energy: 'low',
    status: 'planned',
    durationMinutes: 25,
    order: 1,
  },
  {
    id: 'floating-3',
    title: 'Reach out to mentor',
    category: 'personal',
    energy: 'medium',
    status: 'planned',
    durationMinutes: 20,
    order: 2,
  },
]

