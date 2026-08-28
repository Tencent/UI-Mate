import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronRight, ChevronDown, Settings, X, AlertTriangle, Plus, Trash2, CheckCircle } from 'lucide-react'

const STEPS = ['Site Setup', 'Variants', 'Goals', 'Pages', 'Targeting', 'Advanced (Optional)']

export default function Experiment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()

  // Handle new experiment creation
  if (id === 'new') {
    const newId = `exp_${Date.now()}`
    const newExp = {
      id: newId,
      name: 'New Experiment',
      type: 'ab_test',
      subtype: 'web',
      status: 'draft',
      owner: state.currentUser.name,
      createdAt: new Date().toISOString(),
      variants: [
        { id: 'var_a', name: 'control', isControl: true, rolloutPercent: 50 },
        { id: 'var_b', name: 'treatment', isControl: false, rolloutPercent: 50 }
      ],
      goals: [{ metricName: 'Sign Up', type: 'success', direction: 'increase' }],
      pages: [{ url: '/' }],
      targeting: { segments: ['All Users'], percentage: 100 },
      rolloutPercent: 0,
      results: { winner: null, lift: null, pValue: null }
    }
    dispatch({ type: 'ADD_EXPERIMENT', payload: newExp })
    navigate(`/experiment/${newId}`, { replace: true })
    return null
  }

  const experiment = state.experiments ? state.experiments.find(e => e.id === id) : null
  const [activeStep, setActiveStep] = useState('Variants')
  const [rollout, setRollout] = useState(experiment?.rolloutPercent || 0)
  const [variants, setVariants] = useState(
    experiment?.variants?.map((v, i) => ({
      id: v.id, letter: String.fromCharCode(65 + i), name: v.name,
      tag: v.isControl ? 'Control' : null, rolloutPercent: v.rolloutPercent || 50
    })) || [
      { id: 'ctrl', letter: 'A', name: 'control', tag: 'Control', rolloutPercent: 50 },
      { id: 'trt', letter: 'B', name: 'treatment', tag: null, rolloutPercent: 50 }
    ]
  )
  const [goals, setGoals] = useState(
    experiment?.goals || [{ metricName: 'Sign Up', type: 'success', direction: 'increase' }]
  )
  const [pages, setPages] = useState(
    experiment?.pages || [{ url: '/' }]
  )
  const [targeting, setTargeting] = useState(
    experiment?.targeting || { segments: ['All Users'], percentage: 100 }
  )
  const [siteSetup, setSiteSetup] = useState({
    snippetInstalled: true,
    sdkVersion: 'xmplitude-ts-script/2.11.1',
    projectId: 'default'
  })
  const [advanced, setAdvanced] = useState({
    mutualExclusionGroup: '',
    holdoutGroup: '',
    stickyBucketing: true,
    statsEngine: 'bayesian'
  })

  if (!experiment) {
    return (
      <div style={{ padding: 40, color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Experiment not found</div>
        <button className="btn-outline" onClick={() => navigate('/experiments')}>Back to Experiments</button>
      </div>
    )
  }

  function handleSaveAndClose() {
    const updatedExp = {
      ...experiment,
      variants: variants.map(v => ({
        id: v.id, name: v.name, isControl: v.tag === 'Control', rolloutPercent: v.rolloutPercent
      })),
      goals,
      pages,
      targeting,
      rolloutPercent: rollout
    }
    dispatch({ type: 'UPDATE_EXPERIMENT', payload: updatedExp })
    navigate('/experiments')
  }

  function advanceStep() {
    const idx = STEPS.indexOf(activeStep)
    if (idx < STEPS.length - 1) setActiveStep(STEPS[idx + 1])
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', background: 'white' }}>
      {/* Left sidebar */}
      <div style={{ width: 220, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{experiment.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{experiment.type === 'ab_test' ? 'A/B Test' : experiment.type}, {experiment.subtype || 'Web'}</div>
        </div>
        <div style={{ flex: 1, padding: '12px 0' }}>
          {STEPS.map(step => {
            const isActive = step === activeStep
            return (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 16px', fontSize: 13, cursor: 'pointer',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  border: 'none', borderRight: 'none',
                  borderLeftStyle: 'solid', borderLeftWidth: isActive ? 3 : 0,
                  marginLeft: isActive ? 0 : 3,
                  transition: 'all 0.1s'
                }}
              >
                {step}
              </button>
            )
          })}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn-outline"
            style={{ width: '100%', fontSize: 12, height: 32 }}
            onClick={handleSaveAndClose}
          >
            Save All &amp; Close
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        {activeStep === 'Variants' && (
          <VariantsStep variants={variants} setVariants={setVariants} onNext={advanceStep} />
        )}
        {activeStep === 'Site Setup' && (
          <SiteSetupStep siteSetup={siteSetup} setSiteSetup={setSiteSetup} onNext={advanceStep} />
        )}
        {activeStep === 'Goals' && (
          <GoalsStep goals={goals} setGoals={setGoals} eventDefinitions={state.eventDefinitions} onNext={advanceStep} />
        )}
        {activeStep === 'Pages' && (
          <PagesStep pages={pages} setPages={setPages} onNext={advanceStep} />
        )}
        {activeStep === 'Targeting' && (
          <TargetingStep targeting={targeting} setTargeting={setTargeting} cohorts={state.cohorts} onNext={advanceStep} />
        )}
        {activeStep === 'Advanced (Optional)' && (
          <AdvancedStep advanced={advanced} setAdvanced={setAdvanced} />
        )}
      </div>

      {/* Right summary panel */}
      <div style={{ width: 260, borderLeft: '1px solid var(--border)', padding: 20, overflowY: 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Summary</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Rollout</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{rollout}%</div>
            <input
              type="range" min={0} max={100} value={rollout}
              onChange={e => setRollout(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary)' }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Variants</div>
          {variants.map(v => (
            <div key={v.id} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#22C55E', color: 'white', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{v.letter}</span>
              <span style={{ fontSize: 12 }}>{v.name}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Goals</div>
          {goals.map((g, i) => (
            <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
              {i === 0 ? 'Primary' : 'Secondary'}: {g.metricName} ({g.direction})
            </div>
          ))}
        </div>
        {experiment.status !== 'running' && (
          <div style={{ background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 6, padding: 10, fontSize: 12, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <AlertTriangle size={14} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
            <span style={{ color: '#92400E' }}>Complete all steps and set rollout above 0% to activate.</span>
          </div>
        )}
        {experiment.status === 'running' && (
          <div style={{ background: 'var(--success-light)', border: '1px solid #059669', borderRadius: 6, padding: 10, fontSize: 12, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <CheckCircle size={14} style={{ color: '#059669', flexShrink: 0, marginTop: 1 }} />
            <span style={{ color: '#065F46' }}>Experiment is running.</span>
          </div>
        )}
        {experiment.results?.lift && (
          <div style={{ marginTop: 16, padding: 12, border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Results</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: experiment.results.lift > 0 ? 'var(--success)' : 'var(--error)' }}>
              {experiment.results.lift > 0 ? '+' : ''}{experiment.results.lift}% lift
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>p-value: {experiment.results.pValue}</div>
            {experiment.results.winner && <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>Winner: {experiment.results.winner}</div>}
          </div>
        )}
        <div style={{ marginTop: 20 }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', color: 'var(--text-secondary)', padding: '4px 0', fontWeight: 600 }}>Variant</th>
                <th style={{ textAlign: 'right', color: 'var(--text-secondary)', padding: '4px 0', fontWeight: 600 }}>Traffic</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(v => (
                <tr key={v.id}>
                  <td style={{ padding: '4px 0' }}>{v.letter} {v.name}</td>
                  <td style={{ textAlign: 'right', padding: '4px 0' }}>{v.rolloutPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SiteSetupStep({ siteSetup, setSiteSetup, onNext }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Site Setup</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Configure the site where this experiment will run. Paste your snippet or connect your SDK.</p>

      <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>SDK Installation</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <input
            type="checkbox"
            checked={siteSetup.snippetInstalled}
            onChange={e => setSiteSetup({ ...siteSetup, snippetInstalled: e.target.checked })}
          />
          <label style={{ fontSize: 13 }}>Xmplitude SDK snippet installed</label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>SDK Version</label>
          <input className="input" style={{ width: 300 }} value={siteSetup.sdkVersion} onChange={e => setSiteSetup({ ...siteSetup, sdkVersion: e.target.value })} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Project</label>
          <select className="input" style={{ width: 300 }} value={siteSetup.projectId} onChange={e => setSiteSetup({ ...siteSetup, projectId: e.target.value })}>
            <option value="default">default</option>
          </select>
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Installation Snippet</div>
        <pre style={{ background: 'var(--page-bg)', borderRadius: 6, padding: 12, fontSize: 12, fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
{`<script src="https://cdn.amplitude.com/script/YOUR_API_KEY.js"></script>
<script>
  window.amplitude.init('YOUR_API_KEY', {
    experimentEnabled: true
  });
</script>`}
        </pre>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" style={{ fontSize: 14, height: 38, padding: '0 24px' }} onClick={onNext}>
          Next: Variants <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

function VariantsStep({ variants, setVariants, onNext }) {
  function addVariant() {
    const letters = 'CDEFGHIJKLMNOPQRSTUVWXYZ'
    const letter = letters[variants.length - 2] || 'C'
    const newPercent = Math.floor(100 / (variants.length + 1))
    const updated = variants.map(v => ({ ...v, rolloutPercent: newPercent }))
    updated.push({ id: `var_${Date.now()}`, letter, name: `variant_${letter.toLowerCase()}`, tag: null, rolloutPercent: 100 - newPercent * variants.length })
    setVariants(updated)
  }

  function removeVariant(id) {
    const filtered = variants.filter(v => v.id !== id)
    const newPercent = Math.floor(100 / filtered.length)
    const rest = 100 - newPercent * (filtered.length - 1)
    setVariants(filtered.map((v, i) => ({ ...v, rolloutPercent: i === 0 ? rest : newPercent })))
  }

  function updateVariantName(id, name) {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, name } : v))
  }

  function updateVariantPercent(id, pct) {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, rolloutPercent: pct } : v))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Variants ({variants.length})</h2>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Create variants to test changes to your site. Each variant can have a different version of your page.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {variants.map(v => (
          <div
            key={v.id}
            style={{
              border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12, background: 'white'
            }}
          >
            <span style={{
              background: '#22C55E', color: 'white', borderRadius: 6,
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, flexShrink: 0
            }}>{v.letter}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="input"
                  style={{ height: 28, width: 160, fontSize: 13 }}
                  value={v.name}
                  onChange={e => updateVariantName(v.id, e.target.value)}
                />
                {v.tag && (
                  <span style={{
                    background: '#E8EEFB', color: 'var(--primary)', borderRadius: 4,
                    padding: '1px 6px', fontSize: 11, fontWeight: 600
                  }}>{v.tag}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <input
                type="number" min={0} max={100}
                value={v.rolloutPercent}
                onChange={e => updateVariantPercent(v.id, Number(e.target.value))}
                style={{ width: 50, height: 28, border: '1px solid var(--border)', borderRadius: 4, textAlign: 'center', fontSize: 12 }}
              />
              <span>%</span>
            </div>
            {v.letter !== 'A' && (
              <button
                className="icon-btn"
                title="Remove"
                style={{ width: 28, height: 28 }}
                onClick={() => removeVariant(v.id)}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        className="btn-ghost"
        style={{ fontSize: 13, color: 'var(--primary)', padding: '4px 0' }}
        onClick={addVariant}
      >
        + Add a Variant
      </button>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" style={{ fontSize: 14, height: 38, padding: '0 24px' }} onClick={onNext}>
          Next: Goals <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

function GoalsStep({ goals, setGoals, eventDefinitions, onNext }) {
  function addGoal() {
    setGoals(prev => [...prev, { metricName: 'Page View', type: 'success', direction: 'increase' }])
  }

  function removeGoal(idx) {
    setGoals(prev => prev.filter((_, i) => i !== idx))
  }

  function updateGoal(idx, field, value) {
    setGoals(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g))
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Goals</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Define the primary and secondary metrics that will determine the winner of this experiment.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        {goals.map((goal, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{i === 0 ? 'Primary Goal' : `Secondary Goal ${i}`}</span>
              {i > 0 && <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => removeGoal(i)}><Trash2 size={13} /></button>}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Metric Event</label>
                <select className="input" style={{ width: 200 }} value={goal.metricName} onChange={e => updateGoal(i, 'metricName', e.target.value)}>
                  {eventDefinitions.map(ed => <option key={ed.id} value={ed.name}>{ed.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Type</label>
                <select className="input" style={{ width: 140 }} value={goal.type} onChange={e => updateGoal(i, 'type', e.target.value)}>
                  <option value="success">Success metric</option>
                  <option value="guardrail">Guardrail metric</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Direction</label>
                <select className="input" style={{ width: 140 }} value={goal.direction} onChange={e => updateGoal(i, 'direction', e.target.value)}>
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-ghost" style={{ fontSize: 13, color: 'var(--primary)' }} onClick={addGoal}>
        <Plus size={14} /> Add Secondary Goal
      </button>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" style={{ fontSize: 14, height: 38, padding: '0 24px' }} onClick={onNext}>
          Next: Pages <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

function PagesStep({ pages, setPages, onNext }) {
  function addPage() {
    setPages(prev => [...prev, { url: '' }])
  }

  function removePage(idx) {
    setPages(prev => prev.filter((_, i) => i !== idx))
  }

  function updatePage(idx, url) {
    setPages(prev => prev.map((p, i) => i === idx ? { url } : p))
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Pages</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Specify the pages where this experiment will be active. Use URL patterns to match multiple pages.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {pages.map((page, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 60 }}>URL {i + 1}</span>
            <input
              className="input"
              style={{ flex: 1, maxWidth: 400 }}
              placeholder="e.g. /pricing, /products/*"
              value={page.url}
              onChange={e => updatePage(i, e.target.value)}
            />
            {pages.length > 1 && (
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => removePage(i)}><Trash2 size={14} /></button>
            )}
          </div>
        ))}
      </div>

      <button className="btn-ghost" style={{ fontSize: 13, color: 'var(--primary)' }} onClick={addPage}>
        <Plus size={14} /> Add Page
      </button>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" style={{ fontSize: 14, height: 38, padding: '0 24px' }} onClick={onNext}>
          Next: Targeting <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

function TargetingStep({ targeting, setTargeting, cohorts, onNext }) {
  function toggleSegment(name) {
    const segs = targeting.segments || []
    const updated = segs.includes(name) ? segs.filter(s => s !== name) : [...segs, name]
    setTargeting({ ...targeting, segments: updated })
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Targeting</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Define which users will be included in this experiment.</p>

      <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Traffic Allocation</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <input
            type="range" min={1} max={100}
            value={targeting.percentage || 100}
            onChange={e => setTargeting({ ...targeting, percentage: Number(e.target.value) })}
            style={{ width: 200, accentColor: 'var(--primary)' }}
          />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{targeting.percentage || 100}%</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>of eligible users</span>
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Audience Segments</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(cohorts || []).map(cohort => (
            <label key={cohort.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={(targeting.segments || []).includes(cohort.name)}
                onChange={() => toggleSegment(cohort.name)}
              />
              <span>{cohort.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>({cohort.userCount} users)</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" style={{ fontSize: 14, height: 38, padding: '0 24px' }} onClick={onNext}>
          Next: Advanced <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

function AdvancedStep({ advanced, setAdvanced }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Advanced Settings</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Configure mutual exclusion groups, holdout groups, and traffic allocation.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Mutual Exclusion Group</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Prevent users from being in multiple experiments at the same time.</p>
          <input
            className="input"
            style={{ width: 300 }}
            placeholder="e.g. homepage-experiments"
            value={advanced.mutualExclusionGroup}
            onChange={e => setAdvanced({ ...advanced, mutualExclusionGroup: e.target.value })}
          />
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Holdout Group</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Reserve a percentage of users who see no experiments for measuring cumulative impact.</p>
          <input
            className="input"
            style={{ width: 300 }}
            placeholder="e.g. global-holdout"
            value={advanced.holdoutGroup}
            onChange={e => setAdvanced({ ...advanced, holdoutGroup: e.target.value })}
          />
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Sticky Bucketing</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Ensure users always see the same variant once assigned.</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={advanced.stickyBucketing}
              onChange={e => setAdvanced({ ...advanced, stickyBucketing: e.target.checked })}
            />
            Enable sticky bucketing
          </label>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Statistics Engine</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Choose the statistical methodology for analyzing results.</p>
          <select
            className="input"
            style={{ width: 200 }}
            value={advanced.statsEngine}
            onChange={e => setAdvanced({ ...advanced, statsEngine: e.target.value })}
          >
            <option value="bayesian">Bayesian</option>
            <option value="frequentist">Frequentist</option>
            <option value="sequential">Sequential Testing</option>
          </select>
        </div>
      </div>
    </div>
  )
}
