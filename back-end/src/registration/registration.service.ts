import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Registration } from './entities/registration.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Event } from 'src/event/entities/event.entity';
import NotificationService from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/dto/notification.dto';

import {
  EventDto,
  RegistrationResponseDto,
  UserDto,
} from './dto/registration-response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    private readonly notifications: NotificationService,
  ) {}

  //get all registration
  async getRegistrations(): Promise<RegistrationResponseDto[]> {
    const registrations = await this.registrationRepo.find({
      relations: ['user', 'event'],
    });

    return registrations.map((registration) => {
      const dto = new RegistrationResponseDto();

      // Map main registration fields
      dto.id = registration.id;
      dto.confirmed = registration.confirmed;
      dto.createdAt = registration.createdAt;
      dto.eventId = registration.event.id;

      // Map user relation
      if (registration.user) {
        const userDto = new UserDto();
        userDto.id = registration.user.id;
        userDto.fullName = registration.user.fullName;
        userDto.email = registration.user.email;
        dto.user = userDto;
      }

      // Map event relation
      if (registration.event) {
        const eventDto = new EventDto();
        eventDto.title = registration.event.title;
        dto.event = eventDto;
      }

      return dto;
    });
  }

  //post registration
  async registerToEvent(eventId: string, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['host'],
    });

    if (!user || !event) {
      throw new NotFoundException('User or Event not found');
    }

    const existing = await this.registrationRepo.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
      },
    });

    if (existing) {
      throw new ConflictException('Already registered');
    }

    const registration = this.registrationRepo.create({
      user,
      event,
      confirmed: false,
    });
    const saved = await this.registrationRepo.save(registration);

    if (event.host?.id) {
      this.notifications.sendToUser(event.host.id, {
        type: NotificationType.EVENT_REGISTRATION,
        message: `${user.fullName} registered to ${event.title}`,
        data: { eventId: event.id, participantId: user.id },
      });
    }

    return saved;
  }

  // get resgistration by event id
  async getRegistrationsForEvent(
    eventId: string,
  ): Promise<RegistrationResponseDto[]> {
    const registrations = await this.registrationRepo.find({
      where: { event: { id: eventId } },
      relations: ['user', 'event'],
    });

    // Transform each registration and its relations
    return registrations.map((registration) => {
      return plainToInstance(
        RegistrationResponseDto,
        {
          ...registration,
          user: plainToInstance(UserDto, registration.user),
          event: plainToInstance(EventDto, registration.event),
        },
        {
          excludeExtraneousValues: true,
        },
      );
    });
  }

  async cancelRegistration(
    eventId: string,
    userId: string,
    currentUserRole: string,
    currentUserId: string,
  ) {
    // Find the registration
    const registration = await this.registrationRepo.findOne({
      where: {
        event: { id: eventId },
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (
      currentUserRole !== 'organizer' &&
      registration.user.id !== currentUserId
    ) {
      throw new ForbiddenException(
        'You can only cancel your own registrations',
      );
    }

    await this.registrationRepo.remove(registration);
  }
  //confirm registration (update)
  async confirmRegistration(id: string) {
    const registration = await this.registrationRepo.findOneBy({ id });
    if (!registration) throw new NotFoundException('Registration not found');
    registration.confirmed = true;
    return this.registrationRepo.save(registration);
  }
}
