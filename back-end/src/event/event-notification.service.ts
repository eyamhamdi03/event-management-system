import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Event } from './entities/event.entity';
import { NotificationType } from '../notifications/dto/notification.dto';
import NotificationsService from '../notifications/notifications.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../auth/roles.enum';

@Injectable()
export class EventNotificationService {
  constructor(
    private readonly notifications: NotificationsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async notifyEventCreated(event: Event): Promise<void> {
    const users = await this.userRepository.find();
    for (const user of users) {
      this.notifications.sendToUser(user.id, {
        type: NotificationType.EVENT_CREATED,
        message: `A new event "${event.title}" has been created.`,
        data: { eventId: event.id },
      });
    }
  }

  async notifyEventUpdated(event: Event): Promise<void> {
    await this.notifyRegisteredUsers(
      event,
      NotificationType.EVENT_UPDATED,
      `The event "${event.title}" has been updated.`,
    );
  }

  async notifyEventCancelled(event: Event): Promise<void> {
    await this.notifyRegisteredUsers(
      event,
      NotificationType.EVENT_CANCELLATION,
      `The event "${event.title}" has been cancelled.`,
    );
  }

  async notifyEventRestored(event: Event): Promise<void> {
    await this.notifyRegisteredUsers(
      event,
      NotificationType.EVENT_RESTORED,
      `The event "${event.title}" has been rescheduled.`,
    );
  }

  private async notifyRegisteredUsers(
    event: Event,
    type: NotificationType,
    message: string,
  ): Promise<void> {
    const fullEvent = event.registrations?.length
      ? event
      : await this.eventRepository.findOne({
          where: { id: event.id },
          relations: ['registrations', 'registrations.user'],
        });

    if (!fullEvent || !fullEvent.registrations) return;

    const admins = await this.userRepository.find({
      where: { role: Role.Admin },
    });

    for (const admin of admins) {
      this.notifications.sendToUser(admin.id, {
        type,
        message,
        data: { eventId: event.id },
      });
    }

    for (const registration of fullEvent.registrations) {
      const user = registration.user;
      if (user) {
        this.notifications.sendToUser(user.id, {
          type,
          message,
          data: { eventId: event.id },
        });
      }
    }
  }
}
