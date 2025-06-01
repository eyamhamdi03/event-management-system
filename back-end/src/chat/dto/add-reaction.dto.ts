import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddReactionDto {
    @IsNotEmpty()
    @IsUUID()
    messageId: string;

    @IsNotEmpty()
    @IsString()
    emoji: string;
}