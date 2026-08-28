import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function DataSourcesPage() {
  const { state, openDataSource } = useApp()
  const { dataSources } = state
  const [search, setSearch] = useState('')

  const filtered = dataSources.filter(ds =>
    !search || ds.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-datasources">
      <div className="page-header">
        <h1>Data Sources</h1>
        <div className="ds-toolbar">
          <div className="explore-search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#9CA3AF" strokeWidth="1.5"/>
              <line x1="11" y1="11" x2="14" y2="14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input placeholder="Search data sources..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="ds-list">
        <div className="ds-list-header">
          <div className="ds-col-name">Name</div>
          <div className="ds-col-type">Connection</div>
          <div className="ds-col-mode">Type</div>
          <div className="ds-col-project">Project</div>
          <div className="ds-col-owner">Owner</div>
          <div className="ds-col-updated">Modified</div>
        </div>
        {filtered.map(ds => (
          <div key={ds.id} className="ds-list-row" onClick={() => openDataSource(ds.id)}>
            <div className="ds-col-name">
              <div className="ds-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <ellipse cx="10" cy="6" rx="7" ry="3" stroke="#1F77B4" strokeWidth="1.3"/>
                  <path d="M3 6v8c0 1.7 3.1 3 7 3s7-1.3 7-3V6" stroke="#1F77B4" strokeWidth="1.3"/>
                  <path d="M3 10c0 1.7 3.1 3 7 3s7-1.3 7-3" stroke="#1F77B4" strokeWidth="1.3"/>
                </svg>
              </div>
              <div>
                <div className="ds-name">{ds.name}</div>
                {ds.isCertified && (
                  <span className="ds-certified">
                    <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                    Certified
                  </span>
                )}
              </div>
            </div>
            <div className="ds-col-type">{ds.connectionType}</div>
            <div className="ds-col-mode">
              <span className={`ds-badge ${ds.type === 'Live' ? 'live' : 'extract'}`}>{ds.type}</span>
            </div>
            <div className="ds-col-project">{ds.project}</div>
            <div className="ds-col-owner">{ds.owner}</div>
            <div className="ds-col-updated">{new Date(ds.updatedAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
