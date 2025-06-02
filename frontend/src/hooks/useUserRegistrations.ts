import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

export interface UserRegistration {
    id: string
    confirmed: boolean
    createdAt: string
    eventId: string
    checkedIn: boolean
    user: {
        id: string
        fullName: string
        email: string
    }
    event: {
        id: string
        title: string
        description: string
        eventDate: string
        location: string
        category: {
            id: string
            name: string
        }
        host: {
            id: string
            fullName: string
            email: string
        }
    }
}

export const useUserRegistrations = () => {
    const { token, isAuthenticated } = useAuth()

    return useQuery<UserRegistration[]>({
        queryKey: ['user-registrations'],
        queryFn: () => api<UserRegistration[]>('/registration/user/me', 'GET', undefined, token),
        enabled: !!token && isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
