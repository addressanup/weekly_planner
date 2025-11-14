import { WeeksService } from './weeks.service';
import { CreateWeekDto, UpdateWeekDto, UpdateDayDto } from './dto';
export declare class WeeksController {
    private readonly weeksService;
    constructor(weeksService: WeeksService);
    create(req: any, createWeekDto: CreateWeekDto): Promise<import("./dto").WeekResponseDto>;
    findAll(req: any, startDate?: string, endDate?: string): Promise<import("./dto").WeekResponseDto[]>;
    findCurrent(req: any): Promise<import("./dto").WeekResponseDto | null>;
    findOne(req: any, id: string): Promise<import("./dto").WeekResponseDto>;
    findOneWithStats(req: any, id: string): Promise<import("./dto").WeekWithStatsDto>;
    update(req: any, id: string, updateWeekDto: UpdateWeekDto): Promise<import("./dto").WeekResponseDto>;
    remove(req: any, id: string): Promise<void>;
    findDay(req: any, dayId: string): Promise<import("./dto").DayResponseDto>;
    updateDay(req: any, dayId: string, updateDayDto: UpdateDayDto): Promise<import("./dto").DayResponseDto>;
}
