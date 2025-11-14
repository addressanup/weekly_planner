import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

/**
 * API Client Configuration
 *
 * Configured axios instance with:
 * - Base URL from environment variable
 * - JWT token interceptor
 * - Error handling interceptor
 * - Request/response logging in development
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Token storage utilities
 */
export const tokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('auth_token');
  },
};

/**
 * Request interceptor - Add JWT token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      const status = error.response.status;

      // Unauthorized - clear token and redirect to login
      if (status === 401) {
        console.warn('[API] Unauthorized - clearing token');
        tokenStorage.removeToken();

        // Dispatch custom event for auth state change
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status,
          data: error.response.data,
        });
      }
    } else if (error.request) {
      console.error('[API] Network error - no response received', error.request);
    } else {
      console.error('[API] Request setup error', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * API Error type for better error handling
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

/**
 * Type guard for API errors
 */
export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error) && error.response !== undefined;
}

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    const data = error.response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export default apiClient;
