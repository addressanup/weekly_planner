import { PrismaService } from '../prisma/prisma.service';
import { SwimlaneType } from '@prisma/client';
import { CreateTaskDto, UpdateTaskDto, TaskResponseDto, AssignTaskToSwimlaneDto } from './dto';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createTaskDto: CreateTaskDto): Promise<TaskResponseDto>;
    findAll(userId: string): Promise<TaskResponseDto[]>;
    findByDay(userId: string, dayId: string): Promise<TaskResponseDto[]>;
    findBySwimlane(userId: string, swimlane: SwimlaneType): Promise<TaskResponseDto[]>;
    findUnassigned(userId: string): Promise<TaskResponseDto[]>;
    findOne(userId: string, taskId: string): Promise<TaskResponseDto>;
    update(userId: string, taskId: string, updateTaskDto: UpdateTaskDto): Promise<TaskResponseDto>;
    assignToSwimlane(userId: string, taskId: string, assignDto: AssignTaskToSwimlaneDto): Promise<TaskResponseDto>;
    reorder(userId: string, taskId: string, newPosition: number): Promise<TaskResponseDto>;
    remove(userId: string, taskId: string): Promise<void>;
    getStatistics(userId: string): Promise<{
        total: number;
        completed: number;
        inProgress: number;
        planned: number;
        skipped: number;
        completionRate: number;
    }>;
    private verifyDayOwnership;
    private getNextPosition;
}
