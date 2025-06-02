import { useEffect, useState } from 'react'

export function useSSE(url: string) {
  const [messages, setMessages] = useState<Array<string>>([])

  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data])
    }

    eventSource.onerror = (err) => {
      console.error('SSE error:', err)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [url])

  return messages
}
