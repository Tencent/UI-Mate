import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Plus, X, ChevronDown, ChevronRight, ChevronLeft, Check, ArrowLeft } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { withCurrentSearch } from '../utils/navigation.js'

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function SurveysList() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()

  const surveys = state.surveys || []

  const statusColors = { active: 'green', draft: 'grey', paused: 'yellow', completed: 'blue' }

  function deleteSurvey(id, e) {
    e.stopPropagation()
    dispatch({ type: 'DELETE_SURVEY', payload: id })
  }

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Surveys</h1>
          <p className="page-subtitle">Collect feedback directly from your visitors</p>
        </div>
        <button className="btn-primary" onClick={() => navigate(withCurrentSearch('/surveys/new', location.search))}>
          <Plus size={16} />
          Create survey
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Survey name</th>
              <th>Status</th>
              <th>Responses</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {surveys.map(survey => (
              <tr key={survey.id} style={{ cursor: 'pointer' }} onClick={() => navigate(withCurrentSearch(`/surveys/${survey.id}`, location.search))}>
                <td style={{ fontWeight: 500 }}>{survey.name}</td>
                <td>
                  <span className={`badge badge-${statusColors[survey.status] || 'grey'}`}>
                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                  </span>
                </td>
                <td>{survey.responsesCount?.toLocaleString()}</td>
                <td style={{ color: '#6B7280' }}>{formatDate(survey.createdAt)}</td>
                <td>
                  <button className="header-icon-btn" onClick={e => deleteSurvey(survey.id, e)} title="Delete">
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {surveys.length === 0 && (
          <div className="empty-state" style={{ padding: 48 }}>
            <div className="empty-state-title">No surveys yet</div>
            <p style={{ marginBottom: 16 }}>Create your first survey to start collecting feedback</p>
            <button className="btn-primary" onClick={() => navigate(withCurrentSearch('/surveys/new', location.search))}>
              <Plus size={16} />
              Create survey
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const QUESTION_TYPES = [
  { value: 'reaction', label: 'Reaction' },
  { value: 'long_text', label: 'Long text' },
  { value: 'short_text', label: 'Short text' },
  { value: 'email', label: 'Email' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'nps', label: 'NPS' },
  { value: 'rating', label: 'Rating' },
  { value: 'statement', label: 'Statement' },
]

const SURVEY_TYPES = [
  { value: 'popover', label: 'Popover', desc: 'Small card that appears on the page' },
  { value: 'button', label: 'Button', desc: 'Triggered by a button click' },
  { value: 'embedded', label: 'Embedded', desc: 'Embedded in your page content' },
  { value: 'fullscreen', label: 'Full screen', desc: 'Takes over the entire screen' },
  { value: 'link', label: 'Link', desc: 'Shareable link survey' },
]

export function SurveyBuilder() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState('type')
  const [surveyType, setSurveyType] = useState('popover')
  const [surveyName, setSurveyName] = useState('New survey')
  const [questions, setQuestions] = useState([
    { id: 'nq-1', type: 'reaction', text: 'How would you rate your experience?', required: true, options: [], scaleMax: 5, logic: null }
  ])
  const [expandedSection, setExpandedSection] = useState('type')
  const [previewDevice, setPreviewDevice] = useState('desktop')

  function addQuestion() {
    setQuestions([...questions, {
      id: `nq-${Date.now()}`,
      type: 'short_text',
      text: '',
      required: false,
      options: [],
      scaleMax: null,
      logic: null
    }])
  }

  function updateQuestion(idx, field, value) {
    setQuestions(questions.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }

  function removeQuestion(idx) {
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  function handleCreate() {
    const newSurvey = {
      id: `survey-${Date.now()}`,
      siteId: state.activeSiteId,
      name: surveyName,
      status: 'draft',
      createdAt: new Date().toISOString(),
      responsesCount: 0,
      questions,
      appearance: { position: 'bottom-right', color: '#FF3C00', widgetType: surveyType },
      behavior: { showOnUrl: '*', showAfterSeconds: 5, showOnDevice: 'all', triggerEvent: null },
      responses: []
    }
    dispatch({ type: 'CREATE_SURVEY', payload: newSurvey })
    navigate(withCurrentSearch('/surveys', location.search))
  }

  const sections = [
    { id: 'type', label: 'Type', done: true },
    { id: 'questions', label: 'Questions', done: false },
    { id: 'appearance', label: 'Appearance', done: false },
    { id: 'targeting', label: 'Targeting', done: false },
  ]

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#F9FAFB' }}>
      {/* Left panel */}
      <div style={{ width: 420, minWidth: 420, background: '#FFFFFF', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="header-icon-btn" onClick={() => navigate(withCurrentSearch('/surveys', location.search))}><X size={18} /></button>
          <div>
            <input
              value={surveyName}
              onChange={e => setSurveyName(e.target.value)}
              style={{ fontSize: 16, fontWeight: 600, border: 'none', outline: 'none', fontFamily: 'inherit', color: '#2D3038', width: '100%' }}
            />
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn-primary" onClick={handleCreate}>Create survey</button>
        </div>

        {/* Sections accordion */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {sections.map(section => (
            <div key={section.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', background: expandedSection === section.id ? '#F9FAFB' : '#FFFFFF' }}
                onClick={() => setExpandedSection(expandedSection === section.id ? '' : section.id)}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: section.done ? '#10B981' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {section.done && <Check size={12} color="white" />}
                </div>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{section.label}</span>
                {section.done && <span className="badge badge-green">Done</span>}
                <div style={{ flex: 1 }} />
                {expandedSection === section.id ? <ChevronDown size={16} color="#6B7280" /> : <ChevronRight size={16} color="#6B7280" />}
              </div>

              {expandedSection === section.id && (
                <div style={{ padding: '0 16px 16px' }}>
                  {section.id === 'type' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {SURVEY_TYPES.map(type => (
                        <div
                          key={type.value}
                          onClick={() => setSurveyType(type.value)}
                          style={{
                            padding: '12px', borderRadius: 8,
                            border: `2px solid ${surveyType === type.value ? '#FF3C00' : '#E5E7EB'}`,
                            cursor: 'pointer', background: surveyType === type.value ? '#FFF7F5' : '#FFFFFF',
                            transition: 'border-color 0.15s'
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#2D3038', marginBottom: 4 }}>{type.label}</div>
                          <div style={{ fontSize: 12, color: '#6B7280' }}>{type.desc}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.id === 'questions' && (
                    <div>
                      {questions.map((q, idx) => (
                        <div key={q.id} className="card" style={{ marginBottom: 12, padding: 12 }}>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <select
                              value={q.type}
                              onChange={e => updateQuestion(idx, 'type', e.target.value)}
                              style={{ fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 4, padding: '4px 8px', fontFamily: 'inherit', color: '#2D3038', flex: 1 }}
                            >
                              {QUESTION_TYPES.map(qt => <option key={qt.value} value={qt.value}>{qt.label}</option>)}
                            </select>
                            <button className="header-icon-btn" onClick={() => removeQuestion(idx)}><X size={14} /></button>
                          </div>
                          <input
                            value={q.text}
                            onChange={e => updateQuestion(idx, 'text', e.target.value)}
                            placeholder="Question text..."
                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #D1D5DB', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                          />
                        </div>
                      ))}
                      <button className="btn-secondary" onClick={addQuestion} style={{ width: '100%', justifyContent: 'center' }}>
                        <Plus size={14} />
                        Add question
                      </button>
                    </div>
                  )}

                  {section.id === 'appearance' && (
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#2D3038', display: 'block', marginBottom: 4 }}>Position</label>
                        <select style={{ fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 4, padding: '6px 8px', fontFamily: 'inherit', width: '100%' }}>
                          <option>Bottom right</option>
                          <option>Center</option>
                          <option>Top right</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: '#2D3038', display: 'block', marginBottom: 4 }}>Button color</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="color" defaultValue="#FF3C00" style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                          <span style={{ fontSize: 13, color: '#6B7280' }}>#FF3C00</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'targeting' && (
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Device</div>
                        {['Desktop', 'Tablet', 'Mobile'].map(d => (
                          <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 6, cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                            {d}
                          </label>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Show after (seconds)</div>
                        <input type="number" defaultValue={5} style={{ width: '100%', padding: '6px 8px', border: '1px solid #D1D5DB', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div className="toggle-group">
            <button className={`toggle-btn ${previewDevice === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewDevice('desktop')}>Desktop</button>
            <button className={`toggle-btn ${previewDevice === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewDevice('mobile')}>Mobile</button>
          </div>
        </div>

        <div style={{ position: 'relative', width: previewDevice === 'mobile' ? 320 : 640, height: previewDevice === 'mobile' ? 520 : 400, background: '#F3F4F6', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {/* Mock page */}
          <div style={{ padding: 24 }}>
            <div style={{ height: 40, background: '#E5E7EB', borderRadius: 6, marginBottom: 12 }} />
            <div style={{ height: 100, background: '#E5E7EB', borderRadius: 8, marginBottom: 12 }} />
            <div style={{ height: 60, background: '#E5E7EB', borderRadius: 8 }} />
          </div>

          {/* Survey popover */}
          <div style={{ position: 'absolute', bottom: 12, right: 12, width: 240, background: '#FFFFFF', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3038', lineHeight: '18px' }}>
                {questions[0]?.text || 'How would you rate your experience?'}
              </div>
              <X size={12} color="#9CA3AF" style={{ cursor: 'pointer', flexShrink: 0, marginLeft: 8 }} />
            </div>
            {questions[0]?.type === 'reaction' && (
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {['😠', '😞', '😐', '😊', '😍'].map((emoji, i) => (
                  <div key={i} style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 24 }}>{emoji}</div>
                    <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>
                      {['Not good', 'Bad', 'Okay', 'Good', 'Amazing'][i]}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {questions[0]?.type === 'nps' && (
              <div style={{ display: 'flex', gap: 2 }}>
                {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div key={n} style={{ flex: 1, height: 24, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, cursor: 'pointer' }}>{n}</div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', textAlign: 'right' }}>Powered by xotjar</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SurveyDetail() {
  const { state, dispatch } = useAppContext()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeView, setActiveView] = useState('overview')

  const survey = state.surveys.find(s => s.id === id)
  if (!survey) return (
    <div className="content-area"><div>Survey not found</div></div>
  )

  const statusColors = { active: 'green', draft: 'grey', paused: 'yellow', completed: 'blue' }

  function toggleStatus() {
    const newStatus = survey.status === 'active' ? 'paused' : 'active'
    dispatch({ type: 'UPDATE_SURVEY', payload: { id: survey.id, updates: { status: newStatus } } })
  }

  return (
    <div className="content-area">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="header-icon-btn" onClick={() => navigate(withCurrentSearch('/surveys', location.search))}><ArrowLeft size={18} /></button>
        <h1 className="page-title" style={{ fontSize: 20, marginBottom: 0 }}>{survey.name}</h1>
        <span className={`badge badge-${statusColors[survey.status] || 'grey'}`}>
          {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
        </span>
        <div style={{ flex: 1 }} />
        <button className="btn-secondary" onClick={toggleStatus}>
          {survey.status === 'active' ? 'Pause survey' : 'Activate survey'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: 24 }}>
        {['overview', 'responses'].map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 500,
              color: activeView === view ? '#FF3C00' : '#6B7280',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${activeView === view ? '#FF3C00' : 'transparent'}`,
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1,
              textTransform: 'capitalize'
            }}
          >
            {view === 'overview' ? 'Overview' : 'Individual responses'}
          </button>
        ))}
      </div>

      {activeView === 'overview' ? (
        <div>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="metric-card">
              <div className="metric-label">Total responses</div>
              <div className="metric-value">{survey.responsesCount}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Completion rate</div>
              <div className="metric-value">{survey.responsesCount > 0 ? '87%' : '—'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Questions</div>
              <div className="metric-value">{survey.questions?.length || 0}</div>
            </div>
          </div>

          {/* Question results */}
          {survey.questions?.map((q, idx) => (
            <div key={q.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Q{idx + 1}: {q.text}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>{QUESTION_TYPES.find(t => t.value === q.type)?.label}</div>
              {q.type === 'nps' && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {[0,1,2,3,4,5,6,7,8,9,10].map(n => {
                    const count = survey.responses?.filter(r => r.answers?.[q.id] === String(n)).length || 0
                    const pct = survey.responsesCount > 0 ? (count / survey.responsesCount) * 100 : 0
                    return (
                      <div key={n} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <div style={{ width: '80%', height: `${Math.max(2, pct * 2)}px`, background: n >= 9 ? '#10B981' : n >= 7 ? '#F59E0B' : '#EF4444', borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{n}</div>
                      </div>
                    )
                  })}
                </div>
              )}
              {q.type === 'radio' && q.options?.length > 0 && (
                <div>
                  {q.options.map(opt => {
                    const count = survey.responses?.filter(r => r.answers?.[q.id] === opt).length || 0
                    const pct = survey.responsesCount > 0 ? (count / survey.responsesCount) * 100 : 0
                    return (
                      <div key={opt} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                          <span>{opt}</span>
                          <span style={{ color: '#6B7280' }}>{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#FF3C00', borderRadius: 3 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {q.type === 'reaction' && (
                <div style={{ display: 'flex', gap: 16 }}>
                  {['😠', '😞', '😐', '😊', '😍'].map((emoji, i) => {
                    const opts = q.options || ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
                    const opt = opts[i]
                    const count = survey.responses?.filter(r => r.answers?.[q.id] === opt).length || 0
                    return (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 28 }}>{emoji}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{count}</div>
                      </div>
                    )
                  })}
                </div>
              )}
              {['long_text', 'short_text'].includes(q.type) && (
                <div>
                  {survey.responses?.filter(r => r.answers?.[q.id]).slice(0, 3).map(r => (
                    <div key={r.id} style={{ padding: '8px 12px', background: '#F9FAFB', borderRadius: 6, marginBottom: 8, fontSize: 13, color: '#2D3038', fontStyle: 'italic' }}>
                      "{r.answers[q.id]}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Visitor</th>
                <th>Device</th>
                <th>Page</th>
              </tr>
            </thead>
            <tbody>
              {survey.responses?.map(r => (
                <tr key={r.id}>
                  <td style={{ color: '#6B7280' }}>{formatDate(r.submittedAt)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.visitorId}</td>
                  <td>{r.device}</td>
                  <td style={{ color: '#6B7280', fontSize: 12 }}>{r.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!survey.responses || survey.responses.length === 0) && (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="empty-state-title">No responses yet</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
