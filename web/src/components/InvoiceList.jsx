import React, { useEffect, useState } from 'react'

export default function InvoiceList({ refreshKey }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('http://localhost:4000/api/invoices')
        const data = await res.json()
        if (data.ok) setInvoices(data.invoices)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshKey])

  const handleDelete = async (id) => {
    if (!confirm('Delete invoice?')) return
    await fetch(`http://localhost:4000/api/invoices/${id}`, { method: 'DELETE' })
    // refresh
    const res = await fetch('http://localhost:4000/api/invoices')
    const data = await res.json()
    if (data.ok) setInvoices(data.invoices)
  }

  return (
    <div>
      <h2>Invoices</h2>
      {loading && <div>Loading...</div>}
      {!loading && invoices.length === 0 && <div>No invoices yet.</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {invoices.map(inv => (
          <li key={inv.id} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
            <div style={{ width: 100, height: 70, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a href={`http://localhost:4000/api/invoices/${inv.id}/file`} target="_blank" rel="noreferrer">Open</a>
            </div>
            <div style={{ flex: 1 }}>
              <div><strong>{inv.original_name}</strong></div>
              <div style={{ fontSize: 12, color: '#666' }}>{inv.mimetype} — {(inv.size/1024).toFixed(1)} KB</div>
              <div style={{ fontSize: 12, color: '#666' }}>{new Date(inv.created_at).toLocaleString()}</div>
            </div>
            <div>
              <button onClick={() => handleDelete(inv.id)} style={{ color: 'red' }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
