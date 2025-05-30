import { IsOptional, IsUUID, IsDateString } from 'class-validator';

export class GetMessagesDto {
    @IsUUID()
    eventId: string;

    @IsOptional()
    @IsDateString()
    before?: string;

    @IsOptional()
    limit?: number = 50;
}