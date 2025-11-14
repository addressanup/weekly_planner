import apiClient, { tokenStorage } from './client';
import type {
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  AuthResponse,
  UserProfile,
} from './types';

/**
 * Authentication API Service
 *
 * Handles all authentication-related API calls:
 * - User registration
 * - User login
 * - Get user profile
 * - Update user profile
 * - Logout
 */

export const authService = {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    // Store the token
    tokenStorage.setToken(response.data.accessToken);

    return response.data;
  },

  /**
   * Login existing user
   * POST /auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);

    // Store the token
    tokenStorage.setToken(response.data.accessToken);

    return response.data;
  },

  /**
   * Get current user profile
   * GET /auth/profile
   * Requires authentication
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/auth/profile');
    return response.data;
  },

  /**
   * Update current user profile
   * PATCH /auth/profile
   * Requires authentication
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>('/auth/profile', data);
    return response.data;
  },

  /**
   * Logout current user
   * POST /auth/logout
   * Requires authentication
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Always remove token, even if API call fails
      tokenStorage.removeToken();

      // Dispatch custom event for auth state change
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return tokenStorage.getToken() !== null;
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return tokenStorage.getToken();
  },
};

export default authService;
