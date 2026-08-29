import React from 'react'
import { useApp } from '../context/AppContext'
import { WorkbookCardGrid } from '../components/WorkbookCard'

export default function RecentsPage() {
  const { state } = useApp()
  const { workbooks, recents } = state

  const recentWorkbooks = recents
    .map(id => workbooks.find(w => w.id === id))
    .filter(Boolean)

  return (
    <div className="page-recents">
      <div className="page-header">
        <h1>Recents</h1>
        <p className="page-subtitle">{recentWorkbooks.length} item{recentWorkbooks.length !== 1 ? 's' : ''}</p>
      </div>
      {recentWorkbooks.length > 0 ? (
        <div className="wb-card-grid">
          {recentWorkbooks.map(wb => <WorkbookCardGrid key={wb.id} workbook={wb} />)}
        </div>
      ) : (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#D1D5DB" strokeWidth="2"/>
            <path d="M24 12v12l8 5" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="empty-state-title">No recent items</div>
          <div className="empty-state-desc">Workbooks you view will appear here</div>
        </div>
      )}
    </div>
  )
}
