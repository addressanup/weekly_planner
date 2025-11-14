import { CreateDayDto } from './create-day.dto';
declare const UpdateDayDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateDayDto, "weekId">>>;
export declare class UpdateDayDto extends UpdateDayDto_base {
}
export {};
