import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  fullName: string;

  @IsString()
  password: string;
}
