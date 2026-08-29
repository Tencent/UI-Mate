import React, { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Header from '../components/Header.jsx'
import DatePickerBar from '../components/DatePickerBar.jsx'
import BoardCard from '../components/BoardCard.jsx'
import { Plus, BarChart2, BarChart, GitBranch, RotateCcw, Type } from 'lucide-react'

export default function BoardPage() {
  const { boardId } = useParams()
  const { state, updateBoard, addReport } = useApp()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sid = searchParams.get('sid')
  const [activePreset, setActivePreset] = useState('30D')
  const [editingTitle, setEditingTitle] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)

  const board = state?.boards?.find(b => b.id === boardId)
  if (!board) return <div style={{ padding: 40, color: '#8E8EA0' }}>Board not found</div>

  const reports = state?.reports || []

  function navTo(path) {
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  function handleTitleSave(val) {
    updateBoard(boardId, { name: val })
    setEditingTitle(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header
        title={board.name}
        isFavorite={board.isFavorite}
        onFavorite={() => updateBoard(boardId, { isFavorite: !board.isFavorite })}
      />
      <DatePickerBar
        activePreset={activePreset}
        onPresetChange={setActivePreset}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          {editingTitle ? (
            <input
              autoFocus
              defaultValue={board.name}
              onBlur={e => handleTitleSave(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(e.target.value); if (e.key === 'Escape') setEditingTitle(false) }}
              style={{
                fontSize: 26, fontWeight: 700, color: '#1B1B2E',
                border: 'none', borderBottom: '2px solid #4F44E0',
                outline: 'none', background: 'transparent', width: '100%',
                letterSpacing: '-0.02em'
              }}
            />
          ) : (
            <h1 onClick={() => setEditingTitle(true)} style={{
              fontSize: 26, fontWeight: 700, color: '#1B1B2E',
              letterSpacing: '-0.02em', cursor: 'text',
              display: 'inline-block'
            }}>
              {board.name}
            </h1>
          )}
          {board.description && (
            <p style={{ fontSize: 14, color: '#8E8EA0', marginTop: 6 }}>{board.description}</p>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16
        }}>
          {board.items?.map(item => {
            if (item.type === 'report') {
              const report = reports.find(r => r.id === item.reportId)
              return (
                <BoardCard key={item.id} item={item} report={report}
                  onClick={() => report && navTo(`/report/${report.id}`)} />
              )
            }
            if (item.type === 'text') {
              return (
                <div key={item.id} style={{
                  background: '#fff', border: '1px solid #E4E4E8', borderRadius: 8,
                  padding: 20, fontSize: 14, color: '#1B1B2E', lineHeight: 1.6
                }}>
                  {item.content}
                </div>
              )
            }
            return null
          })}
        </div>

        <div style={{ marginTop: 24, position: 'relative' }}>
          <button onClick={() => setAddMenuOpen(v => !v)} style={{
            width: '100%', padding: '16px', border: '2px dashed #E4E4E8',
            borderRadius: 8, background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: '#8E8EA0', fontSize: 14, transition: 'border-color 0.15s, color 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F44E0'; e.currentTarget.style.color = '#4F44E0' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4E4E8'; e.currentTarget.style.color = '#8E8EA0' }}>
            <Plus size={16} />
            Add content
          </button>
          {addMenuOpen && (
            <AddContentMenu onClose={() => setAddMenuOpen(false)}
              boardId={boardId}
              onAdd={(item) => {
                updateBoard(boardId, { items: [...board.items, item] })
                setAddMenuOpen(false)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function AddContentMenu({ onClose, boardId, onAdd }) {
  const { addReport } = useApp()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sid = searchParams.get('sid')

  const items = [
    { key: 'insights', icon: <BarChart2 size={15} />, label: 'Insights Report', color: '#4F44E0' },
    { key: 'funnels', icon: <BarChart size={15} />, label: 'Funnels Report', color: '#EB5757' },
    { key: 'flows', icon: <GitBranch size={15} />, label: 'Flows Report', color: '#27AE60' },
    { key: 'retention', icon: <RotateCcw size={15} />, label: 'Retention Report', color: '#F5A623' },
    { key: 'text', icon: <Type size={15} />, label: 'Text', color: '#8E8EA0' },
  ]

  function handleSelect(key) {
    const typeMap = { insights: 'insights', funnels: 'funnels', flows: 'flows', retention: 'retention' }
    const type = typeMap[key]
    if (type) {
      const reportId = `report_new_${Date.now()}`
      const newReport = {
        id: reportId, name: 'Untitled', type, boardId,
        createdBy: 'user_001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        dateRange: { start: '2025-12-23', end: '2026-01-22', preset: '30D' }, granularity: 'Day',
        chartType: type === 'insights' ? 'line' : type,
        metrics: type === 'insights' ? [{ id: 'metric_a', label: 'A', name: 'Total Page View', events: [{ id: 'mevt_001', name: 'Page View', color: '#4F44E0' }], measurement: 'Total Events' }] : [],
        filters: [], breakdowns: [],
        ...(type === 'funnels' ? { steps: [{ id: 'step_a', label: 'A', eventName: 'Page View' }, { id: 'step_b', label: 'B', eventName: 'Sign Up' }], conversionCriteria: { timeWindow: '7 days', counting: 'Uniques' } } : {}),
        ...(type === 'flows' ? { flowConfig: { startEvent: 'Page View', depth: 4 } } : {}),
        ...(type === 'retention' ? { retentionConfig: { firstEvent: 'Page View', returnEvent: 'Any Event' } } : {}),
      }
      addReport(newReport)
      onAdd({ id: `bitem_${Date.now()}`, type: 'report', reportId, position: { x: 0, y: 0, w: 6, h: 4 }, title: 'Untitled' })
      navigate(sid ? `/report/${reportId}?sid=${sid}` : `/report/${reportId}`)
    } else if (key === 'text') {
      onAdd({ id: `bitem_${Date.now()}`, type: 'text', content: 'Add your text here...', position: { x: 0, y: 0, w: 12, h: 2 } })
    } else {
      onClose()
    }
  }

  React.useEffect(() => {
    const handler = () => onClose()
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [onClose])

  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 200,
      background: '#fff', border: '1px solid #E4E4E8', borderRadius: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: 4, marginBottom: 4
    }}>
      {items.map(item => (
        <button key={item.key} onClick={() => handleSelect(item.key)} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 4, border: 'none',
          background: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F7F7F8'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <span style={{ color: item.color, flexShrink: 0 }}>{item.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1B1B2E' }}>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
