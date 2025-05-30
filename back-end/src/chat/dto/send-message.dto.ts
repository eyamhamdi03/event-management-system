import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsUUID()
    eventId: string;
}