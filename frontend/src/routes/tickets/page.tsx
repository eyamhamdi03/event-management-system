import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/auth-context'
import { useUserRegistrations, type UserRegistration } from '@/hooks/useUserRegistrations'
import {
    Calendar,
    MapPin,
    QrCode,
    Download,
    ArrowLeft,
    Ticket,
    AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/tickets/page')({
    component: TicketsPage,
})

function TicketsPage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const { data: registrations, isLoading, error } = useUserRegistrations()

    const { upcomingTickets, pastTickets } = useMemo(() => {
        if (!registrations) return { upcomingTickets: [], pastTickets: [] }

        const now = new Date()
        const upcoming = registrations.filter(reg => new Date(reg.event.eventDate) > now)
        const past = registrations.filter(reg => new Date(reg.event.eventDate) <= now)

        return { upcomingTickets: upcoming, pastTickets: past }
    }, [registrations])

    const handleGoBack = () => {
        navigate({ to: '/' })
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
                    <p className="text-gray-600 mb-4">Vous devez être connecté pour voir vos billets</p>
                    <Button onClick={() => navigate({ to: '/auth/login/page' })}>
                        Se connecter
                    </Button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6">
                        <Button variant="outline" onClick={handleGoBack} className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Ticket className="h-8 w-8 text-blue-600" />
                            Mes Billets
                        </h1>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-20 rounded-lg" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
                    <p className="text-gray-600 mb-4">
                        Impossible de charger vos billets. Veuillez réessayer.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Réessayer
                    </Button>
                </div>
            </div>
        )
    }

    const totalTickets = registrations?.length || 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Button
                            variant="outline"
                            onClick={handleGoBack}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Ticket className="h-8 w-8 text-blue-600" />
                            Mes Billets
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Gérez vos billets d'événements et vos codes QR
                        </p>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total des billets</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
                                </div>
                                <Ticket className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Événements à venir</p>
                                    <p className="text-2xl font-bold text-green-600">{upcomingTickets.length}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Événements passés</p>
                                    <p className="text-2xl font-bold text-gray-600">{pastTickets.length}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Events */}
                {upcomingTickets.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Événements à venir</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {upcomingTickets.map((registration) => (
                                <TicketCard key={registration.id} registration={registration} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Events */}
                {pastTickets.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Événements passés</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {pastTickets.map((registration) => (
                                <TicketCard key={registration.id} registration={registration} isPast />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {totalTickets === 0 && (
                    <div className="text-center py-12">
                        <Ticket className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun billet trouvé</h3>
                        <p className="text-gray-600 mb-4">
                            Vous n'avez pas encore de billets. Inscrivez-vous à un événement pour obtenir votre premier billet!
                        </p>
                        <Button onClick={() => navigate({ to: '/event/events/page' })}>
                            Parcourir les événements
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

interface TicketCardProps {
    registration: UserRegistration
    isPast?: boolean
}

function TicketCard({ registration, isPast = false }: TicketCardProps) {
    const formattedDate = format(new Date(registration.event.eventDate), 'PPPP à HH:mm', { locale: fr })

    const handleDownloadQR = () => {
        // For now, create a simple placeholder QR code
        // In a real implementation, you would generate the actual QR code with registration data
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (ctx) {
            canvas.width = 200
            canvas.height = 200
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, 200, 200)
            ctx.fillStyle = '#000000'
            ctx.font = '12px Arial'
            ctx.fillText('QR Code', 80, 100)
            ctx.fillText(registration.id.substring(0, 12), 70, 120)

            const link = document.createElement('a')
            link.download = `ticket-${registration.event.title}-qr.png`
            link.href = canvas.toDataURL()
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    return (
        <Card className={`${isPast ? 'opacity-75' : ''} hover:shadow-lg transition-shadow`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{registration.event.title}</CardTitle>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formattedDate}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                {registration.event.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Badge variant="outline" className="text-xs">
                                    {registration.event.category.name}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Badge
                            variant={registration.confirmed ? 'default' : 'secondary'}
                        >
                            {registration.confirmed ? 'Confirmé' : 'En attente'}
                        </Badge>
                        {registration.checkedIn && (
                            <Badge className="bg-green-600">
                                Présent ✓
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* QR Code Display */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <QrCode className="h-12 w-12 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Code QR</p>
                            <p className="text-xs text-gray-600">
                                Présentez ce code à l'entrée de l'événement
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                ID: {registration.id.substring(0, 8)}...
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadQR}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Télécharger QR
                    </Button>
                </div>

                {!isPast && !registration.checkedIn && registration.confirmed && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Rappel:</strong> Gardez ce billet à portée de main le jour de l'événement.
                            Vous recevrez également une copie par email.
                        </p>
                    </div>
                )}

                {!registration.confirmed && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            ⏳ <strong>En attente:</strong> Votre inscription est en cours de validation.
                            Vous recevrez une confirmation par email une fois approuvée.
                        </p>
                    </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Organisé par: <span className="font-medium">{registration.event.host.fullName}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                        Inscrit le: {format(new Date(registration.createdAt), 'PPP', { locale: fr })}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
