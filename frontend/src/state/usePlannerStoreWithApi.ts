import { addDays, startOfWeek, endOfWeek, format } from "date-fns";
import { create } from "zustand";
import toast from "react-hot-toast";

import type {
  PlannerDay,
  PlannerSwimlaneKey,
  PlannerTask,
  PlannerWeek,
} from "../types/planner";
import {
  buildFloatingSeed,
  buildSeedTasks,
  buildWeeklySkeleton,
} from "../lib/plannerSeed";
import type { PlannerSnapshot } from "../types/persistence";
import {
  createSnapshotFromState,
  loadOrCreateSnapshot,
  saveSnapshot,
} from "../services/plannerPersistence";
import { weeksService, tasksService } from "../api";
import {
  taskFromApi,
  taskToApiCreate,
  taskToApiUpdate,
  weekFromApi,
  toApiSwimlane,
} from "../lib/apiMappers";
import { getErrorMessage } from "../api/client";
import { useAuthStore } from "./useAuthStore";

type PlannerViewMode = "weekly" | "list";

interface PlannerState {
  mode: PlannerViewMode;
  activeWeek: PlannerWeek;
  tasks: PlannerTask[];
  floatingTasks: PlannerTask[];
  isHydrated: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  lastSavedAt?: string;
  snapshotSource?: PlannerSnapshot["source"];
  activeWeekId?: string; // Backend week ID

  setMode: (mode: PlannerViewMode) => void;
  setTheme: (dayId: string, theme?: string) => void;
  setFocusMetric: (dayId: string, focusMetric?: string) => void;
  hydrateFromDate: (date: Date) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  resetToCurrentWeek: () => void;
  moveTask: (payload: {
    taskId: string;
    dayId: string;
    swimlaneId: PlannerSwimlaneKey;
    index: number;
  }) => Promise<void>;
  createFloatingTask: (
    task: Omit<PlannerTask, "id" | "order" | "status"> &
      Partial<Pick<PlannerTask, "status">>
  ) => Promise<PlannerTask>;
  reorderFloatingTask: (taskId: string, index: number) => void;
  scheduleFloatingTask: (payload: {
    taskId: string;
    dayId: string;
    swimlaneId: PlannerSwimlaneKey;
    index: number;
  }) => Promise<void>;
  unscheduleTask: (payload: { taskId: string; index?: number }) => Promise<void>;
  updateTaskStatus: (taskId: string, status: PlannerTask["status"]) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  loadInitialSnapshot: () => Promise<void>;
  loadCurrentWeekFromApi: () => Promise<void>;
  persistSnapshot: () => Promise<void>;
}

