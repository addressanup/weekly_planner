import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { PlannerStatus } from '@prisma/client';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsEnum(PlannerStatus, {
    message: 'Status must be one of: PLANNED, IN_PROGRESS, COMPLETED, SKIPPED',
  })
  status?: PlannerStatus;
}
