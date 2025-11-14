import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import clsx from "clsx";

import type { PlannerSwimlane, PlannerTask } from "../../types/planner";
import { SwimlaneSection } from "./SwimlaneSection";
import { TaskCard } from "./TaskCard";

interface LaneColumnProps {
  dayId: string;
  swimlane: PlannerSwimlane;
  tasks: PlannerTask[];
}

export const LaneColumn = ({ dayId, swimlane, tasks }: LaneColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `lane:${dayId}:${swimlane.id}`,
    data: {
      type: "lane",
      dayId,
      swimlaneId: swimlane.id,
    },
  });

  return (
    <SwimlaneSection swimlane={swimlane}>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={clsx(
            "min-h-32 rounded-lg border-2 border-dashed bg-white/70 p-2 transition",
            isOver
              ? "border-indigo-400 bg-indigo-50/80 shadow-inner"
              : "border-transparent"
          )}
        >
          <div className="flex flex-col gap-2">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                context="scheduled"
              />
            ))}
            {tasks.length === 0 && !isOver && (
              <p className="text-xs text-slate-400">
                Drop a task or use quick add to plan this swimlane.
              </p>
            )}
          </div>
        </div>
      </SortableContext>
    </SwimlaneSection>
  );
};
