import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Header from '../components/Header.jsx'
import { Plus, Users, X, ChevronDown } from 'lucide-react'

const EVENT_NAMES = [
  'Any Event', 'Page View', 'Button Click', 'Sign Up', 'Login',
  'Search', 'Add to Cart', 'Purchase', 'Form Submit'
]

export default function CohortsPage() {
  const { state, setState } = useApp()
  const cohorts = state?.cohorts || []
  const [showBuilder, setShowBuilder] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEvent, setNewEvent] = useState('Any Event')
  const [newCount, setNewCount] = useState(1)
  const [newTimeframe, setNewTimeframe] = useState('Last 30 days')

  function createCohort() {
    if (!newName.trim()) return
    const newCohort = {
      id: 'cohort_' + Date.now(),
      name: newName,
      description: `Users who did ${newEvent} at least ${newCount} time(s) in ${newTimeframe}`,
      userCount: Math.floor(Math.random() * 20) + 1,
      createdAt: new Date().toISOString(),
      criteria: { event: newEvent, count: newCount, timeframe: newTimeframe }
    }
    setState(prev => ({ ...prev, cohorts: [...prev.cohorts, newCohort] }))
    setShowBuilder(false)
    setNewName('')
    setNewEvent('Any Event')
    setNewCount(1)
  }

  function deleteCohort(id) {
    setState(prev => ({ ...prev, cohorts: prev.cohorts.filter(c => c.id !== id) }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header title="Cohorts" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderBottom: '1px solid #E4E4E8' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1B1B2E' }}>{cohorts.length} Cohorts</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowBuilder(true)} style={{
            padding: '7px 14px', border: 'none', borderRadius: 6,
            background: '#4F44E0', color: '#fff', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Plus size={14} /> Create Cohort
          </button>
        </div>

        {/* Cohort builder modal */}
        {showBuilder && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowBuilder(false)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#fff', borderRadius: 12, padding: 24, width: 480,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>Create Cohort</h3>
                <button onClick={() => setShowBuilder(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0' }}><X size={18} /></button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1B1B2E', marginBottom: 6 }}>Cohort Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., Active Purchasers"
                  style={{ width: '100%', border: '1px solid #E4E4E8', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#4F44E0'}
                  onBlur={e => e.target.style.borderColor = '#E4E4E8'} />
              </div>

              <div style={{ background: '#F7F7F8', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1B1B2E', marginBottom: 12 }}>Users who performed</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <select value={newEvent} onChange={e => setNewEvent(e.target.value)} style={{
                    border: '1px solid #E4E4E8', borderRadius: 6, padding: '6px 10px',
                    fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer'
                  }}>
                    {EVENT_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                  <span style={{ fontSize: 13, color: '#8E8EA0' }}>at least</span>
                  <input type="number" value={newCount} onChange={e => setNewCount(parseInt(e.target.value) || 1)} min={1}
                    style={{ width: 60, border: '1px solid #E4E4E8', borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none', textAlign: 'center' }} />
                  <span style={{ fontSize: 13, color: '#8E8EA0' }}>time(s) in</span>
                  <select value={newTimeframe} onChange={e => setNewTimeframe(e.target.value)} style={{
                    border: '1px solid #E4E4E8', borderRadius: 6, padding: '6px 10px',
                    fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer'
                  }}>
                    {['Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowBuilder(false)} style={{
                  padding: '8px 16px', border: '1px solid #E4E4E8', borderRadius: 6,
                  background: '#fff', cursor: 'pointer', fontSize: 13
                }}>Cancel</button>
                <button onClick={createCohort} style={{
                  padding: '8px 16px', border: 'none', borderRadius: 6,
                  background: '#4F44E0', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600
                }}>Create Cohort</button>
              </div>
            </div>
          </div>
        )}

        {/* Cohorts list */}
        <div style={{ padding: '16px 24px' }}>
          {cohorts.map(cohort => (
            <div key={cohort.id} style={{
              border: '1px solid #E4E4E8', borderRadius: 8, padding: '16px 20px',
              marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16,
              transition: 'box-shadow 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{
                width: 40, height: 40, borderRadius: 8, background: '#F0EFFC',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Users size={18} color="#4F44E0" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1B1B2E', marginBottom: 2 }}>{cohort.name}</div>
                <div style={{ fontSize: 12, color: '#8E8EA0' }}>{cohort.description}</div>
                {cohort.criteria && (
                  <div style={{ fontSize: 11, color: '#4F44E0', marginTop: 4, background: '#F0EFFC', display: 'inline-block', padding: '2px 8px', borderRadius: 4 }}>
                    {cohort.criteria.event} {'>='}  {cohort.criteria.count}x in {cohort.criteria.timeframe}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1B1B2E' }}>{cohort.userCount}</div>
                <div style={{ fontSize: 11, color: '#8E8EA0' }}>users</div>
              </div>
              <button onClick={() => deleteCohort(cohort.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0', padding: 4,
                fontSize: 14
              }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
