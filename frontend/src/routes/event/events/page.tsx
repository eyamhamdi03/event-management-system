import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useEventsWithFilter, useCategoriesGraphQL, type EventsFilter, type Event } from '@/hooks/useEventsGraphQL'
import EventCard from '@/components/events/EventCard'
import EventFilters from '@/components/events/EventFilters'
import EventPagination from '@/components/events/EventPagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw, Calendar, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/event/events/page')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<EventsFilter>({
    page: 1,
    limit: 12,
    sortBy: 'EVENT_DATE',
    sortOrder: 'ASC'
  })

  // GraphQL queries
  const {
    data: eventsResult,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents
  } = useEventsWithFilter(filter)

  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useCategoriesGraphQL()

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, page }))
  }

  const handlePageSizeChange = (limit: number) => {
    setFilter(prev => ({ ...prev, limit, page: 1 }))
  }
  // Handle event actions
  const handleViewEvent = (event: Event) => {
    console.log('View event:', event.id)
    navigate({ to: '/event/$eventId/page', params: { eventId: event.id } })
  }

  const handleRegisterForEvent = (event: Event) => {
    console.log('Register for event:', event.id)
    // Implement registration logic
  }

  // Loading skeleton
  const EventSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: filter.limit || 12 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-white p-3 rounded-full shadow-md mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Découvrir les Événements
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explorez et participez aux événements qui vous intéressent.
            Utilisez les filtres pour trouver exactement ce que vous cherchez.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <EventFilters
            filter={filter}
            onFilterChange={setFilter}
            categories={categories}
            isLoading={categoriesLoading}
          />
        </div>

        {/* Results Summary */}
        {eventsResult && !eventsLoading && (
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{eventsResult.total}</span> événement(s) trouvé(s)
              {filter.search && (
                <span> pour "{filter.search}"</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchEvents()}
              disabled={eventsLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${eventsLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        )}        {/* Error State */}
        {eventsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800">
                Erreur lors du chargement des événements.
                <Button
                  variant="link"
                  className="h-auto p-0 ml-2 underline text-red-600"
                  onClick={() => refetchEvents()}
                >
                  Réessayer
                </Button>
              </span>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {eventsLoading ? (
          <EventSkeleton />
        ) : eventsResult?.data?.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {eventsResult.data.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={handleViewEvent}
                  onRegister={handleRegisterForEvent}
                  showActions={true}
                />
              ))}
            </div>

            {/* Pagination */}
            <EventPagination
              currentPage={eventsResult.page}
              totalPages={eventsResult.totalPages}
              pageSize={eventsResult.limit}
              totalItems={eventsResult.total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isLoading={eventsLoading}
            />
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center bg-gray-100 p-6 rounded-full mb-6">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {filter.search || filter.category || filter.upcoming
                ? 'Essayez de modifier vos critères de recherche ou supprimez certains filtres.'
                : 'Il n\'y a actuellement aucun événement disponible.'}
            </p>
            {(filter.search || filter.category || filter.upcoming) && (
              <Button
                variant="outline"
                onClick={() => setFilter({
                  page: 1,
                  limit: 12,
                  sortBy: 'EVENT_DATE',
                  sortOrder: 'ASC'
                })}
              >
                Effacer tous les filtres
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
