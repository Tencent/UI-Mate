import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Database } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatDistanceToNow } from 'date-fns'
import ConnectorDialog from '../components/shared/ConnectorDialog'

function getRelativeTime(dateStr) {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }) } catch (e) { return '' }
}

const DS_ICONS = {
  google_analytics: '📊',
  google_ads: '📢',
  google_sheets: '📋',
  bigquery: '🗄️',
  mysql: '🐬',
  postgresql: '🐘',
  csv: '📄',
  search_console: '🔍',
  default: '🗄️'
}

export default function DataSourcesPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Roboto, sans-serif' }}>
      {/* Header */}
      <div style={{ height: '56px', background: 'white', borderBottom: '1px solid #DADCE0', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px', flexShrink: 0 }}>
        <button className="icon-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#202124', margin: 0 }}>Data Sources</h1>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={() => dispatch({ type: 'OPEN_CONNECTOR_DIALOG' })}>+ Create data source</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#F8F9FA' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ background: 'white', border: '1px solid #DADCE0', borderRadius: '4px', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'flex', padding: '12px 16px', borderBottom: '1px solid #DADCE0', background: '#F8F9FA' }}>
              <div style={{ flex: 2, fontSize: '12px', fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</div>
              <div style={{ flex: 1, fontSize: '12px', fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</div>
              <div style={{ flex: 1, fontSize: '12px', fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fields</div>
              <div style={{ flex: 1, fontSize: '12px', fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Owner</div>
              <div style={{ flex: 1, fontSize: '12px', fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last modified</div>
            </div>

            {state.dataSources.map(ds => (
              <div
                key={ds.id}
                style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F1F3F4', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8F9FA'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{DS_ICONS[ds.type] || DS_ICONS.default}</span>
                  <span style={{ fontSize: '14px', color: '#202124' }}>{ds.name}</span>
                </div>
                <div style={{ flex: 1, fontSize: '13px', color: '#5F6368' }}>{ds.type.replace(/_/g, ' ')}</div>
                <div style={{ flex: 1, fontSize: '13px', color: '#5F6368' }}>{ds.fields?.length || 0} fields</div>
                <div style={{ flex: 1, fontSize: '13px', color: '#5F6368' }}>{ds.ownerName}</div>
                <div style={{ flex: 1, fontSize: '13px', color: '#5F6368' }}>{getRelativeTime(ds.modifiedAt)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', fontSize: '14px', color: '#5F6368', textAlign: 'center' }}>
            {state.dataSources.length} data source{state.dataSources.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {state.connectorDialog?.open && <ConnectorDialog />}
    </div>
  )
}
