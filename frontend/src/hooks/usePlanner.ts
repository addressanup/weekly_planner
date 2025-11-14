/**
 * Unified Planner Hook
 *
 * Automatically selects the appropriate store based on authentication status:
 * - Authenticated users: usePlannerStoreWithApi (backend synchronization)
 * - Unauthenticated users: usePlannerStore (localStorage only)
 *
 * This hook provides a seamless interface that components can use without
 * worrying about which underlying store is being used.
 *
 * Type Safety:
 * Both stores implement BasePlannerStore interface, ensuring type safety
 * across all components. Some methods may return Promises in the API store
 * but are synchronous in the localStorage store - this is intentional and
 * components should handle both cases.
 */

import { usePlannerStore } from '../state/usePlannerStore'
import { usePlannerStoreWithApi } from '../state/usePlannerStoreWithApi'
import { useAuthStore } from '../state/useAuthStore'
import type { BasePlannerStore } from '../types/plannerStore'

/**
 * Hook that returns the appropriate planner store selector based on authentication status
 *
 * @example
 * ```tsx
 * const tasks = usePlanner((state) => state.tasks);
 * const createTask = usePlanner((state) => state.createFloatingTask);
 * ```
 */
export function usePlanner<T>(selector: (state: BasePlannerStore) => T): T {
  const { isAuthenticated } = useAuthStore()

  // Select the appropriate store based on authentication
  // Both stores satisfy BasePlannerStore interface for type safety
  if (isAuthenticated) {
    return usePlannerStoreWithApi(selector as (state: any) => T)
  }

  return usePlannerStore(selector as (state: any) => T)
}
