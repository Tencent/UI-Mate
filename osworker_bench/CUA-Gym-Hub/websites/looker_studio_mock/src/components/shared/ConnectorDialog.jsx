import React, { useState } from 'react'
import { X, Database } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CONNECTORS = [
  { type: 'google_analytics', name: 'Google Analytics', icon: 'analytics', color: '#E37400' },
  { type: 'google_ads', name: 'Google Ads', icon: 'ads', color: '#4285F4' },
  { type: 'google_sheets', name: 'Google Sheets', icon: 'sheets', color: '#34A853' },
  { type: 'bigquery', name: 'BigQuery', icon: 'bq', color: '#4285F4' },
  { type: 'mysql', name: 'MySQL', icon: 'mysql', color: '#00758F' },
  { type: 'postgresql', name: 'PostgreSQL', icon: 'pg', color: '#336791' },
  { type: 'csv', name: 'File Upload (CSV)', icon: 'csv', color: '#5F6368' },
  { type: 'search_console', name: 'Search Console', icon: 'sc', color: '#4285F4' }
]

const CONNECTOR_ICONS = {
  analytics: (color) => <span style={{ fontSize: '24px' }}>{'📊'}</span>,
  ads: (color) => <span style={{ fontSize: '24px' }}>{'📢'}</span>,
  sheets: (color) => <span style={{ fontSize: '24px' }}>{'📋'}</span>,
  bq: (color) => <span style={{ fontSize: '24px' }}>{'🗄️'}</span>,
  mysql: (color) => <span style={{ fontSize: '24px' }}>{'🐬'}</span>,
  pg: (color) => <span style={{ fontSize: '24px' }}>{'🐘'}</span>,
  csv: (color) => <span style={{ fontSize: '24px' }}>{'📄'}</span>,
  sc: (color) => <span style={{ fontSize: '24px' }}>{'🔍'}</span>,
}

export default function ConnectorDialog() {
  const { state, dispatch } = useApp()
  const [step, setStep] = useState('select') // 'select' | 'configure'
  const [selectedType, setSelectedType] = useState(null)
  const [dsName, setDsName] = useState('')
  const [search, setSearch] = useState('')

  const filteredConnectors = CONNECTORS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    if (!dsName.trim() || !selectedType) return
    const connector = CONNECTORS.find(c => c.type === selectedType)
    const newDs = {
      id: `ds_${Date.now()}`,
      name: dsName.trim(),
      type: selectedType,
      connectorIcon: connector?.icon || 'default',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      ownerId: state.user.id,
      ownerName: state.user.name,
      fields: [
        { id: 'dim_date', name: 'Date', type: 'date', category: 'dimension' },
        { id: 'dim_category', name: 'Category', type: 'text', category: 'dimension' },
        { id: 'met_value', name: 'Value', type: 'number', category: 'metric', aggregation: 'SUM' }
      ],
      data: []
    }
    dispatch({ type: 'ADD_DATA_SOURCE', payload: newDs })
    dispatch({ type: 'CLOSE_CONNECTOR_DIALOG' })
  }

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_CONNECTOR_DIALOG' })}>
      <div className="modal" style={{ width: '560px', padding: 0, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #DADCE0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#202124' }}>
              {step === 'select' ? 'Connect to data' : 'Configure data source'}
            </div>
            <button className="icon-btn" onClick={() => dispatch({ type: 'CLOSE_CONNECTOR_DIALOG' })}>
              <X size={20} />
            </button>
          </div>
          {step === 'select' && (
            <input
              type="text"
              placeholder="Search connectors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginTop: '12px', width: '100%', padding: '10px 12px', border: '1px solid #DADCE0', borderRadius: '24px', fontSize: '14px', color: '#202124' }}
            />
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {step === 'select' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {filteredConnectors.map(connector => (
                <div
                  key={connector.type}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '16px', border: '1px solid #DADCE0', borderRadius: '8px',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4285F4'; e.currentTarget.style.background = '#F8F9FA' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#DADCE0'; e.currentTarget.style.background = 'white' }}
                  onClick={() => {
                    setSelectedType(connector.type)
                    setDsName(`My ${connector.name} Data`)
                    setStep('configure')
                  }}
                >
                  {CONNECTOR_ICONS[connector.icon]?.(connector.color) || <Database size={24} color={connector.color} />}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#202124' }}>{connector.name}</div>
                    <div style={{ fontSize: '12px', color: '#5F6368' }}>Google connector</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#5F6368', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  Data source name
                </label>
                <input
                  type="text"
                  value={dsName}
                  onChange={e => setDsName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ padding: '16px', background: '#F8F9FA', borderRadius: '8px', color: '#5F6368', fontSize: '13px' }}>
                <div style={{ fontWeight: 500, color: '#202124', marginBottom: '8px' }}>
                  Connector: {CONNECTORS.find(c => c.type === selectedType)?.name}
                </div>
                <div>The data source will be created with default schema fields. You can customize fields after creation.</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid #DADCE0', flexShrink: 0 }}>
          {step === 'configure' ? (
            <>
              <button className="btn-secondary" onClick={() => setStep('select')}>Back</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!dsName.trim()}>Connect</button>
            </>
          ) : (
            <>
              <div />
              <button className="btn-secondary" onClick={() => dispatch({ type: 'CLOSE_CONNECTOR_DIALOG' })}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
