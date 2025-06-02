'use client'

import { useEffect, useRef, useState } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useAuth } from '@/context/auth-context'

type Notification = {
  id: string
  title?: string
  message: string
  timestamp: number
}

export default function SSEListener() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<Array<Notification>>([])
  const idCounter = useRef(0)

  useEffect(() => {
    if (!token) return

    const eventSource = new EventSourcePolyfill(
      'http://localhost:3000/sse/notifications',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        heartbeatTimeout: 50000,
      },
    )

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const newNotification: Notification = {
          id: (idCounter.current++).toString(),
          title: data.title || 'New Notification',
          message: data.message || JSON.stringify(data),
          timestamp: Date.now(),
        }
        setNotifications((prev) => [newNotification, ...prev])
      } catch (error) {
        console.error('Failed to parse notification', error)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE error:', err)
    }

    return () => {
      eventSource.close()
    }
  }, [token])

  // Auto remove notifications after 5 seconds
  useEffect(() => {
    if (notifications.length === 0) return

    const timer = setTimeout(() => {
      setNotifications((prev) => prev.slice(0, prev.length - 1))
    }, 5000)

    return () => clearTimeout(timer)
  }, [notifications])

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: 320,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {notifications.map(({ id, title, message }) => (
        <div
          key={id}
          style={{
            backgroundColor: '#f5f5f5',
            color: 'blue',
            padding: '12px 16px',
            borderRadius: 8,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            animation: 'slideIn 0.3s ease forwards',
          }}
          onClick={() =>
            setNotifications((prev) => prev.filter((n) => n.id !== id))
          }
          role="alert"
          aria-live="assertive"
        >
          <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>
          <span>{message}</span>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {opacity: 0; transform: translateX(100%)}
          to {opacity: 1; transform: translateX(0)}
        }
      `}</style>
    </div>
  )
}
