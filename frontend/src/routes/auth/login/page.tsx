import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/context/auth-context'
import { LoginForm } from '@/components/login-form'

export const Route = createFileRoute('/auth/login/page')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const API_BASE_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Login failed')
      }

      return res.json()
    },
    onSuccess: (data) => {
      login({ access_token: data.access_token })

      console.log('Login successful:', data)

      navigate({ to: '/' })
    },
    onError: (error) => {
      console.error(error)
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <LoginForm
          onSubmit={({ email, password }) =>
            loginMutation.mutate({ email, password })
          }
          isLoading={loginMutation.isPending}
          error={loginMutation.error as Error}
        />
      </div>
    </div>
  )
}
