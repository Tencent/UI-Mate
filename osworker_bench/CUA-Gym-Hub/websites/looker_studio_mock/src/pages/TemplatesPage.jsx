import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

const CATEGORY_COLORS = {
  Marketing: '#4285F4',
  Sales: '#34A853',
  Finance: '#FBBC04',
  Operations: '#FF6D01',
  HR: '#EA4335'
}

const CATEGORIES = ['All', 'Marketing', 'Sales', 'Finance', 'Operations', 'HR']

export default function TemplatesPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [selectedCat, setSelectedCat] = React.useState('All')

  const filtered = state.templates.filter(t => selectedCat === 'All' || t.category === selectedCat)

  const createFromTemplate = (template) => {
    const id = `rpt_${Date.now()}`
    const now = new Date().toISOString()
    dispatch({
      type: 'CREATE_REPORT', payload: {
        id, name: template.name,
        ownerId: state.user.id, ownerName: state.user.name, ownerEmail: state.user.email,
        createdAt: now, modifiedAt: now, lastOpenedAt: now,
        thumbnailColor: template.thumbnailColor, starred: false, shared: false, trashed: false, sharedWith: [],
        dataSources: [], pages: [], currentPageId: null
      }
    })
    navigate(`/report/${id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Roboto, sans-serif' }}>
      {/* Header */}
      <div style={{ height: '56px', background: 'white', borderBottom: '1px solid #DADCE0', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px', flexShrink: 0 }}>
        <button className="icon-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#202124', margin: 0 }}>Template Gallery</h1>
      </div>

      {/* Category tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #DADCE0', display: 'flex', padding: '0 24px', gap: '4px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            style={{
              background: 'none', border: 'none',
              borderBottom: selectedCat === cat ? '2px solid #1A73E8' : '2px solid transparent',
              padding: '12px 16px', fontSize: '14px',
              color: selectedCat === cat ? '#1A73E8' : '#5F6368',
              fontWeight: selectedCat === cat ? 500 : 400,
              cursor: 'pointer', marginBottom: '-1px'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#F8F9FA' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {filtered.map(template => (
            <div
              key={template.id}
              style={{
                width: '220px',
                background: 'white',
                border: '1px solid #DADCE0',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              onClick={() => createFromTemplate(template)}
            >
              {/* Thumbnail */}
              <div style={{ height: '140px', background: template.thumbnailColor, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                <BarChart2 size={48} color="white" />
              </div>
              {/* Info */}
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#202124', marginBottom: '4px' }}>{template.name}</div>
                <div style={{ fontSize: '12px', color: '#5F6368', marginBottom: '8px', lineHeight: 1.4 }}>{template.description}</div>
                <span style={{
                  fontSize: '11px',
                  background: CATEGORY_COLORS[template.category] || '#4285F4',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {template.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
