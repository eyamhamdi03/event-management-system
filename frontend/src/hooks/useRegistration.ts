import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

export interface CreateRegistrationPayload {
    eventId: string
    userId: string
}

export interface Registration {
    id: string
    confirmed: boolean
    createdAt: string
    eventId: string
    user: {
        id: string
        fullName: string
        email: string
    }
    event: {
        id: string
        title: string
    }
}

export interface RegistrationResponse {
    registration: Registration
}

// Hook to register for an event
export const useRegisterForEvent = () => {
    const { token } = useAuth()
    const qc = useQueryClient()

    return useMutation<RegistrationResponse, Error, CreateRegistrationPayload>({
        mutationFn: (payload: CreateRegistrationPayload) =>
            api<RegistrationResponse>('/registration', 'POST', payload, token),
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            qc.invalidateQueries({ queryKey: ['events'] })
            qc.invalidateQueries({ queryKey: ['event', variables.eventId] })
            qc.invalidateQueries({ queryKey: ['user-registrations'] })
        },
    })
}

// Hook to cancel registration
export const useCancelRegistration = () => {
    const { token } = useAuth()
    const qc = useQueryClient()

    return useMutation<{ message: string }, Error, { eventId: string; userId: string }>({
        mutationFn: (payload: { eventId: string; userId: string }) =>
            api<{ message: string }>('/registration', 'DELETE', payload, token),
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            qc.invalidateQueries({ queryKey: ['events'] })
            qc.invalidateQueries({ queryKey: ['event', variables.eventId] })
            qc.invalidateQueries({ queryKey: ['user-registrations'] })
        },
    })
}

// Hook to get user's registrations (optional, for future use)
export const useUserRegistrations = () => {
    const { token, user } = useAuth()

    return useQuery<Registration[]>({
        queryKey: ['user-registrations', user?.sub],
        queryFn: () => api<Registration[]>('/registration/user', 'GET', undefined, token),
        enabled: !!token && !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Hook to check if user is registered for a specific event
export const useUserEventRegistration = (eventId: string, event?: any) => {
    const { user } = useAuth()

    return useQuery<Registration | null>({
        queryKey: ['user-registration', eventId, user?.sub, event?.registrations?.length],
        queryFn: async () => {
            if (!user || !event?.registrations) return null

            // Look for the current user in the event's registrations
            const userRegistration = event.registrations.find((reg: any) =>
                reg.user.id === user.sub && reg.confirmed
            )

            return userRegistration ? {
                id: userRegistration.id,
                confirmed: userRegistration.confirmed,
                createdAt: userRegistration.createdAt || new Date().toISOString(),
                eventId: eventId,
                user: userRegistration.user,
                event: { id: eventId, title: event.title }
            } : null
        },
        enabled: !!user && !!event && !!eventId,
        staleTime: 30 * 1000, // 30 seconds
    })
}
