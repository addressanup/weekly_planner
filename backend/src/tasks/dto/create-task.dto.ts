import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { PlannerCategory, PlannerEnergy, SwimlaneType } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: 'Task title is required' })
  @MaxLength(200, { message: 'Task title must be less than 200 characters' })
  title: string;

  @IsEnum(PlannerCategory, {
    message: 'Category must be one of: WORK, HEALTH, PERSONAL, LEARNING, ADMIN',
  })
  category: PlannerCategory;

  @IsEnum(PlannerEnergy, {
    message: 'Energy must be one of: HIGH, MEDIUM, LOW',
  })
  energy: PlannerEnergy;

  @IsInt({ message: 'Duration must be a whole number' })
  @Min(5, { message: 'Duration must be at least 5 minutes' })
  @Max(480, { message: 'Duration cannot exceed 8 hours' })
  durationMinutes: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes must be less than 1000 characters' })
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(21, { message: 'Cannot exceed 3 times per day' })
  targetOccurrencesPerWeek?: number;

  @IsOptional()
  @IsString()
  dayId?: string;

  @IsOptional()
  @IsEnum(SwimlaneType, {
    message: 'Swimlane must be one of: FOCUS, COLLABORATION, SELF_CARE, LIFE_ADMIN',
  })
  swimlane?: SwimlaneType;
}
