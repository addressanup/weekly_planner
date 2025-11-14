import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlannerStatus, SwimlaneType } from '@prisma/client';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskResponseDto,
  AssignTaskToSwimlaneDto,
} from './dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new task
   */
  async create(
    userId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const { dayId, swimlane, ...taskData } = createTaskDto;

    // Verify day belongs to user if dayId provided
    if (dayId) {
      await this.verifyDayOwnership(userId, dayId);
    }

    // Get next order for the task
    const order = await this.getNextPosition(userId, dayId, swimlane);

    const task = await this.prisma.task.create({
      data: {
        ...taskData,
        userId,
        dayId: dayId || null,
        swimlane: swimlane || null,
        order,
        status: PlannerStatus.PLANNED,
      },
    });

    return task as TaskResponseDto;
  }

  /**
   * Get all tasks for user
   */
  async findAll(userId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }],
    });

    return tasks as TaskResponseDto[];
  }

  /**
   * Get tasks by day
   */
  async findByDay(userId: string, dayId: string): Promise<TaskResponseDto[]> {
    await this.verifyDayOwnership(userId, dayId);

    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        dayId,
      },
      orderBy: [{ order: 'asc' }],
    });

    return tasks as TaskResponseDto[];
  }

  /**
   * Get tasks by swimlane
   */
  async findBySwimlane(
    userId: string,
    swimlane: SwimlaneType,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        swimlane,
      },
      orderBy: [{ order: 'asc' }],
    });

    return tasks as TaskResponseDto[];
  }

  /**
   * Get unassigned tasks (backlog)
   */
  async findUnassigned(userId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        dayId: null,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return tasks as TaskResponseDto[];
  }

  /**
   * Get single task by ID
   */
  async findOne(userId: string, taskId: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task as TaskResponseDto;
  }

  /**
   * Update task
   */
  async update(
    userId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.findOne(userId, taskId);

    const { dayId, swimlane, status, ...taskData } = updateTaskDto;

    // Verify day ownership if changing day
    if (dayId && dayId !== task.dayId) {
      await this.verifyDayOwnership(userId, dayId);
    }

    // Handle completion
    const completedAt =
      status === PlannerStatus.COMPLETED && task.status !== PlannerStatus.COMPLETED
        ? new Date()
        : status !== PlannerStatus.COMPLETED
          ? null
          : task.completedAt;

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...taskData,
        dayId: dayId !== undefined ? dayId : task.dayId,
        swimlane: swimlane !== undefined ? swimlane : task.swimlane,
        status: status || task.status,
        completedAt,
      },
    });

    return updatedTask as TaskResponseDto;
  }

  /**
   * Assign task to swimlane
   */
  async assignToSwimlane(
    userId: string,
    taskId: string,
    assignDto: AssignTaskToSwimlaneDto,
  ): Promise<TaskResponseDto> {
    const task = await this.findOne(userId, taskId);
    const { swimlane, dayId, order } = assignDto;

    // Verify day ownership
    await this.verifyDayOwnership(userId, dayId);

    // Get order if not provided
    const finalPosition =
      order ?? (await this.getNextPosition(userId, dayId, swimlane));

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        swimlane,
        dayId,
        order: finalPosition,
      },
    });

    return updatedTask as TaskResponseDto;
  }

  /**
   * Reorder tasks within a swimlane
   */
  async reorder(
    userId: string,
    taskId: string,
    newPosition: number,
  ): Promise<TaskResponseDto> {
    const task = await this.findOne(userId, taskId);

    if (newPosition < 0) {
      throw new BadRequestException('Position must be non-negative');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { order: newPosition },
    });

    return updatedTask as TaskResponseDto;
  }

  /**
   * Delete task
   */
  async remove(userId: string, taskId: string): Promise<void> {
    await this.findOne(userId, taskId);

    await this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  /**
   * Get task statistics for user
   */
  async getStatistics(userId: string) {
    const [total, completed, inProgress, planned, skipped] = await Promise.all([
      this.prisma.task.count({ where: { userId } }),
      this.prisma.task.count({
        where: { userId, status: PlannerStatus.COMPLETED },
      }),
      this.prisma.task.count({
        where: { userId, status: PlannerStatus.IN_PROGRESS },
      }),
      this.prisma.task.count({
        where: { userId, status: PlannerStatus.PLANNED },
      }),
      this.prisma.task.count({
        where: { userId, status: PlannerStatus.SKIPPED },
      }),
    ]);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      planned,
      skipped,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  /**
   * Private helper: Verify day belongs to user
   */
  private async verifyDayOwnership(
    userId: string,
    dayId: string,
  ): Promise<void> {
    const day = await this.prisma.day.findUnique({
      where: { id: dayId },
      include: { week: true },
    });

    if (!day) {
      throw new NotFoundException('Day not found');
    }

    if (day.week.userId !== userId) {
      throw new ForbiddenException('You do not have access to this day');
    }
  }

  /**
   * Private helper: Get next order for task
   */
  private async getNextPosition(
    userId: string,
    dayId: string | null | undefined,
    swimlane: SwimlaneType | null | undefined,
  ): Promise<number> {
    const maxPosition = await this.prisma.task.findFirst({
      where: {
        userId,
        dayId: dayId || null,
        swimlane: swimlane || null,
      },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return maxPosition ? maxPosition.order + 1 : 0;
  }
}
