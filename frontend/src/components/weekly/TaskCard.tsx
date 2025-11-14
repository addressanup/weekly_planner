import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { Flame, Move } from "lucide-react";

import type { PlannerTask } from "../../types/planner";

interface TaskCardProps {
  task: PlannerTask;
  index: number;
  context: "scheduled" | "floating";
}

const categoryStyles: Record<PlannerTask["category"], string> = {
  work: "bg-indigo-100 text-indigo-700",
  health: "bg-emerald-100 text-emerald-700",
  personal: "bg-rose-100 text-rose-700",
  learning: "bg-sky-100 text-sky-700",
  admin: "bg-amber-100 text-amber-700",
};

const energyCopy: Record<PlannerTask["energy"], string> = {
  high: "High energy",
  medium: "Medium energy",
  low: "Low energy",
};

export const TaskCard = ({ task, index, context }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      taskId: task.id,
      dayId: task.assignedDayId,
      swimlaneId: task.swimlaneId,
      index,
      context,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group relative flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition focus-within:ring-2 focus-within:ring-indigo-300",
        context === "floating" && "border-dashed border-slate-300 bg-white/80",
        isDragging && "z-10 rotate-1 border-indigo-300 shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{task.title}</h3>
          <p className="text-xs text-slate-500">
            {Math.round(task.durationMinutes / 15) * 15} mins •{" "}
            {energyCopy[task.energy]}
          </p>
        </div>
        <button
          type="button"
          className="flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 opacity-0 transition group-hover:opacity-100"
          aria-label="Drag task"
          {...listeners}
          {...attributes}
        >
          <Move className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={clsx(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            categoryStyles[task.category]
          )}
        >
          {task.category.toUpperCase()}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          <Flame className="size-3 text-amber-500" aria-hidden />
          {task.energy}
        </span>
        {task.targetOccurrencesPerWeek ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
            {task.targetOccurrencesPerWeek}x/week
          </span>
        ) : null}
      </div>
    </article>
  );
};
