import type { Tx } from '../api'

export default function TransactionsTable({ items }: { items: Tx[] }) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⬡</div>
        <p style={{ margin: 0 }}>No transactions yet. Upload a CSV to get started.</p>
      </div>
    )
  }

  return (
    <div style={{ maxHeight: 460, overflowY: 'auto' }}>
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
          {items.map((t, i) => (
            <tr key={i}>
              <td style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                {new Date(t.Date).toLocaleDateString('en-CA')}
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
