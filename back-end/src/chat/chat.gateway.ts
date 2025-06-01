import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { AddReactionDto } from './dto/add-reaction.dto';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userFullName?: string;
}

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('ChatGateway');

    private typingUsers = new Map<string, Set<string>>();

    constructor(
        private chatService: ChatService,
        private jwtService: JwtService,
    ) { }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                this.logger.warn('Client attempted to connect without token');
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            client.userId = payload.sub;
            client.userFullName = payload.fullName;

            this.logger.log(`Client connected: ${client.userId} (${client.userFullName})`);
        } catch (error) {
            this.logger.warn('Client authentication failed');
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        if (client.userId) {
            for (const [eventId, typingSet] of this.typingUsers.entries()) {
                if (typingSet.has(client.userId)) {
                    typingSet.delete(client.userId);
                    this.broadcastTypingUpdate(eventId);
                }
            }
        }
        this.logger.log(`Client disconnected: ${client.userId}`);
    }

    @SubscribeMessage('joinEventRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { eventId: string },
    ) {
        try {
            const { eventId } = data;

            if (!client.userId) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            const isAllowed = await this.chatService.isUserAllowedInRoom(client.userId, eventId);

            if (!isAllowed) {
                client.emit('error', {
                    message: 'You are not authorized to join this event chat. You must be the host or a registered participant.'
                });
                return;
            }

            await client.join(`event_${eventId}`);

            client.to(`event_${eventId}`).emit('userJoined', {
                userId: client.userId,
                userFullName: client.userFullName,
                message: `${client.userFullName} joined the chat`,
            });

            client.emit('joinedRoom', { eventId, message: 'Successfully joined event chat' });
            this.logger.log(`User ${client.userId} joined room event_${eventId}`);
        } catch (error) {
            this.logger.error('Error joining room:', error);
            client.emit('error', { message: 'Failed to join room' });
        }
    }

    @SubscribeMessage('leaveEventRoom')
    async handleLeaveRoom(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { eventId: string },
    ) {
        const { eventId } = data;

        await client.leave(`event_${eventId}`);

        if (client.userId) {
            const typingSet = this.typingUsers.get(eventId);
            if (typingSet?.has(client.userId)) {
                typingSet.delete(client.userId);
                this.broadcastTypingUpdate(eventId);
            }
        }

        client.to(`event_${eventId}`).emit('userLeft', {
            userId: client.userId,
            userFullName: client.userFullName,
            message: `${client.userFullName} left the chat`,
        });

        this.logger.log(`User ${client.userId} left room event_${eventId}`);
    }

    @SubscribeMessage('startTyping')
    async handleStartTyping(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { eventId: string },
    ) {
        if (!client.userId) {
            client.emit('error', { message: 'Not authenticated' });
            return;
        }

        const { eventId } = data;

        if (!this.typingUsers.has(eventId)) {
            this.typingUsers.set(eventId, new Set());
        }

        const typingSet = this.typingUsers.get(eventId)!;
        const userId = client.userId;

        if (!typingSet.has(userId)) {
            typingSet.add(userId);
            this.broadcastTypingUpdate(eventId);
        }

        setTimeout(() => {
            if (typingSet.has(userId)) {
                typingSet.delete(userId);
                this.broadcastTypingUpdate(eventId);
            }
        }, 3000);
    }

    @SubscribeMessage('stopTyping')
    async handleStopTyping(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { eventId: string },
    ) {
        if (!client.userId) return;

        const { eventId } = data;
        const typingSet = this.typingUsers.get(eventId);

        if (typingSet?.has(client.userId)) {
            typingSet.delete(client.userId);
            this.broadcastTypingUpdate(eventId);
        }
    }

    private broadcastTypingUpdate(eventId: string) {
        const typingSet = this.typingUsers.get(eventId);
        const typingUserIds = typingSet ? Array.from(typingSet) : [];

        this.server.to(`event_${eventId}`).emit('typingUpdate', {
            eventId,
            typingUsers: typingUserIds,
        });
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() sendMessageDto: SendMessageDto,
    ) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            const typingSet = this.typingUsers.get(sendMessageDto.eventId);
            if (typingSet?.has(client.userId)) {
                typingSet.delete(client.userId);
                this.broadcastTypingUpdate(sendMessageDto.eventId);
            }

            const message = await this.chatService.sendMessage(client.userId, sendMessageDto);

            this.server.to(`event_${sendMessageDto.eventId}`).emit('newMessage', {
                id: message.id,
                content: message.content,
                user: {
                    id: message.user.id,
                    fullName: message.user.fullName,
                    avatar: message.user.avatar,
                },
                createdAt: message.createdAt,
                eventId: sendMessageDto.eventId,
                reactions: [],
            });

            this.logger.log(`Message sent by ${client.userId} to event ${sendMessageDto.eventId}`);
        } catch (error) {
            this.logger.error('Error sending message:', error);
            client.emit('error', {
                message: error.message || 'Failed to send message'
            });
        }
    }

    @SubscribeMessage('addReaction')
    async handleAddReaction(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() addReactionDto: AddReactionDto & { eventId: string },
    ) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            const reaction = await this.chatService.addReaction(client.userId, addReactionDto);

            // Broadcast reaction update to all clients in the event room
            this.server.to(`event_${addReactionDto.eventId}`).emit('reactionAdded', {
                messageId: addReactionDto.messageId,
                reaction: {
                    id: reaction.id,
                    emoji: reaction.emoji,
                    user: {
                        id: reaction.user.id,
                        fullName: reaction.user.fullName,
                    },
                    createdAt: reaction.createdAt,
                },
                eventId: addReactionDto.eventId,
            });

            this.logger.log(`Reaction added by ${client.userId} to message ${addReactionDto.messageId}`);
        } catch (error) {
            this.logger.error('Error adding reaction:', error);
            client.emit('error', {
                message: error.message || 'Failed to add reaction'
            });
        }
    }

    @SubscribeMessage('removeReaction')
    async handleRemoveReaction(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { messageId: string; eventId: string },
    ) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            await this.chatService.removeReaction(client.userId, data.messageId);

            // Broadcast reaction removal to all clients in the event room
            this.server.to(`event_${data.eventId}`).emit('reactionRemoved', {
                messageId: data.messageId,
                userId: client.userId,
                eventId: data.eventId,
            });

            this.logger.log(`Reaction removed by ${client.userId} from message ${data.messageId}`);
        } catch (error) {
            this.logger.error('Error removing reaction:', error);
            client.emit('error', {
                message: error.message || 'Failed to remove reaction'
            });
        }
    }

    @SubscribeMessage('getMessages')
    async handleGetMessages(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() getMessagesDto: GetMessagesDto,
    ) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            const isAllowed = await this.chatService.isUserAllowedInRoom(client.userId, getMessagesDto.eventId);

            if (!isAllowed) {
                client.emit('error', { message: 'Not authorized to view messages' });
                return;
            }

            const messages = await this.chatService.getMessages(getMessagesDto);

            client.emit('messagesHistory', {
                eventId: getMessagesDto.eventId,
                messages: messages.map(message => ({
                    id: message.id,
                    content: message.content,
                    user: {
                        id: message.user.id,
                        fullName: message.user.fullName,
                        avatar: message.user.avatar,
                    },
                    createdAt: message.createdAt,
                    reactions: message.reactions?.map(reaction => ({
                        id: reaction.id,
                        emoji: reaction.emoji,
                        user: {
                            id: reaction.user.id,
                            fullName: reaction.user.fullName,
                        },
                        createdAt: reaction.createdAt,
                    })) || [],
                })),
            });
        } catch (error) {
            this.logger.error('Error getting messages:', error);
            client.emit('error', { message: 'Failed to get messages' });
        }
    }

    @SubscribeMessage('deleteMessage')
    async handleDeleteMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { messageId: string; eventId: string },
    ) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Not authenticated' });
                return;
            }

            await this.chatService.deleteMessage(client.userId, data.messageId);

            this.server.to(`event_${data.eventId}`).emit('messageDeleted', {
                messageId: data.messageId,
                eventId: data.eventId,
            });

            this.logger.log(`Message ${data.messageId} deleted by ${client.userId}`);
        } catch (error) {
            this.logger.error('Error deleting message:', error);
            client.emit('error', { message: error.message || 'Failed to delete message' });
        }
    }
}