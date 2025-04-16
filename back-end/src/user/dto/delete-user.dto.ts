// user/dto/delete-user.dto.ts
import { IsUUID } from 'class-validator';

export class DeleteUserDto {
  @IsUUID()
  userId: string;
}