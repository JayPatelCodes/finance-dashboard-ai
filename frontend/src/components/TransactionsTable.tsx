import type { Tx } from '../api'

export default function TransactionsTable({ items }: { items: Tx[] }){
  return (
    <div className="card">
      <h3>Transactions</h3>
      <div style={{ maxHeight: 420, overflow: 'auto' }}>
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
                <td>{new Date(t.Date).toLocaleDateString()}</td>
                <td>{t.Description}</td>
                <td><span className="badge">{t.Category}</span></td>
                <td style={{ textAlign: 'right' }}>{t.Amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}