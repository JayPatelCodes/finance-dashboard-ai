import RecurringTransactions from '../components/RecurringTransactions'

export default function RecurringPage() {
  return (
    <div>
      <header className="main-header" style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1>Recurring Transactions</h1>
        <p className="header-meta">Transactions that appear regularly in your history</p>
      </header>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card">
          <RecurringTransactions />
        </div>
      </div>
    </div>
  )
}
