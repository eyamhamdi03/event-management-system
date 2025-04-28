import { IsOptional, IsString, IsDateString, IsNumberString, IsBooleanString } from 'class-validator';

export class FilterEventsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumberString()
  hostId?: string;

  @IsOptional()
  @IsBooleanString()
  upcoming?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
