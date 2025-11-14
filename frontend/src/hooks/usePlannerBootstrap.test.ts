/**
 * Tests for usePlannerBootstrap hook
 *
 * Verifies that the hook correctly initializes the appropriate store
 * based on authentication status.
 */

import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlannerBootstrap } from './usePlannerBootstrap'

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

describe('usePlannerBootstrap', () => {
  const mockLocalLoadSnapshot = vi.fn()
  const mockApiLoadWeek = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalLoadSnapshot.mockResolvedValue(undefined)
    mockApiLoadWeek.mockResolvedValue(undefined)
  })

  describe('initial load', () => {
    it('should not load data when auth is not initialized', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isInitialized: false,
      })
      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      renderHook(() => usePlannerBootstrap())

      expect(mockLocalLoadSnapshot).not.toHaveBeenCalled()
      expect(mockApiLoadWeek).not.toHaveBeenCalled()
    })

    it('should wait for auth to initialize before loading', async () => {
      // Start with auth not initialized
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isInitialized: false,
      })
      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      const { rerender } = renderHook(() => usePlannerBootstrap())

      expect(mockLocalLoadSnapshot).not.toHaveBeenCalled()

      // Auth initializes
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isInitialized: true,
      })

      rerender()

      await waitFor(() => {
        expect(mockLocalLoadSnapshot).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('unauthenticated user', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isInitialized: true,
      })
    })

    it('should load from localStorage when not hydrated', async () => {
      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      renderHook(() => usePlannerBootstrap())

      await waitFor(() => {
        expect(mockLocalLoadSnapshot).toHaveBeenCalledTimes(1)
        expect(mockApiLoadWeek).not.toHaveBeenCalled()
      })
    })

    it('should not load from localStorage when already hydrated', () => {
      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: true, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      renderHook(() => usePlannerBootstrap())

      expect(mockLocalLoadSnapshot).not.toHaveBeenCalled()
      expect(mockApiLoadWeek).not.toHaveBeenCalled()
    })

    it('should only load once even if hook rerenders', async () => {
      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      const { rerender } = renderHook(() => usePlannerBootstrap())

      await waitFor(() => {
        expect(mockLocalLoadSnapshot).toHaveBeenCalledTimes(1)
      })

      // Rerender multiple times
      rerender()
      rerender()
      rerender()

      // Should still only be called once
      expect(mockLocalLoadSnapshot).toHaveBeenCalledTimes(1)
    })
  })

  describe('authenticated user', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isInitialized: true,
      })
    })

    it('should load from API when not hydrated', async () => {
      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      renderHook(() => usePlannerBootstrap())

      await waitFor(() => {
        expect(mockApiLoadWeek).toHaveBeenCalledTimes(1)
        expect(mockLocalLoadSnapshot).not.toHaveBeenCalled()
      })
    })

    it('should not load from API when already hydrated', () => {
      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: true, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      renderHook(() => usePlannerBootstrap())

      expect(mockApiLoadWeek).not.toHaveBeenCalled()
      expect(mockLocalLoadSnapshot).not.toHaveBeenCalled()
    })

    it('should only load once even if hook rerenders', async () => {
      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      const { rerender } = renderHook(() => usePlannerBootstrap())

      await waitFor(() => {
        expect(mockApiLoadWeek).toHaveBeenCalledTimes(1)
      })

      // Rerender multiple times
      rerender()
      rerender()
      rerender()

      // Should still only be called once
      expect(mockApiLoadWeek).toHaveBeenCalledTimes(1)
    })
  })

  describe('authentication state transitions', () => {
    it('should load from API when user logs in', async () => {
      // Start unauthenticated
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isInitialized: true,
      })

      let localHydrated = false
      let apiHydrated = false

      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: localHydrated, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: apiHydrated, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      const { rerender } = renderHook(() => usePlannerBootstrap())

      await waitFor(() => {
        expect(mockLocalLoadSnapshot).toHaveBeenCalledTimes(1)
      })

      // Simulate localStorage hydration complete
      localHydrated = true

      // User logs in
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isInitialized: true,
      })

      rerender()

      await waitFor(() => {
        expect(mockApiLoadWeek).toHaveBeenCalledTimes(1)
      })
    })

    it('should load from localStorage when user logs out', async () => {
      // Start authenticated
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isInitialized: true,
      })

      let localHydrated = false
      let apiHydrated = false

      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: localHydrated, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: apiHydrated, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      const { rerender } = renderHook(() => usePlannerBootstrap())

      await waitFor(() => {
        expect(mockApiLoadWeek).toHaveBeenCalledTimes(1)
      })

      // Simulate API hydration complete
      apiHydrated = true

      // User logs out
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isInitialized: true,
      })

      rerender()

      await waitFor(() => {
        expect(mockLocalLoadSnapshot).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('error handling', () => {
    it('should handle localStorage load errors gracefully', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isInitialized: true,
      })

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockLocalLoadSnapshot.mockRejectedValueOnce(new Error('localStorage error'))

      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      renderHook(() => usePlannerBootstrap())

      await waitFor(() => {
        expect(mockLocalLoadSnapshot).toHaveBeenCalled()
      })

      // Hook should not crash
      expect(mockApiLoadWeek).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should handle API load errors gracefully', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isInitialized: true,
      })

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApiLoadWeek.mockRejectedValueOnce(new Error('API error'))

      vi.mocked(usePlannerStore).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadInitialSnapshot: mockLocalLoadSnapshot }
        return selector(state)
      })
      vi.mocked(usePlannerStoreWithApi).mockImplementation((selector: any) => {
        const state = { isHydrated: false, loadCurrentWeekFromApi: mockApiLoadWeek }
        return selector(state)
      })

      renderHook(() => usePlannerBootstrap())

      await waitFor(() => {
        expect(mockApiLoadWeek).toHaveBeenCalled()
      })

      // Hook should not crash
      expect(mockLocalLoadSnapshot).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })
})
