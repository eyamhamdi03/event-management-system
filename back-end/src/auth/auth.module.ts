import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { RolesGuard } from './guards/roles.guard';
import {APP_GUARD} from "@nestjs/core"
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
dotenv.config();


@Module({
  imports: [
    MailModule,
    ConfigModule,
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),    
  ],


    providers: [
      AuthService,
      JwtStrategy,
      {
        provide: APP_GUARD,
        useClass: JwtAuthGuard, 
      },
      {
        provide: APP_GUARD,
        useClass: RolesGuard, 
      }
    ],

  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule], 

})
export class AuthModule {}


