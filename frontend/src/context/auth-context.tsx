import { api } from '@/lib/api'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export interface User {
  sub: string
  email: string
  fullName?: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (data: { access_token: string }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedToken = localStorage.getItem('authToken')
    if (!storedToken) return

    setToken(storedToken)
  }, [])

  useEffect(() => {
    if (!token) return

    let cancelled = false
    ;(async () => {
      try {
        const currentUser = await api<User>('/user/me', 'GET', undefined, token)
        if (!cancelled) setUser(currentUser)
      } catch (err) {
        console.error('Failed to load current user:', err)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  const login = async (data: { access_token: string }) => {
    if (!data.access_token) {
      console.error('No access_token provided to login')
      return
    }

    setToken(data.access_token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.access_token)
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
