import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const COLORS = ['#4285F4', '#EA4335', '#34A853', '#FBBC04', '#FF6D01', '#46BDC6', '#9C27B0']
function colorFor(email) {
  let hash = 0
  for (const c of email) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length
  return COLORS[hash]
}

export default function ShareDialog() {
  const { state, dispatch } = useApp()
  const reportId = state.shareDialog.reportId
  const report = state.reports.find(r => r.id === reportId)
  const [emailInput, setEmailInput] = useState('')
  const [pendingList, setPendingList] = useState(report?.sharedWith || [])

  if (!report) return null

  const addPerson = () => {
    const email = emailInput.trim()
    if (!email || !email.includes('@')) return
    if (pendingList.some(p => p.email === email)) return
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    setPendingList([...pendingList, { email, name, role: 'viewer', avatarColor: colorFor(email) }])
    setEmailInput('')
  }

  const changeRole = (email, role) => {
    setPendingList(pendingList.map(p => p.email === email ? { ...p, role } : p))
  }

  const removePerson = (email) => {
    setPendingList(pendingList.filter(p => p.email !== email))
  }

  const save = () => {
    dispatch({ type: 'UPDATE_SHARE', payload: { reportId, sharedWith: pendingList } })
    dispatch({ type: 'CLOSE_SHARE_DIALOG' })
  }

  const hasPendingChanges = JSON.stringify(pendingList) !== JSON.stringify(report.sharedWith)

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_SHARE_DIALOG' })}>
      <div className="modal" style={{ width: '520px', padding: 0 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #DADCE0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: '#202124' }}>Share with people and groups</div>
              <div style={{ fontSize: '14px', color: '#5F6368', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Share as
                <div className="avatar avatar-sm" style={{ background: state.user.avatarColor }}>
                  {initials(state.user.name)}
                </div>
                {state.user.name}
              </div>
            </div>
            <button className="icon-btn" onClick={() => dispatch({ type: 'CLOSE_SHARE_DIALOG' })}>
              <X size={20} />
            </button>
          </div>
          {/* Email input */}
          <div style={{ marginTop: '16px' }}>
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addPerson() }}
              placeholder="Add people and groups"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                borderBottom: '2px solid #1A73E8',
                fontSize: '14px',
                color: '#202124',
                outline: 'none',
                background: 'transparent'
              }}
            />
          </div>
        </div>

        {/* People with access */}
        <div style={{ padding: '16px 24px', maxHeight: '320px', overflowY: 'auto' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#202124', marginBottom: '12px' }}>People with access</div>

          {/* Owner (always first, can't be removed) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
            <div className="avatar" style={{ background: state.user.avatarColor }}>
              {initials(state.user.name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#202124' }}>{state.user.name} (you)</div>
              <div style={{ fontSize: '12px', color: '#5F6368' }}>{state.user.email}</div>
            </div>
            <div style={{ fontSize: '14px', color: '#5F6368' }}>Manager</div>
          </div>

          {/* Shared users */}
          {pendingList.map(person => (
            <div key={person.email} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
              <div className="avatar" style={{ background: person.avatarColor || colorFor(person.email) }}>
                {initials(person.name || person.email)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: '#202124' }}>{person.name}</div>
                <div style={{ fontSize: '12px', color: '#5F6368' }}>{person.email}</div>
              </div>
              <select
                value={person.role}
                onChange={e => changeRole(person.email, e.target.value)}
                style={{
                  border: '1px solid #DADCE0', borderRadius: '4px', padding: '4px 8px',
                  fontSize: '14px', color: '#202124', cursor: 'pointer'
                }}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="manager">Manager</option>
              </select>
              <button
                className="icon-btn"
                style={{ width: 28, height: 28 }}
                onClick={() => removePerson(person.email)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '16px', padding: '16px 24px', borderTop: '1px solid #DADCE0'
        }}>
          {hasPendingChanges && (
            <span style={{ fontSize: '12px', color: '#5F6368', fontStyle: 'italic' }}>Pending changes</span>
          )}
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
