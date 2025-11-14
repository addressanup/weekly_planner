import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlannerStore } from './usePlannerStore';
import type { PlannerTask } from '../types/planner';

// Mock the persistence service
vi.mock('../services/plannerPersistence', () => ({
  loadOrCreateSnapshot: vi.fn(() =>
    Promise.resolve({
      id: 'snapshot-1',
      capturedAtISO: new Date().toISOString(),
      activeWeek: {
        weekNumber: 1,
        startISO: '2025-01-01',
        endISO: '2025-01-07',
        days: [],
        swimlanes: [],
      },
      tasks: [],
      floatingTasks: [],
      source: 'mock',
    })
  ),
  saveSnapshot: vi.fn(() => Promise.resolve()),
  createSnapshotFromState: vi.fn(),
}));

describe('usePlannerStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    const { result } = renderHook(() => usePlannerStore());
    act(() => {
      result.current.resetToCurrentWeek();
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('initializes with default mode', () => {
      const { result } = renderHook(() => usePlannerStore());

      expect(result.current.mode).toBe('weekly');
    });

    it('initializes with tasks array', () => {
      const { result } = renderHook(() => usePlannerStore());

      expect(Array.isArray(result.current.tasks)).toBe(true);
    });

    it('initializes with floating tasks array', () => {
      const { result } = renderHook(() => usePlannerStore());

      expect(Array.isArray(result.current.floatingTasks)).toBe(true);
    });

    it('initializes as not hydrated', () => {
      const { result } = renderHook(() => usePlannerStore());

      expect(result.current.isHydrated).toBe(false);
    });

    it('initializes as not saving', () => {
      const { result } = renderHook(() => usePlannerStore());

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('Mode Management', () => {
    it('switches to list mode', () => {
      const { result } = renderHook(() => usePlannerStore());

      act(() => {
        result.current.setMode('list');
      });

      expect(result.current.mode).toBe('list');
    });

    it('switches back to weekly mode', () => {
      const { result } = renderHook(() => usePlannerStore());

      act(() => {
        result.current.setMode('list');
        result.current.setMode('weekly');
      });

      expect(result.current.mode).toBe('weekly');
    });
  });

  describe('Floating Task Creation', () => {
    it('creates a floating task with correct properties', () => {
      const { result } = renderHook(() => usePlannerStore());

      let createdTask: PlannerTask | undefined;

      act(() => {
        createdTask = result.current.createFloatingTask({
          title: 'Test Task',
          category: 'work',
          energy: 'high',
          durationMinutes: 60,
        });
      });

      expect(createdTask).toBeDefined();
      expect(createdTask?.title).toBe('Test Task');
      expect(createdTask?.category).toBe('work');
      expect(createdTask?.energy).toBe('high');
      expect(createdTask?.durationMinutes).toBe(60);
      expect(createdTask?.status).toBe('planned');
    });

    it('generates unique task ID', () => {
      const { result } = renderHook(() => usePlannerStore());

      let task1: PlannerTask | undefined;
      let task2: PlannerTask | undefined;

      act(() => {
        task1 = result.current.createFloatingTask({
          title: 'Task 1',
          category: 'work',
          energy: 'high',
          durationMinutes: 60,
        });

        task2 = result.current.createFloatingTask({
          title: 'Task 2',
          category: 'work',
          energy: 'high',
          durationMinutes: 60,
        });
      });

      expect(task1?.id).toBeDefined();
      expect(task2?.id).toBeDefined();
      expect(task1?.id).not.toBe(task2?.id);
    });

    it('adds task to floating tasks array', () => {
      const { result } = renderHook(() => usePlannerStore());
      const initialCount = result.current.floatingTasks.length;

      act(() => {
        result.current.createFloatingTask({
          title: 'Test Task',
          category: 'work',
          energy: 'high',
          durationMinutes: 60,
        });
      });

      expect(result.current.floatingTasks.length).toBe(initialCount + 1);
      expect(
        result.current.floatingTasks.some((t) => t.title === 'Test Task')
      ).toBe(true);
    });

    it('assigns correct order to floating tasks', () => {
      const { result } = renderHook(() => usePlannerStore());

      act(() => {
        result.current.createFloatingTask({
          title: 'Task 1',
          category: 'work',
          energy: 'high',
          durationMinutes: 60,
        });

        result.current.createFloatingTask({
          title: 'Task 2',
          category: 'work',
          energy: 'high',
          durationMinutes: 60,
        });
      });

      expect(result.current.floatingTasks[0].order).toBe(0);
      expect(result.current.floatingTasks[1].order).toBe(1);
    });
  });

  describe('Week Navigation', () => {
    it('has a current week defined', () => {
      const { result } = renderHook(() => usePlannerStore());

      expect(result.current.activeWeek).toBeDefined();
      expect(result.current.activeWeek.days).toBeDefined();
      expect(result.current.activeWeek.swimlanes).toBeDefined();
    });

    it('navigates to previous week', () => {
      const { result } = renderHook(() => usePlannerStore());
      const currentWeekStart = result.current.activeWeek.startISO;

      act(() => {
        result.current.goToPreviousWeek();
      });

      // Week start should be earlier than before
      expect(new Date(result.current.activeWeek.startISO).getTime()).toBeLessThan(
        new Date(currentWeekStart).getTime()
      );
    });

    it('navigates to next week', () => {
      const { result } = renderHook(() => usePlannerStore());
      const currentWeekStart = result.current.activeWeek.startISO;

      act(() => {
        result.current.goToNextWeek();
      });

      // Week start should be later than before
      expect(
        new Date(result.current.activeWeek.startISO).getTime()
      ).toBeGreaterThan(new Date(currentWeekStart).getTime());
    });

    it('resets to current week', () => {
      const { result } = renderHook(() => usePlannerStore());
      const originalWeekNumber = result.current.activeWeek.weekNumber;

      act(() => {
        result.current.goToNextWeek();
        result.current.goToNextWeek();
        result.current.resetToCurrentWeek();
      });

      expect(result.current.activeWeek.weekNumber).toBe(originalWeekNumber);
    });
  });

  describe('Day Theme Management', () => {
    it('sets day theme', () => {
      const { result } = renderHook(() => usePlannerStore());
      const firstDayId = result.current.activeWeek.days[0]?.id;

      if (firstDayId) {
        act(() => {
          result.current.setTheme(firstDayId, 'Deep Work Day');
        });

        const updatedDay = result.current.activeWeek.days.find(
          (d) => d.id === firstDayId
        );
        expect(updatedDay?.theme).toBe('Deep Work Day');
      }
    });

    it('clears day theme', () => {
      const { result } = renderHook(() => usePlannerStore());
      const firstDayId = result.current.activeWeek.days[0]?.id;

      if (firstDayId) {
        act(() => {
          result.current.setTheme(firstDayId, 'Deep Work Day');
          result.current.setTheme(firstDayId, undefined);
        });

        const updatedDay = result.current.activeWeek.days.find(
          (d) => d.id === firstDayId
        );
        expect(updatedDay?.theme).toBeUndefined();
      }
    });
  });

  describe('Focus Metric Management', () => {
    it('sets focus metric', () => {
      const { result } = renderHook(() => usePlannerStore());
      const firstDayId = result.current.activeWeek.days[0]?.id;

      if (firstDayId) {
        act(() => {
          result.current.setFocusMetric(firstDayId, '4 hours deep work');
        });

        const updatedDay = result.current.activeWeek.days.find(
          (d) => d.id === firstDayId
        );
        expect(updatedDay?.focusMetric).toBe('4 hours deep work');
      }
    });

    it('clears focus metric', () => {
      const { result } = renderHook(() => usePlannerStore());
      const firstDayId = result.current.activeWeek.days[0]?.id;

      if (firstDayId) {
        act(() => {
          result.current.setFocusMetric(firstDayId, '4 hours deep work');
          result.current.setFocusMetric(firstDayId, undefined);
        });

        const updatedDay = result.current.activeWeek.days.find(
          (d) => d.id === firstDayId
        );
        expect(updatedDay?.focusMetric).toBeUndefined();
      }
    });
  });
});
