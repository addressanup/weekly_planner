import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlannerStatus } from '@prisma/client';
import {
  CreateWeekDto,
  UpdateWeekDto,
  CreateDayDto,
  UpdateDayDto,
  WeekResponseDto,
  DayResponseDto,
  WeekWithStatsDto,
} from './dto';

@Injectable()
export class WeeksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new week with days
   */
  async create(
    userId: string,
    createWeekDto: CreateWeekDto,
  ): Promise<WeekResponseDto> {
    const { startDate, endDate, theme } = createWeekDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Calculate week number (YYYYWW format)
    const year = start.getFullYear();
    const week1 = new Date(year, 0, 1);
    const days = Math.floor((start.getTime() - week1.getTime()) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((days + week1.getDay() + 1) / 7);
    const weekNumber = year * 100 + weekNum;

    // Create week with 7 days
    const week = await this.prisma.week.create({
      data: {
        userId,
        weekNumber,
        startDate: start,
        endDate: end,
        theme,
        days: {
          create: this.generateDays(start, end),
        },
      },
      include: {
        days: {
          orderBy: { date: 'asc' },
        },
      },
    });

    return week as WeekResponseDto;
  }

  /**
   * Get all weeks for user
   */
  async findAll(userId: string): Promise<WeekResponseDto[]> {
    const weeks = await this.prisma.week.findMany({
      where: { userId },
      include: {
        days: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return weeks as WeekResponseDto[];
  }

  /**
   * Get current week for user
   */
  async findCurrent(userId: string): Promise<WeekResponseDto | null> {
    const now = new Date();

    const week = await this.prisma.week.findFirst({
      where: {
        userId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        days: {
          orderBy: { date: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return week as WeekResponseDto | null;
  }

  /**
   * Get week by ID
   */
  async findOne(userId: string, weekId: string): Promise<WeekResponseDto> {
    const week = await this.prisma.week.findUnique({
      where: { id: weekId },
      include: {
        days: {
          orderBy: { date: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!week) {
      throw new NotFoundException('Week not found');
    }

    if (week.userId !== userId) {
      throw new ForbiddenException('You do not have access to this week');
    }

    return week as WeekResponseDto;
  }

  /**
   * Get week with statistics
   */
  async findOneWithStats(
    userId: string,
    weekId: string,
  ): Promise<WeekWithStatsDto> {
    const week = await this.findOne(userId, weekId);

    const tasks = await this.prisma.task.findMany({
      where: {
        day: {
          weekId,
        },
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.status === PlannerStatus.COMPLETED,
    ).length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === PlannerStatus.IN_PROGRESS,
    ).length;
    const plannedTasks = tasks.filter(
      (t) => t.status === PlannerStatus.PLANNED,
    ).length;
    const totalDuration = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      ...week,
      statistics: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        plannedTasks,
        totalDuration,
        completionRate: Math.round(completionRate * 100) / 100,
      },
    };
  }

  /**
   * Update week
   */
  async update(
    userId: string,
    weekId: string,
    updateWeekDto: UpdateWeekDto,
  ): Promise<WeekResponseDto> {
    await this.findOne(userId, weekId);

    const { startDate, endDate, ...rest } = updateWeekDto;

    // Validate dates if both provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const week = await this.prisma.week.update({
      where: { id: weekId },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        days: {
          orderBy: { date: 'asc' },
        },
      },
    });

    return week as WeekResponseDto;
  }

  /**
   * Delete week
   */
  async remove(userId: string, weekId: string): Promise<void> {
    await this.findOne(userId, weekId);

    await this.prisma.week.delete({
      where: { id: weekId },
    });
  }

  /**
   * Get day by ID
   */
  async findDay(userId: string, dayId: string): Promise<DayResponseDto> {
    const day = await this.prisma.day.findUnique({
      where: { id: dayId },
      include: {
        week: true,
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!day) {
      throw new NotFoundException('Day not found');
    }

    if (day.week.userId !== userId) {
      throw new ForbiddenException('You do not have access to this day');
    }

    return day as DayResponseDto;
  }

  /**
   * Update day
   */
  async updateDay(
    userId: string,
    dayId: string,
    updateDayDto: UpdateDayDto,
  ): Promise<DayResponseDto> {
    await this.findDay(userId, dayId);

    const { date, ...rest } = updateDayDto;

    const day = await this.prisma.day.update({
      where: { id: dayId },
      data: {
        ...rest,
        date: date ? new Date(date) : undefined,
      },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return day as DayResponseDto;
  }

  /**
   * Private helper: Generate days between start and end date
   */
  private generateDays(startDate: Date, endDate: Date) {
    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push({
        date: new Date(current),
        dayOfWeek: current.getDay(),
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  /**
   * Get week by date range
   */
  async findByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<WeekResponseDto[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }

    const weeks = await this.prisma.week.findMany({
      where: {
        userId,
        OR: [
          {
            startDate: { gte: start, lte: end },
          },
          {
            endDate: { gte: start, lte: end },
          },
          {
            AND: [{ startDate: { lte: start } }, { endDate: { gte: end } }],
          },
        ],
      },
      include: {
        days: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return weeks as WeekResponseDto[];
  }
}
