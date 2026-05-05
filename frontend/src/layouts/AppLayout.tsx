import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

type Page = 'dashboard' | 'budgets' | 'recurring' | 'settings'

type Props = {
  activePage: Page
  onNavigate: (page: Page) => void
  children: React.ReactNode
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'budgets', label: 'Budgets', icon: '◎' },
  { id: 'recurring', label: 'Recurring', icon: '↻' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export default function AppLayout({ activePage, onNavigate, children }: Props) {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="app-layout">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Brand + collapse toggle */}
        <div className="sidebar-top">
          {!collapsed && <div className="brand"><span className="brand-dot" />FinAI</div>}
          <button className="collapse-btn" onClick={() => setCollapsed(v => !v)} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* User info */}
        {!collapsed && user && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user.name[0].toUpperCase()
              }
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        )}

        {collapsed && user && (
          <div className="user-avatar" style={{ margin: '0 auto' }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : user.name[0].toUpperCase()
            }
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className={`nav-item ${collapsed ? 'collapsed' : ''}`}
            onClick={logout}
            title={collapsed ? 'Sign out' : undefined}
            style={{ color: 'var(--text-dim)' }}
          >
            <span className="nav-icon">→</span>
            {!collapsed && <span className="nav-label">Sign out</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
