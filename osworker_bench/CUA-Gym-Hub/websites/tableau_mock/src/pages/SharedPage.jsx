import React from 'react'
import { useApp } from '../context/AppContext'
import { WorkbookCardGrid } from '../components/WorkbookCard'

export default function SharedPage() {
  const { state } = useApp()
  const { workbooks, sharedWithMe } = state

  const sharedWorkbooks = sharedWithMe
    .map(id => workbooks.find(w => w.id === id))
    .filter(Boolean)

  return (
    <div className="page-shared">
      <div className="page-header">
        <h1>Shared with Me</h1>
        <p className="page-subtitle">{sharedWorkbooks.length} item{sharedWorkbooks.length !== 1 ? 's' : ''}</p>
      </div>
      {sharedWorkbooks.length > 0 ? (
        <div className="wb-card-grid">
          {sharedWorkbooks.map(wb => <WorkbookCardGrid key={wb.id} workbook={wb} />)}
        </div>
      ) : (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="18" cy="14" r="6" stroke="#D1D5DB" strokeWidth="2"/>
            <circle cx="34" cy="18" r="5" stroke="#D1D5DB" strokeWidth="2"/>
            <path d="M6 38c0-6.6 5.4-12 12-12h0c4 0 7.5 1.9 9.7 4.9" stroke="#D1D5DB" strokeWidth="2"/>
            <path d="M26 42c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#D1D5DB" strokeWidth="2"/>
          </svg>
          <div className="empty-state-title">Nothing shared with you</div>
          <div className="empty-state-desc">When others share workbooks with you, they will appear here</div>
        </div>
      )}
    </div>
  )
}
