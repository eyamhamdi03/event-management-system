import { io, Socket } from 'socket.io-client';

interface User {
    id: string;
    fullName: string;
    avatar?: string;
}

interface Message {
    id: string;
    content: string;
    user: User;
    createdAt: string;
    reactions: MessageReaction[];
}

interface MessageReaction {
    id: string;
    emoji: string;
    user: User;
    createdAt: string;
}

interface ChatEvents {
    newMessage: (message: Message) => void;
    messagesHistory: (data: { eventId: string; messages: Message[] }) => void;
    userJoined: (data: { userId: string; userFullName: string; message: string }) => void;
    userLeft: (data: { userId: string; userFullName: string; message: string }) => void;
    typingUpdate: (data: { eventId: string; typingUsers: string[] }) => void;
    reactionAdded: (data: { messageId: string; reaction: MessageReaction; eventId: string }) => void;
    reactionRemoved: (data: { messageId: string; userId: string; eventId: string }) => void;
    messageDeleted: (data: { messageId: string; eventId: string }) => void;
    joinedRoom: (data: { eventId: string; message: string }) => void;
    error: (data: { message: string }) => void;
}

class ChatService {
    private socket: Socket | null = null;
    private eventListeners: Map<string, Function[]> = new Map();

    constructor() { }

    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.socket = io(`${import.meta.env.VITE_API_URL}/chat`, {
                    auth: {
                        token: token,
                    },
                    transports: ['websocket'],
                    upgrade: false,
                });

                this.socket.on('connect', () => {
                    console.log('Connected to chat server');
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
                    reject(error);
                });

                this.socket.on('error', (data) => {
                    console.error('Chat error:', data.message);
                    this.emit('error', data);
                });

                // Setup all event listeners
                this.setupEventListeners();
            } catch (error) {
                reject(error);
            }
        });
    }

    private setupEventListeners() {
        if (!this.socket) return;

        const events: (keyof ChatEvents)[] = [
            'newMessage',
            'messagesHistory',
            'userJoined',
            'userLeft',
            'typingUpdate',
            'reactionAdded',
            'reactionRemoved',
            'messageDeleted',
            'joinedRoom',
            'error'
        ];

        events.forEach(event => {
            this.socket!.on(event, (data) => {
                this.emit(event, data);
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.eventListeners.clear();
    }

    // Event management
    on<K extends keyof ChatEvents>(event: K, callback: ChatEvents[K]) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
    }

    off<K extends keyof ChatEvents>(event: K, callback: ChatEvents[K]) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    private emit<K extends keyof ChatEvents>(event: K, data: any) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    // Chat actions
    joinEventRoom(eventId: string) {
        if (!this.socket) {
            throw new Error('Not connected to chat server');
        }
        this.socket.emit('joinEventRoom', { eventId });
    }

    leaveEventRoom(eventId: string) {
        if (!this.socket) return;
        this.socket.emit('leaveEventRoom', { eventId });
    }

    sendMessage(content: string, eventId: string) {
        if (!this.socket) {
            throw new Error('Not connected to chat server');
        }
        this.socket.emit('sendMessage', { content, eventId });
    }

    startTyping(eventId: string) {
        if (!this.socket) return;
        this.socket.emit('startTyping', { eventId });
    }

    stopTyping(eventId: string) {
        if (!this.socket) return;
        this.socket.emit('stopTyping', { eventId });
    }

    getMessages(eventId: string, before?: string, limit?: number) {
        if (!this.socket) {
            throw new Error('Not connected to chat server');
        }
        this.socket.emit('getMessages', { eventId, before, limit });
    }

    addReaction(messageId: string, emoji: string, eventId: string) {
        if (!this.socket) {
            throw new Error('Not connected to chat server');
        }
        this.socket.emit('addReaction', { messageId, emoji, eventId });
    }

    removeReaction(messageId: string, eventId: string) {
        if (!this.socket) {
            throw new Error('Not connected to chat server');
        }
        this.socket.emit('removeReaction', { messageId, eventId });
    }

    deleteMessage(messageId: string, eventId: string) {
        if (!this.socket) {
            throw new Error('Not connected to chat server');
        }
        this.socket.emit('deleteMessage', { messageId, eventId });
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

// Export singleton instance
export const chatService = new ChatService();
export type { Message, MessageReaction, User, ChatEvents };
