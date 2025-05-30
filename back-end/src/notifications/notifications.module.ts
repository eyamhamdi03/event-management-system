import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import NotificationsController from './notifications.controller';
import NotificationsService from './notifications.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
