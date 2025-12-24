import React, { useEffect, useState } from 'react'
import UploadForm from './components/UploadForm'
import InvoiceList from './components/InvoiceList'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Invoice Manager</h1>
      <UploadForm onUploaded={() => setRefreshKey(k => k + 1)} />
      <hr />
      <InvoiceList refreshKey={refreshKey} />
    </div>
  )
}
