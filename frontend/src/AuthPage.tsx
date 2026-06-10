import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { signup, login, googleAuth, guestLogin } from './api'
import { useAuth } from './context/AuthContext'

declare global {
  interface Window { google?: any }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

type Props = {
  initialMode?: 'login' | 'signup'
}

export default function AuthPage({ initialMode = 'login' }: Props) {
  const { login: authLogin } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Re-sync if parent changes initialMode (e.g. guest clicking "Sign up")
  useEffect(() => {
    setMode(initialMode)
    setError('')
  }, [initialMode])

  // Initialize Google Sign-In button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      })
      window.google?.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'filled_black', size: 'large', width: 320, text: 'continue_with' }
      )
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const handleGoogleResponse = async (response: any) => {
    setError('')
    setLoading(true)
    try {
      const res = await googleAuth(response.credential)
      authLogin(res.access_token, res.user)
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Google sign-in failed.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = mode === 'signup'
        ? await signup(name, email, password)
        : await login(email, password)
      authLogin(res.access_token, res.user)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await guestLogin()
      authLogin(res.access_token, res.user)
    } catch {
      setError('Could not start guest session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-dot" />
          FinAI
        </div>
        <p className="auth-tagline">
          {mode === 'login' ? 'Welcome back.' : 'Start tracking your finances.'}
        </p>

        {GOOGLE_CLIENT_ID && (
          <>
            <div id="google-btn" style={{ margin: '0 auto 16px' }} />
            <div className="auth-divider"><span>or</span></div>
          </>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="input"
                type="text"
                placeholder="Jay Patel"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="input"
              type="password"
              placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="button button-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="auth-switch-btn"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div className="auth-divider"><span>or</span></div>

        <button
          className="button auth-submit"
          type="button"
          onClick={handleGuest}
          disabled={loading}
          style={{ width: '100%', opacity: 0.85 }}
        >
          Continue as Guest
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', margin: '8px 0 0' }}>
          No account needed · data deleted after 24 hours
        </p>
      </div>
    </div>
  )
}
