import { addDays } from "date-fns";
import { create } from "zustand";

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

type PlannerViewMode = "weekly" | "list";

interface PlannerState {
  mode: PlannerViewMode;
  activeWeek: PlannerWeek;
  tasks: PlannerTask[];
  floatingTasks: PlannerTask[];
  isHydrated: boolean;
  isSaving: boolean;
  lastSavedAt?: string;
  snapshotSource?: PlannerSnapshot["source"];
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
  }) => void;
  createFloatingTask: (
    task: Omit<PlannerTask, "id" | "order" | "status"> &
      Partial<Pick<PlannerTask, "status">>
  ) => PlannerTask;
  reorderFloatingTask: (taskId: string, index: number) => void;
  scheduleFloatingTask: (payload: {
    taskId: string;
    dayId: string;
    swimlaneId: PlannerSwimlaneKey;
    index: number;
  }) => void;
  unscheduleTask: (payload: { taskId: string; index?: number }) => void;
  loadInitialSnapshot: () => Promise<void>;
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

export const usePlannerStore = create<PlannerState>((set, get) => ({
  mode: "weekly",
  activeWeek: initialWeek,
  tasks: initialTasks,
  floatingTasks: initialFloatingTasks,
  isHydrated: false,
  isSaving: false,
  setMode: (mode) => set({ mode }),
  setTheme: (dayId, theme) =>
    set((state) => ({
      activeWeek: updateDay(state.activeWeek, dayId, { theme }),
    })),
  setFocusMetric: (dayId, focusMetric) =>
    set((state) => ({
      activeWeek: updateDay(state.activeWeek, dayId, { focusMetric }),
    })),
  hydrateFromDate: (date) =>
    set(() => ({
      activeWeek: buildWeeklySkeleton(date),
    })),
  goToPreviousWeek: () => {
    const { activeWeek } = get();
    const previousStart = addDays(new Date(activeWeek.startISO), -7);
    set({ activeWeek: buildWeeklySkeleton(previousStart) });
  },
  goToNextWeek: () => {
    const { activeWeek } = get();
    const nextStart = addDays(new Date(activeWeek.startISO), 7);
    set({ activeWeek: buildWeeklySkeleton(nextStart) });
  },
  resetToCurrentWeek: () =>
    set(() => ({
      activeWeek: buildWeeklySkeleton(new Date()),
    })),
  moveTask: ({ taskId, dayId, swimlaneId, index }) =>
    set((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return {};
      }

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

      // ensure source lane still present with sorted items
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

      return { tasks: flattened };
    }),
  createFloatingTask: (taskInput) => {
    const task: PlannerTask = {
      id: generateId(),
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

    set((state) => ({
      floatingTasks: normalizeFloatingOrdering([task, ...state.floatingTasks]),
    }));

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
  scheduleFloatingTask: ({ taskId, dayId, swimlaneId, index }) =>
    set((state) => {
      const floatingTask = state.floatingTasks.find(
        (task) => task.id === taskId
      );
      if (!floatingTask) {
        return {};
      }

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

      return {
        floatingTasks: normalizeFloatingOrdering(remainingFloating),
        tasks: normalizeLaneOrdering(merged),
      };
    }),
  unscheduleTask: ({ taskId, index }) =>
    set((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return {};
      }

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

      return {
        tasks: normalizedTasks,
        floatingTasks: normalizeFloatingOrdering(floatingWithTask),
      };
    }),
  loadInitialSnapshot: async () => {
    if (get().isHydrated) {
      return;
    }

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
