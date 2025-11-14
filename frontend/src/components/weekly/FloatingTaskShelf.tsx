import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { usePlannerStore } from "../../state/usePlannerStore";
import { TaskCard } from "./TaskCard";

export const FloatingTaskShelf = () => {
  const tasks = usePlannerStore((state) =>
    state.floatingTasks.slice().sort((a, b) => a.order - b.order)
  );

  const { setNodeRef, isOver } = useDroppable({
    id: "floating-shelf",
    data: {
      type: "floating-shelf" as const,
    },
  });

  return (
    <aside className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Floating Tasks
        </p>
        <h2 className="text-lg font-semibold text-slate-800">
          Unschedule Bucket
        </h2>
        <p className="text-xs text-slate-500">
          Drag tasks here to keep them flexible, or drop into the week to
          schedule.
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto rounded-xl border-2 border-dashed p-2 transition ${
          isOver
            ? "border-indigo-400 bg-indigo-50/70"
            : "border-transparent bg-slate-50/60"
        }`}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                context="floating"
              />
            ))}
            {tasks.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-4 text-sm text-slate-500">
                Nothing floating right now. Use quick add or unschedule a task
                to keep it flexible.
              </p>
            )}
          </div>
        </SortableContext>
      </div>
    </aside>
  );
};
