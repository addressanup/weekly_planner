/**
 * Tests for usePlanner hook
 *
 * Verifies that the hook correctly switches between localStorage and API stores
 * based on authentication status.
 */

import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlanner } from './usePlanner'

// Mock the store modules
vi.mock('../state/usePlannerStore', () => ({
  usePlannerStore: vi.fn(),
}))

vi.mock('../state/usePlannerStoreWithApi', () => ({
  usePlannerStoreWithApi: vi.fn(),
}))

vi.mock('../state/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}))

// Import mocked modules
const { usePlannerStore } = await import('../state/usePlannerStore')
const { usePlannerStoreWithApi } = await import('../state/usePlannerStoreWithApi')
const { useAuthStore } = await import('../state/useAuthStore')

describe('usePlanner', () => {
  const mockLocalStoreResult = { tasks: [], activeWeek: { id: 'local-week' } }
  const mockApiStoreResult = { tasks: [], activeWeek: { id: 'api-week' } }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when user is NOT authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false })
    })

    it('should use localStorage store', () => {
      vi.mocked(usePlannerStore).mockReturnValue(mockLocalStoreResult)

      const selector = (state: any) => state
      const { result } = renderHook(() => usePlanner(selector))

      expect(usePlannerStore).toHaveBeenCalledWith(expect.any(Function))
      expect(usePlannerStoreWithApi).not.toHaveBeenCalled()
      expect(result.current).toEqual(mockLocalStoreResult)
    })

    it('should correctly select tasks from localStorage store', () => {
      const mockTasks = [
        { id: '1', title: 'Local Task 1' },
        { id: '2', title: 'Local Task 2' },
      ]
      vi.mocked(usePlannerStore).mockReturnValue(mockTasks)

      const selector = (state: any) => state.tasks
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toEqual(mockTasks)
    })

    it('should correctly select activeWeek from localStorage store', () => {
      const mockWeek = { id: 'week-1', startISO: '2025-01-01', days: [] }
      vi.mocked(usePlannerStore).mockReturnValue(mockWeek)

      const selector = (state: any) => state.activeWeek
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toEqual(mockWeek)
    })

    it('should correctly select actions from localStorage store', () => {
      const mockAction = vi.fn()
      vi.mocked(usePlannerStore).mockReturnValue(mockAction)

      const selector = (state: any) => state.createFloatingTask
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toBe(mockAction)
    })
  })

  describe('when user IS authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true })
    })

    it('should use API-integrated store', () => {
      vi.mocked(usePlannerStoreWithApi).mockReturnValue(mockApiStoreResult)

      const selector = (state: any) => state
      const { result } = renderHook(() => usePlanner(selector))

      expect(usePlannerStoreWithApi).toHaveBeenCalledWith(expect.any(Function))
      expect(usePlannerStore).not.toHaveBeenCalled()
      expect(result.current).toEqual(mockApiStoreResult)
    })

    it('should correctly select tasks from API store', () => {
      const mockTasks = [
        { id: '1', title: 'API Task 1' },
        { id: '2', title: 'API Task 2' },
      ]
      vi.mocked(usePlannerStoreWithApi).mockReturnValue(mockTasks)

      const selector = (state: any) => state.tasks
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toEqual(mockTasks)
    })

    it('should correctly select activeWeek from API store', () => {
      const mockWeek = { id: 'api-week-1', startISO: '2025-01-01', days: [] }
      vi.mocked(usePlannerStoreWithApi).mockReturnValue(mockWeek)

      const selector = (state: any) => state.activeWeek
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toEqual(mockWeek)
    })

    it('should correctly select actions from API store', () => {
      const mockAction = vi.fn()
      vi.mocked(usePlannerStoreWithApi).mockReturnValue(mockAction)

      const selector = (state: any) => state.createFloatingTask
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toBe(mockAction)
    })

    it('should correctly select loading state from API store', () => {
      vi.mocked(usePlannerStoreWithApi).mockReturnValue(true)

      const selector = (state: any) => state.isLoading
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toBe(true)
    })
  })

  describe('authentication state changes', () => {
    it('should switch from localStorage to API store when user logs in', () => {
      // Start unauthenticated
      vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false })
      vi.mocked(usePlannerStore).mockReturnValue(mockLocalStoreResult)

      const selector = (state: any) => state
      const { result, rerender } = renderHook(() => usePlanner(selector))

      expect(result.current).toEqual(mockLocalStoreResult)
      expect(usePlannerStore).toHaveBeenCalled()

      // User logs in
      vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true })
      vi.mocked(usePlannerStoreWithApi).mockReturnValue(mockApiStoreResult)

      rerender()

      expect(result.current).toEqual(mockApiStoreResult)
      expect(usePlannerStoreWithApi).toHaveBeenCalled()
    })

    it('should switch from API store to localStorage when user logs out', () => {
      // Start authenticated
      vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true })
      vi.mocked(usePlannerStoreWithApi).mockReturnValue(mockApiStoreResult)

      const selector = (state: any) => state
      const { result, rerender } = renderHook(() => usePlanner(selector))

      expect(result.current).toEqual(mockApiStoreResult)
      expect(usePlannerStoreWithApi).toHaveBeenCalled()

      // User logs out
      vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false })
      vi.mocked(usePlannerStore).mockReturnValue(mockLocalStoreResult)

      rerender()

      expect(result.current).toEqual(mockLocalStoreResult)
      expect(usePlannerStore).toHaveBeenCalled()
    })
  })

  describe('selector functions', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false })
    })

    it('should handle complex selectors correctly', () => {
      const mockState = {
        tasks: [
          { id: '1', status: 'planned' },
          { id: '2', status: 'in-progress' },
          { id: '3', status: 'planned' },
        ],
      }
      vi.mocked(usePlannerStore).mockImplementation((selector: any) =>
        selector(mockState)
      )

      const selector = (state: any) =>
        state.tasks.filter((t: any) => t.status === 'planned')
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toHaveLength(2)
      expect(result.current[0].id).toBe('1')
      expect(result.current[1].id).toBe('3')
    })

    it('should handle computed values correctly', () => {
      const mockState = {
        tasks: [{ durationMinutes: 30 }, { durationMinutes: 60 }, { durationMinutes: 45 }],
      }
      vi.mocked(usePlannerStore).mockImplementation((selector: any) =>
        selector(mockState)
      )

      const selector = (state: any) =>
        state.tasks.reduce((sum: number, t: any) => sum + t.durationMinutes, 0)
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toBe(135)
    })

    it('should handle undefined/null selector results', () => {
      const mockState = { activeWeek: null }
      vi.mocked(usePlannerStore).mockImplementation((selector: any) =>
        selector(mockState)
      )

      const selector = (state: any) => state.activeWeek
      const { result } = renderHook(() => usePlanner(selector))

      expect(result.current).toBeNull()
    })
  })
})
