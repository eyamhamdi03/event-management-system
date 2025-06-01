import { Calendar, Plus } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import EventCard from '@/components/events/EventCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { useDeleteEvent } from '@/hooks/useDeleteEvent'
import { useEffect } from 'react'

export default function MyEventsList() {
  const navigate = useNavigate()

  const { data: events = [], isLoading, refetch } = useEvents()
  const deleteEvent = useDeleteEvent()
useEffect(() => {
  if (events) {
    console.log('Frontend received events:', events)
  }
}, [events])

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id)
      await refetch()
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-white p-3 rounded-full shadow-md mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isLoading ? (
              <Skeleton className="w-64 h-10 mx-auto" />
            ) : (
              `Mes Événements`
            )}
          </h1>
          <p className="text-lg text-gray-600">Gérer et créer vos événements</p>
        </div>

        {/* Add Event Button */}
        <div className="flex justify-center mb-10">
          <Button
            className="py-3 bg-blue-600 hover:bg-blue-700 px-6"
            onClick={() => navigate({ to: '/event/add/page' })}
          >
            <Plus className="h-5 w-5" />
            Ajouter un événement
          </Button>
        </div>

        {/* Events Grid */}
        <div className="mb-12">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Aucun événement trouvé
              </h3>
              <p className="text-gray-500">
                Commencez par créer votre premier événement
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">              {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={(event) => handleDelete(event.id)}
              />
            ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
