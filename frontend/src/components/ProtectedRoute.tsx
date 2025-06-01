import { useAuth } from '@/context/auth-context'
import { Navigate } from '@tanstack/react-router'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: string
    redirectTo?: string
}

export function ProtectedRoute({
    children,
    requiredRole,
    redirectTo = '/auth/login/page'
}: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} />
    }

    if (requiredRole && user?.role !== requiredRole) {
        // If user doesn't have required role, redirect to home or unauthorized page
        return <Navigate to="/" />
    }

    return <>{children}</>
}

// Higher-order component for easier route protection
export function withProtectedRoute<T extends object>(
    Component: React.ComponentType<T>,
    requiredRole?: string
) {
    return function ProtectedComponent(props: T) {
        return (
            <ProtectedRoute requiredRole={requiredRole}>
                <Component {...props} />
            </ProtectedRoute>
        )
    }
}
