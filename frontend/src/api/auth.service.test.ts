import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AuthResponse, UserProfile } from './types';

// Mock the entire client module
const mockPost = vi.fn();
const mockGet = vi.fn();
const mockPatch = vi.fn();

const mockTokenStorage = {
  getToken: vi.fn(),
  setToken: vi.fn(),
  removeToken: vi.fn(),
};

vi.mock('./client', () => ({
  default: {
    post: mockPost,
    get: mockGet,
    patch: mockPatch,
  },
  apiClient: {
    post: mockPost,
    get: mockGet,
    patch: mockPatch,
  },
  tokenStorage: mockTokenStorage,
}));

// Import after mocking
const { authService } = await import('./auth.service');

describe('authService', () => {
  const mockAuthResponse: AuthResponse = {
    accessToken: 'test-token-123',
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: null,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  };

  const mockUserProfile: UserProfile = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should register a new user and store token', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
      };

      mockPost.mockResolvedValueOnce({ data: mockAuthResponse });

      const result = await authService.register(registerData);

      expect(mockPost).toHaveBeenCalledWith('/auth/register', registerData);
      expect(mockTokenStorage.setToken).toHaveBeenCalledWith('test-token-123');
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error on failed registration', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const error = new Error('User already exists');
      mockPost.mockRejectedValueOnce(error);

      await expect(authService.register(registerData)).rejects.toThrow();
      expect(mockTokenStorage.setToken).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user and store token', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockPost.mockResolvedValueOnce({ data: mockAuthResponse });

      const result = await authService.login(loginData);

      expect(mockPost).toHaveBeenCalledWith('/auth/login', loginData);
      expect(mockTokenStorage.setToken).toHaveBeenCalledWith('test-token-123');
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error on failed login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockPost.mockRejectedValueOnce(error);

      await expect(authService.login(loginData)).rejects.toThrow();
      expect(mockTokenStorage.setToken).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should fetch user profile', async () => {
      mockGet.mockResolvedValueOnce({ data: mockUserProfile });

      const result = await authService.getProfile();

      expect(mockGet).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockUserProfile);
    });

    it('should throw error when not authenticated', async () => {
      const error = new Error('Unauthorized');
      mockGet.mockRejectedValueOnce(error);

      await expect(authService.getProfile()).rejects.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = {
        name: 'Updated Name',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const updatedProfile = { ...mockUserProfile, ...updates };
      mockPatch.mockResolvedValueOnce({ data: updatedProfile });

      const result = await authService.updateProfile(updates);

      expect(mockPatch).toHaveBeenCalledWith('/auth/profile', updates);
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('logout', () => {
    it('should logout and remove token', async () => {
      mockPost.mockResolvedValueOnce({});

      await authService.logout();

      expect(mockPost).toHaveBeenCalledWith('/auth/logout');
      expect(mockTokenStorage.removeToken).toHaveBeenCalled();
    });

    it('should remove token even if API call fails', async () => {
      const error = new Error('Network error');
      mockPost.mockRejectedValueOnce(error);

      // Even if logout throws, token should be removed
      try {
        await authService.logout();
      } catch (e) {
        // Ignore error - we only care that token was removed
      }

      expect(mockTokenStorage.removeToken).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      mockTokenStorage.getToken.mockReturnValueOnce('test-token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when token does not exist', () => {
      mockTokenStorage.getToken.mockReturnValueOnce(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return stored token', () => {
      mockTokenStorage.getToken.mockReturnValueOnce('test-token');

      const result = authService.getToken();

      expect(result).toBe('test-token');
    });

    it('should return null when no token', () => {
      mockTokenStorage.getToken.mockReturnValueOnce(null);

      const result = authService.getToken();

      expect(result).toBeNull();
    });
  });
});
