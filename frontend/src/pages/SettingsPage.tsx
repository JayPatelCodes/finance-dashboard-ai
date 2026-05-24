import toast from 'react-hot-toast'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { clearTransactions } from '../api'

type Props = { onDataCleared: () => void }

export default function SettingsPage({ onDataCleared }: Props) {
  const { user } = useAuth()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleClear = async () => {
    setClearing(true)
    await clearTransactions()
    setClearing(false)
    setShowClearConfirm(false)
    onDataCleared()
    toast.success('All transaction data cleared')
  }

  return (
    <div>
      <header className="main-header" style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1>Settings</h1>
        <p className="header-meta">Manage your account and data</p>
      </header>

      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Account info */}
        <div className="card">
          <h3>Account</h3>
          <div className="settings-row">
            <div className="user-avatar" style={{ width: 48, height: 48, fontSize: 20, flexShrink: 0 }}>
              {user?.avatar
                ? <img src={user.avatar} alt={user?.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user?.name[0].toUpperCase()
              }
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 2 }}>
                {user?.avatar ? 'Google account' : 'Email account'}
              </div>
            </div>
          </div>
        </div>



        {/* AI Data Processing Disclosure */}
        <div className="card">
          <h3>AI Data Processing</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 10px' }}>
            FinAI uses Google Gemini to power transaction categorization and the financial chatbot.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 10px' }}>
            When you upload a CSV, your transaction descriptions are sent to Google Gemini for classification. When you use the chatbot, a summary of your financial data including total income, spending by category, and recent transactions is included in each request.
          </p>
          <p style={{ color: 'var(--text-dim)', fontSize: 12, margin: 0 }}>
            This data is processed according to{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              Google's Privacy Policy
            </a>
            . No data is sold or shared with third parties beyond Google's API infrastructure.
          </p>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: 'rgba(240,92,92,0.2)' }}>
          <h3 style={{ color: 'var(--red)' }}>Danger Zone</h3>
          <div className="settings-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Clear all transaction data</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                Permanently deletes all your uploaded transactions and cannot be undone.
              </div>
            </div>
            <div style={{ flexShrink: 0, marginLeft: 16 }}>
              {showClearConfirm ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="button danger-btn" onClick={handleClear} disabled={clearing}>
                    {clearing ? 'Deleting…' : 'Confirm'}
                  </button>
                  <button className="button" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                </div>
              ) : (
                <button className="button danger-btn" onClick={() => setShowClearConfirm(true)}>
                  Clear data
                </button>
              )}
            </div>
          </div>
          
        </div>

      </div>
    </div>
  )
}
