import { IsString, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL for avatar' })
  avatarUrl?: string;
}
