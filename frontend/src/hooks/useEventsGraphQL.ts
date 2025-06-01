import { useQuery } from '@tanstack/react-query'
import { graphqlClient, setAuthToken } from '@/graphql/client'
import { GET_EVENTS_WITH_FILTER, GET_CATEGORIES, GET_EVENT_BY_ID } from '@/graphql/queries'
import { useAuth } from '@/context/auth-context'

export interface EventsFilter {
    search?: string
    category?: string
    date?: string
    startDate?: string
    endDate?: string
    hostId?: string
    upcoming?: boolean
    page?: number
    limit?: number
    sortBy?: 'TITLE' | 'EVENT_DATE' | 'LOCATION' | 'CREATED_AT' | 'PARTICIPANT_COUNT'
    sortOrder?: 'ASC' | 'DESC'
}

export interface Event {
    id: string
    title: string
    description: string
    eventDate: string
    location: string
    participantLimit?: number
    validated: boolean
    createdAt: string
    updatedAt: string
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
}

export interface EventsResult {
    data: Event[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface Category {
    id: string
    name: string
}

export const useEventsWithFilter = (filter: EventsFilter = {}) => {
    const { token } = useAuth()

    return useQuery<EventsResult>({
        queryKey: ['events', 'filtered', filter],
        queryFn: async () => {
            if (token) {
                setAuthToken(token)
            }

            const response = await graphqlClient.request<{ eventsWithFilter: EventsResult }>(
                GET_EVENTS_WITH_FILTER,
                { filter }
            )

            return response.eventsWithFilter
        },
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false,
    })
}

export const useCategoriesGraphQL = () => {
    const { token } = useAuth()

    return useQuery<Category[]>({
        queryKey: ['categories', 'graphql'],
        queryFn: async () => {
            if (token) {
                setAuthToken(token)
            }

            const response = await graphqlClient.request<{ categories: Category[] }>(
                GET_CATEGORIES
            )

            return response.categories
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useEventById = (eventId: string) => {
    const { token } = useAuth()

    return useQuery<Event>({
        queryKey: ['event', eventId, 'graphql'],
        queryFn: async () => {
            if (token) {
                setAuthToken(token)
            }

            const response = await graphqlClient.request<{ event: Event }>(
                GET_EVENT_BY_ID,
                { id: eventId }
            )

            return response.event
        },
        enabled: !!eventId, // Only run query if eventId is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}