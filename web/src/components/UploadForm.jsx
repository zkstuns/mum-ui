import React, { useState } from 'react'

export default function UploadForm({ onUploaded }) {
  const [files, setFiles] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!files || files.length === 0) return setMessage('Select at least one file')
    const form = new FormData()
    for (const f of files) form.append('files', f)

    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('http://localhost:4000/api/invoices/upload', {
        method: 'POST',
        body: form
      })
      const data = await res.json()
      if (data.ok) {
        setMessage('Uploaded ' + (data.files.length || 0) + ' file(s)')
        setFiles(null)
        onUploaded && onUploaded()
      } else {
        setMessage('Upload failed: ' + (data.error || 'unknown'))
      }
    } catch (err) {
      setMessage('Upload error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Upload invoices (PDF, JPG, PNG, TIFF):
        <input
          type="file"
          multiple
          accept="application/pdf,image/*"
          onChange={(e) => setFiles(e.target.files)}
        />
      </label>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={loading}>Upload</button>
      </div>
      <div style={{ marginTop: 8, color: 'green' }}>{message}</div>
    </form>
  )
}
