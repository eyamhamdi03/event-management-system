import { User } from '../../user/entities/user.entity';
import { Role } from '../roles.enum';

export class UserResponseDto implements Partial<Pick<User, 
  'id' |
  'fullName' |
  'email' |
  'phone' |
  'birthDate' |
  'role' |
  'emailVerified' |
  'socialId' |
  'avatar' |
  'provider' |
  'createdAt' |
  'updatedAt'
>>{
  id: string;
  fullName: string;
  email: string;
  phone?: number;
  birthDate?: Date;
  role: Role;
  emailVerified: boolean;
  socialId?: string;
  avatar?: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}