'use client'
import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import { api } from '@/lib/api'
import { Settings, Upload, CheckCircle, Database } from 'lucide-react'

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null)
  const [datasets, setDatasets] = useState<any[]>([])
  const [datasetName, setDatasetName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    api.health().then(setHealth).catch(console.error)
    api.listDatasets().then(setDatasets).catch(console.error)
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !datasetName) return
    setUploading(true)
    setMsg(null)
    try {
      const res = await api.ingestDataset(file, datasetName)
      setMsg(`Dataset ingested successfully: ${res.row_count} rows. Status: ${res.validation_status}`)
      api.listDatasets().then(setDatasets)
    } catch (err: any) {
      setMsg(`Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Layout>
      <div style={{ padding: '28px 32px', maxWidth: 1000 }}>
        <PageHeader title="Settings & Datasets" subtitle="System configuration and FOCUS billing data management" />

        {/* System Health */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>System Health</div>
          {health ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>{health.status}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Database</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>{health.database}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>LLM Provider</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{health.llm_provider}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Version</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>v{health.version}</div>
              </div>
            </div>
          ) : <div>Checking system health…</div>}
        </div>

        {/* Upload FOCUS Dataset */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>Ingest Real FOCUS Billing Data</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Upload CSV or Parquet files conforming to FOCUS 1.0 / 1.0.1 specifications.
          </p>

          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Dataset Name</label>
              <input
                id="dataset-name-input"
                type="text"
                value={datasetName}
                onChange={e => setDatasetName(e.target.value)}
                placeholder="e.g. AWS Focus Q1 2024"
                required
                style={{ width: '100%', maxWidth: 400 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Billing File (CSV / Parquet)</label>
              <input
                id="file-input"
                type="file"
                accept=".csv,.parquet,.pq"
                onChange={e => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <button id="upload-btn" type="submit" disabled={uploading} className="btn btn-primary" style={{ width: 'fit-content' }}>
              <Upload size={14} />
              {uploading ? 'Ingesting…' : 'Ingest Dataset'}
            </button>
          </form>

          {msg && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 13 }}>
              {msg}
            </div>
          )}
        </div>

        {/* Installed Datasets */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Ingested Datasets ({datasets.length})</div>
          {datasets.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <Database size={24} />
              <span>No datasets ingested yet</span>
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Name</th><th>Rows</th><th>FOCUS Version</th><th>Status</th><th>Currency</th></tr></thead>
              <tbody>
                {datasets.map(d => (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.name}</td>
                    <td>{d.row_count?.toLocaleString()}</td>
                    <td>{d.focus_version}</td>
                    <td><span className={`badge badge-${d.validation_status?.toLowerCase()}`}>{d.validation_status}</span></td>
                    <td>{d.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
