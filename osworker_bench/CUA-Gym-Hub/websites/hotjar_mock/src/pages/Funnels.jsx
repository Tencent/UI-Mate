import { useState } from 'react'
import { Plus, X, Trash2, Edit2, Check } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'

export default function Funnels() {
  const { state, dispatch } = useAppContext()
  const [selectedFunnel, setSelectedFunnel] = useState(state.funnels?.[0]?.id)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFunnelName, setNewFunnelName] = useState('')
  const [editingStepId, setEditingStepId] = useState(null)
  const [editStepName, setEditStepName] = useState('')
  const [editStepValue, setEditStepValue] = useState('')
  const [createError, setCreateError] = useState('')

  const funnels = (state.funnels || []).filter(f => f.siteId === state.activeSiteId)
  const funnel = funnels.find(f => f.id === selectedFunnel) || funnels[0]

  const maxVisitors = funnel?.steps?.[0]?.visitors || 1
  const overallConversion = funnel?.steps?.length > 1
    ? ((funnel.steps[funnel.steps.length - 1].visitors / funnel.steps[0].visitors) * 100).toFixed(1)
    : 0

  function handleAddStep() {
    if (!funnel) return
    const prevVisitors = funnel.steps.length > 0
      ? funnel.steps[funnel.steps.length - 1].visitors
      : 1000
    const newStep = {
      id: `step-${Date.now()}`,
      name: `Step ${funnel.steps.length + 1}`,
      type: 'page_url',
      value: '/new-step',
      visitors: Math.round(prevVisitors * 0.7),
      dropOffRate: 30,
      conversionRate: 70
    }
    dispatch({
      type: 'UPDATE_FUNNEL',
      payload: { id: funnel.id, updates: { steps: [...funnel.steps, newStep] } }
    })
  }

  function handleRemoveStep(stepId) {
    if (!funnel) return
    dispatch({
      type: 'UPDATE_FUNNEL',
      payload: { id: funnel.id, updates: { steps: funnel.steps.filter(s => s.id !== stepId) } }
    })
  }

  function handleCreateFunnel() {
    if (!newFunnelName.trim()) {
      setCreateError('Enter a funnel name before creating it.')
      return
    }
    const newId = `funnel-${Date.now()}`
    dispatch({
      type: 'CREATE_FUNNEL',
      payload: {
        id: newId,
        siteId: state.activeSiteId,
        name: newFunnelName.trim(),
        createdAt: new Date().toISOString(),
        steps: [
          { id: `step-${Date.now()}-1`, name: 'Step 1', type: 'page_url', value: '/', visitors: 1000, dropOffRate: 0, conversionRate: 100 }
        ]
      }
    })
    setSelectedFunnel(newId)
    setNewFunnelName('')
    setCreateError('')
    setShowCreateModal(false)
  }

  function startEditStep(step) {
    setEditingStepId(step.id)
    setEditStepName(step.name)
    setEditStepValue(step.value)
  }

  function saveEditStep() {
    if (!funnel || !editingStepId) return
    dispatch({
      type: 'UPDATE_FUNNEL',
      payload: {
        id: funnel.id,
        updates: {
          steps: funnel.steps.map(s =>
            s.id === editingStepId ? { ...s, name: editStepName, value: editStepValue } : s
          )
        }
      }
    })
    setEditingStepId(null)
  }

  function handleDeleteFunnel(funnelId) {
    const remaining = funnels.filter(f => f.id !== funnelId)
    // Remove from state by updating all funnels
    const allFunnels = (state.funnels || []).filter(f => f.id !== funnelId)
    dispatch({ type: 'SET_STATE', payload: { ...state, funnels: allFunnels } })
    if (remaining.length > 0) {
      setSelectedFunnel(remaining[0].id)
    } else {
      setSelectedFunnel(null)
    }
  }

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Funnels</h1>
          <p className="page-subtitle">Measure conversions and learn why users drop off</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} />
            Create funnel
          </button>
        </div>
      </div>

      {/* Funnel selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {funnels.map(f => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setSelectedFunnel(f.id)}
              style={{
                padding: '6px 16px', borderRadius: 20,
                border: `1px solid ${selectedFunnel === f.id || (!selectedFunnel && funnel?.id === f.id) ? '#FF3C00' : '#E5E7EB'}`,
                background: (selectedFunnel === f.id || (!selectedFunnel && funnel?.id === f.id)) ? '#FFF7F5' : '#FFFFFF',
                color: (selectedFunnel === f.id || (!selectedFunnel && funnel?.id === f.id)) ? '#FF3C00' : '#6B7280',
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {f.name}
            </button>
            <button
              className="header-icon-btn"
              style={{ width: 24, height: 24 }}
              onClick={() => handleDeleteFunnel(f.id)}
              title="Delete funnel"
            >
              <Trash2 size={12} color="#9CA3AF" />
            </button>
          </div>
        ))}
        {funnels.length === 0 && (
          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No funnels created yet. Create your first funnel to get started.</div>
        )}
      </div>

      {funnel && (
        <>
          {/* Steps */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Funnel steps</div>
            {funnel.steps?.map((step, idx) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FF3C00', color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>{idx + 1}</div>
                {editingStepId === step.id ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F9FAFB', borderRadius: 6, border: '1px solid #FF3C00' }}>
                    <input
                      className="input"
                      value={editStepName}
                      onChange={e => setEditStepName(e.target.value)}
                      placeholder="Step name"
                      style={{ flex: 1, fontSize: 13 }}
                    />
                    <input
                      className="input"
                      value={editStepValue}
                      onChange={e => setEditStepValue(e.target.value)}
                      placeholder="URL pattern"
                      style={{ flex: 1, fontSize: 13 }}
                    />
                    <button className="header-icon-btn" style={{ width: 28, height: 28, color: '#10B981' }} onClick={saveEditStep}><Check size={14} /></button>
                    <button className="header-icon-btn" style={{ width: 28, height: 28 }} onClick={() => setEditingStepId(null)}><X size={14} /></button>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F9FAFB', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#2D3038' }}>{step.name}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>·</span>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>{step.type === 'page_url' ? 'Viewed page contains' : 'Event'}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#FF3C00', fontFamily: 'monospace' }}>{step.value}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{step.visitors?.toLocaleString()} visitors</span>
                  </div>
                )}
                <button className="header-icon-btn" style={{ width: 28, height: 28 }} onClick={() => startEditStep(step)} title="Edit step"><Edit2 size={12} /></button>
                <button className="header-icon-btn" style={{ width: 28, height: 28 }} onClick={() => handleRemoveStep(step.id)} title="Remove step"><X size={14} /></button>
              </div>
            ))}
            <button className="btn-secondary" onClick={handleAddStep} style={{ marginTop: 4 }}>
              <Plus size={14} />
              Add step
            </button>
          </div>

          {/* Funnel visualization */}
          {funnel.steps?.length >= 2 ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 14, color: '#6B7280' }}>Overall conversion (all steps)</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>{overallConversion}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#6B7280' }}>Avg. time to convert</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#2D3038' }}>2:34m</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 200 }}>
                {funnel.steps?.map((step, idx) => {
                  const barHeight = (step.visitors / maxVisitors) * 100
                  const nextStep = funnel.steps[idx + 1]
                  const dropOff = nextStep ? step.visitors - nextStep.visitors : 0
                  const dropOffPct = step.visitors > 0 ? (dropOff / step.visitors * 100).toFixed(0) : 0

                  return (
                    <div key={step.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#2D3038' }}>{step.visitors.toLocaleString()}</div>
                      <div style={{ width: '100%', height: `${barHeight}%`, background: idx === 0 ? '#FF3C00' : `rgba(255, 60, 0, ${1 - (idx * 0.15)})`, borderRadius: '4px 4px 0 0', position: 'relative', minHeight: 4, transition: 'height 0.3s ease' }}>
                        {nextStep && dropOff > 0 && (
                          <div style={{ position: 'absolute', top: '50%', right: -30, transform: 'translateY(-50%)', fontSize: 11, color: '#EF4444', fontWeight: 600 }}>-{dropOffPct}%</div>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#6B7280', textAlign: 'center' }}>{step.name}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state" style={{ padding: 32 }}>
                <div style={{ fontSize: 14, color: '#6B7280' }}>Add at least 2 steps to view a funnel visualization.</div>
                <button className="btn-primary" style={{ marginTop: 12 }} onClick={handleAddStep}>
                  <Plus size={14} />
                  Add step
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Funnel Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 600, fontSize: 16 }}>Create new funnel</div>
              <button className="header-icon-btn" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label className="label">Funnel name</label>
              <input
                className="input"
                value={newFunnelName}
                onChange={e => setNewFunnelName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateFunnel()}
                placeholder="e.g. Checkout Funnel"
                autoFocus
              />
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>You can add steps to your funnel after creating it.</p>
              {createError && <p style={{ fontSize: 12, color: '#B91C1C', marginTop: 8 }}>{createError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateFunnel}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
