import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { useAuth } from '@/context/auth-context'
import { Textarea } from '../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useCategories } from '@/hooks/useCategories'
import { useCreateEvent } from '@/hooks/useCreateEvent'

export interface CreateEventPayload {
  title: string
  description: string
  eventDate: string
  location: string
  hostId: string
  validated?: boolean
  categoryId: string
  participantLimit: number
}

export function CreateEventForm() {
  const { user } = useAuth()

  const {
    data: categories = [],
    isLoading: catLoading,
    error: catError,
  } = useCategories()

  const { mutate: createEvent, isPending: saving, isSuccess } = useCreateEvent()

  const [eventDate, setEventDate] = useState<Date>()
  const [categoryId, setCategoryId] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      return alert('You must be logged in to create an event.')
    }
    if (user.role !== 'organizer') {
      return alert('Only organizers can create events.')
    }

    const form = new FormData(e.currentTarget)

    createEvent({
      title: form.get('title') as string,
      description: form.get('description') as string,
      location: form.get('location') as string,
      hostId: user.sub,
      validated: false,
      categoryId: categoryId,
      eventDate: eventDate?.toISOString().split('T')[0] ?? '',
      participantLimit: Number(form.get('participantLimit')),
    })
    console.log({
      title: form.get('title'),
      description: form.get('description'),
      location: form.get('location'),
      hostId: user.sub,
      validated: false,
      categoryId,
      eventDate: eventDate?.toISOString().split('T')[0],
      participantLimit: Number(form.get('participantLimit')),
    })
  }

  if (isSuccess) {
    return (
      <div className="text-center pt-12">
        <h2 className="text-2xl font-semibold">🎉 Event created!</h2>
        <p className="mt-2 text-muted-foreground">
          You can find it in “My Events”.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center px-4 pt-8">
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create a New Event</CardTitle>
          </CardHeader>

          <CardContent>
            {catError && (
              <p className="mb-4 text-center text-destructive">
                Failed to load categories.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Event title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="Tunis, Tunisia"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="participantLimit">Participant Limit</Label>
                    <Input
                      id="participantLimit"
                      name="participantLimit"
                      type="number"
                      min={1}
                      placeholder="100"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-8 md:pt-0">
                  <div>
                    <Label htmlFor="eventDate">Event Date</Label>
                    <DatePicker date={eventDate} setDate={setEventDate} />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      disabled={catLoading}
                      value={categoryId}
                      onValueChange={setCategoryId}
                    >
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue
                          placeholder={
                            catLoading ? 'Loading…' : 'Select a category'
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={8}
                  placeholder="Event description"
                  required
                  className="h-32"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  saving ||
                  catLoading ||
                  !categoryId ||
                  !eventDate ||
                  (user?.role ?? '') !== 'organizer'
                }
              >
                {saving ? 'Creating event…' : 'Create Event'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
