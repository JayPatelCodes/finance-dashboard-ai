import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import UploadArea from '../components/UploadArea'

type Page = 'dashboard' | 'budgets' | 'recurring' | 'settings'

type Props = {
  activePage: Page
  onNavigate: (page: Page) => void
  onUploaded: () => void
  onGuestSignUp: () => void
  children: React.ReactNode
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'budgets', label: 'Budgets', icon: '◎' },
  { id: 'recurring', label: 'Recurring', icon: '↻' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export default function AppLayout({ activePage, onNavigate, onUploaded, onGuestSignUp, children }: Props) {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const isGuest = user?.email?.endsWith('@guest.local') ?? false

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile sidebar on route change
  const handleNavigate = (page: Page) => {
    onNavigate(page)
    setMobileOpen(false)
  }

  const sidebarContent = (isMobile = false) => (
    <aside className={`sidebar ${collapsed && !isMobile ? 'collapsed' : ''} ${isMobile ? 'sidebar-mobile' : ''}`}>

      {/* Guest banner */}
      {isGuest && (!collapsed || isMobile) && (
        <div style={{
          background: 'rgba(245,166,35,0.1)',
          border: '1px solid rgba(245,166,35,0.22)',
          borderRadius: 10,
          padding: '10px 12px',
          marginBottom: 12,
          fontSize: 12,
          lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 600, color: '#f5a623', marginBottom: 4 }}>👤 Guest Mode</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
            Data deleted after 24 hours.
          </div>
          <button
            className="button button-primary"
            style={{ width: '100%', fontSize: 12, padding: '7px 0' }}
            onClick={onGuestSignUp}
          >
            Sign up to save data →
          </button>
        </div>
      )}

      <div className="sidebar-top">
        {(!collapsed || isMobile) && <div className="brand"><span className="brand-dot" />FinAI</div>}
        {isMobile ? (
          <button className="collapse-btn" onClick={() => setMobileOpen(false)}>✕</button>
        ) : (
          <button className="collapse-btn" onClick={() => setCollapsed(v => !v)} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? '›' : '‹'}
          </button>
        )}
      </div>

      {user && (
        <div ref={isMobile ? undefined : profileRef} style={{ position: 'relative' }}>
          <div
            className="sidebar-user"
            onClick={() => setShowProfileMenu(v => !v)}
            style={{ cursor: 'pointer' }}
            title="Account options"
          >
            <div className="user-avatar" style={{ margin: collapsed && !isMobile ? '0 auto' : undefined }}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user.name[0].toUpperCase()
              }
            </div>
            {(!collapsed || isMobile) && (
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{isGuest ? 'Guest account' : user.email}</div>
              </div>
            )}
          </div>

          {showProfileMenu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: '#0e1530', border: '1px solid var(--border-strong)',
              borderRadius: 10, overflow: 'hidden', zIndex: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {(!collapsed || isMobile) && (
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                    {isGuest ? 'Guest account · expires in 24h' : user.email}
                  </div>
                </div>
              )}
              <button
                onClick={() => { setShowProfileMenu(false); logout() }}
                style={{
                  width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                  color: 'var(--red)', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                  fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240,92,92,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >Sign out</button>
            </div>
          )}
        </div>
      )}

      {(!collapsed || isMobile) && (
        <div className="sidebar-section">
          {showUpload ? (
            <div>
              <UploadArea onUploaded={() => { onUploaded(); setShowUpload(false); setMobileOpen(false) }} />
              <button className="button" style={{ width: '100%', marginTop: 8, fontSize: 12 }} onClick={() => setShowUpload(false)}>Cancel</button>
            </div>
          ) : (
            <button className="button button-primary" style={{ width: '100%' }} onClick={() => setShowUpload(true)}>
              + Import CSV
            </button>
          )}
        </div>
      )}

      {collapsed && !isMobile && (
        <button className="nav-item collapsed" onClick={() => { setCollapsed(false); setShowUpload(true) }} title="Import CSV">
          <span className="nav-icon">↑</span>
        </button>
      )}

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''} ${collapsed && !isMobile ? 'collapsed' : ''}`}
            onClick={() => handleNavigate(item.id)}
            title={collapsed && !isMobile ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {(!collapsed || isMobile) && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <p className="tx-count" style={{ margin: 0, fontSize: 11, color: 'var(--text-dim)' }}>FinAI v1.0</p>
      </div>
    </aside>
  )

  return (
    <div className="app-layout">
      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        {sidebarContent(false)}
      </div>

      {/* Mobile hamburger button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
          {sidebarContent(true)}
        </>
      )}

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
