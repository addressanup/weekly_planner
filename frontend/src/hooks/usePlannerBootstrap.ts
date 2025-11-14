import { useEffect } from 'react'

import { usePlannerStore } from '../state/usePlannerStore'

export const usePlannerBootstrap = () => {
  const isHydrated = usePlannerStore((state) => state.isHydrated)
  const loadInitialSnapshot = usePlannerStore((state) => state.loadInitialSnapshot)

  useEffect(() => {
    if (!isHydrated) {
      void loadInitialSnapshot()
    }
  }, [isHydrated, loadInitialSnapshot])
}

