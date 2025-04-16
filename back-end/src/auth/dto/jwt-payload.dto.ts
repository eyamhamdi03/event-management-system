import { Role } from '../roles.enum';

export class JwtPayloadDto {
  sub: string;
  email: string;
  role: Role;
  fullName?: string;
}