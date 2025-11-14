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
import { WeeksService } from './weeks.service';
import { CreateWeekDto, UpdateWeekDto, UpdateDayDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('weeks')
@UseGuards(JwtAuthGuard)
export class WeeksController {
  constructor(private readonly weeksService: WeeksService) {}

  /**
   * POST /weeks
   * Create a new week
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createWeekDto: CreateWeekDto) {
    return this.weeksService.create(req.user.id, createWeekDto);
  }

  /**
   * GET /weeks
   * Get all weeks (optionally filtered by date range)
   */
  @Get()
  async findAll(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate && endDate) {
      return this.weeksService.findByDateRange(
        req.user.id,
        startDate,
        endDate,
      );
    }

    return this.weeksService.findAll(req.user.id);
  }

  /**
   * GET /weeks/current
   * Get current week
   */
  @Get('current')
  async findCurrent(@Request() req: any) {
    return this.weeksService.findCurrent(req.user.id);
  }

  /**
   * GET /weeks/:id
   * Get week by ID
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.weeksService.findOne(req.user.id, id);
  }

  /**
   * GET /weeks/:id/stats
   * Get week with statistics
   */
  @Get(':id/stats')
  async findOneWithStats(@Request() req: any, @Param('id') id: string) {
    return this.weeksService.findOneWithStats(req.user.id, id);
  }

  /**
   * PATCH /weeks/:id
   * Update week
   */
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateWeekDto: UpdateWeekDto,
  ) {
    return this.weeksService.update(req.user.id, id, updateWeekDto);
  }

  /**
   * DELETE /weeks/:id
   * Delete week
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.weeksService.remove(req.user.id, id);
  }

  /**
   * GET /weeks/days/:dayId
   * Get day by ID
   */
  @Get('days/:dayId')
  async findDay(@Request() req: any, @Param('dayId') dayId: string) {
    return this.weeksService.findDay(req.user.id, dayId);
  }

  /**
   * PATCH /weeks/days/:dayId
   * Update day
   */
  @Patch('days/:dayId')
  async updateDay(
    @Request() req: any,
    @Param('dayId') dayId: string,
    @Body() updateDayDto: UpdateDayDto,
  ) {
    return this.weeksService.updateDay(req.user.id, dayId, updateDayDto);
  }
}
