import { create } from 'zustand';
import { authService, getErrorMessage } from '../api';
import type { UserProfile, RegisterRequest, LoginRequest } from '../api/types';

/**
 * Authentication State Management
 *
 * Manages user authentication state:
 * - User profile
 * - Loading states
 * - Authentication actions (login, register, logout)
 * - Auto-loading user profile on app init
 */

interface AuthState {
  // State
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatarUrl?: string }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * Initialize auth state by loading user profile if token exists
   * Should be called once on app mount
   */
  initialize: async () => {
    // Skip if already initialized or no token
    if (get().isInitialized || !authService.isAuthenticated()) {
      set({ isInitialized: true });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await authService.getProfile();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      console.error('[Auth] Failed to load user profile:', error);

      // Clear invalid token
      authService.logout();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null, // Don't show error on init failure
      });
    }
  },

  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(credentials);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('[Auth] Login failed:', errorMessage);

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  /**
   * Register new user account
   */
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.register(data);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('[Auth] Registration failed:', errorMessage);

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  /**
   * Logout current user
   */
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await authService.logout();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('[Auth] Logout failed:', error);

      // Always clear state even if API call fails
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Update current user profile
   */
  updateProfile: async (updates: { name?: string; avatarUrl?: string }) => {
    if (!get().isAuthenticated) {
      throw new Error('Must be authenticated to update profile');
    }

    set({ isLoading: true, error: null });

    try {
      const updatedUser = await authService.updateProfile(updates);

      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('[Auth] Profile update failed:', errorMessage);

      set({
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  /**
   * Clear any error messages
   */
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Setup auth event listeners
 * Should be called once in the app root
 */
export const setupAuthEventListeners = () => {
  // Listen for logout events from API client (e.g., 401 responses)
  window.addEventListener('auth:logout', () => {
    const authStore = useAuthStore.getState();
    authStore.logout();
  });
};
