"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let WeeksService = class WeeksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createWeekDto) {
        const { startDate, endDate, theme } = createWeekDto;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        const year = start.getFullYear();
        const week1 = new Date(year, 0, 1);
        const days = Math.floor((start.getTime() - week1.getTime()) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((days + week1.getDay() + 1) / 7);
        const weekNumber = year * 100 + weekNum;
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
        return week;
    }
    async findAll(userId) {
        const weeks = await this.prisma.week.findMany({
            where: { userId },
            include: {
                days: {
                    orderBy: { date: 'asc' },
                },
            },
            orderBy: { startDate: 'desc' },
        });
        return weeks;
    }
    async findCurrent(userId) {
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
        return week;
    }
    async findOne(userId, weekId) {
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
            throw new common_1.NotFoundException('Week not found');
        }
        if (week.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this week');
        }
        return week;
    }
    async findOneWithStats(userId, weekId) {
        const week = await this.findOne(userId, weekId);
        const tasks = await this.prisma.task.findMany({
            where: {
                day: {
                    weekId,
                },
            },
        });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === client_1.PlannerStatus.COMPLETED).length;
        const inProgressTasks = tasks.filter((t) => t.status === client_1.PlannerStatus.IN_PROGRESS).length;
        const plannedTasks = tasks.filter((t) => t.status === client_1.PlannerStatus.PLANNED).length;
        const totalDuration = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
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
    async update(userId, weekId, updateWeekDto) {
        await this.findOne(userId, weekId);
        const { startDate, endDate, ...rest } = updateWeekDto;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start >= end) {
                throw new common_1.BadRequestException('Start date must be before end date');
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
        return week;
    }
    async remove(userId, weekId) {
        await this.findOne(userId, weekId);
        await this.prisma.week.delete({
            where: { id: weekId },
        });
    }
    async findDay(userId, dayId) {
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
            throw new common_1.NotFoundException('Day not found');
        }
        if (day.week.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this day');
        }
        return day;
    }
    async updateDay(userId, dayId, updateDayDto) {
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
        return day;
    }
    generateDays(startDate, endDate) {
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
    async findByDateRange(userId, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            throw new common_1.BadRequestException('Start date must be before end date');
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
        return weeks;
    }
};
exports.WeeksService = WeeksService;
exports.WeeksService = WeeksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WeeksService);
//# sourceMappingURL=weeks.service.js.map