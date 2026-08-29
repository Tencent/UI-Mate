import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import EditorMenuBar from '../components/editor/EditorMenuBar'
import EditorToolbar from '../components/editor/EditorToolbar'
import Canvas from '../components/editor/Canvas'
import PropertiesPanel from '../components/editor/PropertiesPanel'
import PageTabs from '../components/editor/PageTabs'

export default function ReportEditor() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    const report = state.reports.find(r => r.id === id)
    if (report) {
      dispatch({ type: 'SET_CURRENT_REPORT', payload: id })
    }
  }, [id])

  const report = state.reports.find(r => r.id === id) || state.currentReport
  const isViewMode = state.editor.mode === 'view'

  if (!report) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#5F6368', fontFamily: 'Roboto, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Report not found</div>
          <button className="btn-primary" onClick={() => navigate('/')}>Go home</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F0F0F0', fontFamily: 'Roboto, sans-serif' }}>
      {/* Menu bar */}
      <EditorMenuBar report={report} />

      {/* Toolbar (edit mode only) */}
      {!isViewMode && <EditorToolbar report={report} />}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Canvas + Page tabs */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Canvas report={report} />
          <PageTabs report={report} />
        </div>

        {/* Properties panel (edit mode only) */}
        {!isViewMode && <PropertiesPanel />}
      </div>
    </div>
  )
}
