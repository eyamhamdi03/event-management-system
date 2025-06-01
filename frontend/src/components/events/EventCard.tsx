import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Calendar, MapPin, Clock, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type EventCardProps = {
  event: any
  onDelete: () => void
}

export default function EventCard({ event, onDelete }: EventCardProps) {
  const formattedDate = event.eventDate 
    ? format(new Date(event.eventDate), 'PPP', { locale: fr })
    : 'Date non spécifiée'

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 line-clamp-2">
          {event.title || event.name || 'Sans titre'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          {event.description && (
            <CardDescription className="text-gray-600 line-clamp-3">
              {event.description}
            </CardDescription>
          )}
          
          <div className="space-y-2 text-sm text-gray-600">
            {event.eventDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{formattedDate}</span>
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onDelete}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  )
}