import { useState } from 'react'
import { uploadCsv } from '../api'

export default function UploadArea({ onUploaded }: { onUploaded: () => void }){
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setMsg('')
    try {
      const res = await uploadCsv(file)
      setMsg(`Uploaded ${res.inserted} transactions`)
      onUploaded()
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3>Upload CSV</h3>
      <input className="input" type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} />
      <div style={{ marginTop: 8 }}>
        <button className="button" onClick={handleUpload} disabled={!file || loading}>
          {loading ? 'Uploading…' : 'Upload'}
        </button>
        {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
      </div>
    </div>
  )
}