import { useState, useMemo } from 'react'
import type { Tx } from '../api'

function exportToCsv(items: Tx[]) {
  const header = 'Date,Description,Category,Amount'
  const rows = items.map(t =>
    `${t.Date.split('T')[0]},"${t.Description.replace(/"/g, '""')}",${t.Category},${t.Amount}`
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'transactions.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const CATEGORIES = ['All', 'Groceries', 'Dining', 'Transportation', 'Utilities', 'Rent', 'Entertainment', 'Other']

export default function TransactionsTable({ items }: { items: Tx[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [amountFilter, setAmountFilter] = useState<'all' | 'income' | 'expense'>('all')

  const filtered = useMemo(() => {
    return items.filter(t => {
      const matchSearch = t.Description.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'All' || t.Category === category
      const matchAmount =
        amountFilter === 'all' ||
        (amountFilter === 'income' && t.Amount >= 0) ||
        (amountFilter === 'expense' && t.Amount < 0)
      return matchSearch && matchCat && matchAmount
    })
  }, [items, search, category, amountFilter])

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⬡</div>
        <p style={{ margin: 0 }}>No transactions yet. Upload a CSV to get started.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ flex: 1, minWidth: 140 }}
          placeholder="Search descriptions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input"
          style={{ width: 140 }}
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="input"
          style={{ width: 120 }}
          value={amountFilter}
          onChange={e => setAmountFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>
        <button
          className="button"
          onClick={() => exportToCsv(filtered)}
          disabled={filtered.length === 0}
          title="Export filtered transactions to CSV"
        >
          ↓ Export
        </button>
      </div>

      {/* Result count */}
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>
        {filtered.length === items.length
          ? `${items.length} transactions`
          : `${filtered.length} of ${items.length} transactions`}
      </div>

      {/* Table */}
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-dim)', fontSize: 13 }}>
            No transactions match your filters.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const [y, m, d] = t.Date.split('T')[0].split('-').map(Number)
                const dateStr = new Date(y, m - 1, d).toLocaleDateString('en-CA')
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                      {dateStr}
                    </td>
                    <td style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.Description}
                    </td>
                    <td>
                      <span className={`badge ${t.Category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {t.Category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={t.Amount < 0 ? 'amount-negative' : 'amount-positive'}>
                        {t.Amount < 0 ? '-' : '+'}${Math.abs(t.Amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
