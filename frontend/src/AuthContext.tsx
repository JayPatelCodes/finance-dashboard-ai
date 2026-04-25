import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser } from './api'

export type User = {
  id: string
  name: string
  email: string
  avatar?: string
}

type AuthCtx = {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('finai_token')
    if (stored) {
      setToken(stored)
      getCurrentUser(stored)
        .then(u => setUser(u))
        .catch(() => {
          localStorage.removeItem('finai_token')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('finai_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('finai_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
