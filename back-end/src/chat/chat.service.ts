import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { User } from '../user/entities/user.entity';
import { Event } from '../event/entities/event.entity';
import { Registration } from '../registration/entities/registration.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { Role } from '../auth/roles.enum';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(MessageReaction)
        private messageReactionRepository: Repository<MessageReaction>,
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @InjectRepository(Registration)
        private registrationRepository: Repository<Registration>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async sendMessage(userId: string, sendMessageDto: SendMessageDto): Promise<Message> {
        const { content, eventId } = sendMessageDto;

        await this.validateUserPermission(userId, eventId);

        const user = await this.userRepository.findOne({ where: { id: userId } });
        const event = await this.eventRepository.findOne({ where: { id: eventId } });

        if (!user || !event) {
            throw new NotFoundException('User or Event not found');
        }

        const message = this.messageRepository.create({
            content,
            user,
            event,
        });

        return await this.messageRepository.save(message);
    }

    async getMessages(getMessagesDto: GetMessagesDto): Promise<Message[]> {
        const { eventId, before, limit = 50 } = getMessagesDto;

        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.user', 'user')
            .leftJoinAndSelect('message.reactions', 'reactions')
            .leftJoinAndSelect('reactions.user', 'reactionUser')
            .where('message.eventId = :eventId', { eventId })
            .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
            .orderBy('message.createdAt', 'DESC')
            .limit(limit);

        if (before) {
            queryBuilder.andWhere('message.createdAt < :before', { before });
        }

        const messages = await queryBuilder.getMany();
        return messages.reverse();
    }

    async addReaction(userId: string, addReactionDto: AddReactionDto): Promise<MessageReaction> {
        const { messageId, emoji } = addReactionDto;

        const message = await this.messageRepository.findOne({
            where: { id: messageId },
            relations: ['event', 'reactions'],
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        await this.validateUserPermission(userId, message.event.id);

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        let existingReaction = await this.messageReactionRepository.findOne({
            where: {
                message: { id: messageId },
                user: { id: userId },
            },
        });

        if (existingReaction) {
            existingReaction.emoji = emoji;
            return await this.messageReactionRepository.save(existingReaction);
        } else {
            const reaction = this.messageReactionRepository.create({
                emoji,
                user,
                message,
            });
            return await this.messageReactionRepository.save(reaction);
        }
    }

    async removeReaction(userId: string, messageId: string): Promise<void> {
        const reaction = await this.messageReactionRepository.findOne({
            where: {
                message: { id: messageId },
                user: { id: userId },
            },
        });

        if (!reaction) {
            throw new NotFoundException('Reaction not found');
        }

        await this.messageReactionRepository.remove(reaction);
    }

    async deleteMessage(userId: string, messageId: string): Promise<void> {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
            relations: ['user', 'event'],
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (
            message.user.id !== userId &&
            message.event.host.id !== userId &&
            user?.role !== Role.Admin
        ) {
            throw new ForbiddenException('You can only delete your own messages');
        }

        message.isDeleted = true;
        await this.messageRepository.save(message);
    }

    async validateUserPermission(userId: string, eventId: string): Promise<void> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['host'],
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        if (event.host.id === userId) {
            return;
        }

        const registration = await this.registrationRepository.findOne({
            where: {
                user: { id: userId },
                event: { id: eventId },
                confirmed: true,
            },
        });

        if (!registration) {
            throw new ForbiddenException('You must be registered for this event to participate in chat');
        }
    }

    async isUserAllowedInRoom(userId: string, eventId: string): Promise<boolean> {
        try {
            await this.validateUserPermission(userId, eventId);
            return true;
        } catch {
            return false;
        }
    }
}