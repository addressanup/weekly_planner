import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateDayDto } from './create-day.dto';

export class UpdateDayDto extends PartialType(
  OmitType(CreateDayDto, ['weekId'] as const),
) {}
