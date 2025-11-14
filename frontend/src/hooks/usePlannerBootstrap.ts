import { useEffect } from 'react'

import { usePlannerStore } from '../state/usePlannerStore'
import { usePlannerStoreWithApi } from '../state/usePlannerStoreWithApi'
import { useAuthStore } from '../state/useAuthStore'

export const usePlannerBootstrap = () => {
  const { isAuthenticated, isInitialized: authInitialized } = useAuthStore()

  // Use API-integrated store when authenticated, otherwise use localStorage store
  const localIsHydrated = usePlannerStore((state) => state.isHydrated)
  const localLoadSnapshot = usePlannerStore((state) => state.loadInitialSnapshot)

  const apiIsHydrated = usePlannerStoreWithApi((state) => state.isHydrated)
  const apiLoadWeek = usePlannerStoreWithApi((state) => state.loadCurrentWeekFromApi)

  useEffect(() => {
    // Wait for auth to initialize before loading data
    if (!authInitialized) {
      return
    }

    if (isAuthenticated && !apiIsHydrated) {
      // Authenticated: Load from backend API
      void apiLoadWeek()
    } else if (!isAuthenticated && !localIsHydrated) {
      // Not authenticated: Load from localStorage
      void localLoadSnapshot()
    }
  }, [
    isAuthenticated,
    authInitialized,
    apiIsHydrated,
    localIsHydrated,
    apiLoadWeek,
    localLoadSnapshot,
  ])
}

