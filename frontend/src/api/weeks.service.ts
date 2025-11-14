import apiClient from './client';
import type {
  CreateWeekRequest,
  UpdateWeekRequest,
  UpdateDayRequest,
  Week,
  WeekWithStats,
  Day,
  WeeksQueryParams,
} from './types';

/**
 * Weeks API Service
 *
 * Handles all week and day-related API calls:
 * - Week CRUD operations
 * - Day management
 * - Week statistics
 * - Date range queries
 */

export const weeksService = {
  /**
   * Create a new week
   * POST /weeks
   * Requires authentication
   *
   * Automatically generates 7 days for the week
   */
  async create(data: CreateWeekRequest): Promise<Week> {
    const response = await apiClient.post<Week>('/weeks', data);
    return response.data;
  },

  /**
   * Get all weeks with optional filters
   * GET /weeks
   * Requires authentication
   *
   * @param params - Query parameters for filtering
   * @param params.startDate - Filter by start date
   * @param params.endDate - Filter by end date
   */
  async getAll(params?: WeeksQueryParams): Promise<Week[]> {
    const response = await apiClient.get<Week[]>('/weeks', { params });
    return response.data;
  },

  /**
   * Get current week (week containing today)
   * GET /weeks/current
   * Requires authentication
   *
   * @returns Current week or null if no current week exists
   */
  async getCurrent(): Promise<Week | null> {
    const response = await apiClient.get<Week | null>('/weeks/current');
    return response.data;
  },

  /**
   * Get a single week by ID
   * GET /weeks/:id
   * Requires authentication
   */
  async getById(id: string): Promise<Week> {
    const response = await apiClient.get<Week>(`/weeks/${id}`);
    return response.data;
  },

  /**
   * Get a week with statistics
   * GET /weeks/:id/stats
   * Requires authentication
   */
  async getWithStats(id: string): Promise<WeekWithStats> {
    const response = await apiClient.get<WeekWithStats>(`/weeks/${id}/stats`);
    return response.data;
  },

  /**
   * Update a week
   * PATCH /weeks/:id
   * Requires authentication
   */
  async update(id: string, data: UpdateWeekRequest): Promise<Week> {
    const response = await apiClient.patch<Week>(`/weeks/${id}`, data);
    return response.data;
  },

  /**
   * Delete a week (cascades to days and tasks)
   * DELETE /weeks/:id
   * Requires authentication
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/weeks/${id}`);
  },

  /**
   * Get weeks within a date range
   * GET /weeks?startDate=:start&endDate=:end
   * Requires authentication
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Week[]> {
    return this.getAll({ startDate, endDate });
  },

  // ============================================================================
  // Day Management
  // ============================================================================

  /**
   * Get a specific day by ID
   * GET /weeks/days/:dayId
   * Requires authentication
   */
  async getDay(dayId: string): Promise<Day> {
    const response = await apiClient.get<Day>(`/weeks/days/${dayId}`);
    return response.data;
  },

  /**
   * Update a day
   * PATCH /weeks/days/:dayId
   * Requires authentication
   */
  async updateDay(dayId: string, data: UpdateDayRequest): Promise<Day> {
    const response = await apiClient.patch<Day>(`/weeks/days/${dayId}`, data);
    return response.data;
  },
};

export default weeksService;
