import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, AssignTaskToSwimlaneDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * POST /tasks
   * Create a new task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  /**
   * GET /tasks
   * Get all tasks (optionally filtered by query params)
   */
  @Get()
  async findAll(
    @Request() req: any,
    @Query('dayId') dayId?: string,
    @Query('swimlaneId') swimlaneId?: string,
    @Query('unassigned') unassigned?: string,
  ) {
    if (dayId) {
      return this.tasksService.findByDay(req.user.id, dayId);
    }

    if (swimlaneId) {
      return this.tasksService.findBySwimlane(req.user.id, swimlaneId as any);
    }

    if (unassigned === 'true') {
      return this.tasksService.findUnassigned(req.user.id);
    }

    return this.tasksService.findAll(req.user.id);
  }

  /**
   * GET /tasks/statistics
   * Get task statistics for current user
   */
  @Get('statistics')
  async getStatistics(@Request() req: any) {
    return this.tasksService.getStatistics(req.user.id);
  }

  /**
   * GET /tasks/:id
   * Get single task by ID
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.tasksService.findOne(req.user.id, id);
  }

  /**
   * PATCH /tasks/:id
   * Update task
   */
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.id, id, updateTaskDto);
  }

  /**
   * PATCH /tasks/:id/assign
   * Assign task to swimlane
   */
  @Patch(':id/assign')
  async assignToSwimlane(
    @Request() req: any,
    @Param('id') id: string,
    @Body() assignDto: AssignTaskToSwimlaneDto,
  ) {
    return this.tasksService.assignToSwimlane(req.user.id, id, assignDto);
  }

  /**
   * PATCH /tasks/:id/reorder
   * Reorder task position
   */
  @Patch(':id/reorder')
  async reorder(
    @Request() req: any,
    @Param('id') id: string,
    @Body('position') position: number,
  ) {
    return this.tasksService.reorder(req.user.id, id, position);
  }

  /**
   * DELETE /tasks/:id
   * Delete task
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.tasksService.remove(req.user.id, id);
  }
}
