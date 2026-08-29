import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'

const ICONS = {
  calendar: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  cloud: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
  dollar: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  mail: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  'credit-card': <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  video: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  message: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  file: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
}

export default function AppIntegrationsPage() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const integrations = state.appIntegrations || []
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const categories = ['All', ...Array.from(new Set(integrations.map(i => i.category)))]

  const filtered = integrations
    .filter(i => filter === 'All' || i.category === filter)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()))

  const handleToggle = (integration) => {
    dispatch({ type: 'TOGGLE_INTEGRATION', payload: { integrationId: integration.id } })
    addToast(integration.status === 'Connected' ? `${integration.name} disconnected` : `${integration.name} connected`)
  }

  const connected = integrations.filter(i => i.status === 'Connected').length
  const total = integrations.length

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">App Integrations</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 4 }}>Total Integrations</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{total}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 4 }}>Connected</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2E7D32' }}>{connected}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 4 }}>Available</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A73E8' }}>{total - connected}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ width: 260, height: 34 }}
          placeholder="Search integrations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid var(--border-color)', background: filter === c ? 'var(--primary)' : 'white', color: filter === c ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(integration => (
          <div key={integration.id} className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: integration.status === 'Connected' ? '#E3F2FD' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: integration.status === 'Connected' ? '#1A73E8' : '#9AA0A6' }}>
              {ICONS[integration.icon] || ICONS.file}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{integration.name}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500, background: integration.status === 'Connected' ? '#E8F5E9' : '#F5F5F5', color: integration.status === 'Connected' ? '#2E7D32' : '#9AA0A6' }}>
                  {integration.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 4 }}>{integration.description}</div>
              <div style={{ fontSize: 11, color: '#9AA0A6', marginBottom: 10 }}>
                Category: {integration.category}
                {integration.connectedAt && ` | Connected: ${new Date(integration.connectedAt).toLocaleDateString()}`}
              </div>
              <button
                onClick={() => handleToggle(integration)}
                style={{
                  padding: '5px 14px', borderRadius: 5, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  background: integration.status === 'Connected' ? 'white' : 'var(--primary)',
                  color: integration.status === 'Connected' ? '#C62828' : 'white',
                  borderColor: integration.status === 'Connected' ? '#C62828' : 'var(--primary)',
                }}
              >
                {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: '#9AA0A6', gridColumn: '1 / -1' }}>
            No integrations match your search
          </div>
        )}
      </div>
    </div>
  )
}
