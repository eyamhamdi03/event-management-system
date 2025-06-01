import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  eventDate: Date;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  hostId: string;

  @IsOptional()
  @IsBoolean()
  validated?: boolean;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsInt()
  @Min(1)
  participantLimit: number;
}
