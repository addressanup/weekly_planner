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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createTaskDto) {
        const { dayId, swimlane, ...taskData } = createTaskDto;
        if (dayId) {
            await this.verifyDayOwnership(userId, dayId);
        }
        const order = await this.getNextPosition(userId, dayId, swimlane);
        const task = await this.prisma.task.create({
            data: {
                ...taskData,
                userId,
                dayId: dayId || null,
                swimlane: swimlane || null,
                order,
                status: client_1.PlannerStatus.PLANNED,
            },
        });
        return task;
    }
    async findAll(userId) {
        const tasks = await this.prisma.task.findMany({
            where: { userId },
            orderBy: [{ createdAt: 'desc' }],
        });
        return tasks;
    }
    async findByDay(userId, dayId) {
        await this.verifyDayOwnership(userId, dayId);
        const tasks = await this.prisma.task.findMany({
            where: {
                userId,
                dayId,
            },
            orderBy: [{ order: 'asc' }],
        });
        return tasks;
    }
    async findBySwimlane(userId, swimlane) {
        const tasks = await this.prisma.task.findMany({
            where: {
                userId,
                swimlane,
            },
            orderBy: [{ order: 'asc' }],
        });
        return tasks;
    }
    async findUnassigned(userId) {
        const tasks = await this.prisma.task.findMany({
            where: {
                userId,
                dayId: null,
            },
            orderBy: [{ createdAt: 'desc' }],
        });
        return tasks;
    }
    async findOne(userId, taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this task');
        }
        return task;
    }
    async update(userId, taskId, updateTaskDto) {
        const task = await this.findOne(userId, taskId);
        const { dayId, swimlane, status, ...taskData } = updateTaskDto;
        if (dayId && dayId !== task.dayId) {
            await this.verifyDayOwnership(userId, dayId);
        }
        const completedAt = status === client_1.PlannerStatus.COMPLETED && task.status !== client_1.PlannerStatus.COMPLETED
            ? new Date()
            : status !== client_1.PlannerStatus.COMPLETED
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
        return updatedTask;
    }
    async assignToSwimlane(userId, taskId, assignDto) {
        const task = await this.findOne(userId, taskId);
        const { swimlane, dayId, order } = assignDto;
        await this.verifyDayOwnership(userId, dayId);
        const finalPosition = order ?? (await this.getNextPosition(userId, dayId, swimlane));
        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data: {
                swimlane,
                dayId,
                order: finalPosition,
            },
        });
        return updatedTask;
    }
    async reorder(userId, taskId, newPosition) {
        const task = await this.findOne(userId, taskId);
        if (newPosition < 0) {
            throw new common_1.BadRequestException('Position must be non-negative');
        }
        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data: { order: newPosition },
        });
        return updatedTask;
    }
    async remove(userId, taskId) {
        await this.findOne(userId, taskId);
        await this.prisma.task.delete({
            where: { id: taskId },
        });
    }
    async getStatistics(userId) {
        const [total, completed, inProgress, planned, skipped] = await Promise.all([
            this.prisma.task.count({ where: { userId } }),
            this.prisma.task.count({
                where: { userId, status: client_1.PlannerStatus.COMPLETED },
            }),
            this.prisma.task.count({
                where: { userId, status: client_1.PlannerStatus.IN_PROGRESS },
            }),
            this.prisma.task.count({
                where: { userId, status: client_1.PlannerStatus.PLANNED },
            }),
            this.prisma.task.count({
                where: { userId, status: client_1.PlannerStatus.SKIPPED },
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
    async verifyDayOwnership(userId, dayId) {
        const day = await this.prisma.day.findUnique({
            where: { id: dayId },
            include: { week: true },
        });
        if (!day) {
            throw new common_1.NotFoundException('Day not found');
        }
        if (day.week.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this day');
        }
    }
    async getNextPosition(userId, dayId, swimlane) {
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
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map