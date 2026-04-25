import { useRef, useState } from 'react'
import { uploadCsv } from '../api'

export default function UploadArea({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    setMsg(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.name.toLowerCase().endsWith('.csv')) handleFile(f)
    else setMsg({ text: 'Please drop a .csv file', type: 'error' })
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setMsg(null)
    try {
      const res = await uploadCsv(file)
      setMsg({ text: `✓ ${res.inserted} transactions imported`, type: 'success' })
      setFile(null)
      onUploaded()
    } catch (e: any) {
      setMsg({ text: e?.response?.data?.detail || 'Upload failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div
        className="upload-drop-zone"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <span className="upload-icon">⇪</span>
        {file
          ? <p style={{ color: '#e8eeff', fontWeight: 500 }}>{file.name}</p>
          : <p>Drop CSV or <span style={{ color: '#4f8ef7' }}>browse</span></p>
        }
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button
        className="button button-primary"
        style={{ width: '100%' }}
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? 'Importing…' : 'Import Transactions'}
      </button>

      {msg && (
        <div className={`upload-msg ${msg.type}`}>
          {msg.text}
        </div>
      )}
    </div>
  )
}
