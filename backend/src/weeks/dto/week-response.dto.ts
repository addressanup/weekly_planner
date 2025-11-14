import { TaskResponseDto } from '../../tasks/dto';

export class DayResponseDto {
  id: string;
  date: Date;
  theme: string | null;
  focusMetric: string | null;
  weekId: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: TaskResponseDto[];
}

export class WeekResponseDto {
  id: string;
  startDate: Date;
  endDate: Date;
  theme: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  days?: DayResponseDto[];
}

export class WeekWithStatsDto extends WeekResponseDto {
  statistics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    plannedTasks: number;
    totalDuration: number;
    completionRate: number;
  };
}
