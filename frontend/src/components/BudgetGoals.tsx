import { useState, useEffect } from 'react'
import { fetchBudgets, createBudget, deleteBudget } from '../api'
import toast from 'react-hot-toast'

type Budget = {
  id: string
  category: string
  amount: number
  month: string | null
  spent: number
  percent: number
}

const CATEGORIES = ['Groceries', 'Dining', 'Transportation', 'Utilities', 'Rent', 'Entertainment', 'Other']
const BAR_COLOR = (pct: number) => pct >= 100 ? '#f05c5c' : pct >= 80 ? '#f5a623' : '#22c97a'

export default function BudgetGoals({ activeMonth }: { activeMonth: string | null }) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [isMonthly, setIsMonthly] = useState(true)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const data = await fetchBudgets(activeMonth ?? undefined)
    setBudgets(data)
  }

  useEffect(() => { load() }, [activeMonth])

  const handleCreate = async () => {
    if (!amount || isNaN(+amount) || +amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setLoading(true)
    try {
      await createBudget(category, +amount, isMonthly ? activeMonth : null)
      setAmount('')
      setShowForm(false)
      await load()
      toast.success(`Budget set for ${category}`)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to save budget')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, cat: string) => {
    try {
      await deleteBudget(id)
      await load()
      toast.success(`${cat} budget removed`)
    } catch {
      toast.error('Failed to remove budget')
    }
  }

  return (
    <div>
      {budgets.length === 0 && !showForm && (
        <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: '0 0 12px' }}>
          No budgets set. Add one to track your spending limits.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {budgets.map(b => (
          <div key={b.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{b.category}</span>
                {b.month && <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>{b.month}</span>}
                {!b.month && <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>every month</span>}
              </div>
              <button
                onClick={() => handleDelete(b.id, b.category)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                title="Remove budget"
              >✕</button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 6, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ width: `${b.percent}%`, height: '100%', background: BAR_COLOR(b.percent), borderRadius: 6, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: BAR_COLOR(b.percent), fontFamily: 'DM Mono, monospace' }}>${b.spent.toFixed(2)} spent</span>
              <span style={{ color: 'var(--text-dim)', fontFamily: 'DM Mono, monospace' }}>${b.amount.toFixed(2)} limit</span>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            className="input"
            type="number"
            placeholder="Monthly limit ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="1"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              id="monthly-toggle"
              checked={isMonthly}
              onChange={e => setIsMonthly(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            <label htmlFor="monthly-toggle">
              {isMonthly ? `Apply to ${activeMonth ?? 'current month'} only` : 'Apply every month'}
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button button-primary" onClick={handleCreate} disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Saving…' : 'Save Budget'}
            </button>
            <button className="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="button" style={{ width: '100%' }} onClick={() => setShowForm(true)}>
          + Add Budget
        </button>
      )}
    </div>
  )
}
