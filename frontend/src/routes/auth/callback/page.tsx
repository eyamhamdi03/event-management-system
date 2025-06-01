import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/context/auth-context'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/callback/page')({
    component: AuthCallbackPage,
})

function AuthCallbackPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const error = urlParams.get('error')

        if (error) {
            console.error('Authentication error:', error)
            navigate({ to: '/auth/login/page' })
            return
        }

        if (token) {
            login({ access_token: token }).then(() => {
                navigate({ to: '/' })
            })
        } else {
            navigate({ to: '/auth/login/page' })
        }
    }, [login, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Completing authentication...</h2>
                <p className="text-gray-600">Please wait while we log you in.</p>
            </div>
        </div>
    )
}
