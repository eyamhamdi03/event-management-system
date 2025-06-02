import React from 'react'
import { useNotifications } from '@/context/notification-context'
import { NotificationToastContainer } from './NotificationToast'

/**
 * NotificationManager - Handles displaying toast notifications
 * This component should be placed at the app root level
 */
export const NotificationManager: React.FC = () => {
    const {
        notifications,
        removeNotification,
        markAsRead,
    } = useNotifications()

    // Filter to only show unread notifications as toasts
    // and only show recent notifications (last 5 minutes)
    const toastNotifications = notifications.filter(notification => {
        const isRecent = Date.now() - notification.timestamp < 5 * 60 * 1000 // 5 minutes
        return !notification.read && isRecent
    })

    return (
        <NotificationToastContainer
            notifications={toastNotifications}
            onClose={removeNotification}
            onMarkAsRead={markAsRead}
            maxVisible={5}
        />
    )
}
