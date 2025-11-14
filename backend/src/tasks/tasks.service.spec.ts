import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlannerStatus, PlannerCategory, PlannerEnergy, SwimlaneType } from '@prisma/client';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUserId = 'user-123';
  const mockDayId = 'day-123';
  const mockTaskId = 'task-123';

  const mockTask = {
    id: mockTaskId,
    userId: mockUserId,
    weekId: 'week-123',
    dayId: mockDayId,
    title: 'Test Task',
    notes: 'Test notes',
    category: PlannerCategory.WORK,
    energy: PlannerEnergy.HIGH,
    status: PlannerStatus.PLANNED,
    durationMinutes: 60,
    swimlane: SwimlaneType.FOCUS,
    order: 0,
    targetOccurrencesPerWeek: null,
    isRecurring: false,
    sourceType: 'manual',
    externalId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
  };

  const mockDay = {
    id: mockDayId,
    weekId: 'week-123',
    date: new Date(),
    dayOfWeek: 1,
    theme: null,
    focusMetric: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    week: {
      userId: mockUserId,
    },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      day: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTaskDto = {
      title: 'New Task',
      category: PlannerCategory.WORK,
      energy: PlannerEnergy.HIGH,
      durationMinutes: 60,
      notes: 'Task notes',
      dayId: mockDayId,
      swimlane: SwimlaneType.FOCUS,
    };

    it('should create a task successfully', async () => {
      prismaService.day.findUnique.mockResolvedValue(mockDay as any);
      prismaService.task.findFirst.mockResolvedValue(null);
      prismaService.task.create.mockResolvedValue(mockTask as any);

      const result = await service.create(mockUserId, createTaskDto);

      expect(result).toEqual(mockTask);
      expect(prismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createTaskDto.title,
          userId: mockUserId,
          status: PlannerStatus.PLANNED,
        }),
      });
    });

    it('should verify day ownership before creating task', async () => {
      prismaService.day.findUnique.mockResolvedValue(mockDay as any);
      prismaService.task.findFirst.mockResolvedValue(null);
      prismaService.task.create.mockResolvedValue(mockTask as any);

      await service.create(mockUserId, createTaskDto);

      expect(prismaService.day.findUnique).toHaveBeenCalledWith({
        where: { id: mockDayId },
        include: { week: true },
      });
    });

    it('should throw NotFoundException if day does not exist', async () => {
      prismaService.day.findUnique.mockResolvedValue(null);

      await expect(service.create(mockUserId, createTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if day belongs to different user', async () => {
      const wrongUserDay = {
        ...mockDay,
        week: { userId: 'different-user' },
      };
      prismaService.day.findUnique.mockResolvedValue(wrongUserDay as any);

      await expect(service.create(mockUserId, createTaskDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should assign correct position when creating task', async () => {
      const existingTask = { ...mockTask, order: 5 };
      prismaService.day.findUnique.mockResolvedValue(mockDay as any);
      prismaService.task.findFirst.mockResolvedValue(existingTask as any);
      prismaService.task.create.mockResolvedValue({
        ...mockTask,
        order: 6,
      } as any);

      await service.create(mockUserId, createTaskDto);

      expect(prismaService.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            order: 6,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all tasks for user', async () => {
      const mockTasks = [mockTask, { ...mockTask, id: 'task-456' }];
      prismaService.task.findMany.mockResolvedValue(mockTasks as any);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual(mockTasks);
      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: [{ createdAt: 'desc' }],
      });
    });
  });

  describe('findByDay', () => {
    it('should return tasks for a specific day', async () => {
      const mockTasks = [mockTask];
      prismaService.day.findUnique.mockResolvedValue(mockDay as any);
      prismaService.task.findMany.mockResolvedValue(mockTasks as any);

      const result = await service.findByDay(mockUserId, mockDayId);

      expect(result).toEqual(mockTasks);
      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          dayId: mockDayId,
        },
        orderBy: [{ order: 'asc' }],
      });
    });
  });

  describe('findUnassigned', () => {
    it('should return unassigned tasks (backlog)', async () => {
      const unassignedTasks = [{ ...mockTask, dayId: null }];
      prismaService.task.findMany.mockResolvedValue(unassignedTasks as any);

      const result = await service.findUnassigned(mockUserId);

      expect(result).toEqual(unassignedTasks);
      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          dayId: null,
        },
        orderBy: [{ createdAt: 'desc' }],
      });
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const updateDto = {
        title: 'Updated Task',
        status: PlannerStatus.IN_PROGRESS,
      };

      prismaService.task.findUnique.mockResolvedValue(mockTask as any);
      prismaService.task.update.mockResolvedValue({
        ...mockTask,
        ...updateDto,
      } as any);

      const result = await service.update(mockUserId, mockTaskId, updateDto);

      expect(result.title).toBe(updateDto.title);
      expect(result.status).toBe(updateDto.status);
      expect(prismaService.task.update).toHaveBeenCalled();
    });

    it('should set completedAt when marking task as completed', async () => {
      const updateDto = {
        status: PlannerStatus.COMPLETED,
      };

      prismaService.task.findUnique.mockResolvedValue(mockTask as any);
      prismaService.task.update.mockResolvedValue({
        ...mockTask,
        ...updateDto,
        completedAt: new Date(),
      } as any);

      const result = await service.update(mockUserId, mockTaskId, updateDto);

      expect(result.completedAt).toBeTruthy();
      expect(prismaService.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw NotFoundException if task does not exist', async () => {
      prismaService.task.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockUserId, 'non-existent', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if task belongs to different user', async () => {
      const wrongUserTask = { ...mockTask, userId: 'different-user' };
      prismaService.task.findUnique.mockResolvedValue(wrongUserTask as any);

      await expect(
        service.update(mockUserId, mockTaskId, {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a task successfully', async () => {
      prismaService.task.findUnique.mockResolvedValue(mockTask as any);
      prismaService.task.delete.mockResolvedValue(mockTask as any);

      await service.remove(mockUserId, mockTaskId);

      expect(prismaService.task.delete).toHaveBeenCalledWith({
        where: { id: mockTaskId },
      });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      prismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.remove(mockUserId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatistics', () => {
    it('should return task statistics', async () => {
      prismaService.task.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(6) // completed
        .mockResolvedValueOnce(2) // in-progress
        .mockResolvedValueOnce(1) // planned
        .mockResolvedValueOnce(1); // skipped

      const result = await service.getStatistics(mockUserId);

      expect(result).toEqual({
        total: 10,
        completed: 6,
        inProgress: 2,
        planned: 1,
        skipped: 1,
        completionRate: 60,
      });
    });

    it('should handle zero tasks gracefully', async () => {
      prismaService.task.count.mockResolvedValue(0);

      const result = await service.getStatistics(mockUserId);

      expect(result.completionRate).toBe(0);
    });
  });

  describe('reorder', () => {
    it('should update task position', async () => {
      const newPosition = 3;
      prismaService.task.findUnique.mockResolvedValue(mockTask as any);
      prismaService.task.update.mockResolvedValue({
        ...mockTask,
        order: newPosition,
      } as any);

      const result = await service.reorder(mockUserId, mockTaskId, newPosition);

      expect(result.order).toBe(newPosition);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        data: { order: newPosition },
      });
    });

    it('should throw BadRequestException for negative position', async () => {
      prismaService.task.findUnique.mockResolvedValue(mockTask as any);

      await expect(service.reorder(mockUserId, mockTaskId, -1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
