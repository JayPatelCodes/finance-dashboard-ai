import { useState } from 'react'
import UploadArea from '../components/UploadArea'
import TransactionsTable from '../components/TransactionsTable'
import Charts from '../components/Charts'
import { fetchTransactions } from '../api'
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

export default function DashboardPage({
  tx, insights, months, activeMonth, forecast,
  onMonthChange, onRefresh, showYearPicker, setShowYearPicker
}: Props) {
  return (
    <div>
      {/* Centered month navigator */}
      <header className="main-header">
        {months.length > 0 ? (
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
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h1>Financial Overview</h1>
            <p className="header-meta">Upload a CSV to get started.</p>
          </div>
        )}
      </header>

      {/* Quick insights strip */}
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
    </div>
  )
}
