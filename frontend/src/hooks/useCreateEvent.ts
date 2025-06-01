import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import type { CreateEventPayload } from '@/components/forms/add-event'

export const useCreateEvent = () => {
  const { token } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      api('/event', 'POST', payload, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
