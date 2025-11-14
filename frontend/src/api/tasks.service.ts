import apiClient from './client';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
  ReorderTaskRequest,
  Task,
  TaskStatistics,
  TasksQueryParams,
} from './types';

/**
 * Tasks API Service
 *
 * Handles all task-related API calls:
 * - CRUD operations
 * - Filtering and querying
 * - Task assignment and reordering
 * - Statistics
 */

export const tasksService = {
  /**
   * Create a new task
   * POST /tasks
   * Requires authentication
   */
  async create(data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  },

  /**
   * Get all tasks with optional filters
   * GET /tasks
   * Requires authentication
   *
   * @param params - Query parameters for filtering
   * @param params.dayId - Filter by day ID
   * @param params.swimlane - Filter by swimlane type
   * @param params.unassigned - Get only unassigned tasks (backlog)
   */
  async getAll(params?: TasksQueryParams): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks', { params });
    return response.data;
  },

  /**
   * Get tasks for a specific day
   * GET /tasks?dayId=:id
   * Requires authentication
   */
  async getByDay(dayId: string): Promise<Task[]> {
    return this.getAll({ dayId });
  },

  /**
   * Get tasks for a specific swimlane
   * GET /tasks?swimlane=:type
   * Requires authentication
   */
  async getBySwimlane(swimlane: string): Promise<Task[]> {
    return this.getAll({ swimlane: swimlane as any });
  },

  /**
   * Get unassigned tasks (backlog)
   * GET /tasks?unassigned=true
   * Requires authentication
   */
  async getUnassigned(): Promise<Task[]> {
    return this.getAll({ unassigned: true });
  },

  /**
   * Get a single task by ID
   * GET /tasks/:id
   * Requires authentication
   */
  async getById(id: string): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Update a task
   * PATCH /tasks/:id
   * Requires authentication
   */
  async update(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Assign task to a swimlane and/or day
   * PATCH /tasks/:id/assign
   * Requires authentication
   */
  async assign(id: string, data: AssignTaskRequest): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}/assign`, data);
    return response.data;
  },

  /**
   * Reorder a task within its swimlane
   * PATCH /tasks/:id/reorder
   * Requires authentication
   */
  async reorder(id: string, data: ReorderTaskRequest): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}/reorder`, data);
    return response.data;
  },

  /**
   * Delete a task
   * DELETE /tasks/:id
   * Requires authentication
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  /**
   * Get task statistics
   * GET /tasks/statistics
   * Requires authentication
   */
  async getStatistics(): Promise<TaskStatistics> {
    const response = await apiClient.get<TaskStatistics>('/tasks/statistics');
    return response.data;
  },
};

export default tasksService;
