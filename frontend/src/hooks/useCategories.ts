import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

export interface Category {
  id: string
  name: string
}

export const useCategories = () => {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['category'],
    queryFn: () => api<Category[]>('/category', 'GET', undefined, token),
    enabled: !!token,
    staleTime: 5 * 60 * 1_000,
  })
}
