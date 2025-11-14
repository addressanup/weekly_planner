import { PlannerCategory, PlannerEnergy, PlannerStatus, SwimlaneType } from '@prisma/client';

export class TaskResponseDto {
  id: string;
  title: string;
  category: PlannerCategory;
  energy: PlannerEnergy;
  status: PlannerStatus;
  durationMinutes: number;
  notes: string | null;
  targetOccurrencesPerWeek: number | null;
  userId: string;
  dayId: string | null;
  swimlane: SwimlaneType | null;
  order: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AssignTaskToSwimlaneDto {
  swimlane: SwimlaneType;
  dayId: string;
  order?: number;
}
