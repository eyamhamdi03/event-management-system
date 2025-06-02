import React, { useState } from 'react'
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useNotifications, type Notification } from '@/context/notification-context'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
    className?: string
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        isConnected
    } = useNotifications()

    const [isOpen, setIsOpen] = useState(false)

    const handleMarkAllAsRead = () => {
        markAllAsRead()
    }

    const handleClearAll = () => {
        clearAllNotifications()
        setIsOpen(false)
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id)
        }

        // Handle navigation based on notification data
        if (notification.data?.eventId) {
            // Navigate to event details
            window.location.href = `/event/${notification.data.eventId}`
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "relative flex items-center space-x-2 hover:bg-gray-100",
                        className
                    )}
                >
                    <div className="relative">
                        <Bell className={cn(
                            "h-5 w-5 transition-colors",
                            isConnected ? "text-gray-700" : "text-gray-400"
                        )} />
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold min-w-[20px] animate-pulse"
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                        )}
                        {!isConnected && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </div>
                    <span className="hidden sm:inline text-sm">
                        Notifications
                    </span>
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-80 md:w-96 p-0"
                align="end"
                sideOffset={8}
            >
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {!isConnected && (
                                <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                    Disconnected
                                </Badge>
                            )}
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {unreadCount} new
                                </Badge>
                            )}
                        </div>
                    </div>

                    {notifications.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs h-7"
                                >
                                    <CheckCheck className="h-3 w-3 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearAll}
                                className="text-xs h-7 text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                <div className="max-h-96">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm font-medium mb-1">No notifications</p>
                            <p className="text-xs text-gray-400">
                                You're all caught up! New notifications will appear here.
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="p-2">
                                {notifications.map((notification, index) => (
                                    <div key={notification.id}>
                                        <NotificationItem
                                            notification={notification}
                                            onClick={() => handleNotificationClick(notification)}
                                            onRemove={() => removeNotification(notification.id)}
                                        />
                                        {index < notifications.length - 1 && (
                                            <Separator className="my-2" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

interface NotificationItemProps {
    notification: Notification
    onClick: () => void
    onRemove: () => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onClick,
    onRemove,
}) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'EVENT_REGISTRATION':
                return '✅'
            case 'EVENT_CANCELLATION':
                return '❌'
            case 'EVENT_CREATED':
                return '📅'
            case 'EVENT_UPDATED':
                return '📝'
            case 'EVENT_DAY':
                return '🔔'
            case 'EVENT_STARTED':
                return '🎬'
            case 'EVENT_ENDED':
                return '🏁'
            case 'EVENT_RESTORED':
                return '🔄'
            default:
                return '🔔'
        }
    }

    return (
        <div
            className={cn(
                "p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                !notification.read && "bg-blue-50 border-l-4 border-l-blue-500"
            )}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                <div className="text-lg flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    {notification.title && (
                        <h4 className={cn(
                            "font-medium text-sm mb-1 truncate",
                            !notification.read && "font-semibold"
                        )}>
                            {notification.title}
                        </h4>
                    )}
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove()
                    }}
                    className="flex-shrink-0 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove notification</span>
                </Button>
            </div>

            {!notification.read && (
                <div className="absolute top-2 left-2 w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
        </div>
    )
}
