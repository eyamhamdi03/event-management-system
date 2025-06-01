import MyEventsList from '@/components/events/myEventsList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/event/MyEvents/page')({
  component: MyEventsListPage,
})

function MyEventsListPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <MyEventsList />
    </div>
  )
}
