import { IsEmail, IsNotEmpty, IsString, IsDate, IsPhoneNumber, IsOptional, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../auth/roles.enum';
import{SocialProvider} from '../../auth/socialProviders.enum'


export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  phone?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

  @IsOptional()
  @IsIn(Object.values(Role))
  role?: Role;

  @IsOptional()
  @IsString()
  salt?: string;

  @IsOptional()
  emailVerified?: boolean;

  @IsOptional()
  @IsIn(Object.values(SocialProvider))
  provider?: SocialProvider;

  @IsOptional()
  @IsString()
  avatar?: string;
}