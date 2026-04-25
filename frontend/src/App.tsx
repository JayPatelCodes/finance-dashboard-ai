import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import AuthPage from './AuthPage'
import UploadArea from './components/UploadArea'
import TransactionsTable from './components/TransactionsTable'
import Charts from './components/Charts'
import Chatbot from './components/Chatbot'
import { fetchTransactions, fetchInsights, fetchMonths, clearTransactions } from './api'
import type { Tx } from './api'

const INSIGHT_LABELS: Record<string, string> = {
  total_spent: 'Total Spent',
  top_category: 'Top Category',
  avg_daily_spend: 'Daily Average',
}

export default function App() {
  const { user, logout, loading } = useAuth()
  const [tx, setTx] = useState<Tx[]>([])
  const [insights, setInsights] = useState<{ key: string; value: string }[]>([])
  const [months, setMonths] = useState<string[]>([])
  const [activeMonth, setActiveMonth] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const refresh = async (month?: string | null) => {
    const [items, ins, ms] = await Promise.all([
      fetchTransactions(month ?? undefined),
      fetchInsights(),
      fetchMonths(),
    ])
    setTx(items)
    setInsights(ins)
    setMonths(ms)
    if (!month && ms.length > 0 && !activeMonth) {
      setActiveMonth(ms[ms.length - 1])
      const fresh = await fetchTransactions(ms[ms.length - 1])
      setTx(fresh)
    }
  }

  useEffect(() => {
    if (user) refresh(activeMonth)
  }, [user])

  const handleMonthChange = async (month: string) => {
    setActiveMonth(month)
    const items = await fetchTransactions(month)
    setTx(items)
  }

  const handleClear = async () => {
    setClearing(true)
    await clearTransactions()
    setTx([])
    setInsights([])
    setMonths([])
    setActiveMonth(null)
    setShowClearConfirm(false)
    setClearing(false)
  }

  const fmtMonth = (m: string) => {
    const [y, mo] = m.split('-')
    return new Date(+y, +mo - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="brand"><span className="brand-dot" />FinAI</div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot" />
          FinAI
        </div>

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

        <div className="sidebar-section">
          <h3>Import Data</h3>
          <UploadArea onUploaded={() => refresh(activeMonth)} />
        </div>

        {months.length > 0 && (
          <div className="sidebar-section">
            <h3>Month</h3>
            <div className="month-list">
              <button
                className={`month-btn ${activeMonth === null ? 'active' : ''}`}
                onClick={() => { setActiveMonth(null); refresh(null) }}
              >All time</button>
              {months.map(m => (
                <button
                  key={m}
                  className={`month-btn ${activeMonth === m ? 'active' : ''}`}
                  onClick={() => handleMonthChange(m)}
                >{fmtMonth(m)}</button>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-section">
          <h3>Quick Insights</h3>
          <div className="insight-list">
            {insights.length > 0 ? (
              insights.map((i, idx) => (
                <div key={idx} className="mini-card">
                  <small>{INSIGHT_LABELS[i.key] ?? i.key.replaceAll('_', ' ')}</small>
                  <p>{i.value}</p>
                </div>
              ))
            ) : (
              <p className="no-data">Upload a CSV to see insights.</p>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <p className="tx-count">
            {tx.length > 0 ? `${tx.length} transactions` : 'No data loaded'}
            {activeMonth ? ` · ${fmtMonth(activeMonth)}` : ''}
          </p>
          {tx.length > 0 && (
            showClearConfirm ? (
              <div className="clear-confirm">
                <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--red)' }}>Delete all your data?</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="button danger-btn" onClick={handleClear} disabled={clearing}>
                    {clearing ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button className="button" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="button danger-btn-ghost" onClick={() => setShowClearConfirm(true)}>
                Clear all data
              </button>
            )
          )}
          <button className="button logout-btn" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1>{activeMonth ? fmtMonth(activeMonth) : 'Financial Overview'}</h1>
          <p>AI-powered transaction analysis and spending forecasts.</p>
        </header>
        <div className="dashboard-grid">
          <div className="card">
            <h3>Spending Analysis</h3>
            <Charts items={tx} />
          </div>
          <div className="card">
            <h3>Transaction History</h3>
            <TransactionsTable items={tx} />
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  )
}
