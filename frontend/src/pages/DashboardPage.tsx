import TransactionsTable from '../components/TransactionsTable'
import Charts from '../components/Charts'
import type { Tx, ForecastData } from '../api'

type Props = {
  tx: Tx[]
  insights: { key: string; value: string }[]
  months: string[]
  activeMonth: string | null
  forecast: ForecastData
  onMonthChange: (month: string) => void
  onRefresh: (month?: string | null) => void
  showYearPicker: boolean
  setShowYearPicker: (v: boolean | ((prev: boolean) => boolean)) => void
}

const INSIGHT_LABELS: Record<string, string> = {
  total_spent: 'Total Spent',
  top_category: 'Top Category',
  avg_daily_spend: 'Daily Average',
}

function fmtMonth(m: string) {
  const [y, mo] = m.split('-')
  return new Date(+y, +mo - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function WelcomeState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      textAlign: 'center',
      gap: 24,
    }}>
      <div style={{ fontSize: 56 }}>✦</div>
      <div>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 600, color: 'var(--text)' }}>
          Welcome to FinAI
        </h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 15, maxWidth: 400 }}>
          Upload your first CSV file to get started. Your transactions will be automatically categorized and visualized.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        maxWidth: 560,
        width: '100%',
        marginTop: 8,
      }}>
        {[
          { icon: '⇪', title: 'Upload CSV', desc: 'Import your bank transactions using the button in the sidebar' },
          { icon: '◎', title: 'Auto-categorize', desc: 'Gemini AI automatically sorts transactions into spending categories' },
          { icon: '✦', title: 'Chat with AI', desc: 'Ask the chatbot questions about your spending and get personalized insights' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(79,142,247,0.08)',
        border: '1px solid rgba(79,142,247,0.2)',
        borderRadius: 10,
        padding: '12px 20px',
        fontSize: 13,
        color: 'var(--accent)',
        maxWidth: 400,
      }}>
        Your CSV needs three columns: <strong>Date</strong>, <strong>Description</strong>, and <strong>Amount</strong>. Negative amounts are expenses, positive are income.
      </div>
    </div>
  )
}

export default function DashboardPage({
  tx, insights, months, activeMonth, forecast,
  onMonthChange, onRefresh, showYearPicker, setShowYearPicker
}: Props) {

  const hasData = tx.length > 0 || months.length > 0

  return (
    <div>
      {/* Month navigator, which only shows up when there's data */}
      {months.length > 0 ? (
        <header className="main-header">
          <div className="month-nav-header">
            <button
              className="month-nav-arrow"
              disabled={activeMonth === null || months.indexOf(activeMonth) <= 0}
              onClick={() => {
                if (!activeMonth) return
                const idx = months.indexOf(activeMonth)
                if (idx > 0) onMonthChange(months[idx - 1])
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
                            onClick={() => { onMonthChange(m); setShowYearPicker(false) }}
                          >
                            {new Date(+m.split('-')[0], +m.split('-')[1] - 1).toLocaleDateString('en-US', { month: 'short' })}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    className={`year-picker-all ${activeMonth === null ? 'active' : ''}`}
                    onClick={() => { onRefresh(null); setShowYearPicker(false) }}
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
                if (idx < months.length - 1) onMonthChange(months[idx + 1])
              }}
            >›</button>
          </div>
        </header>
      ) : (
        <header className="main-header" style={{ textAlign: 'center', marginBottom: 0 }}>
          <h1>Financial Overview</h1>
        </header>
      )}

      {/* Insights strip */}
      {insights.length > 0 && (
        <div className="insights-strip">
          {insights.map((i, idx) => (
            <div key={idx} className="insight-chip">
              <span className="insight-chip-label">{INSIGHT_LABELS[i.key] ?? i.key.replaceAll('_', ' ')}</span>
              <span className="insight-chip-value">{i.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      {!hasData ? (
        <WelcomeState />
      ) : (
        <div className="dashboard-grid">
          <div className="card">
            <h3>Spending Analysis</h3>
            <Charts items={tx} forecast={forecast} />
          </div>
          <div className="card">
            <h3>Transaction History</h3>
            <TransactionsTable items={tx} />
          </div>
        </div>
      )}
    </div>
  )
}
