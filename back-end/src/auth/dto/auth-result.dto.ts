import { UserResponseDto } from './user-response.dto';

export class AuthResultDto {
  access_token: string;
  refresh_token?: string;
  user: UserResponseDto;
}