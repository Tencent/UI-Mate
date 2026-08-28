import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function OrgChart() {
  const { state } = useApp()
  const employees = state.employees || []
  const [expandedNodes, setExpandedNodes] = useState(new Set(['emp-020']))

  function toggleNode(id) {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function getDirectReports(managerId) {
    return employees.filter(e => e.managerId === managerId)
  }

  function OrgNode({ emp, depth = 0 }) {
    const reports = getDirectReports(emp.id)
    const isExpanded = expandedNodes.has(emp.id)
    const hasReports = reports.length > 0

    return (
      <div style={{ marginLeft: depth > 0 ? 32 : 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            background: 'white',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            marginBottom: 4,
            cursor: hasReports ? 'pointer' : 'default',
            boxShadow: depth === 0 ? 'var(--shadow-md)' : 'var(--shadow)',
            borderLeft: depth === 0 ? '3px solid var(--color-primary)' : '3px solid var(--color-border)',
            transition: 'box-shadow 0.15s',
          }}
          onClick={() => hasReports && toggleNode(emp.id)}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = depth === 0 ? 'var(--shadow-md)' : 'var(--shadow)' }}
        >
          {hasReports && (
            <span style={{ fontSize: 12, color: 'var(--color-gray-medium)', width: 16, textAlign: 'center' }}>
              {isExpanded ? '\u25BC' : '\u25B6'}
            </span>
          )}
          {!hasReports && <span style={{ width: 16 }} />}
          <div className="avatar avatar-sm" style={{ background: '#4B5563' }}>{emp.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.firstName} {emp.lastName}</div>
            <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>{emp.jobTitle}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>{emp.department}</div>
            {hasReports && (
              <span className="badge badge-blue" style={{ fontSize: 10 }}>{reports.length} reports</span>
            )}
          </div>
        </div>
        {isExpanded && hasReports && (
          <div style={{ borderLeft: '2px solid var(--color-border)', marginLeft: 20, paddingLeft: 0, marginBottom: 4 }}>
            {reports.map(r => (
              <OrgNode key={r.id} emp={r} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Find the CEO (no manager)
  const ceo = employees.find(e => !e.managerId)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Organization Chart</h1>
        <p>Company hierarchy -- {employees.length} employees</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setExpandedNodes(new Set(employees.map(e => e.id)))}
        >
          Expand All
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setExpandedNodes(new Set())}
        >
          Collapse All
        </button>
      </div>

      <div style={{ maxWidth: 700 }}>
        {ceo ? (
          <OrgNode emp={ceo} />
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ color: 'var(--color-gray-medium)' }}>No organization data available</div>
          </div>
        )}
      </div>
    </div>
  )
}
