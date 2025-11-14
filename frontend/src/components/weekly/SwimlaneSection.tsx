import type { ReactNode } from 'react'

import type { PlannerSwimlane } from '../../types/planner'
import { getSwimlaneStyle } from '../../state/usePlannerStore'

interface SwimlaneSectionProps {
  swimlane: PlannerSwimlane
  children?: ReactNode
}

export const SwimlaneSection = ({ swimlane, children }: SwimlaneSectionProps) => {
  const palette = getSwimlaneStyle(swimlane.id)

  return (
    <section
      className={`flex min-h-40 flex-col rounded-lg border bg-white/80 p-3 shadow-sm transition ${palette}`}
      aria-label={swimlane.label}
    >
      <header className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{swimlane.label}</p>
          <p className="text-xs text-slate-500">{swimlane.description}</p>
        </div>
      </header>
      <div className="flex-1">
        {children ? (
          children
        ) : (
          <p className="text-xs text-slate-500">
            Drop focus blocks and tasks here to flesh out your {swimlane.label.toLowerCase()}.
          </p>
        )}
      </div>
    </section>
  )
}

