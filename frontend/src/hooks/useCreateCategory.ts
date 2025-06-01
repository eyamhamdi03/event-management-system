import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

export interface CreateCategoryPayload {
  name: string
}

export const useCreateCategory = () => {
  const { token } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      api('/category', 'POST', payload, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
