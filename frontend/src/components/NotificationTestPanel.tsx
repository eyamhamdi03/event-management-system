import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNotifications, NotificationType } from '@/context/notification-context'
import { useAuth } from '@/context/auth-context'

export function NotificationTestPanel() {
    const { addNotification, isConnected, unreadCount } = useNotifications()
    const { isAuthenticated } = useAuth()

    // Only show in development
    if (import.meta.env.PROD || !isAuthenticated) {
        return null
    }

    const testNotifications = [
        {
            type: NotificationType.EVENT_CREATED,
            title: 'Test Event Created',
            message: 'A new test event has been created successfully.',
            persistent: false,
        },
        {
            type: NotificationType.EVENT_REGISTRATION,
            title: 'Test Registration',
            message: 'You have successfully registered for the test event.',
            persistent: false,
        },
        {
            type: NotificationType.EVENT_CANCELLATION,
            title: 'Test Cancellation',
            message: 'Unfortunately, the test event has been cancelled.',
            persistent: true,
        },
        {
            type: NotificationType.EVENT_DAY,
            title: 'Event Today',
            message: 'Your test event is happening today!',
            persistent: false,
        },
        {
            type: NotificationType.SYSTEM_ALERT,
            title: 'System Alert',
            message: 'This is a test system alert notification.',
            persistent: true,
        },
    ]

    const triggerNotification = (notification: any) => {
        addNotification(notification)
    }

    return (
        <Card className="mt-4 border-blue-200 bg-blue-50">
            <CardHeader>
                <CardTitle className="text-sm text-blue-800">
                    Notification Test Panel
                    <Badge variant="outline" className="ml-2 text-xs">DEV ONLY</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>SSE Connection: {isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        Unread: {unreadCount}
                    </Badge>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-blue-600 font-medium">
                        Test different notification types:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {testNotifications.map((notif, index) => (
                            <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                onClick={() => triggerNotification(notif)}
                                className="text-xs h-8 justify-start"
                            >
                                {notif.title}
                            </Button>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-blue-500 mt-2">
                    <strong>Note:</strong> These are frontend test notifications. For real SSE testing, trigger events through the backend.
                </p>
            </CardContent>
        </Card>
    )
}
