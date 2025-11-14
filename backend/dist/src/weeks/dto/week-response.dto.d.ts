import { TaskResponseDto } from '../../tasks/dto';
export declare class DayResponseDto {
    id: string;
    date: Date;
    theme: string | null;
    focusMetric: string | null;
    weekId: string;
    createdAt: Date;
    updatedAt: Date;
    tasks?: TaskResponseDto[];
}
export declare class WeekResponseDto {
    id: string;
    startDate: Date;
    endDate: Date;
    theme: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    days?: DayResponseDto[];
}
export declare class WeekWithStatsDto extends WeekResponseDto {
    statistics: {
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        plannedTasks: number;
        totalDuration: number;
        completionRate: number;
    };
}