const updateDay = (
  week: PlannerWeek,
  dayId: string,
  patch: Partial<PlannerDay>
) => ({
  ...week,
  days: week.days.map((day) => (day.id === dayId ? { ...day, ...patch } : day)),
});

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `task-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

const normalizeLaneOrdering = (tasks: PlannerTask[]) => {
  const laneMap = new Map<string, PlannerTask[]>();
  const keyFor = (task: PlannerTask) =>
    `${task.assignedDayId ?? "floating"}::${task.swimlaneId ?? "none"}`;

  for (const task of tasks) {
    const key = keyFor(task);
    const list = laneMap.get(key) ?? [];
    list.push(task);
    laneMap.set(key, list);
  }

  const normalized: PlannerTask[] = [];

  for (const list of laneMap.values()) {
    list
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
      .forEach((task, index) => normalized.push({ ...task, order: index }));
  }

  return normalized;
};

const normalizeFloatingOrdering = (tasks: PlannerTask[]) =>
  tasks
    .slice()
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map((task, index) => ({ ...task, order: index }));

const initialWeek = buildWeeklySkeleton(new Date());
const initialTasks = buildSeedTasks(initialWeek);
const initialFloatingTasks = buildFloatingSeed();

export const usePlannerStoreWithApi = create<PlannerState>((set, get) => ({
  mode: "weekly",
  activeWeek: initialWeek,
  tasks: initialTasks,
  floatingTasks: initialFloatingTasks,
  isHydrated: false,
  isSaving: false,
  isLoading: false,
  error: null,

  setMode: (mode) => set({ mode }),

  setTheme: async (dayId, theme) => {
    const { activeWeek, activeWeekId } = get();

    // Optimistic update
    set({ activeWeek: updateDay(activeWeek, dayId, { theme }) });

    // Sync with backend if authenticated
    if (useAuthStore.getState().isAuthenticated && activeWeekId) {
      try {
        await weeksService.updateDay(dayId, { theme });
      } catch (error) {
        console.error('[Planner] Failed to update day theme:', error);
        toast.error('Failed to save theme change');
        // Revert on error
        set({ activeWeek: updateDay(activeWeek, dayId, { theme: activeWeek.days.find(d => d.id === dayId)?.theme }) });
      }
    }
  },

  setFocusMetric: async (dayId, focusMetric) => {
    const { activeWeek, activeWeekId } = get();

    // Optimistic update
    set({ activeWeek: updateDay(activeWeek, dayId, { focusMetric }) });

    // Sync with backend if authenticated
    if (useAuthStore.getState().isAuthenticated && activeWeekId) {
      try {
        await weeksService.updateDay(dayId, { focusMetric });
      } catch (error) {
        console.error('[Planner] Failed to update focus metric:', error);
        toast.error('Failed to save focus metric');
      }
    }
  },

  hydrateFromDate: (date) =>
    set(() => ({
      activeWeek: buildWeeklySkeleton(date),
    })),

  goToPreviousWeek: () => {
    const { activeWeek } = get();
    const previousStart = addDays(new Date(activeWeek.startISO), -7);
    set({ activeWeek: buildWeeklySkeleton(previousStart) });

    // Load data for the new week
    get().loadCurrentWeekFromApi();
  },

  goToNextWeek: () => {
    const { activeWeek } = get();
    const nextStart = addDays(new Date(activeWeek.startISO), 7);
    set({ activeWeek: buildWeeklySkeleton(nextStart) });

    // Load data for the new week
    get().loadCurrentWeekFromApi();
  },

  resetToCurrentWeek: () => {
    set({ activeWeek: buildWeeklySkeleton(new Date()) });
    get().loadCurrentWeekFromApi();
  },

  moveTask: async ({ taskId, dayId, swimlaneId, index }) => {
    const state = get();
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    // Optimistic update (keep existing logic)
    const withoutTask = state.tasks.filter((item) => item.id !== taskId);
    const groupByLane = (tasks: PlannerTask[]) => {
      const map = new Map<string, PlannerTask[]>();
      const sortByOrder = (items: PlannerTask[]) =>
        [...items].sort((a, b) => a.order - b.order);

      for (const item of tasks) {
        const key = `${item.assignedDayId ?? "floating"}::${
          item.swimlaneId ?? "none"
        }`;
        const collection = map.get(key) ?? [];
        collection.push(item);
        map.set(key, collection);
      }

      for (const [key, items] of map.entries()) {
        map.set(key, sortByOrder(items));
      }

      return map;
    };

    const groups = groupByLane(withoutTask);
    const destinationKey = `${dayId}::${swimlaneId}`;
    const destinationItems = groups.get(destinationKey) ?? [];
    const clampIndex = Math.max(0, Math.min(index, destinationItems.length));
    const updatedTask: PlannerTask = {
      ...task,
      assignedDayId: dayId,
      swimlaneId,
    };

    const updatedLane = [
      ...destinationItems.slice(0, clampIndex),
      updatedTask,
      ...destinationItems.slice(clampIndex),
    ];

    groups.set(destinationKey, updatedLane);

    const sourceKey = `${task.assignedDayId ?? "floating"}::${
      task.swimlaneId ?? "none"
    }`;
    if (!groups.has(sourceKey)) {
      groups.set(sourceKey, []);
    }

    const flattened: PlannerTask[] = [];
    for (const items of groups.values()) {
      const normalized = items.map((item, order) => ({ ...item, order }));
      flattened.push(...normalized);
    }

    set({ tasks: flattened });

    // Sync with backend
    if (useAuthStore.getState().isAuthenticated) {
      try {
        await tasksService.assign(taskId, {
          dayId,
          swimlane: toApiSwimlane(swimlaneId),
          order: clampIndex,
        });
      } catch (error) {
        console.error('[Planner] Failed to move task:', error);
        toast.error('Failed to save task move');
        // Revert on error
        set({ tasks: state.tasks });
      }
    }
  },

  createFloatingTask: async (taskInput) => {
    const task: PlannerTask = {
      id: generateId(), // Temporary ID
      title: taskInput.title,
      category: taskInput.category,
      energy: taskInput.energy,
      durationMinutes: taskInput.durationMinutes,
      status: taskInput.status ?? "planned",
      assignedDayId: taskInput.assignedDayId,
      swimlaneId: taskInput.swimlaneId,
      targetOccurrencesPerWeek: taskInput.targetOccurrencesPerWeek,
      notes: taskInput.notes,
      order: 0,
    };

    // Optimistic update
    set((state) => ({
      floatingTasks: normalizeFloatingOrdering([task, ...state.floatingTasks]),
    }));

    // Create in backend
    if (useAuthStore.getState().isAuthenticated) {
      try {
        const apiTask = await tasksService.create(taskToApiCreate(taskInput));
        const backendTask = taskFromApi(apiTask);

        // Replace temporary task with backend task
        set((state) => ({
          floatingTasks: state.floatingTasks.map(t =>
            t.id === task.id ? backendTask : t
          ),
        }));

        return backendTask;
      } catch (error) {
        console.error('[Planner] Failed to create task:', error);
        toast.error('Failed to save task');
        // Remove optimistic task on error
        set((state) => ({
          floatingTasks: state.floatingTasks.filter(t => t.id !== task.id),
        }));
        throw error;
      }
    }

    return task;
  },

  reorderFloatingTask: (taskId, index) =>
    set((state) => {
      const tasks = state.floatingTasks
        .slice()
        .sort((a, b) => a.order - b.order);
      const currentIndex = tasks.findIndex((task) => task.id === taskId);
      if (currentIndex === -1) {
        return {};
      }

      const [item] = tasks.splice(currentIndex, 1);
      const clampIndex = Math.max(0, Math.min(index, tasks.length));
      tasks.splice(clampIndex, 0, item);

      return {
        floatingTasks: tasks.map((task, order) => ({ ...task, order })),
      };
    }),

  scheduleFloatingTask: async ({ taskId, dayId, swimlaneId, index }) => {
    const state = get();
    const floatingTask = state.floatingTasks.find((task) => task.id === taskId);
    if (!floatingTask) {
      return;
    }

    // Optimistic update (keep existing logic)
    const remainingFloating = state.floatingTasks
      .filter((task) => task.id !== taskId)
      .map((task, order) => ({ ...task, order }));

    const updatedTask: PlannerTask = {
      ...floatingTask,
      assignedDayId: dayId,
      swimlaneId,
    };

    const tasksWithout = state.tasks.filter((task) => task.id !== taskId);
    const destinationTasks = tasksWithout
      .filter(
        (task) =>
          task.assignedDayId === dayId && task.swimlaneId === swimlaneId
      )
      .sort((a, b) => a.order - b.order);
    const clampIndex = Math.max(0, Math.min(index, destinationTasks.length));
    destinationTasks.splice(clampIndex, 0, updatedTask);

    const otherTasks = tasksWithout.filter(
      (task) =>
        !(task.assignedDayId === dayId && task.swimlaneId === swimlaneId)
    );
    const laneWithOrder = destinationTasks.map((task, order) => ({
      ...task,
      order,
    }));

    const merged = [...otherTasks, ...laneWithOrder];

    set({
      floatingTasks: normalizeFloatingOrdering(remainingFloating),
      tasks: normalizeLaneOrdering(merged),
    });

    // Sync with backend
    if (useAuthStore.getState().isAuthenticated) {
      try {
        await tasksService.assign(taskId, {
          dayId,
          swimlane: toApiSwimlane(swimlaneId),
          order: clampIndex,
        });
      } catch (error) {
        console.error('[Planner] Failed to schedule task:', error);
        toast.error('Failed to save task assignment');
        // Revert on error
        set({
          floatingTasks: state.floatingTasks,
          tasks: state.tasks,
        });
      }
    }
  },

  unscheduleTask: async ({ taskId, index }) => {
    const state = get();
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    // Optimistic update (keep existing logic)
    const tasks = state.tasks.filter((item) => item.id !== taskId);
    const normalizedTasks = normalizeLaneOrdering(tasks);

    const floating = normalizeFloatingOrdering(state.floatingTasks);
    const insertionIndex = Math.max(
      0,
      Math.min(index ?? floating.length, floating.length)
    );
    const floatingWithTask = [...floating];
    floatingWithTask.splice(insertionIndex, 0, {
      ...task,
      assignedDayId: undefined,
      swimlaneId: undefined,
    });

    set({
      tasks: normalizedTasks,
      floatingTasks: normalizeFloatingOrdering(floatingWithTask),
    });

    // Sync with backend - assign to null day
    if (useAuthStore.getState().isAuthenticated) {
      try {
        await tasksService.assign(taskId, {
          dayId: undefined,
          swimlane: undefined,
          order: insertionIndex,
        });
      } catch (error) {
        console.error('[Planner] Failed to unschedule task:', error);
        toast.error('Failed to save task change');
        // Revert on error
        set({
          tasks: state.tasks,
          floatingTasks: state.floatingTasks,
        });
      }
    }
  },

  updateTaskStatus: async (taskId, status) => {
    const state = get();

    // Optimistic update
    set({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t),
      floatingTasks: state.floatingTasks.map(t => t.id === taskId ? { ...t, status } : t),
    });

    // Sync with backend
    if (useAuthStore.getState().isAuthenticated) {
      try {
        await tasksService.update(taskId, taskToApiUpdate({ status }));
      } catch (error) {
        console.error('[Planner] Failed to update task status:', error);
        toast.error('Failed to save task status');
        // Revert on error
        set({ tasks: state.tasks, floatingTasks: state.floatingTasks });
      }
    }
  },

  deleteTask: async (taskId) => {
    const state = get();

    // Optimistic update
    set({
      tasks: state.tasks.filter(t => t.id !== taskId),
      floatingTasks: state.floatingTasks.filter(t => t.id !== taskId),
    });

    // Sync with backend
    if (useAuthStore.getState().isAuthenticated) {
      try {
        await tasksService.delete(taskId);
      } catch (error) {
        console.error('[Planner] Failed to delete task:', error);
        toast.error('Failed to delete task');
        // Revert on error
        set({ tasks: state.tasks, floatingTasks: state.floatingTasks });
      }
    }
  },

  loadInitialSnapshot: async () => {
    if (get().isHydrated) {
      return;
    }

    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (isAuthenticated) {
      // Load from API
      await get().loadCurrentWeekFromApi();
    } else {
      // Fallback to local storage
      const snapshot = await loadOrCreateSnapshot();

      set({
        activeWeek: snapshot.activeWeek,
        tasks: normalizeLaneOrdering(snapshot.tasks),
        floatingTasks: normalizeFloatingOrdering(snapshot.floatingTasks),
        isHydrated: true,
        lastSavedAt:
          snapshot.source === "local-storage"
            ? snapshot.capturedAtISO
            : undefined,
        snapshotSource: snapshot.source,
      });
    }
  },

  loadCurrentWeekFromApi: async () => {
    set({ isLoading: true, error: null });

    try {
      const { activeWeek } = get();
      const weekStart = startOfWeek(new Date(activeWeek.startISO), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      // Try to get current week from backend
      let week = await weeksService.getCurrent();

      // If no week exists, create one
      if (!week) {
        week = await weeksService.create({
          startDate: format(weekStart, 'yyyy-MM-dd'),
          endDate: format(weekEnd, 'yyyy-MM-dd'),
        });
      }

      const mappedWeek = weekFromApi(week);

      // Load tasks for this week
      const apiTasks = await tasksService.getAll();
      const allTasks = apiTasks.map(taskFromApi);

      // Separate assigned and floating tasks
      const assignedTasks = allTasks.filter(t => t.assignedDayId);
      const floatingTasks = allTasks.filter(t => !t.assignedDayId);

      set({
        activeWeek: {
          ...mappedWeek,
          swimlanes: activeWeek.swimlanes, // Keep frontend swimlanes definition
        },
        activeWeekId: week.id,
        tasks: normalizeLaneOrdering(assignedTasks),
        floatingTasks: normalizeFloatingOrdering(floatingTasks),
        isHydrated: true,
        isLoading: false,
        snapshotSource: 'backend-api',
      });
    } catch (error) {
      console.error('[Planner] Failed to load week from API:', error);

      set({
        isLoading: false,
        error: getErrorMessage(error),
      });

      toast.error('Failed to load planning data');

      // Fallback to local storage
      const snapshot = await loadOrCreateSnapshot();
      set({
        activeWeek: snapshot.activeWeek,
        tasks: normalizeLaneOrdering(snapshot.tasks),
        floatingTasks: normalizeFloatingOrdering(snapshot.floatingTasks),
        isHydrated: true,
        snapshotSource: snapshot.source,
      });
    }
  },

  persistSnapshot: async () => {
    set({ isSaving: true });
    const state = get();

    const snapshot = createSnapshotFromState(
      state.activeWeek,
      normalizeLaneOrdering(state.tasks),
      normalizeFloatingOrdering(state.floatingTasks)
    );

    try {
      await saveSnapshot(snapshot);
      set({
        isSaving: false,
        lastSavedAt: snapshot.capturedAtISO,
        snapshotSource: snapshot.source,
      });
    } catch (error) {
      console.warn("Failed to save planner snapshot.", error);
      set({ isSaving: false });
    }
  },
}));

export const getSwimlaneStyle = (swimlaneId: PlannerSwimlaneKey) => {
  const palette: Record<PlannerSwimlaneKey, string> = {
    focus: "bg-indigo-50 border-indigo-200",
    collaboration: "bg-blue-50 border-blue-200",
    "self-care": "bg-emerald-50 border-emerald-200",
    "life-admin": "bg-amber-50 border-amber-200",
  };

  return palette[swimlaneId];
};
