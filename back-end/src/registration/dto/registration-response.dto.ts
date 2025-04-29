import { Expose, Type } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;
}

export class EventDto {
  @Expose()
  id: string;
  @Expose()
  title: string;
}

export class RegistrationResponseDto {
  @Expose()
  id: string;

  @Expose()
  confirmed: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  eventId: string;

  @Expose()
  @Type(() => UserDto) 
  user: UserDto;

  @Expose()
  @Type(() => EventDto) 
  event: EventDto;
}