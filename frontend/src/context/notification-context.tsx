import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useAuth } from './auth-context'

export enum NotificationType {
    EVENT_REGISTRATION = 'EVENT_REGISTRATION',
    EVENT_CANCELLATION = 'EVENT_CANCELLATION',
    EVENT_CREATED = 'EVENT_CREATED',
    EVENT_UPDATED = 'EVENT_UPDATED',
    SYSTEM_ALERT = 'SYSTEM_ALERT',
    EVENT_DAY = 'EVENT_DAY',
    EVENT_STARTED = 'EVENT_STARTED',
    EVENT_RESTORED = 'EVENT_RESTORED',
    EVENT_ENDED = 'EVENT_ENDED',
}

export interface Notification {
    id: string
    type: NotificationType
    title?: string
    message: string
    data?: any
    timestamp: number
    read: boolean
    persistent?: boolean // Some notifications should persist until manually dismissed
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    removeNotification: (id: string) => void
    clearAllNotifications: () => void
    isConnected: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
    children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { token, isAuthenticated } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const idCounter = useRef(0)
    const eventSourceRef = useRef<EventSource | null>(null)

    // Create notification with auto-generated ID and timestamp
    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notif_${idCounter.current++}_${Date.now()}`,
            timestamp: Date.now(),
            read: false,
        }

        setNotifications(prev => [newNotification, ...prev])

        // Auto-remove non-persistent notifications after 10 seconds
        if (!notification.persistent) {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
            }, 10000)
        }
    }

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        )
    }

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id))
    }

    const clearAllNotifications = () => {
        setNotifications([])
    }

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length

    // Setup SSE connection
    useEffect(() => {
        if (!token || !isAuthenticated) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
                eventSourceRef.current = null
            }
            setIsConnected(false)
            return
        } const eventSource = new EventSourcePolyfill(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/sse/notifications`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                },
                heartbeatTimeout: 50000,
            },
        )

        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
            console.log('SSE connection opened')
            setIsConnected(true)
        }

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                console.log('Received notification:', data)

                // Create notification from backend data
                const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
                    type: data.type || NotificationType.SYSTEM_ALERT,
                    title: getNotificationTitle(data.type),
                    message: data.message || 'New notification',
                    data: data.data,
                    persistent: isPersistentNotification(data.type),
                }

                addNotification(notification)
            } catch (error) {
                console.error('Failed to parse notification:', error)
                // Fallback notification
                addNotification({
                    type: NotificationType.SYSTEM_ALERT,
                    title: 'System Notification',
                    message: 'New notification received',
                    persistent: false,
                })
            }
        }

        eventSource.onerror = (err) => {
            console.error('SSE error:', err)
            setIsConnected(false)
        }

        return () => {
            eventSource.close()
            eventSourceRef.current = null
            setIsConnected(false)
        }
    }, [token, isAuthenticated])

    // Helper function to get notification title based on type
    const getNotificationTitle = (type: NotificationType): string => {
        switch (type) {
            case NotificationType.EVENT_REGISTRATION:
                return 'Registration Confirmed'
            case NotificationType.EVENT_CANCELLATION:
                return 'Event Cancelled'
            case NotificationType.EVENT_CREATED:
                return 'New Event Created'
            case NotificationType.EVENT_UPDATED:
                return 'Event Updated'
            case NotificationType.EVENT_DAY:
                return 'Event Today'
            case NotificationType.EVENT_STARTED:
                return 'Event Started'
            case NotificationType.EVENT_ENDED:
                return 'Event Ended'
            case NotificationType.EVENT_RESTORED:
                return 'Event Restored'
            case NotificationType.SYSTEM_ALERT:
                return 'System Alert'
            default:
                return 'Notification'
        }
    }

    // Helper function to determine if notification should persist
    const isPersistentNotification = (type: NotificationType): boolean => {
        return [
            NotificationType.EVENT_CANCELLATION,
            NotificationType.EVENT_UPDATED,
            NotificationType.SYSTEM_ALERT,
        ].includes(type)
    }

    const contextValue: NotificationContextType = {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        isConnected,
    }

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
