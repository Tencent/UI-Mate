import React from 'react'
import { useApp } from '../context/AppContext'
import { WorkbookCardGrid, WorkbookCardList } from '../components/WorkbookCard'

export default function ExplorePage() {
  const { state, setExploreView, setExploreSort, setExploreFilter, setExploreSearch } = useApp()
  const { workbooks, uiState } = state
  const { exploreView, exploreSort, exploreFilter, exploreSearch } = uiState

  let filtered = [...workbooks]

  // Search
  if (exploreSearch) {
    const q = exploreSearch.toLowerCase()
    filtered = filtered.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.project.toLowerCase().includes(q) ||
      w.owner.toLowerCase().includes(q) ||
      w.tags.some(t => t.includes(q))
    )
  }

  // Filter by type/owner/project
  if (exploreFilter === 'my') {
    filtered = filtered.filter(w => w.owner === state.currentUser.name)
  } else if (exploreFilter.startsWith('project:')) {
    const proj = exploreFilter.slice(8)
    filtered = filtered.filter(w => w.project === proj)
  } else if (exploreFilter.startsWith('owner:')) {
    const owner = exploreFilter.slice(6)
    filtered = filtered.filter(w => w.owner === owner)
  }

  // Sort
  switch (exploreSort) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'date':
      filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      break
    case 'views':
      filtered.sort((a, b) => b.viewCount - a.viewCount)
      break
    case 'favorites':
      filtered.sort((a, b) => b.favoriteCount - a.favoriteCount)
      break
  }

  const projects = [...new Set(workbooks.map(w => w.project))]
  const owners = [...new Set(workbooks.map(w => w.owner))]

  return (
    <div className="page-explore">
      <div className="page-header">
        <h1>Explore</h1>
        <div className="explore-toolbar">
          <div className="explore-search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#9CA3AF" strokeWidth="1.5"/>
              <line x1="11" y1="11" x2="14" y2="14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              placeholder="Search workbooks..."
              value={exploreSearch}
              onChange={e => setExploreSearch(e.target.value)}
            />
          </div>

          <div className="explore-controls">
            <select className="explore-select" value={exploreFilter} onChange={e => setExploreFilter(e.target.value)}>
              <option value="all">All Content</option>
              <option value="my">My Content</option>
              <optgroup label="Projects">
                {projects.map(p => <option key={p} value={`project:${p}`}>{p}</option>)}
              </optgroup>
              <optgroup label="Owners">
                {owners.map(o => <option key={o} value={`owner:${o}`}>{o}</option>)}
              </optgroup>
            </select>

            <select className="explore-select" value={exploreSort} onChange={e => setExploreSort(e.target.value)}>
              <option value="name">Name</option>
              <option value="date">Last Modified</option>
              <option value="views">Most Viewed</option>
              <option value="favorites">Most Favorited</option>
            </select>

            <div className="view-toggle">
              <button className={`view-toggle-btn ${exploreView === 'grid' ? 'active' : ''}`} onClick={() => setExploreView('grid')} title="Grid view">
                <svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"/></svg>
              </button>
              <button className={`view-toggle-btn ${exploreView === 'list' ? 'active' : ''}`} onClick={() => setExploreView('list')} title="List view">
                <svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="2.5" rx="0.5" fill="currentColor"/><rect x="1" y="6.5" width="14" height="2.5" rx="0.5" fill="currentColor"/><rect x="1" y="11" width="14" height="2.5" rx="0.5" fill="currentColor"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="explore-results-count">{filtered.length} workbook{filtered.length !== 1 ? 's' : ''}</div>

      {exploreView === 'grid' ? (
        <div className="wb-card-grid">
          {filtered.map(wb => <WorkbookCardGrid key={wb.id} workbook={wb} />)}
        </div>
      ) : (
        <div className="wb-list">
          <div className="wb-list-header">
            <div className="wb-list-fav-col"></div>
            <div className="wb-list-icon-col"></div>
            <div className="wb-list-info-col">Name</div>
            <div className="wb-list-project-col">Project</div>
            <div className="wb-list-owner-col">Owner</div>
            <div className="wb-list-views-col">Views</div>
            <div className="wb-list-updated-col">Modified</div>
          </div>
          {filtered.map(wb => <WorkbookCardList key={wb.id} workbook={wb} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#D1D5DB" strokeWidth="2"/>
            <line x1="18" y1="24" x2="30" y2="24" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="empty-state-title">No workbooks found</div>
          <div className="empty-state-desc">Try adjusting your search or filters</div>
        </div>
      )}
    </div>
  )
}
