import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/user/entities/user.entity';
import { Event } from 'src/event/entities/event.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Registration, User, Event]),AuthModule,],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}
