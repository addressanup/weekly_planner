import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { memo, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { usePlannerStore } from "../../state/usePlannerStore";
import type { PlannerSwimlaneKey } from "../../types/planner";
import { DayColumn } from "./DayColumn";
import { FloatingTaskShelf } from "./FloatingTaskShelf";
import { PlannerStatusBar } from "./PlannerStatusBar";
import { QuickAddBar } from "./QuickAddBar";
import { TaskCardPreview } from "./TaskCardPreview";
import { WeekHeader } from "./WeekHeader";

export const WeeklyCanvas = memo(() => {
  const week = usePlannerStore((state) => state.activeWeek);
  const tasks = usePlannerStore((state) => state.tasks);
  const floatingTasks = usePlannerStore((state) => state.floatingTasks);
  const moveTask = usePlannerStore((state) => state.moveTask);
  const reorderFloatingTask = usePlannerStore(
    (state) => state.reorderFloatingTask
  );
  const scheduleFloatingTask = usePlannerStore(
    (state) => state.scheduleFloatingTask
  );
  const unscheduleTask = usePlannerStore((state) => state.unscheduleTask);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const activeTask = useMemo(() => {
    const combined = [...tasks, ...floatingTasks];
    return combined.find((task) => task.id === activeTaskId) ?? null;
  }, [activeTaskId, tasks, floatingTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id;
    if (typeof activeId === "string") {
      setActiveTaskId(activeId);
    }
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over || typeof active.id !== "string") {
      return;
    }

    const activeData = active.data.current as
      | {
          type: "task";
          context: "scheduled" | "floating";
          taskId: string;
          dayId?: string;
          swimlaneId?: string;
          index?: number;
        }
      | undefined;

    const overData = over.data.current as
      | {
          type: "task";
          context: "scheduled" | "floating";
          taskId: string;
          dayId?: string;
          swimlaneId?: string;
          index?: number;
        }
      | {
          type: "lane";
          dayId: string;
          swimlaneId: string;
        }
      | {
          type: "floating-shelf";
        }
      | undefined;

    if (!activeData || activeData.type !== "task" || !overData) {
      return;
    }

    if (activeData.context === "floating") {
      if (overData.type === "floating-shelf") {
        return;
      }

      if (overData.type === "task" && overData.context === "floating") {
        if (overData.taskId === activeData.taskId) {
          return;
        }

        const targetIndex = overData.index ?? floatingTasks.length;
        reorderFloatingTask(activeData.taskId, targetIndex);
        return;
      }

      if (overData.type === "task" && overData.context === "scheduled") {
        const targetDayId = overData.dayId;
        const targetLaneId = overData.swimlaneId;
        if (!targetDayId || !targetLaneId) {
          return;
        }

        const baseIndex = overData.index ?? 0;
        scheduleFloatingTask({
          taskId: activeData.taskId,
          dayId: targetDayId,
          swimlaneId: targetLaneId as PlannerSwimlaneKey,
          index: baseIndex,
        });
        return;
      }

      if (overData.type === "lane") {
        scheduleFloatingTask({
          taskId: activeData.taskId,
          dayId: overData.dayId,
          swimlaneId: overData.swimlaneId as PlannerSwimlaneKey,
          index: tasks.filter(
            (item) =>
              item.assignedDayId === overData.dayId &&
              item.swimlaneId === overData.swimlaneId
          ).length,
        });
        return;
      }

      return;
    }

    // Scheduled tasks interaction
    if (activeData.context === "scheduled") {
      if (overData.type === "floating-shelf") {
        unscheduleTask({ taskId: activeData.taskId });
        return;
      }

      if (overData.type === "task" && overData.context === "floating") {
        const targetIndex = overData.index ?? floatingTasks.length;
        unscheduleTask({ taskId: activeData.taskId, index: targetIndex });
        return;
      }

      const task = tasks.find((item) => item.id === activeData.taskId);
      if (!task) {
        return;
      }

      if (overData.type === "task" && overData.context === "scheduled") {
        const targetDayId = overData.dayId;
        const targetLaneId = overData.swimlaneId;
        if (!targetDayId || !targetLaneId) {
          return;
        }

        const targetIndex = overData.index ?? 0;
        moveTask({
          taskId: task.id,
          dayId: targetDayId,
          swimlaneId: targetLaneId as PlannerSwimlaneKey,
          index: targetIndex,
        });
        return;
      }

      if (overData.type === "lane") {
        const targetDayId = overData.dayId;
        const targetLaneId = overData.swimlaneId;
        const laneLength = tasks.filter(
          (item) =>
            item.assignedDayId === targetDayId &&
            item.swimlaneId === targetLaneId
        ).length;
        moveTask({
          taskId: task.id,
          dayId: targetDayId,
          swimlaneId: targetLaneId as PlannerSwimlaneKey,
          index: laneLength,
        });
        return;
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full flex-col">
        <WeekHeader />
        <QuickAddBar />
        <PlannerStatusBar />
        <main className="relative flex-1 overflow-hidden bg-slate-100/60">
          <div className="absolute inset-0 overflow-hidden">
            <div className="flex h-full flex-col gap-6 overflow-hidden px-6 py-6">
              <div className="flex flex-1 flex-col gap-6 lg:flex-row">
                <section className="flex-1 overflow-x-auto">
                  <div className="flex min-w-max gap-4 pb-4 lg:min-w-full">
                    {week.days.map((day) => (
                      <DayColumn key={day.id} day={day} />
                    ))}
                  </div>
                </section>
                <div className="w-full shrink-0 lg:w-80 xl:w-96">
                  <FloatingTaskShelf />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskCardPreview task={activeTask} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
});

WeeklyCanvas.displayName = "WeeklyCanvas";
