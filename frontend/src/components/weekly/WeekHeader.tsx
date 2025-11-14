import { format } from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react'
import { memo } from 'react'

import { usePlannerStore } from '../../state/usePlannerStore'

const formatRange = (startISO: string, endISO: string) => {
  const start = new Date(startISO)
  const end = new Date(endISO)

  const startLabel = format(start, 'MMM d')
  const endLabel = format(end, start.getMonth() === end.getMonth() ? 'd, yyyy' : 'MMM d, yyyy')

  return `${startLabel} – ${endLabel}`
}

export const WeekHeader = memo(() => {
  const activeWeek = usePlannerStore((state) => state.activeWeek)
  const goToPreviousWeek = usePlannerStore((state) => state.goToPreviousWeek)
  const goToNextWeek = usePlannerStore((state) => state.goToNextWeek)
  const resetToCurrentWeek = usePlannerStore((state) => state.resetToCurrentWeek)

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-indigo-100 p-2 text-indigo-600">
          <CalendarDays className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-medium text-slate-500">Current Week</p>
          <h1 className="text-2xl font-semibold text-slate-900">{formatRange(activeWeek.startISO, activeWeek.endISO)}</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          onClick={goToPreviousWeek}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          onClick={resetToCurrentWeek}
        >
          <RefreshCcw className="size-4" aria-hidden />
          Today
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          onClick={goToNextWeek}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </header>
  )
})

WeekHeader.displayName = 'WeekHeader'

