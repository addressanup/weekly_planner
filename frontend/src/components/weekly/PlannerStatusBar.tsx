import { Loader2, Save } from 'lucide-react'

import { usePlannerStore } from '../../state/usePlannerStore'
import { formatRelativeTime } from '../../lib/time'

const sourceCopy: Record<string, string> = {
  mock: 'Mock dataset',
  'local-storage': 'Local storage',
}

export const PlannerStatusBar = () => {
  const isHydrated = usePlannerStore((state) => state.isHydrated)
  const isSaving = usePlannerStore((state) => state.isSaving)
  const snapshotSource = usePlannerStore((state) => state.snapshotSource)
  const lastSavedAt = usePlannerStore((state) => state.lastSavedAt)
  const persistSnapshot = usePlannerStore((state) => state.persistSnapshot)

  const handleSave = () => {
    void persistSnapshot()
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-6 py-3 text-xs text-slate-600">
      <div className="flex items-center gap-2">
        {!isHydrated ? (
          <>
            <Loader2 className="size-3 animate-spin text-indigo-500" aria-hidden />
            <span>Preparing your weekly planner...</span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Source: {sourceCopy[snapshotSource ?? 'mock'] ?? 'Mock dataset'}
            </span>
            {lastSavedAt ? (
              <span className="text-slate-500">
                Last saved {formatRelativeTime(new Date(lastSavedAt))}
              </span>
            ) : (
              <span className="text-slate-500">Not yet saved</span>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <Save className="size-3" aria-hidden />}
        {isSaving ? 'Saving…' : 'Save snapshot'}
      </button>
    </section>
  )
}

