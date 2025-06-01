import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X, Search, Filter, Calendar as CalendarIcon, SortAsc, SortDesc } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { EventsFilter, Category } from '@/hooks/useEventsGraphQL'

interface EventFiltersProps {
    filter: EventsFilter
    onFilterChange: (filter: EventsFilter) => void
    categories: Category[]
    isLoading?: boolean
}

export default function EventFilters({
    filter,
    onFilterChange,
    categories,
    isLoading = false
}: EventFiltersProps) {
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [startDate, setStartDate] = useState<Date | undefined>(
        filter.startDate ? new Date(filter.startDate) : undefined
    )
    const [endDate, setEndDate] = useState<Date | undefined>(
        filter.endDate ? new Date(filter.endDate) : undefined
    )

    const updateFilter = (updates: Partial<EventsFilter>) => {
        onFilterChange({ ...filter, ...updates, page: 1 }) // Reset to first page on filter change
    }

    const clearFilters = () => {
        setStartDate(undefined)
        setEndDate(undefined)
        onFilterChange({
            page: 1,
            limit: filter.limit || 12,
            sortBy: 'EVENT_DATE',
            sortOrder: 'ASC'
        })
    }

    const hasActiveFilters = Boolean(
        filter.search ||
        filter.category ||
        filter.startDate ||
        filter.endDate ||
        filter.upcoming
    )

    const getSortLabel = () => {
        const sortLabels = {
            TITLE: 'Titre',
            EVENT_DATE: 'Date',
            LOCATION: 'Lieu',
            CREATED_AT: 'Création',
            PARTICIPANT_COUNT: 'Participants'
        }
        return sortLabels[filter.sortBy || 'EVENT_DATE']
    }

    return (
        <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher des événements..."
                        value={filter.search || ''}
                        onChange={(e) => updateFilter({ search: e.target.value })}
                        className="pl-10"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filtres
                    {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {Object.keys(filter).filter(k =>
                                k !== 'page' && k !== 'limit' && k !== 'sortBy' && k !== 'sortOrder' && filter[k as keyof EventsFilter]
                            ).length}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={filter.upcoming ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter({ upcoming: !filter.upcoming })}
                    className="text-xs"
                >
                    Événements à venir
                </Button>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs gap-1"
                    >
                        <X className="h-3 w-3" />
                        Effacer filtres
                    </Button>
                )}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Category Filter */}
                        <div className="space-y-2">
                            <Label>Catégorie</Label>
                            <Select
                                value={filter.category || ''}
                                onValueChange={(value) => updateFilter({ category: value || undefined })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Toutes les catégories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Toutes les catégories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-2">
                            <Label>Trier par</Label>
                            <Select
                                value={filter.sortBy || 'EVENT_DATE'}
                                onValueChange={(value) => updateFilter({
                                    sortBy: value as EventsFilter['sortBy']
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EVENT_DATE">Date de l'événement</SelectItem>
                                    <SelectItem value="TITLE">Titre</SelectItem>
                                    <SelectItem value="LOCATION">Lieu</SelectItem>
                                    <SelectItem value="CREATED_AT">Date de création</SelectItem>
                                    <SelectItem value="PARTICIPANT_COUNT">Nombre de participants</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Order */}
                        <div className="space-y-2">
                            <Label>Ordre</Label>
                            <Button
                                variant="outline"
                                onClick={() => updateFilter({
                                    sortOrder: filter.sortOrder === 'ASC' ? 'DESC' : 'ASC'
                                })}
                                className="w-full justify-start gap-2"
                            >
                                {filter.sortOrder === 'ASC' ? (
                                    <SortAsc className="h-4 w-4" />
                                ) : (
                                    <SortDesc className="h-4 w-4" />
                                )}
                                {filter.sortOrder === 'ASC' ? 'Croissant' : 'Décroissant'}
                            </Button>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date de début</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        {startDate ? format(startDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(date) => {
                                            setStartDate(date)
                                            updateFilter({
                                                startDate: date ? date.toISOString().split('T')[0] : undefined
                                            })
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Date de fin</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        {endDate ? format(endDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(date) => {
                                            setEndDate(date)
                                            updateFilter({
                                                endDate: date ? date.toISOString().split('T')[0] : undefined
                                            })
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="flex gap-2 flex-wrap pt-2 border-t">
                    <span className="text-sm text-gray-600">Filtres actifs:</span>
                    {filter.search && (
                        <Badge variant="secondary" className="text-xs gap-1">
                            Recherche: "{filter.search}"
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => updateFilter({ search: undefined })}
                            />
                        </Badge>
                    )}
                    {filter.category && (
                        <Badge variant="secondary" className="text-xs gap-1">
                            Catégorie: {filter.category}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => updateFilter({ category: undefined })}
                            />
                        </Badge>
                    )}
                    {filter.upcoming && (
                        <Badge variant="secondary" className="text-xs gap-1">
                            À venir
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => updateFilter({ upcoming: undefined })}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}
