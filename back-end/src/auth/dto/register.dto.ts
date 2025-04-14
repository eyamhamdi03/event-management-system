import { IsDate, IsEmail, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsNumber()
  phone: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  birthDate: Date;
}
