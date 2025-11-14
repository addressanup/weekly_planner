import { PrismaService } from '../prisma/prisma.service';
import { CreateWeekDto, UpdateWeekDto, UpdateDayDto, WeekResponseDto, DayResponseDto, WeekWithStatsDto } from './dto';
export declare class WeeksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createWeekDto: CreateWeekDto): Promise<WeekResponseDto>;
    findAll(userId: string): Promise<WeekResponseDto[]>;
    findCurrent(userId: string): Promise<WeekResponseDto | null>;
    findOne(userId: string, weekId: string): Promise<WeekResponseDto>;
    findOneWithStats(userId: string, weekId: string): Promise<WeekWithStatsDto>;
    update(userId: string, weekId: string, updateWeekDto: UpdateWeekDto): Promise<WeekResponseDto>;
    remove(userId: string, weekId: string): Promise<void>;
    findDay(userId: string, dayId: string): Promise<DayResponseDto>;
    updateDay(userId: string, dayId: string, updateDayDto: UpdateDayDto): Promise<DayResponseDto>;
    private generateDays;
    findByDateRange(userId: string, startDate: string, endDate: string): Promise<WeekResponseDto[]>;
}
