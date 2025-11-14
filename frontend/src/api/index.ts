/**
 * API Module Index
 *
 * Central export point for all API services and types
 */

// Services
export { authService } from './auth.service';
export { tasksService } from './tasks.service';
export { weeksService } from './weeks.service';

// Client and utilities
export { apiClient, tokenStorage, getErrorMessage, isApiError } from './client';
export type { ApiError } from './client';

// Types
export * from './types';
