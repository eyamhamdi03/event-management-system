/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateRegistrationDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  eventId: string;

  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;
}
