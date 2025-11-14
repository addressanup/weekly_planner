import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, AssignTaskToSwimlaneDto } from './dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(req: any, createTaskDto: CreateTaskDto): Promise<import("./dto").TaskResponseDto>;
    findAll(req: any, dayId?: string, swimlaneId?: string, unassigned?: string): Promise<import("./dto").TaskResponseDto[]>;
    getStatistics(req: any): Promise<{
        total: number;
        completed: number;
        inProgress: number;
        planned: number;
        skipped: number;
        completionRate: number;
    }>;
    findOne(req: any, id: string): Promise<import("./dto").TaskResponseDto>;
    update(req: any, id: string, updateTaskDto: UpdateTaskDto): Promise<import("./dto").TaskResponseDto>;
    assignToSwimlane(req: any, id: string, assignDto: AssignTaskToSwimlaneDto): Promise<import("./dto").TaskResponseDto>;
    reorder(req: any, id: string, position: number): Promise<import("./dto").TaskResponseDto>;
    remove(req: any, id: string): Promise<void>;
}
