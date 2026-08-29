import React from 'react'
import { useApp } from '../context/AppContext'
import { WorkbookCardGrid } from '../components/WorkbookCard'

export default function HomePage() {
  const { state, navigate, openWorkbook } = useApp()
  const { workbooks, favorites, recents } = state

  const recentWorkbooks = recents
    .map(id => workbooks.find(w => w.id === id))
    .filter(Boolean)
    .slice(0, 6)

  const favoriteWorkbooks = favorites
    .map(id => workbooks.find(w => w.id === id))
    .filter(Boolean)
    .slice(0, 4)

  const recommendations = workbooks
    .filter(w => !favorites.includes(w.id))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 3)

  return (
    <div className="page-home">
      {/* Welcome banner */}
      <div className="home-welcome">
        <div className="home-welcome-content">
          <h1>Welcome, {state.currentUser.name.split(' ')[0]}</h1>
          <p>Here is what is happening across your site</p>
        </div>
        <div className="home-stats">
          <div className="home-stat">
            <div className="home-stat-value">{workbooks.length}</div>
            <div className="home-stat-label">Workbooks</div>
          </div>
          <div className="home-stat">
            <div className="home-stat-value">{state.dataSources.length}</div>
            <div className="home-stat-label">Data Sources</div>
          </div>
          <div className="home-stat">
            <div className="home-stat-value">{state.users.length}</div>
            <div className="home-stat-label">Users</div>
          </div>
        </div>
      </div>

      {/* Recent */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Recents</h2>
          <button className="link-btn" onClick={() => navigate('recents')}>See all</button>
        </div>
        <div className="wb-card-grid">
          {recentWorkbooks.map(wb => (
            <WorkbookCardGrid key={wb.id} workbook={wb} />
          ))}
        </div>
      </section>

      {/* Favorites */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Favorites</h2>
          <button className="link-btn" onClick={() => navigate('favorites')}>See all</button>
        </div>
        <div className="wb-card-grid">
          {favoriteWorkbooks.map(wb => (
            <WorkbookCardGrid key={wb.id} workbook={wb} />
          ))}
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="home-section">
          <div className="home-section-header">
            <h2>Recommended for You</h2>
          </div>
          <div className="wb-card-grid">
            {recommendations.map(wb => (
              <WorkbookCardGrid key={wb.id} workbook={wb} />
            ))}
          </div>
        </section>
      )}

      {/* Getting Started */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Getting Started</h2>
        </div>
        <div className="getting-started-grid">
          <div className="gs-card" onClick={() => navigate('explore')}>
            <div className="gs-card-icon" style={{ background: '#EEF2FF' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1F77B4" strokeWidth="1.5"/><path d="M12 8v4l3 2" stroke="#1F77B4" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div className="gs-card-title">Explore Content</div>
            <div className="gs-card-desc">Browse all workbooks and data sources</div>
          </div>
          <div className="gs-card" onClick={() => navigate('datasources')}>
            <div className="gs-card-icon" style={{ background: '#FFF7ED' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="7" rx="8" ry="3" stroke="#FF7F0E" strokeWidth="1.5"/><path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7" stroke="#FF7F0E" strokeWidth="1.5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" stroke="#FF7F0E" strokeWidth="1.5"/></svg>
            </div>
            <div className="gs-card-title">Connect to Data</div>
            <div className="gs-card-desc">View and manage data sources</div>
          </div>
          <div className="gs-card" onClick={() => navigate('projects')}>
            <div className="gs-card-icon" style={{ background: '#F0FDF4' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 7h6l3-3h7v16H4V7z" stroke="#2CA02C" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </div>
            <div className="gs-card-title">Organize Projects</div>
            <div className="gs-card-desc">Create and manage project folders</div>
          </div>
        </div>
      </section>
    </div>
  )
}
