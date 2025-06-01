import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    isLoading?: boolean
}

export default function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    isLoading = false
}: PaginationProps) {
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2)
            let start = Math.max(1, currentPage - halfVisible)
            let end = Math.min(totalPages, start + maxVisiblePages - 1)

            if (end - start + 1 < maxVisiblePages) {
                start = Math.max(1, end - maxVisiblePages + 1)
            }

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
        }

        return pages
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white rounded-lg shadow-sm border">
            {/* Items info */}
            <div className="text-sm text-gray-600">
                Affichage de {startItem} à {endItem} sur {totalItems} événements
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Afficher</span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-16 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="48">48</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1 || isLoading}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Page numbers */}
                    {getPageNumbers().map((page) => (
                        <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            disabled={isLoading}
                            className="h-8 min-w-8 px-3"
                        >
                            {page}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages || isLoading}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
