import clsx from 'clsx'
import { Flame } from 'lucide-react'

import type { PlannerTask } from '../../types/planner'

const categoryStyles: Record<PlannerTask['category'], string> = {
  work: 'bg-indigo-100 text-indigo-700',
  health: 'bg-emerald-100 text-emerald-700',
  personal: 'bg-rose-100 text-rose-700',
  learning: 'bg-sky-100 text-sky-700',
  admin: 'bg-amber-100 text-amber-700',
}

const energyCopy: Record<PlannerTask['energy'], string> = {
  high: 'High energy',
  medium: 'Medium energy',
  low: 'Low energy',
}

interface TaskCardPreviewProps {
  task: PlannerTask
}

export const TaskCardPreview = ({ task }: TaskCardPreviewProps) => (
  <article className="flex w-[260px] flex-col gap-2 rounded-lg border border-indigo-200 bg-white p-3 shadow-lg">
    <div>
      <h3 className="text-sm font-semibold text-slate-800">{task.title}</h3>
      <p className="text-xs text-slate-500">
        {Math.round(task.durationMinutes / 15) * 15} mins • {energyCopy[task.energy]}
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', categoryStyles[task.category])}>
        {task.category.toUpperCase()}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
        <Flame className="size-3 text-amber-500" aria-hidden />
        {task.energy}
      </span>
    </div>
  </article>
)

