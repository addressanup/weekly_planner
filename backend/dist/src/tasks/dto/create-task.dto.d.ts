import { PlannerCategory, PlannerEnergy, SwimlaneType } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    category: PlannerCategory;
    energy: PlannerEnergy;
    durationMinutes: number;
    notes?: string;
    targetOccurrencesPerWeek?: number;
    dayId?: string;
    swimlane?: SwimlaneType;
}
