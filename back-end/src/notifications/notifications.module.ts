import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import NotificationsController from './notifications.controller';
import NotificationsService from './notifications.service';
import { NotificationScheduler } from './notifications.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [NotificationsController],
  providers: [NotificationsService,NotificationScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}
