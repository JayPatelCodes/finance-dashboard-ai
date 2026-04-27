import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import AuthPage from './AuthPage'
import UploadArea from './components/UploadArea'
import TransactionsTable from './components/TransactionsTable'
import Charts from './components/Charts'
import Chatbot from './components/Chatbot'
import { fetchTransactions, fetchInsights, fetchMonths, fetchForecast, clearTransactions } from './api'
import BudgetGoals from './components/BudgetGoals'
import RecurringTransactions from './components/RecurringTransactions'
import type { Tx } from './api'

const INSIGHT_LABELS: Record<string, string> = {
  total_spent: 'Total Spent',
  top_category: 'Top Category',
  avg_daily_spend: 'Daily Average',
}

type ForecastData = { points: { date: string; predicted: number }[]; summary: string }

export default function App() {
  const { user, logout, loading } = useAuth()
  const [tx, setTx] = useState<Tx[]>([])
  const [insights, setInsights] = useState<{ key: string; value: string }[]>([])
  const [months, setMonths] = useState<string[]>([])
  const [activeMonth, setActiveMonth] = useState<string | null>(null)
  const [forecast, setForecast] = useState<ForecastData>({ points: [], summary: '' })
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)

  const refresh = async (month?: string | null) => {
    const [items, ins, ms, fc] = await Promise.all([
      fetchTransactions(month ?? undefined),
      fetchInsights(),
      fetchMonths(),
      fetchForecast(),
    ])
    setTx(items)
    setInsights(ins)
    setMonths(ms)
    setForecast(fc)
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
    setForecast({ points: [], summary: '' })
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
          {months.length > 0 ? (
            <div className="month-nav-header">
              <button
                className="month-nav-arrow"
                disabled={activeMonth === null || months.indexOf(activeMonth) <= 0}
                onClick={() => {
                  if (!activeMonth) return
                  const idx = months.indexOf(activeMonth)
                  if (idx > 0) handleMonthChange(months[idx - 1])
                }}
              >‹</button>

              <div className="month-nav-center">
                <button
                  className="month-nav-title"
                  onClick={() => setShowYearPicker(v => !v)}
                  title="Click to browse all months"
                >
                  {activeMonth ? fmtMonth(activeMonth) : 'All time'}
                  <span className="month-nav-caret">▾</span>
                </button>

                {tx.length > 0 && (
                  <p className="header-meta">
                    {tx.length} transactions
                    {' · '}
                    {(() => { const [y,m,d] = tx[0].Date.split('T')[0].split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) })()}
                    {' – '}
                    {(() => { const [y,m,d] = tx[tx.length-1].Date.split('T')[0].split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) })()}
                  </p>
                )}

                {showYearPicker && (
                  <div className="year-picker">
                    {Array.from(new Set(months.map(m => m.split('-')[0]))).map(year => (
                      <div key={year} className="year-picker-group">
                        <div className="year-picker-year">{year}</div>
                        <div className="year-picker-months">
                          {months.filter(m => m.startsWith(year)).map(m => (
                            <button
                              key={m}
                              className={`year-picker-month ${activeMonth === m ? 'active' : ''}`}
                              onClick={() => { handleMonthChange(m); setShowYearPicker(false) }}
                            >
                              {new Date(+m.split('-')[0], +m.split('-')[1] - 1).toLocaleDateString('en-US', { month: 'short' })}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      className={`year-picker-all ${activeMonth === null ? 'active' : ''}`}
                      onClick={() => { setActiveMonth(null); refresh(null); setShowYearPicker(false) }}
                    >All time</button>
                  </div>
                )}
              </div>

              <button
                className="month-nav-arrow"
                disabled={activeMonth === null || months.indexOf(activeMonth) >= months.length - 1}
                onClick={() => {
                  if (!activeMonth) return
                  const idx = months.indexOf(activeMonth)
                  if (idx < months.length - 1) handleMonthChange(months[idx + 1])
                }}
              >›</button>
            </div>
          ) : (
            <div>
              <h1>Financial Overview</h1>
              <p className="header-meta">AI-powered transaction analysis and spending forecasts.</p>
            </div>
          )}
        </header>
        <div className="dashboard-grid">
          <div className="card">
            <h3>Spending Analysis</h3>
            <Charts items={tx} forecast={forecast} />
          </div>
          <div className="card">
            <h3>Transaction History</h3>
            <TransactionsTable items={tx} />
          </div>
          <div className="card">
            <h3>Budget Goals</h3>
            <BudgetGoals activeMonth={activeMonth} />
          </div>
          <div className="card">
            <h3>Recurring Transactions</h3>
            <RecurringTransactions />
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  )
}
