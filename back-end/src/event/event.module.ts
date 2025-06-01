import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MailService } from '../mail/mail.service';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RegistrationModule } from '../registration/registration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User, Category]),
    AuthModule,
    RegistrationModule,
  ],
  controllers: [EventController],
  providers: [EventService, MailService],
  exports: [EventService],
})
export class EventModule {}
