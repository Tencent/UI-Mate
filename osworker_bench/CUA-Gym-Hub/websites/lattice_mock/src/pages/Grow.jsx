import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../utils/dataManager.js'

const RECOMMENDED = {
  title: 'Cultivating Advanced Analytical Skills',
  description: 'While I have demonstrated strong project management and collaboration skills, there is an opportunity to deepen analytical capabilities, particularly in data interpretation and application. This growth area will enhance my ability to make informed decisions that align with organizational goals.',
  actions: [
    'Enroll in the LMS course on Statistical Data Analysis Techniques to strengthen analytical skills and apply them to current projects.',
    'Request bi-weekly coaching sessions with the data analytics team lead to build practical skills.',
  ],
}

function GrowthAreaModal({ onClose, onSubmit, area = null }) {
  const [title, setTitle] = useState(area?.title || '')
  const [description, setDescription] = useState(area?.description || '')
  const [status, setStatus] = useState(area?.status || 'draft')
  const [actions, setActions] = useState(area?.actions?.map(a => a.text) || [''])

  const addAction = () => setActions(prev => [...prev, ''])
  const updateAction = (idx, val) => setActions(prev => prev.map((a, i) => i === idx ? val : a))
  const removeAction = (idx) => setActions(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = () => {
    if (!title.trim()) return
    const ga = {
      id: area?.id || `ga_${Date.now()}`,
      userId: 'user_1',
      title: title.trim(),
      description: description.trim(),
      status,
      actions: actions.filter(a => a.trim()).map((text, idx) => ({
        id: `ga_action_${Date.now()}_${idx}`,
        text: text.trim(),
        completed: false,
      })),
      createdAt: area?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSubmit(ga)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{area ? 'Edit Growth Area' : 'New Growth Area'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Name this growth area..." value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Describe your development goal..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="seg-control">
              <button className={`seg-btn${status === 'active' ? ' active' : ''}`} onClick={() => setStatus('active')}>Active</button>
              <button className={`seg-btn${status === 'draft' ? ' active' : ''}`} onClick={() => setStatus('draft')}>Draft</button>
            </div>
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Action Items</label>
              <button className="btn btn-outline btn-sm" onClick={addAction}>+ Add action</button>
            </div>
            {actions.map((action, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="form-input"
                  placeholder={`Action item ${idx + 1}...`}
                  value={action}
                  onChange={e => updateAction(idx, e.target.value)}
                />
                <button onClick={() => removeAction(idx)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!title.trim()}>
            {area ? 'Save Changes' : 'Create Growth Area'}
          </button>
        </div>
      </div>
    </div>
  )
}

function GrowthAreaCard({ area, onToggleAction, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const completedCount = area.actions.filter(a => a.completed).length
  const totalCount = area.actions.length

  return (
    <div className="card" style={{ marginBottom: 10, overflow: 'hidden' }}>
      <div
        style={{ padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>{area.title}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              {completedCount} of {totalCount} action{totalCount !== 1 ? 's' : ''} completed
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Last updated {formatDate(area.updatedAt)}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(90deg)' : '', transition: 'transform 0.2s', marginTop: 2 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #F3F4F6', padding: '12px 16px' }}>
          {area.description && (
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 12 }}>{area.description}</p>
          )}
          <div style={{ marginBottom: 12 }}>
            {area.actions.map(action => (
              <div key={action.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={action.completed}
                  onChange={() => onToggleAction(area.id, action.id)}
                  style={{ marginTop: 2, accentColor: '#6B4FBB', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: action.completed ? '#9CA3AF' : '#374151', textDecoration: action.completed ? 'line-through' : 'none', lineHeight: 1.4 }}>
                  {action.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => onEdit(area)}>Edit</button>
            <button
              onClick={() => onDelete(area.id)}
              style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const BEST_PRACTICES = [
  {
    title: 'Make growth areas specific and measurable',
    body: 'Vague goals like "improve communication" are hard to track. Instead, define concrete outcomes like "deliver 3 cross-functional presentations by Q3." Specificity makes progress visible and motivating.',
  },
  {
    title: 'Align your IDP with your career vision',
    body: 'Every growth area should connect to your longer-term career north star. Before adding a new area, ask: "Does this bring me closer to where I want to be in 2–3 years?"',
  },
  {
    title: 'Review and update your IDP regularly',
    body: 'Treat your IDP as a living document. Revisit it in every 1:1 with your manager, check off completed actions, and add new ones as your role evolves.',
  },
  {
    title: 'Use your manager as a thought partner',
    body: 'Share your career vision with your manager early. They can unlock opportunities — stretch assignments, cross-team projects, mentorship — that you may not have access to on your own.',
  },
]

function BestPracticesModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">IDP Best Practices</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {BEST_PRACTICES.map((bp, idx) => (
            <div key={idx} style={{ borderLeft: '3px solid #6B4FBB', paddingLeft: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>{bp.title}</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{bp.body}</div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  )
}

export default function Grow() {
  const { state, updateState } = useApp()
  const navigate = useNavigate()
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingArea, setEditingArea] = useState(null)
  const [showBestPractices, setShowBestPractices] = useState(false)
  const [careerVision, setCareerVision] = useState(state?.careerVision || 'North Star Goal')
  const [editingVision, setEditingVision] = useState(false)
  const [showRecommended, setShowRecommended] = useState(true)
  const [hideActive, setHideActive] = useState(false)
  const [hideDrafts, setHideDrafts] = useState(false)

  if (!state) return null
  const { currentUser, growthAreas, careerTracks } = state

  const currentTrack = careerTracks[0]
  const myGrowthAreas = growthAreas.filter(ga => ga.userId === currentUser.id)
  const active = myGrowthAreas.filter(ga => ga.status === 'active')
  const drafts = myGrowthAreas.filter(ga => ga.status === 'draft')
  const visionText = careerVision || 'North Star Goal'

  const handleCreateOrUpdate = (ga) => {
    updateState(prev => {
      const exists = prev.growthAreas.some(a => a.id === ga.id)
      return {
        ...prev,
        growthAreas: exists
          ? prev.growthAreas.map(a => a.id === ga.id ? ga : a)
          : [...prev.growthAreas, ga]
      }
    })
    setEditingArea(null)
  }

  const handleDeleteArea = (id) => {
    updateState(prev => ({ ...prev, growthAreas: prev.growthAreas.filter(ga => ga.id !== id) }))
  }

  const handleToggleAction = (gaId, actionId) => {
    updateState(prev => ({
      ...prev,
      growthAreas: prev.growthAreas.map(ga => {
        if (ga.id !== gaId) return ga
        return {
          ...ga,
          updatedAt: new Date().toISOString(),
          actions: ga.actions.map(a => a.id === actionId ? { ...a, completed: !a.completed } : a)
        }
      })
    }))
  }

  const handleAddDraft = () => {
    const ga = {
      id: `ga_${Date.now()}`,
      userId: currentUser.id,
      title: RECOMMENDED.title,
      description: RECOMMENDED.description,
      status: 'draft',
      actions: RECOMMENDED.actions.map((text, idx) => ({ id: `ga_rec_action_${idx}`, text, completed: false })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    updateState(prev => ({ ...prev, growthAreas: [...prev.growthAreas, ga] }))
    setShowRecommended(false)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '20px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #6B4FBB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E' }}>Grow</h1>
        </div>
        <button onClick={() => setShowBestPractices(true)} style={{ fontSize: 13, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>Best practices</button>
      </div>

      {/* Info banner */}
      <div style={{ margin: '16px 32px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#1E40AF', lineHeight: 1.5 }}>
        <strong>Welcome to your Individual development plan (IDP)</strong> — a space to plan and capture progress on your career development. Use the career vision exercises to clarify your long-term career objectives. Create growth areas to identify short-term development opportunities and track progress against them.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, padding: '0 32px 32px' }}>
        {/* Main IDP section */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Individual development plan</h2>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>CAREER TRACK</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A2E' }}>{currentTrack?.title || 'Product Manager'}</span>
              <button
                onClick={() => navigate('/grow/career-tracks')}
                style={{ fontSize: 12, color: '#6B4FBB', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Browse all
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CAREER VISION</div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            {editingVision ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  value={visionText}
                  onChange={e => setCareerVision(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setEditingVision(false)}
                  autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={() => { updateState(prev => ({ ...prev, careerVision: visionText })); setEditingVision(false) }}>Save</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#374151' }}>{visionText}</span>
                <button onClick={() => setEditingVision(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                  ✎
                </button>
              </div>
            )}
          </div>

          {/* Growth areas */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Growth areas</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setShowNewModal(true)}>+ New</button>
          </div>

          {/* Active */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACTIVE</span>
              <button onClick={() => setHideActive(v => !v)} style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                {hideActive ? 'Show' : 'Hide'}
              </button>
            </div>
            {!hideActive && (
              active.length === 0 ? (
                <div style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>No active growth areas</div>
              ) : (
                active.map(area => (
                  <GrowthAreaCard
                    key={area.id}
                    area={area}
                    onToggleAction={handleToggleAction}
                    onDelete={handleDeleteArea}
                    onEdit={(a) => setEditingArea(a)}
                  />
                ))
              )
            )}
          </div>

          {/* Drafts */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DRAFTS</span>
              <button onClick={() => setHideDrafts(v => !v)} style={{ fontSize: 12, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                {hideDrafts ? 'Show' : 'Hide'}
              </button>
            </div>
            {!hideDrafts && (
              drafts.length === 0 ? (
                <div style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>No draft growth areas</div>
              ) : (
                drafts.map(area => (
                  <GrowthAreaCard
                    key={area.id}
                    area={area}
                    onToggleAction={handleToggleAction}
                    onDelete={handleDeleteArea}
                    onEdit={(a) => setEditingArea(a)}
                  />
                ))
              )
            )}
          </div>
        </div>

        {/* Recommended panel */}
        {showRecommended && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 20, alignSelf: 'flex-start', position: 'sticky', top: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6B4FBB', textTransform: 'uppercase', letterSpacing: '1px', padding: '2px 8px', background: '#EFF6FF', borderRadius: 4 }}>
                ✦ RECOMMENDED GROWTH AREA
              </span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{RECOMMENDED.title}</h3>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Description</div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{RECOMMENDED.description}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Actions</div>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {RECOMMENDED.actions.map((action, idx) => (
                  <li key={idx} style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 6 }}>{action}</li>
                ))}
              </ul>
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
              AI Recommendations can be imperfect. <span style={{ color: '#6B4FBB', cursor: 'pointer' }}>See our guidance.</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowRecommended(false)}
                style={{ color: '#EF4444', borderColor: '#EF4444' }}
              >
                🗑 Delete
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleAddDraft}>
                + Add draft
              </button>
            </div>
          </div>
        )}
      </div>

      {(showNewModal || editingArea) && (
        <GrowthAreaModal
          area={editingArea}
          onClose={() => { setShowNewModal(false); setEditingArea(null) }}
          onSubmit={handleCreateOrUpdate}
        />
      )}
      {showBestPractices && <BestPracticesModal onClose={() => setShowBestPractices(false)} />}
    </div>
  )
}
