import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Type, AlignLeft } from 'lucide-react'
import { Label } from "@/components/ui/label"

export default function EventForm({
  organizerId,
  onAdd,
  categories,  // on suppose que tu passes un tableau { id, name }
}: {
  organizerId: string
  onAdd: (data: any) => void
  categories: { id: string; name: string }[]
}) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [participantLimit, setParticipantLimit] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      alert("Veuillez choisir une catégorie")
      return
    }
    onAdd({ 
      title: name, 
      location, 
      eventDate, 
      description, 
      hostId: organizerId,
      categoryId,
      participantLimit: Number(participantLimit),
    })
    setName("")
    setLocation("")
    setEventDate("")
    setDescription("")
    setCategoryId("")
    setParticipantLimit(1)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Nom de l'événement
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Nom de l'événement"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Lieu
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="Lieu"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date
        </Label>
        <Input
          id="date"
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2">
          <AlignLeft className="h-4 w-4" />
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Description de l'événement"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="flex items-center gap-2">
          Catégorie
        </Label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="w-full border rounded px-2 py-1"
        >
          <option value="">-- Choisissez une catégorie --</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="participantLimit" className="flex items-center gap-2">
          Limite de participants
        </Label>
        <Input
          id="participantLimit"
          type="number"
          min={1}
          value={participantLimit}
          onChange={(e) => setParticipantLimit(Number(e.target.value))}
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="px-6">
          Créer l'événement
        </Button>
      </div>
    </form>
  )
}
