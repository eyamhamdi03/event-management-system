import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { EventService } from 'src/event/event.service';
import NotificationsService from './notifications.service';
import { NotificationDto, NotificationType } from './dto/notification.dto';
import { RegistrationService } from 'src/registration/registration.service';

@Injectable()
export class NotificationScheduler {
  private notified = new Set<string>();

  constructor(
    private readonly eventService: EventService,
    private readonly notifications: NotificationsService,
    private readonly registrationService: RegistrationService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async notifyParticipants() {
    const events = await this.eventService.getEvents();
    const now = dayjs();

    for (const event of events) {
      const eventId = event.id;
      const start = dayjs(event.eventDate);

      const key = (suffix: string) => `${eventId}-${suffix}`;

      if (now.isSame(start, 'day') && !this.notified.has(key('DAY'))) {
        await this.sendToParticipants(eventId, {
          type: NotificationType.EVENT_DAY,
          message: `L'événement "${event.title}" a lieu aujourd'hui.`,
        });
        this.notified.add(key('DAY'));
      }

      if (now.isSame(start, 'minute') && !this.notified.has(key('STARTED'))) {
        await this.sendToParticipants(eventId, {
          type: NotificationType.EVENT_STARTED,
          message: `L'événement "${event.title}" commence maintenant.`,
        });
        this.notified.add(key('STARTED'));
      }
    }
  }

  private async sendToParticipants(eventId: string, notif: NotificationDto) {
    const users =
      await this.registrationService.getRegistrationsForEvent(eventId);
    users.forEach((user) => {
      this.notifications.sendToUser(user.id, notif);
    });
  }
}
