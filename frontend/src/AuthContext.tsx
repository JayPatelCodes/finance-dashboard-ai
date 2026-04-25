import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

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

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('finai_token')
    if (!stored) {
      setLoading(false)
      return
    }

    // Verify token is still valid by calling /auth/me directly with the token
    axios.get<User>(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then(res => {
        setToken(stored)
        setUser(res.data)
      })
      .catch(() => {
        localStorage.removeItem('finai_token')
      })
      .finally(() => setLoading(false))
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
