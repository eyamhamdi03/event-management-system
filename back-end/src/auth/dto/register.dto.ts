import { IsDate, IsEmail, IsNumber, IsString, IsStrongPassword, IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '../roles.enum';

export class RegisterDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsNumber()
  phone: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  birthDate: Date;

  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  @IsIn(['organizer', 'participant', 'user', 'admin'])
  role?: string;
}
