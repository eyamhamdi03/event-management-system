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
import * as dotenv from 'dotenv';
import { Category } from './category/entities/category.entity';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from './graphql/graphql.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Event, Registration, Category],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    EventModule,
    CategoryModule,
    RegistrationModule,
    ThrottlerModule.forRoot([{
      ttl: 60, // 1 minute
      limit: 10, // Max 10 requests per minute
    }]),
    GraphQLModule,
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