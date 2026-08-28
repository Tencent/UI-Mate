import React from 'react'
import HomeHeader from '../components/home/HomeHeader'
import TemplateGallery from '../components/home/TemplateGallery'
import ReportList from '../components/home/ReportList'
import ShareDialog from '../components/shared/ShareDialog'
import ConnectorDialog from '../components/shared/ConnectorDialog'
import { useApp } from '../context/AppContext'

const TABS = [
  { id: 'recent', label: 'Recent' },
  { id: 'owned', label: 'Owned by me' },
  { id: 'shared', label: 'Shared with me' },
  { id: 'trash', label: 'Trash' }
]

export default function HomePage() {
  const { state, dispatch } = useApp()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F8F9FA', overflow: 'hidden' }}>
      <HomeHeader />

      {/* Tab navigation */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #DADCE0',
        display: 'flex',
        padding: '0 24px',
        gap: '4px'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_HOME_VIEW', payload: tab.id })}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: state.home.view === tab.id ? '2px solid #1A73E8' : '2px solid transparent',
              padding: '12px 16px',
              fontSize: '14px',
              color: state.home.view === tab.id ? '#1A73E8' : '#5F6368',
              fontWeight: state.home.view === tab.id ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              marginBottom: '-1px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {(state.home.view === 'recent' || state.home.view === 'owned') && (
            <TemplateGallery />
          )}
          <ReportList />
        </div>
      </div>

      {state.shareDialog.open && <ShareDialog />}
      {state.connectorDialog?.open && <ConnectorDialog />}
    </div>
  )
}
