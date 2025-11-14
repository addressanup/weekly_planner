import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDayDto {
  @IsDateString({}, { message: 'Date must be a valid date' })
  date: string;

  @IsString()
  weekId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Theme must be less than 100 characters' })
  theme?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Focus metric must be less than 200 characters' })
  focusMetric?: string;
}
