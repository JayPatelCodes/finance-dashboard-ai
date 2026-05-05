import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { clearTransactions } from '../api'
import UploadArea from '../components/UploadArea'

type Props = { onDataCleared: () => void; onUploaded: () => void }

export default function SettingsPage({ onDataCleared, onUploaded }: Props) {
  const { user } = useAuth()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [cleared, setCleared] = useState(false)

  const handleClear = async () => {
    setClearing(true)
    await clearTransactions()
    setClearing(false)
    setShowClearConfirm(false)
    setCleared(true)
    onDataCleared()
    setTimeout(() => setCleared(false), 3000)
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
            <div className="user-avatar" style={{ width: 48, height: 48, fontSize: 20 }}>
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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

        {/* Import data */}
        <div className="card">
          <h3>Import Transactions</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 14px' }}>
            Upload a CSV with columns: Date, Description, Amount. Max 5MB.
          </p>
          <UploadArea onUploaded={onUploaded} />
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: 'rgba(240,92,92,0.2)' }}>
          <h3 style={{ color: 'var(--red)' }}>Danger Zone</h3>
          <div className="settings-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Clear all transaction data</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                Permanently deletes all your uploaded transactions. This cannot be undone.
              </div>
            </div>
            {showClearConfirm ? (
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="button danger-btn" onClick={handleClear} disabled={clearing}>
                  {clearing ? 'Deleting…' : 'Confirm'}
                </button>
                <button className="button" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              </div>
            ) : (
              <button className="button danger-btn" style={{ flexShrink: 0 }} onClick={() => setShowClearConfirm(true)}>
                Clear data
              </button>
            )}
          </div>
          {cleared && <p style={{ color: 'var(--green)', fontSize: 13, margin: '12px 0 0' }}>✓ All data cleared.</p>}
        </div>

      </div>
    </div>
  )
}
