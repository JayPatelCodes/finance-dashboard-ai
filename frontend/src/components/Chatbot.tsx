import { useState, useRef, useEffect } from 'react'
import { askChat } from '../api'

type Message = {
  role: 'user' | 'ai'
  text: string
}

const SUGGESTIONS = [
  'What did I spend the most on?',
  'Total spent this month?',
  'Average daily spending?',
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi! Ask me anything about your transactions — spending trends, top categories, or budget tips.' }
  ])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  const send = async (text?: string) => {
    const question = text ?? q
    if (!question.trim() || loading) return
    setQ('')
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setLoading(true)
    try {
      const ans = await askChat(question)
      setMessages(prev => [...prev, { role: 'ai', text: ans }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">✦</div>
              <div>
                <div className="chat-title">Finance AI</div>
                <div className="chat-subtitle">Powered by Gemini</div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <span className="chat-label">{m.role === 'ai' ? 'AI' : 'You'}</span>
                <div className="chat-bubble">{m.text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg ai">
                <span className="chat-label">AI</span>
                <div className="chat-bubble" style={{ opacity: 0.6 }}>Thinking…</div>
              </div>
            )}
            {/* Suggestions — only shown at start */}
            {messages.length === 1 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      background: 'rgba(79,142,247,0.08)',
                      border: '1px solid rgba(79,142,247,0.2)',
                      borderRadius: 10,
                      color: '#4f8ef7',
                      padding: '7px 12px',
                      fontSize: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >{s}</button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-footer">
            <input
              ref={inputRef}
              className="input"
              placeholder="Ask about your finances…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="button button-primary"
              onClick={() => send()}
              disabled={!q.trim() || loading}
              style={{ padding: '9px 14px', flexShrink: 0 }}
            >→</button>
          </div>
        </div>
      )}

      <button className="chat-fab" onClick={() => setIsOpen(!isOpen)} title="Open Finance AI">
        {isOpen ? '✕' : '✦'}
      </button>
    </div>
  )
}
