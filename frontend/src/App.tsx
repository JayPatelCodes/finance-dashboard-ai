import { useEffect, useState } from 'react'
import UploadArea from './components/UploadArea'
import TransactionsTable from './components/TransactionsTable'
import Charts from './components/Charts'
import Chatbot from './components/Chatbot'
import { fetchTransactions, fetchInsights } from './api'
import type { Tx } from './api'

export default function App(){
  const [tx, setTx] = useState<Tx[]>([])
  const [insights, setInsights] = useState<{ key: string; value: string }[]>([])

  const refresh = async () => {
    const items = await fetchTransactions()
    setTx(items)
    const ins = await fetchInsights()
    setInsights(ins)
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="container">
      <h1>AI Personal Finance Dashboard</h1>
      <p>Upload a bank CSV to categorize transactions with AI, see insights, and forecast spending.</p>

      <div className="grid" style={{ marginTop: 16 }}>
        <UploadArea onUploaded={refresh} />
        <div className="card">
          <h3>Quick Insights</h3>
          <ul>
            {insights.map((i, idx) => <li key={idx}><b>{i.key.replaceAll('_',' ')}:</b> {i.value}</li>)}
            {!insights.length && <li>No data yet. Upload a CSV.</li>}
          </ul>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <Charts items={tx} />
        <Chatbot />
      </div>

      <div style={{ marginTop: 16 }}>
        <TransactionsTable items={tx} />
      </div>
    </div>
  )
}