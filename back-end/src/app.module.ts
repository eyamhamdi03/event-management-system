import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { RegistrationModule } from './registration/registration.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { Event } from './event/entities/event.entity';
import { Registration } from './registration/entities/registration.entity';
import { CategoryModule } from './category/category.module';
import { ChatModule } from './chat/chat.module';
import { Message } from './chat/entities/message.entity';
import { MessageReaction } from './chat/entities/message-reaction.entity';
import * as dotenv from 'dotenv';
import { Category } from './category/entities/category.entity';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

dotenv.config();

@Module({
  imports: [

    AuthModule,
    UserModule,
    EventModule,
    CategoryModule,
    RegistrationModule,
    ChatModule, TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Event, Registration, Category, Message, MessageReaction],
      synchronize: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60, // 1 minute
      limit: 10, // Max 10 requests per minute
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }