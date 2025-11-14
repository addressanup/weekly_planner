import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { WeeksService } from './weeks.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlannerStatus } from '@prisma/client';

describe('WeeksService', () => {
  let service: WeeksService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUserId = 'user-123';
  const mockWeekId = 'week-123';
  const mockDayId = 'day-123';

  const mockWeek = {
    id: mockWeekId,
    userId: mockUserId,
    weekNumber: 202446,
    startDate: new Date('2024-11-11'),
    endDate: new Date('2024-11-17'),
    theme: 'Focus Week',
    reflection: null,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDay = {
    id: mockDayId,
    weekId: mockWeekId,
    date: new Date('2024-11-11'),
    dayOfWeek: 1,
    theme: 'Monday Focus',
    focusMetric: 'Complete 3 tasks',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWeekWithDays = {
    ...mockWeek,
    days: [mockDay],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      week: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      day: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      task: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeeksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WeeksService>(WeeksService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createWeekDto = {
      startDate: '2024-11-11',
      endDate: '2024-11-17',
      theme: 'New Week Theme',
    };

    it('should create a week with days successfully', async () => {
      prismaService.week.create.mockResolvedValue(mockWeekWithDays as any);

      const result = await service.create(mockUserId, createWeekDto);

      expect(result).toEqual(mockWeekWithDays);
      expect(prismaService.week.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUserId,
          theme: createWeekDto.theme,
          weekNumber: expect.any(Number),
          days: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                date: expect.any(Date),
                dayOfWeek: expect.any(Number),
              }),
            ]),
          }),
        }),
        include: expect.objectContaining({
          days: expect.any(Object),
        }),
      });
    });

    it('should throw BadRequestException if start date is after end date', async () => {
      const invalidDto = {
        startDate: '2024-11-17',
        endDate: '2024-11-11',
        theme: 'Invalid Week',
      };

      await expect(service.create(mockUserId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should generate correct week number', async () => {
      prismaService.week.create.mockResolvedValue(mockWeekWithDays as any);

      await service.create(mockUserId, createWeekDto);

      expect(prismaService.week.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            weekNumber: expect.any(Number),
          }),
        }),
      );
    });

    it('should generate 7 days for the week', async () => {
      let capturedDays: any[] = [];
      prismaService.week.create.mockImplementation(async (options: any) => {
        capturedDays = options.data.days.create;
        return mockWeekWithDays as any;
      });

      await service.create(mockUserId, createWeekDto);

      expect(capturedDays.length).toBe(7);
    });
  });

  describe('findAll', () => {
    it('should return all weeks for user', async () => {
      const mockWeeks = [mockWeekWithDays];
      prismaService.week.findMany.mockResolvedValue(mockWeeks as any);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual(mockWeeks);
      expect(prismaService.week.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: expect.any(Object),
        orderBy: { startDate: 'desc' },
      });
    });
  });

  describe('findCurrent', () => {
    it('should return current week', async () => {
      prismaService.week.findFirst.mockResolvedValue(mockWeekWithDays as any);

      const result = await service.findCurrent(mockUserId);

      expect(result).toEqual(mockWeekWithDays);
      expect(prismaService.week.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            startDate: expect.any(Object),
            endDate: expect.any(Object),
          }),
        }),
      );
    });

    it('should return null if no current week exists', async () => {
      prismaService.week.findFirst.mockResolvedValue(null);

      const result = await service.findCurrent(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a specific week', async () => {
      prismaService.week.findUnique.mockResolvedValue(mockWeekWithDays as any);

      const result = await service.findOne(mockUserId, mockWeekId);

      expect(result).toEqual(mockWeekWithDays);
      expect(prismaService.week.findUnique).toHaveBeenCalledWith({
        where: { id: mockWeekId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if week does not exist', async () => {
      prismaService.week.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if week belongs to different user', async () => {
      const wrongUserWeek = { ...mockWeekWithDays, userId: 'different-user' };
      prismaService.week.findUnique.mockResolvedValue(wrongUserWeek as any);

      await expect(service.findOne(mockUserId, mockWeekId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOneWithStats', () => {
    it('should return week with task statistics', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          status: PlannerStatus.COMPLETED,
          durationMinutes: 60,
        },
        {
          id: 'task-2',
          status: PlannerStatus.COMPLETED,
          durationMinutes: 30,
        },
        {
          id: 'task-3',
          status: PlannerStatus.IN_PROGRESS,
          durationMinutes: 45,
        },
        {
          id: 'task-4',
          status: PlannerStatus.PLANNED,
          durationMinutes: 90,
        },
      ];

      prismaService.week.findUnique.mockResolvedValue(mockWeekWithDays as any);
      prismaService.task.findMany.mockResolvedValue(mockTasks as any);

      const result = await service.findOneWithStats(mockUserId, mockWeekId);

      expect(result).toHaveProperty('statistics');
      expect(result.statistics).toEqual({
        totalTasks: 4,
        completedTasks: 2,
        inProgressTasks: 1,
        plannedTasks: 1,
        totalDuration: 225,
        completionRate: 50,
      });
    });

    it('should handle weeks with no tasks', async () => {
      prismaService.week.findUnique.mockResolvedValue(mockWeekWithDays as any);
      prismaService.task.findMany.mockResolvedValue([]);

      const result = await service.findOneWithStats(mockUserId, mockWeekId);

      expect(result.statistics).toEqual({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        plannedTasks: 0,
        totalDuration: 0,
        completionRate: 0,
      });
    });
  });

  describe('update', () => {
    it('should update week successfully', async () => {
      const updateDto = {
        theme: 'Updated Theme',
      };

      prismaService.week.findUnique.mockResolvedValue(mockWeekWithDays as any);
      prismaService.week.update.mockResolvedValue({
        ...mockWeekWithDays,
        ...updateDto,
      } as any);

      const result = await service.update(mockUserId, mockWeekId, updateDto);

      expect(result.theme).toBe(updateDto.theme);
      expect(prismaService.week.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if updated dates are invalid', async () => {
      const invalidUpdate = {
        startDate: '2024-11-17',
        endDate: '2024-11-11',
      };

      prismaService.week.findUnique.mockResolvedValue(mockWeekWithDays as any);

      await expect(
        service.update(mockUserId, mockWeekId, invalidUpdate),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete week successfully', async () => {
      prismaService.week.findUnique.mockResolvedValue(mockWeekWithDays as any);
      prismaService.week.delete.mockResolvedValue(mockWeek as any);

      await service.remove(mockUserId, mockWeekId);

      expect(prismaService.week.delete).toHaveBeenCalledWith({
        where: { id: mockWeekId },
      });
    });
  });

  describe('findDay', () => {
    it('should return a specific day', async () => {
      const dayWithWeek = {
        ...mockDay,
        week: mockWeek,
        tasks: [],
      };

      prismaService.day.findUnique.mockResolvedValue(dayWithWeek as any);

      const result = await service.findDay(mockUserId, mockDayId);

      expect(result).toEqual(dayWithWeek);
      expect(prismaService.day.findUnique).toHaveBeenCalledWith({
        where: { id: mockDayId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if day does not exist', async () => {
      prismaService.day.findUnique.mockResolvedValue(null);

      await expect(service.findDay(mockUserId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if day belongs to different user', async () => {
      const wrongUserDay = {
        ...mockDay,
        week: { ...mockWeek, userId: 'different-user' },
      };
      prismaService.day.findUnique.mockResolvedValue(wrongUserDay as any);

      await expect(service.findDay(mockUserId, mockDayId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateDay', () => {
    it('should update day successfully', async () => {
      const updateDto = {
        theme: 'Updated Day Theme',
      };

      const dayWithWeek = {
        ...mockDay,
        week: mockWeek,
      };

      prismaService.day.findUnique.mockResolvedValue(dayWithWeek as any);
      prismaService.day.update.mockResolvedValue({
        ...mockDay,
        ...updateDto,
      } as any);

      const result = await service.updateDay(mockUserId, mockDayId, updateDto);

      expect(result.theme).toBe(updateDto.theme);
      expect(prismaService.day.update).toHaveBeenCalled();
    });
  });

  describe('findByDateRange', () => {
    it('should return weeks within date range', async () => {
      const mockWeeks = [mockWeekWithDays];
      prismaService.week.findMany.mockResolvedValue(mockWeeks as any);

      const result = await service.findByDateRange(
        mockUserId,
        '2024-11-01',
        '2024-11-30',
      );

      expect(result).toEqual(mockWeeks);
      expect(prismaService.week.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should throw BadRequestException if start date is after end date', async () => {
      await expect(
        service.findByDateRange(mockUserId, '2024-11-30', '2024-11-01'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
