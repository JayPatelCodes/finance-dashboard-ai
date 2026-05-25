import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import AuthPage from './AuthPage'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import BudgetsPage from './pages/BudgetsPage'
import RecurringPage from './pages/RecurringPage'
import SettingsPage from './pages/SettingsPage'
import Chatbot from './components/Chatbot'
import { fetchTransactions, fetchInsights, fetchMonths, fetchForecast } from './api'
import type { Tx, ForecastData } from './api'

type Page = 'dashboard' | 'budgets' | 'recurring' | 'settings'

export default function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [tx, setTx] = useState<Tx[]>([])
  const [insights, setInsights] = useState<{ key: string; value: string }[]>([])
  const [months, setMonths] = useState<string[]>([])
  const [activeMonth, setActiveMonth] = useState<string | null>(null)
  const [forecast, setForecast] = useState<ForecastData>({ points: [], summary: '' })
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const refresh = async (month?: string | null) => {
    setDataLoading(true)
    const [items, ins, ms, fc] = await Promise.all([
      fetchTransactions(month ?? undefined),
      fetchInsights(),
      fetchMonths(),
      fetchForecast(),
    ])
    setTx(items)
    setInsights(ins)
    setMonths(ms)
    setForecast(fc)
    setDataLoading(false)
    if (month === undefined && ms.length > 0 && !activeMonth) {
      const latest = ms[ms.length - 1]
      setActiveMonth(latest)
      const fresh = await fetchTransactions(latest)
      setTx(fresh)
    }
  }

  useEffect(() => {
    if (user) refresh(activeMonth)
  }, [user])

  const handleMonthChange = async (month: string) => {
    setActiveMonth(month)
    setShowYearPicker(false)
    const items = await fetchTransactions(month)
    setTx(items)
  }

  const handleDataCleared = () => {
    setTx([])
    setInsights([])
    setMonths([])
    setActiveMonth(null)
    setForecast({ points: [], summary: '' })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="brand"><span className="brand-dot" />FinAI</div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <>
      <AppLayout activePage={page} onNavigate={setPage} onUploaded={() => refresh(activeMonth)}>
        {page === 'dashboard' && (
          <DashboardPage
            dataLoading={dataLoading}
            tx={tx}
            insights={insights}
            months={months}
            activeMonth={activeMonth}
            forecast={forecast}
            onMonthChange={handleMonthChange}
            onRefresh={(m) => { if (m === null) { setActiveMonth(null); refresh(null) } else refresh(m ?? undefined) }}
            showYearPicker={showYearPicker}
            setShowYearPicker={setShowYearPicker}
          />
        )}
        {page === 'budgets' && <BudgetsPage activeMonth={activeMonth} />}
        {page === 'recurring' && <RecurringPage />}
        {page === 'settings' && (
          <SettingsPage
            onDataCleared={handleDataCleared}
          />
        )}
      </AppLayout>
      <Chatbot />
    </>
  )
}
