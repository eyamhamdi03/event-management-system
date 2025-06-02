import React from 'react'
import { X, Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationType, type Notification } from '@/context/notification-context'
import { formatDistanceToNow } from 'date-fns'

interface NotificationToastProps {
    notification: Notification
    onClose: () => void
    onMarkAsRead?: () => void
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
    notification,
    onClose,
    onMarkAsRead,
}) => {
    const getIcon = () => {
        switch (notification.type) {
            case NotificationType.EVENT_REGISTRATION:
            case NotificationType.EVENT_RESTORED:
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case NotificationType.EVENT_CANCELLATION:
            case NotificationType.SYSTEM_ALERT:
                return <AlertTriangle className="h-5 w-5 text-red-600" />
            case NotificationType.EVENT_UPDATED:
            case NotificationType.EVENT_DAY:
            case NotificationType.EVENT_STARTED:
            case NotificationType.EVENT_ENDED:
                return <Info className="h-5 w-5 text-blue-600" />
            case NotificationType.EVENT_CREATED:
                return <Bell className="h-5 w-5 text-purple-600" />
            default:
                return <Bell className="h-5 w-5 text-gray-600" />
        }
    }

    const getColorClasses = () => {
        switch (notification.type) {
            case NotificationType.EVENT_REGISTRATION:
            case NotificationType.EVENT_RESTORED:
                return 'border-green-200 bg-green-50 text-green-800'
            case NotificationType.EVENT_CANCELLATION:
            case NotificationType.SYSTEM_ALERT:
                return 'border-red-200 bg-red-50 text-red-800'
            case NotificationType.EVENT_UPDATED:
            case NotificationType.EVENT_DAY:
            case NotificationType.EVENT_STARTED:
            case NotificationType.EVENT_ENDED:
                return 'border-blue-200 bg-blue-50 text-blue-800'
            case NotificationType.EVENT_CREATED:
                return 'border-purple-200 bg-purple-50 text-purple-800'
            default:
                return 'border-gray-200 bg-gray-50 text-gray-800'
        }
    }

    const handleClick = () => {
        if (!notification.read && onMarkAsRead) {
            onMarkAsRead()
        }
    }

    return (
        <div
            className={cn(
                "relative p-4 border rounded-lg shadow-lg transition-all duration-300 transform animate-in slide-in-from-right-full",
                "max-w-sm w-full cursor-pointer hover:shadow-xl",
                getColorClasses(),
                !notification.read && "ring-2 ring-blue-500 ring-opacity-50"
            )}
            onClick={handleClick}
            role="alert"
            aria-live="assertive"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    {notification.title && (
                        <h4 className="font-semibold text-sm mb-1 truncate">
                            {notification.title}
                        </h4>
                    )}
                    <p className="text-sm leading-relaxed">
                        {notification.message}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        onClose()
                    }}
                    className="flex-shrink-0 h-6 w-6 p-0 hover:bg-black/10"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close notification</span>
                </Button>
            </div>

            {!notification.read && (
                <div className="absolute top-2 left-2 w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
        </div>
    )
}

interface NotificationToastContainerProps {
    notifications: Notification[]
    onClose: (id: string) => void
    onMarkAsRead: (id: string) => void
    maxVisible?: number
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
    notifications,
    onClose,
    onMarkAsRead,
    maxVisible = 5,
}) => {
    // Show only the most recent notifications
    const visibleNotifications = notifications.slice(0, maxVisible)

    if (visibleNotifications.length === 0) {
        return null
    }

    return (
        <div
            className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
            aria-label="Notifications"
        >
            {visibleNotifications.map((notification) => (
                <div key={notification.id} className="pointer-events-auto">
                    <NotificationToast
                        notification={notification}
                        onClose={() => onClose(notification.id)}
                        onMarkAsRead={() => onMarkAsRead(notification.id)}
                    />
                </div>
            ))}

            {notifications.length > maxVisible && (
                <div className="pointer-events-auto text-center">
                    <div className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-600">
                        + {notifications.length - maxVisible} more notifications
                    </div>
                </div>
            )}
        </div>
    )
}
