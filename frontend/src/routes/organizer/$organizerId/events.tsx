import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { fetchEventsByOrganizer, createEvent, deleteEvent, fetchCategories } from '@/api'
import EventCard from '@/components/events/EventCard'
import EventForm from '@/components/events/EventForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Calendar, Plus, X } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/auth-context'

export const Route = createFileRoute('/organizer/$organizerId/events')({
  component: OrganizerEventsPage,
})

function OrganizerEventsPage() {
  const { organizerId } = useParams({ strict: false }) as { organizerId: string }
  const { token } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [organizerName, setOrganizerName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    async function loadEvents() {
      setLoading(true)
      try {
        const result = await fetchEventsByOrganizer(organizerId, token || undefined)
        const eventsRaw = Array.isArray(result?.data) ? result.data : []
        setEvents(eventsRaw)
        const organizer = eventsRaw.length > 0 ? eventsRaw[0].host?.fullName || '' : ''
        setOrganizerName(organizer)
      } catch (e) {
        console.error('Erreur fetch:', e)
        setEvents([])
        setOrganizerName('')
      } finally {
        setLoading(false)
      }

    }
    async function loadCategories() {
      try {
        const cats = await fetchCategories(token || undefined)
        setCategories(cats)
      } catch (e) {
        console.error('Erreur fetch catégories:', e)
        setCategories([])
      }
    }

    if (organizerId) {
      loadEvents()
      loadCategories()
    }
  }, [organizerId])

  const handleAdd = async (eventData: any) => {
    await createEvent({ ...eventData, organizerId }, token || undefined)
    const result = await fetchEventsByOrganizer(organizerId, token || undefined)
    const eventsRaw = Array.isArray(result?.data) ? result.data : []
    setEvents(eventsRaw)
    const organizer = eventsRaw.length > 0 ? eventsRaw[0].host?.fullName || '' : ''
    setOrganizerName(organizer)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    await deleteEvent(id, token || undefined)
    const result = await fetchEventsByOrganizer(organizerId, token || undefined)
    const eventsRaw = Array.isArray(result?.data) ? result.data : []
    setEvents(eventsRaw)
    const organizer = eventsRaw.length > 0 ? eventsRaw[0].host?.fullName || '' : ''
    setOrganizerName(organizer)
  }


  if (!organizerId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-center text-red-500 p-6 bg-white rounded-lg shadow-md">
          Organisateur non trouvé.
        </p>
      </div>
    )
  }
  return (
    <ProtectedRoute requiredRole="organizer">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-white p-3 rounded-full shadow-md mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {loading ? (
                <Skeleton className="w-64 h-10 mx-auto" />
              ) : (
                <>
                  Événements de {organizerName || `l'organisateur ${organizerId}`}
                </>
              )}
            </h1>
            <p className="text-lg text-gray-600">
              Gérer et créer vos événements
            </p>
          </div>

          {/* Add Event Button */}
          <div className="flex justify-center mb-10">
            <Button
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all flex items-center gap-2"
              onClick={() => setShowForm((v) => !v)}
              aria-expanded={showForm}
              aria-controls="event-form"
            >
              {showForm ? (
                <>
                  <X className="h-5 w-5" />
                  Annuler
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Ajouter un événement
                </>
              )}
            </Button>
          </div>

          {/* Event Form */}
          {showForm && (
            <div
              id="event-form"
              className="mb-12 p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto border border-gray-100"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Plus className="h-6 w-6 text-blue-600" />
                Nouvel événement
              </h2>
              <EventForm
                organizerId={organizerId}
                onAdd={handleAdd}
                categories={categories}
              />          </div>
          )}

          {/* Events Grid */}
          <div className="mb-12">
            {loading ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={() => handleDelete(event.id)}
                  />
                ))}
              </div>
            )}        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}