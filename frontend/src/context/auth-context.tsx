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
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const storedToken = localStorage.getItem('authToken')
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    setToken(storedToken)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    ;(async () => {
      try {
        const currentUser = await api<User>('/user/me', 'GET', undefined, token)
        if (!cancelled) {
          setUser(currentUser)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load current user:', err)
        if (!cancelled) {
          setToken(null)
          setUser(null)
          setIsLoading(false)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
          }
        }
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

    setIsLoading(true)
    setToken(data.access_token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.access_token)
    }

    try {
      const currentUser = await api<User>(
        '/user/me',
        'GET',
        undefined,
        data.access_token,
      )
      setUser(currentUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(currentUser))
      }
    } catch (err) {
      console.error('Failed to fetch user after login:', err)
      setToken(null)
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    } finally {
      setIsLoading(false)
    }
  }
  const logout = async () => {
    if (token) {
      try {
        await api('/auth/logout', 'POST', undefined, token)
      } catch (err) {
        console.error('Logout API call failed:', err)
      }
    }

    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
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
