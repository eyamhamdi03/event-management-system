import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'

import { SignupForm } from '@/components/register-form'

export const Route = createFileRoute('/auth/signup/page')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const API_BASE_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`

  const signupMutation = useMutation({
    mutationFn: async (payload: {
      fullName: string
      email: string
      phone: string
      password: string
      birthDate: string
      role: 'organizer' | 'participant'
    }) => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Signup failed')
      return res.json()
    },
    onSuccess: () => navigate({ to: '/auth/login/page' }),
  })

  return (
    <>
      <SignupForm
        onSubmit={signupMutation.mutate}
        isLoading={signupMutation.isPending}
      />
    </>
  )
}
