import { createFileRoute } from '@tanstack/react-router'
import { CreateEventForm } from '@/components/forms/add-event'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createFileRoute('/event/add/page')({
  component: AddEventPage,
})

function AddEventPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-2xl">
          <CreateEventForm />
        </div>
      </div>
    </ProtectedRoute>
  )
}
