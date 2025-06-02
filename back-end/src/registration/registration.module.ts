import { Module, forwardRef } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/user/entities/user.entity';
import { Event } from 'src/event/entities/event.entity';
import { QrCodeModule } from 'src/qrcode/qrcode.module';
import { MailModule } from '../mail/mail.module';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Registration, User, Event]), AuthModule, MailModule, QrCodeModule, TicketModule],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService, TypeOrmModule],
})
export class RegistrationModule { }
