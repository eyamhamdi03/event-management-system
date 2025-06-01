import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation({
    mutationFn: (id: string) =>
      api(`/event/soft/${id}`, 'DELETE', undefined, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event'] })
    },
  })
}
