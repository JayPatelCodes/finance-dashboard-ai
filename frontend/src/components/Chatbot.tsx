import { useState } from 'react'
import { askChat } from '../api'

export default function Chatbot(){
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!q) return
    setLoading(true)
    const ans = await askChat(q)
    setA(ans)
    setLoading(false)
  }

  return (
    <div className="card">
      <h3>Ask Your Spending AI</h3>
      <input className="input" placeholder="e.g. What's my top category?" value={q} onChange={e=>setQ(e.target.value)} />
      <div style={{ marginTop: 8 }}>
        <button className="button" onClick={ask} disabled={!q || loading}>{loading ? 'Thinking…' : 'Ask'}</button>
      </div>
      {a && <p style={{ marginTop: 12 }}>{a}</p>}
    </div>
  )
}