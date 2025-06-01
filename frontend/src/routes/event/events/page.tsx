import { createFileRoute } from '@tanstack/react-router'
import EventsList from '@/components/events/eventsList'

export const Route = createFileRoute('/event/events/page')({
  component: EventsListPage,
})

function EventsListPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <EventsList />
    </div>
  )
}
