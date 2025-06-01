import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

export interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  location: string
  validated: boolean
  participantLimit?: number
  currentParticipants: number
  isFull: boolean
  isAvailable: boolean
  category: {
    id: string
    name: string
  }
  host: {
    id: string
    fullName?: string
    email: string
  }
  registrations: Array<{
    id: string
    confirmed: boolean
    user: {
      id: string
      fullName?: string
      email: string
    }
  }>
  createdAt: string
  updatedAt: string
}

export const useEvents = () => {
  const { token } = useAuth()
  return useQuery<Event[]>({
    queryKey: ['events', 'mine'],
    queryFn: () => api<Event[]>('/event/mine', 'GET', undefined, token),
    enabled: !!token,
    staleTime: 5 * 60 * 1_000,
  })
}
