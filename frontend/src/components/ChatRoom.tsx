import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
    Send,
    Users,
    AlertCircle,
    Loader2,
    Smile,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { type Message } from '../services/chatService';
import { ScrollArea } from './ui/scroll-area';

interface ChatRoomProps {
    eventId: string;
    token: string;
    currentUserId: string;
    onClose: () => void;
}

interface MessageItemProps {
    message: Message;
    currentUserId: string;
    onAddReaction: (messageId: string, emoji: string) => void;
    onRemoveReaction: (messageId: string) => void;
    onDeleteMessage: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
    message,
    currentUserId,
    onAddReaction,
    onRemoveReaction,
    onDeleteMessage,
}) => {
    const [showActions, setShowActions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const isOwnMessage = message.user.id === currentUserId;
    const hasUserReacted = message.reactions.some(r => r.user.id === currentUserId);

    const commonEmojis = ['👍', '❤️', '😄', '😮', '😢', '😡', '🎉', '🔥'];

    const handleEmojiClick = (emoji: string) => {
        if (hasUserReacted) {
            onRemoveReaction(message.id);
        } else {
            onAddReaction(message.id, emoji);
        }
        setShowEmojiPicker(false);
    };

    return (
        <div
            className={`group flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-6`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className={`max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                {/* User info and timestamp */}
                <div className={`flex items-center gap-2 mb-2 px-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isOwnMessage && (
                        <>
                            <div className="relative">
                                {message.user.avatar ? (
                                    <img
                                        src={message.user.avatar}
                                        alt={message.user.fullName}
                                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                                        {message.user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                                {message.user.fullName}
                            </span>
                        </>
                    )}
                    <span className="text-xs text-gray-400 font-medium">
                        {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                </div>

                {/* Message bubble */}
                <div className="relative">
                    <div
                        className={`
                            p-4 rounded-2xl shadow-sm relative transition-all duration-200 ease-in-out
                            ${isOwnMessage
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200'
                                : 'bg-white border border-gray-100 text-gray-800 shadow-gray-100'
                            }
                            ${showActions ? 'shadow-md' : ''}
                        `}
                    >
                        {/* Message tail */}
                        <div
                            className={`
                                absolute top-3 w-3 h-3 transform rotate-45
                                ${isOwnMessage
                                    ? 'bg-blue-500 -right-1.5'
                                    : 'bg-white border-l border-t border-gray-100 -left-1.5'
                                }
                            `}
                        ></div>

                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    </div>
                </div>

                {/* Reactions */}
                {message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 px-1">
                        {message.reactions.map((reaction) => (
                            <Badge
                                key={reaction.id}
                                variant="secondary"
                                className={`
                                    text-xs cursor-pointer transition-all duration-150 hover:scale-105
                                    ${hasUserReacted
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                                onClick={() => handleEmojiClick(reaction.emoji)}
                            >
                                {reaction.emoji} {reaction.user.fullName}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Message Actions */}
                <div className={`
                    flex gap-1 mt-2 px-1 transition-all duration-200
                    ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
                `}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-150"
                    >
                        <Smile className="h-4 w-4" />
                    </Button>

                    {isOwnMessage && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteMessage(message.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-150"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Enhanced Emoji Picker */}
                {showEmojiPicker && (
                    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm">
                        <div className="text-xs text-gray-500 mb-2 font-medium">React with:</div>
                        <div className="flex gap-1">
                            {commonEmojis.map((emoji) => (
                                <Button
                                    key={emoji}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="h-8 w-8 p-0 text-lg hover:bg-gray-100 hover:scale-110 transition-all duration-150"
                                >
                                    {emoji}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ChatRoom: React.FC<ChatRoomProps> = ({
    eventId,
    token,
    currentUserId,
    onClose,
}) => {
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
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
        onlineUsers,
    } = useChat({ eventId, token });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Join room on mount
    useEffect(() => {
        joinRoom();
        return () => leaveRoom();
    }, [joinRoom, leaveRoom]);

    // Handle input changes for typing indicators
    useEffect(() => {
        if (messageInput && !isTyping) {
            setIsTyping(true);
            startTyping();
        } else if (!messageInput && isTyping) {
            setIsTyping(false);
            stopTyping();
        }
    }, [messageInput, isTyping, startTyping, stopTyping]);

    const handleSendMessage = () => {
        if (messageInput.trim() && isConnected) {
            sendMessage(messageInput.trim());
            setMessageInput('');
            setIsTyping(false);
            stopTyping();
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }; if (isConnecting) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-center">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                        <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mx-auto animate-ping opacity-20"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Connexion au chat en cours...</p>
                    <p className="text-gray-400 text-sm mt-1">Veuillez patienter</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mx-auto flex items-center justify-center mb-6">
                        <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-red-600 mb-4 font-medium">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                    >
                        Réessayer
                    </Button>
                </div>
            </div>
        );
    } return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Chat de l'événement</h3>
                            <div className="flex items-center gap-2">
                                {isConnected ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                        Connecté
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-xs">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                        Déconnecté
                                    </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                    {onlineUsers.length} participant{onlineUsers.length !== 1 ? 's' : ''} en ligne
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="px-6 py-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto flex items-center justify-center mb-4">
                                    <Users className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium mb-2">Aucun message pour le moment</p>
                                <p className="text-gray-400 text-sm">Soyez le premier à démarrer la conversation !</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {messages.map((message) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                        currentUserId={currentUserId}
                                        onAddReaction={addReaction}
                                        onRemoveReaction={removeReaction}
                                        onDeleteMessage={deleteMessage}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Enhanced Typing Indicators */}
                        {typingUsers.length > 0 && (
                            <div className="flex items-center gap-2 ml-4 mb-4">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                                <span className="text-sm text-gray-500 italic">
                                    {typingUsers.length === 1
                                        ? 'Quelqu\'un est en train d\'écrire...'
                                        : `${typingUsers.length} personnes écrivent...`
                                    }
                                </span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Enhanced Message Input */}
            <div className="bg-white border-t border-gray-100 px-6 py-4">
                <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Tapez votre message..."
                            disabled={!isConnected}
                            className="pr-12 min-h-[44px] rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-150"
                        />
                        {messageInput && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={handleSendMessage}
                        disabled={!isConnected || !messageInput.trim()}
                        className="h-11 w-11 p-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-150 shadow-md hover:shadow-lg"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
                {!isConnected && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                        Connexion perdue - Tentative de reconnexion...
                    </p>
                )}
            </div>
        </div>
    );
};
