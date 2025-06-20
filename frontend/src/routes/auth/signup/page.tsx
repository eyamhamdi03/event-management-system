import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { SignupForm } from '@/components/register-form'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/signup/page')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, navigate])

  const signupMutation = useMutation({
    mutationFn: async (payload: {
      fullName: string
      email: string
      phone: string
      password: string
      birthDate: string
      role: 'organizer' | 'participant'
    }) => {
      console.log(payload)
      return api('/auth/register', 'POST', payload)
    },
    onSuccess: (data: any) => {
      console.log('Registration successful:', data)
      // Navigate to login page regardless of email send status
      navigate({
        to: '/auth/login/page',
      })
    },
    onError: (error) => {
      console.error('Registration failed:', error)
    },
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
