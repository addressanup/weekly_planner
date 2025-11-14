/**
 * Unified Planner Hook
 *
 * Automatically selects the appropriate store based on authentication status:
 * - Authenticated users: usePlannerStoreWithApi (backend synchronization)
 * - Unauthenticated users: usePlannerStore (localStorage only)
 *
 * This hook provides a seamless interface that components can use without
 * worrying about which underlying store is being used.
 */

import { usePlannerStore } from '../state/usePlannerStore'
import { usePlannerStoreWithApi } from '../state/usePlannerStoreWithApi'
import { useAuthStore } from '../state/useAuthStore'

// Extract the state type from the store
type PlannerState = ReturnType<typeof usePlannerStore.getState>

/**
 * Hook that returns the appropriate planner store selector based on authentication status
 */
export function usePlanner<T>(selector: (state: PlannerState) => T): T {
  const { isAuthenticated } = useAuthStore()

  // Select the appropriate store based on authentication and call with selector
  if (isAuthenticated) {
    return usePlannerStoreWithApi(selector as any)
  }

  return usePlannerStore(selector as any)
}
