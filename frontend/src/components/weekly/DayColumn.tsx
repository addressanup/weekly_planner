import type { PlannerDay, PlannerSwimlaneKey } from '../../types/planner'
import { usePlannerStore } from '../../state/usePlannerStore'
import { LaneColumn } from './LaneColumn'

interface DayColumnProps {
  day: PlannerDay
}

export const DayColumn = ({ day }: DayColumnProps) => {
  const swimlanes = usePlannerStore((state) => state.activeWeek.swimlanes)
  const tasks = usePlannerStore((state) => state.tasks)

  const tasksForLane = (laneId: PlannerSwimlaneKey) =>
    tasks
      .filter((task) => task.assignedDayId === day.id && task.swimlaneId === laneId)
      .sort((a, b) => a.order - b.order)

  return (
    <article
      className="flex min-w-[240px] flex-1 flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm"
      aria-labelledby={`day-${day.id}`}
    >
      <header className="flex flex-col gap-1" id={`day-${day.id}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{day.label}</p>
        {day.theme ? (
          <p className="text-sm font-medium text-indigo-600">{day.theme}</p>
        ) : (
          <button
            type="button"
            className="self-start text-xs font-medium text-slate-500 underline decoration-dotted underline-offset-4 transition hover:text-slate-700"
          >
            Add day theme
          </button>
        )}
        {day.focusMetric && <p className="text-xs text-slate-500">{day.focusMetric}</p>}
      </header>

      <div className="flex flex-col gap-3">
        {swimlanes.map((lane) => (
          <LaneColumn key={`${day.id}-${lane.id}`} dayId={day.id} swimlane={lane} tasks={tasksForLane(lane.id)} />
        ))}
      </div>
    </article>
  )
}

