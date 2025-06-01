import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    UserCheck,
    MessageCircle,
    Tag,
    User
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChatRoom } from '@/components/ChatRoom'
import { useAuth } from '@/context/auth-context'
import { useRegisterForEvent, useCancelRegistration, useUserEventRegistration } from '@/hooks/useRegistration'

import { useEventById } from '@/hooks/useEventsGraphQL'

export const Route = createFileRoute('/event/$eventId/page')({
    component: EventDetailsPage,
})

function EventDetailsPage() {
    const { eventId } = Route.useParams()
    const navigate = useNavigate()
    const { user, token, isAuthenticated } = useAuth()    // Hooks for event data and registration
    const { data: event, isLoading, error } = useEventById(eventId)
    const { data: userRegistration, isLoading: isCheckingRegistration } = useUserEventRegistration(eventId, event)
    const registerMutation = useRegisterForEvent()
    const cancelMutation = useCancelRegistration()

    const [isChatOpen, setIsChatOpen] = useState(false)    // Check if user is already registered
    const isUserRegistered = !!userRegistration && userRegistration.confirmed

    const handleJoinChatRoom = () => {
        if (!isAuthenticated) {
            alert('Vous devez être connecté pour rejoindre le chat.')
            navigate({ to: '/auth/login/page' })
            return
        }

        setIsChatOpen(true)
    }

    const handleCloseChatRoom = () => {
        setIsChatOpen(false)
    }

    const handleRegisterForEvent = () => {
        if (!isAuthenticated || !user) {
            alert('Vous devez être connecté pour vous inscrire.')
            navigate({ to: '/auth/login/page' })
            return
        }

        if (isUserRegistered) {
            // User is already registered, handle cancellation
            cancelMutation.mutate(
                { eventId, userId: user.sub },
                {
                    onSuccess: () => {
                        alert('Votre inscription a été annulée avec succès.')
                    },
                    onError: (error) => {
                        console.error('Failed to cancel registration:', error)
                        alert('Erreur lors de l\'annulation de l\'inscription. Veuillez réessayer.')
                    },
                }
            )
        } else {
            // Register for event
            registerMutation.mutate(
                { eventId, userId: user.sub },
                {
                    onSuccess: () => {
                        alert('Inscription réussie ! Vous recevrez bientôt un email de confirmation avec votre billet.')
                    },
                    onError: (error: any) => {
                        console.error('Failed to register:', error)
                        const errorMessage = error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.'
                        alert(errorMessage)
                    },
                }
            )
        }
    }

    const handleGoBack = () => {
        navigate({ to: '/event/events/page' })
    }

    if (isLoading) {
        return <EventDetailsSkeleton />
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
                    <p className="text-gray-600 mb-4">Impossible de charger les détails de l'événement</p>
                    <Button onClick={handleGoBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux événements
                    </Button>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Événement non trouvé</h2>
                    <p className="text-gray-600 mb-4">L'événement que vous recherchez n'existe pas</p>
                    <Button onClick={handleGoBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux événements
                    </Button>
                </div>
            </div>
        )
    }    const formattedDate = event.eventDate
        ? format(new Date(event.eventDate), 'PPPP à HH:mm', { locale: fr })
        : 'Date non spécifiée'

    const isUpcoming = new Date(event.eventDate) > new Date()
    const canRegister = event.isAvailable && isUpcoming && !event.isFull
    
    // Determine button state and text
    const isProcessing = registerMutation.isPending || cancelMutation.isPending || isCheckingRegistration
    const buttonText = isUserRegistered ? 'Annuler l\'inscription' : 'S\'inscrire à l\'événement'
    const buttonColor = isUserRegistered ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
    const showRegistrationButton = canRegister || isUserRegistered

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={handleGoBack}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux événements
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Event Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Badge
                                        variant={event.validated ? "default" : "secondary"}
                                    >
                                        {event.validated ? 'Validé' : 'En attente'}
                                    </Badge>
                                    {event.category && (
                                        <Badge variant="outline">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {event.category.name}
                                        </Badge>
                                    )}
                                    {event.isFull && (
                                        <Badge variant="destructive">
                                            Complet
                                        </Badge>
                                    )}
                                    {!isUpcoming && (
                                        <Badge variant="secondary">
                                            Terminé
                                        </Badge>
                                    )}                                    {canRegister && (
                                        <Badge className="bg-green-600">
                                            Inscription ouverte
                                        </Badge>
                                    )}
                                    {isUserRegistered && (
                                        <Badge className="bg-blue-600">
                                            Inscrit ✓
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                                    {event.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Informations sur l'événement</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Date et heure</p>
                                            <p className="text-sm text-gray-600">{formattedDate}</p>
                                        </div>
                                    </div>

                                    {event.location && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-red-600" />
                                            <div>
                                                <p className="font-medium">Lieu</p>
                                                <p className="text-sm text-gray-600">{event.location}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Participants</p>
                                            <p className="text-sm text-gray-600">
                                                {event.currentParticipants}
                                                {event.participantLimit && ` / ${event.participantLimit}`} inscrits
                                            </p>
                                        </div>
                                    </div>

                                    {event.host?.fullName && (
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <p className="font-medium">Organisateur</p>
                                                <p className="text-sm text-gray-600">{event.host.fullName}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Actions & Chat */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>                            <CardContent className="space-y-3">
                                {showRegistrationButton && (
                                    <Button
                                        className={`w-full gap-2 ${buttonColor}`}
                                        onClick={handleRegisterForEvent}
                                        disabled={isProcessing || !isAuthenticated}
                                    >
                                        <UserCheck className="h-4 w-4" />
                                        {isProcessing ? 'Traitement...' : buttonText}
                                    </Button>
                                )}

                                {isUserRegistered && (
                                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md text-center">
                                        ✅ Vous êtes inscrit(e) à cet événement
                                    </div>
                                )}

                                <Separator />{/* Chat Room Button */}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-gray-700">Discussion en direct</h4>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={handleJoinChatRoom}
                                        disabled={!isAuthenticated}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        {!isAuthenticated ? 'Connectez-vous pour chatter' : 'Rejoindre le chat'}
                                    </Button>
                                    <p className="text-xs text-gray-500">
                                        Discutez avec les autres participants de l'événement
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Statistiques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Participants inscrits</span>
                                    <span className="font-medium">{event.currentParticipants}</span>
                                </div>
                                {event.participantLimit && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Places disponibles</span>
                                        <span className="font-medium">
                                            {Math.max(0, event.participantLimit - event.currentParticipants)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Créé le</span>
                                    <span className="font-medium text-sm">
                                        {format(new Date(event.createdAt), 'dd/MM/yyyy', { locale: fr })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>                </div>
            </div>            {/* Enhanced Chat Modal */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 gap-0 bg-transparent border-0 shadow-2xl">
                    <div className="h-full w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                        {isChatOpen && user && token && (
                            <ChatRoom
                                eventId={eventId}
                                token={token}
                                currentUserId={user.sub}
                                onClose={handleCloseChatRoom}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function EventDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Skeleton className="h-10 w-40" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex gap-2 mb-4">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                                <Skeleton className="h-8 w-3/4 mb-2" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-5 w-5" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-5 w-16" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-5 w-20" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-8" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
