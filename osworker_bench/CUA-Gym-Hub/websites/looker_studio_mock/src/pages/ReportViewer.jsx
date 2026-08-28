import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit2, Share2, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Canvas from '../components/editor/Canvas'
import PageTabs from '../components/editor/PageTabs'

export default function ReportViewer() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      dispatch({ type: 'SET_CURRENT_REPORT', payload: id })
      dispatch({ type: 'SET_EDITOR_MODE', payload: 'view' })
    }
  }, [id])

  const report = state.reports.find(r => r.id === id) || state.currentReport

  if (!report) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'Roboto, sans-serif' }}>
      {/* Simplified header */}
      <div style={{
        height: '56px', background: 'white', borderBottom: '1px solid #DADCE0',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px', flexShrink: 0
      }}>
        <button className="icon-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, fontSize: '18px', color: '#202124', fontWeight: 400 }}>{report.name}</div>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', border: '1px solid #DADCE0', borderRadius: '4px', background: 'white', fontSize: '14px', cursor: 'pointer' }}
          onClick={() => navigate(`/report/${id}`)}
        >
          <Edit2 size={16} />
          Edit
        </button>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => dispatch({ type: 'OPEN_SHARE_DIALOG', payload: id })}
        >
          <Share2 size={16} />
          Share
        </button>
      </div>

      {/* Canvas (view mode - no toolbars) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Canvas report={report} />
        <PageTabs report={report} />
      </div>
    </div>
  )
}
