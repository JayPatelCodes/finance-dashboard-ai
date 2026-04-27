import { useEffect, useState } from 'react'
import { fetchRecurring } from '../api'

type RecurringItem = {
  description: string
  occurrences: number
  avg_amount: number
  last_date: string
  type: 'income' | 'expense'
}

export default function RecurringTransactions() {
  const [items, setItems] = useState<RecurringItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecurring()
      .then(data => setItems(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Detecting recurring transactions…</div>

  if (items.length === 0) return (
    <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
      No recurring transactions detected yet.
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '10px 14px',
        }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{item.description}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
              {item.occurrences}× · last {item.last_date}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 13,
              fontWeight: 600,
              color: item.type === 'income' ? 'var(--green)' : 'var(--red)',
            }}>
              {item.type === 'income' ? '+' : '-'}${Math.abs(item.avg_amount).toFixed(2)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>avg/occurrence</div>
          </div>
        </div>
      ))}
    </div>
  )
}
