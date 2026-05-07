import { useState, useMemo } from 'react'
import type { Tx } from '../api'
import { updateCategory } from '../api'

const CATEGORIES = ['Groceries', 'Dining', 'Transportation', 'Utilities', 'Rent', 'Entertainment', 'Other']
const FILTER_CATEGORIES = ['All', ...CATEGORIES]

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

function CategoryBadge({ tx, onUpdate }: { tx: Tx; onUpdate: (desc: string, cat: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChange = async (newCat: string) => {
    setSaving(true)
    setEditing(false)
    await updateCategory(tx.Description, newCat)
    onUpdate(tx.Description, newCat)
    setSaving(false)
  }

  if (editing) {
    return (
      <select
        className="input"
        style={{ fontSize: 11, padding: '2px 6px', height: 'auto', width: 130 }}
        defaultValue={tx.Category}
        onChange={e => handleChange(e.target.value)}
        onBlur={() => setEditing(false)}
        autoFocus
      >
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    )
  }

  return (
    <span
      className={`badge ${tx.Category.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={() => setEditing(true)}
      title="Click to edit category"
      style={{ cursor: 'pointer', opacity: saving ? 0.5 : 1 }}
    >
      {saving ? '…' : tx.Category}
    </span>
  )
}

export default function TransactionsTable({ items: initialItems }: { items: Tx[] }) {
  const [items, setItems] = useState<Tx[]>(initialItems)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [amountFilter, setAmountFilter] = useState<'all' | 'income' | 'expense'>('all')

  // Sync if parent passes new items (e.g. month change)
  useMemo(() => setItems(initialItems), [initialItems])

  const handleCategoryUpdate = (description: string, newCategory: string) => {
    setItems(prev => prev.map(t =>
      t.Description === description ? { ...t, Category: newCategory } : t
    ))
  }

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
        <select className="input" style={{ width: 140 }} value={category} onChange={e => setCategory(e.target.value)}>
          {FILTER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" style={{ width: 120 }} value={amountFilter} onChange={e => setAmountFilter(e.target.value as any)}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>
        <button className="button" onClick={() => exportToCsv(filtered)} disabled={filtered.length === 0} title="Export to CSV">
          ↓ Export
        </button>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10 }}>
        {filtered.length === items.length
          ? `${items.length} transactions · click a category badge to edit`
          : `${filtered.length} of ${items.length} transactions`}
      </div>

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
                      <CategoryBadge tx={t} onUpdate={handleCategoryUpdate} />
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
