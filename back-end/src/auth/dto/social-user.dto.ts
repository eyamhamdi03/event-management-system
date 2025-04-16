import { Role } from '../roles.enum';

export type SocialProvider = 'local' | 'google' | 'facebook';

export class SocialUserDto {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  provider: SocialProvider;
  accessToken?: string;
}