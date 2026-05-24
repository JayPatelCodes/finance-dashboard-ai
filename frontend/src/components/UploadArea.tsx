import { useRef, useState, useEffect } from 'react'
import { uploadCsv } from '../api'
import toast from 'react-hot-toast'

export default function UploadArea({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (loading) {
      setProgress(5)
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          const increment = prev < 50 ? 4 : prev < 75 ? 2 : 0.5
          return Math.min(prev + increment, 90)
        })
      }, 500)
    } else {
      if (progressRef.current) clearInterval(progressRef.current)
      if (progress > 0) {
        setProgress(100)
        setTimeout(() => setProgress(0), 800)
      }
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [loading])

  const handleFile = (f: File | null) => {
    if (!f) return
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.name.toLowerCase().endsWith('.csv')) handleFile(f)
    else toast.error('Please drop a .csv file')
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const res = await uploadCsv(file)
      toast.success(`${res.inserted} transactions imported`)
      setFile(null)
      onUploaded()
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Upload failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div
        className="upload-drop-zone"
        onClick={() => !loading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{ cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}
      >
        <span className="upload-icon">⇪</span>
        {file
          ? <p style={{ color: '#e8eeff', fontWeight: 500, margin: '6px 0 0' }}>{file.name}</p>
          : <p style={{ margin: '6px 0 0' }}>Drop CSV or <span style={{ color: '#4f8ef7' }}>browse</span></p>
        }
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
          disabled={loading}
        />
      </div>

      {(loading || progress > 0) && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--accent-gradient)',
              borderRadius: 4,
              transition: progress === 100 ? 'width 0.3s ease' : 'width 0.5s ease',
            }} />
          </div>
          {loading && (
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0', textAlign: 'center' }}>
              Categorizing transactions… this may take a moment
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          className="button button-primary"
          style={{ flex: 1 }}
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? 'Importing…' : 'Import Transactions'}
        </button>

        <div style={{ position: 'relative' }}>
          <button
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
            }}
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
          >?</button>

          {showTip && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
              width: 220, background: '#0e1530',
              border: '1px solid var(--border-strong)', borderRadius: 10,
              padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)',
              lineHeight: 1.5, zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>CSV Format</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--accent)', marginBottom: 6 }}>
                Date, Description, Amount
              </div>
              <div>Amounts should be negative for expenses, positive for income. Max 5MB.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
