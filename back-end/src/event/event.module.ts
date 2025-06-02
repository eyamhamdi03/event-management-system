import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Event } from './entities/event.entity';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { Registration } from '../registration/entities/registration.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RegistrationModule } from '../registration/registration.module';
import { MailModule } from '../mail/mail.module';
import { EventNotificationService } from './event-notification.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User, Category, Registration]),
    RegistrationModule,
    ConfigModule,
    AuthModule,
    NotificationsModule,
    forwardRef(() => RegistrationModule),
    MailModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventNotificationService],
  exports: [EventService, TypeOrmModule],
})
export class EventModule {}
