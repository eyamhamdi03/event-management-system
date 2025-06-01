import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/context/auth-context'
import { LoginForm } from '@/components/login-form'
import { DevAuthPanel } from '@/components/DevAuthPanel'
import { api } from '@/lib/api'
import React from 'react'

export const Route = createFileRoute('/auth/login/page')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, navigate])

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const response = await api<{ access_token: string }>(
        '/auth/login',
        'POST',
        payload,
      )
      if (!response.access_token) {
        throw new Error('No access token received')
      }
      return response
    },
    onSuccess: async (data) => {
      try {
        await login({ access_token: data.access_token })
        console.log('Login successful')
        navigate({ to: '/' })
      } catch (error) {
        console.error('Failed to complete login:', error)
      }
    },
    onError: (error) => {
      console.error('Login error:', error)
    },
  })

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    window.location.href = `${backendUrl}/auth/google`
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <LoginForm
          onSubmit={({ email, password }) =>
            loginMutation.mutate({ email, password })
          }
          onGoogleLogin={handleGoogleLogin}
          isLoading={loginMutation.isPending}
          error={loginMutation.error as Error}
        />
        <DevAuthPanel />
      </div>
    </div>
  )
}
