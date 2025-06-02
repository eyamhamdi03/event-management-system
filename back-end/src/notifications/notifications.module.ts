import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import NotificationsController from './notifications.controller';
import NotificationsService from './notifications.service';
import { NotificationScheduler } from './notifications.scheduler';
import { EventModule } from 'src/event/event.module';
import { RegistrationModule } from 'src/registration/registration.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    forwardRef(() => EventModule),
    RegistrationModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationScheduler, JwtService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
