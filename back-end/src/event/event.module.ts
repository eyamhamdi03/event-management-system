import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Category } from '../category/entities/category.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MailService } from '../mail/mail.service';
import { AuthModule } from 'src/auth/auth.module';
import { RegistrationModule } from '../registration/registration.module';

import { NotificationsModule } from 'src/notifications/notifications.module';
import { User } from 'src/user/entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User, Category, User]),
    AuthModule,
    RegistrationModule,
    NotificationsModule,
  ],
  controllers: [EventController],
  providers: [EventService, MailService],
  exports: [EventService],
})
export class EventModule {}
