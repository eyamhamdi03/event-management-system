import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, type Message, type MessageReaction, type ChatEvents } from '../services/chatService';

interface UseChatOptions {
    eventId: string;
    token: string;
}

interface UseChatReturn {
    messages: Message[];
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    sendMessage: (content: string) => void;
    addReaction: (messageId: string, emoji: string) => void;
    removeReaction: (messageId: string) => void;
    deleteMessage: (messageId: string) => void;
    startTyping: () => void;
    stopTyping: () => void;
    typingUsers: string[];
    joinRoom: () => Promise<void>;
    leaveRoom: () => void;
    loadMoreMessages: () => void;
    onlineUsers: string[];
}

export function useChat({ eventId, token }: UseChatOptions): UseChatReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

    const messagesRef = useRef<Message[]>([]);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update ref when messages change
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const handleNewMessage = useCallback((message: Message) => {
        setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === message.id)) {
                return prev;
            }
            return [...prev, message];
        });
    }, []);

    const handleMessagesHistory = useCallback((data: { eventId: string; messages: Message[] }) => {
        if (data.eventId === eventId) {
            setMessages(data.messages);
        }
    }, [eventId]);

    const handleUserJoined = useCallback((data: { userId: string; userFullName: string; message: string }) => {
        setOnlineUsers(prev => {
            if (!prev.includes(data.userId)) {
                return [...prev, data.userId];
            }
            return prev;
        });
    }, []);

    const handleUserLeft = useCallback((data: { userId: string; userFullName: string; message: string }) => {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    }, []);

    const handleTypingUpdate = useCallback((data: { eventId: string; typingUsers: string[] }) => {
        if (data.eventId === eventId) {
            setTypingUsers(data.typingUsers);
        }
    }, [eventId]);

    const handleReactionAdded = useCallback((data: { messageId: string; reaction: MessageReaction; eventId: string }) => {
        if (data.eventId === eventId) {
            setMessages(prev => prev.map(msg => {
                if (msg.id === data.messageId) {
                    const existingReactionIndex = msg.reactions.findIndex(r => r.user.id === data.reaction.user.id);
                    const newReactions = [...msg.reactions];

                    if (existingReactionIndex >= 0) {
                        newReactions[existingReactionIndex] = data.reaction;
                    } else {
                        newReactions.push(data.reaction);
                    }

                    return { ...msg, reactions: newReactions };
                }
                return msg;
            }));
        }
    }, [eventId]);

    const handleReactionRemoved = useCallback((data: { messageId: string; userId: string; eventId: string }) => {
        if (data.eventId === eventId) {
            setMessages(prev => prev.map(msg => {
                if (msg.id === data.messageId) {
                    return {
                        ...msg,
                        reactions: msg.reactions.filter(r => r.user.id !== data.userId)
                    };
                }
                return msg;
            }));
        }
    }, [eventId]);

    const handleMessageDeleted = useCallback((data: { messageId: string; eventId: string }) => {
        if (data.eventId === eventId) {
            setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
        }
    }, [eventId]);

    const handleJoinedRoom = useCallback((data: { eventId: string; message: string }) => {
        if (data.eventId === eventId) {
            setHasJoinedRoom(true);
            setError(null);
        }
    }, [eventId]);

    const handleError = useCallback((data: { message: string }) => {
        setError(data.message);
        setIsConnecting(false);
    }, []);

    const connect = useCallback(async () => {
        if (isConnected || isConnecting) return;

        setIsConnecting(true);
        setError(null);

        try {
            await chatService.connect(token);
            setIsConnected(true);
            setIsConnecting(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect to chat');
            setIsConnecting(false);
        }
    }, [token, isConnected, isConnecting]);

    const joinRoom = useCallback(async () => {
        if (!isConnected) {
            await connect();
        }

        if (isConnected && !hasJoinedRoom) {
            chatService.joinEventRoom(eventId);
            // Load initial messages
            chatService.getMessages(eventId);
        }
    }, [isConnected, hasJoinedRoom, eventId, connect]);

    const leaveRoom = useCallback(() => {
        if (isConnected && hasJoinedRoom) {
            chatService.leaveEventRoom(eventId);
            setHasJoinedRoom(false);
        }
    }, [isConnected, hasJoinedRoom, eventId]);

    const sendMessage = useCallback((content: string) => {
        if (isConnected && hasJoinedRoom) {
            chatService.sendMessage(content, eventId);
        }
    }, [isConnected, hasJoinedRoom, eventId]);

    const addReaction = useCallback((messageId: string, emoji: string) => {
        if (isConnected && hasJoinedRoom) {
            chatService.addReaction(messageId, emoji, eventId);
        }
    }, [isConnected, hasJoinedRoom, eventId]);

    const removeReaction = useCallback((messageId: string) => {
        if (isConnected && hasJoinedRoom) {
            chatService.removeReaction(messageId, eventId);
        }
    }, [isConnected, hasJoinedRoom, eventId]);

    const deleteMessage = useCallback((messageId: string) => {
        if (isConnected && hasJoinedRoom) {
            chatService.deleteMessage(messageId, eventId);
        }
    }, [isConnected, hasJoinedRoom, eventId]);

    const startTyping = useCallback(() => {
        if (isConnected && hasJoinedRoom) {
            chatService.startTyping(eventId);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Auto-stop typing after 3 seconds
            typingTimeoutRef.current = setTimeout(() => {
                chatService.stopTyping(eventId);
            }, 3000);
        }
    }, [isConnected, hasJoinedRoom, eventId]);

    const stopTyping = useCallback(() => {
        if (isConnected && hasJoinedRoom) {
            chatService.stopTyping(eventId);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    }, [isConnected, hasJoinedRoom, eventId]);

    const loadMoreMessages = useCallback(() => {
        if (isConnected && hasJoinedRoom && messages.length > 0) {
            const oldestMessage = messages[0];
            chatService.getMessages(eventId, oldestMessage.createdAt, 50);
        }
    }, [isConnected, hasJoinedRoom, eventId, messages]);

    // Setup event listeners
    useEffect(() => {
        const eventHandlers: Array<[keyof ChatEvents, Function]> = [
            ['newMessage', handleNewMessage],
            ['messagesHistory', handleMessagesHistory],
            ['userJoined', handleUserJoined],
            ['userLeft', handleUserLeft],
            ['typingUpdate', handleTypingUpdate],
            ['reactionAdded', handleReactionAdded],
            ['reactionRemoved', handleReactionRemoved],
            ['messageDeleted', handleMessageDeleted],
            ['joinedRoom', handleJoinedRoom],
            ['error', handleError],
        ];

        eventHandlers.forEach(([event, handler]) => {
            chatService.on(event, handler as any);
        });

        return () => {
            eventHandlers.forEach(([event, handler]) => {
                chatService.off(event, handler as any);
            });
        };
    }, [
        handleNewMessage,
        handleMessagesHistory,
        handleUserJoined,
        handleUserLeft,
        handleTypingUpdate,
        handleReactionAdded,
        handleReactionRemoved,
        handleMessageDeleted,
        handleJoinedRoom,
        handleError,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            leaveRoom();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [leaveRoom]);

    return {
        messages,
        isConnected,
        isConnecting,
        error,
        sendMessage,
        addReaction,
        removeReaction,
        deleteMessage,
        startTyping,
        stopTyping,
        typingUsers,
        joinRoom,
        leaveRoom,
        loadMoreMessages,
        onlineUsers,
    };
}
