import BudgetGoals from '../components/BudgetGoals'

type Props = { activeMonth: string | null }

function fmtMonth(m: string) {
  const [y, mo] = m.split('-')
  return new Date(+y, +mo - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function BudgetsPage({ activeMonth }: Props) {
  return (
    <div>
      <header className="main-header" style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1>Budget Goals</h1>
        <p className="header-meta">
          {activeMonth ? `Tracking limits for ${fmtMonth(activeMonth)}` : 'Set spending limits per category'}
        </p>
      </header>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card">
          <BudgetGoals activeMonth={activeMonth} />
        </div>
      </div>
    </div>
  )
}
