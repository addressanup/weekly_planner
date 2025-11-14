import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWeekDto {
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Theme must be less than 100 characters' })
  theme?: string;
}
