import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Eye, UserCheck } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Event } from '@/hooks/useEventsGraphQL'

type EventCardProps = {
  event: Event
  onView?: (event: Event) => void
  onRegister?: (event: Event) => void
  showActions?: boolean
}

export default function EventCard({
  event,
  onView,
  onRegister,
  showActions = true
}: EventCardProps) {
  const formattedDate = event.eventDate
    ? format(new Date(event.eventDate), 'PPP à HH:mm', { locale: fr })
    : 'Date non spécifiée'

  const isUpcoming = new Date(event.eventDate) > new Date()
  const canRegister = event.isAvailable && isUpcoming && !event.isFull

  return (
    <Card className="relative hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge
            variant={event.validated ? "default" : "secondary"}
            className="text-xs"
          >
            {event.validated ? 'Validé' : 'En attente'}
          </Badge>
          {event.category && (
            <Badge variant="outline" className="text-xs">
              {event.category.name}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {event.description && (
          <CardDescription className="text-gray-600 line-clamp-3">
            {event.description}
          </CardDescription>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span>
              {event.currentParticipants}
              {event.participantLimit && ` / ${event.participantLimit}`} participants
            </span>
          </div>          {event.host?.fullName && (
            <div className="flex items-center gap-2 text-gray-600">
              <UserCheck className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span className="truncate">Organisé par {event.host.fullName}</span>
            </div>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex gap-2 flex-wrap">
          {event.isFull && (
            <Badge variant="destructive" className="text-xs">
              Complet
            </Badge>
          )}
          {!isUpcoming && (
            <Badge variant="secondary" className="text-xs">
              Terminé
            </Badge>
          )}
          {canRegister && (
            <Badge variant="default" className="text-xs bg-green-600">
              Inscription ouverte
            </Badge>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-4 gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(event)}
              className="flex-1 gap-2"
            >
              <Eye className="h-4 w-4" />
              Voir détails
            </Button>
          )}

          {onRegister && canRegister && (
            <Button
              size="sm"
              onClick={() => onRegister(event)}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4" />
              S'inscrire
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
