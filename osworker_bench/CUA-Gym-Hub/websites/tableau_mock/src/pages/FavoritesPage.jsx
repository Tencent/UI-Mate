import React from 'react'
import { useApp } from '../context/AppContext'
import { WorkbookCardGrid } from '../components/WorkbookCard'

export default function FavoritesPage() {
  const { state } = useApp()
  const { workbooks, favorites } = state

  const favWorkbooks = favorites
    .map(id => workbooks.find(w => w.id === id))
    .filter(Boolean)

  return (
    <div className="page-favorites">
      <div className="page-header">
        <h1>Favorites</h1>
        <p className="page-subtitle">{favWorkbooks.length} item{favWorkbooks.length !== 1 ? 's' : ''}</p>
      </div>
      {favWorkbooks.length > 0 ? (
        <div className="wb-card-grid">
          {favWorkbooks.map(wb => <WorkbookCardGrid key={wb.id} workbook={wb} />)}
        </div>
      ) : (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 6l6 12.3 13.5 1.8-9.9 9.6 2.4 13.5L24 36l-12 7.2 2.4-13.5L4.5 20.1 18 18.3z" fill="none" stroke="#D1D5DB" strokeWidth="2"/>
          </svg>
          <div className="empty-state-title">No favorites yet</div>
          <div className="empty-state-desc">Click the star icon on any workbook to add it here</div>
        </div>
      )}
    </div>
  )
}
