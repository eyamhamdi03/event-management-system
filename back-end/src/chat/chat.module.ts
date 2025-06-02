import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { User } from '../user/entities/user.entity';
import { Event } from '../event/entities/event.entity';
import { Registration } from '../registration/entities/registration.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, MessageReaction, User, Event, Registration]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
        }),
    ],
    providers: [ChatGateway, ChatService],
    exports: [ChatService],
})
export class ChatModule { }