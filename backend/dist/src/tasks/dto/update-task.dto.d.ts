import { PlannerStatus } from '@prisma/client';
import { CreateTaskDto } from './create-task.dto';
declare const UpdateTaskDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTaskDto>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
    status?: PlannerStatus;
}
export {};
