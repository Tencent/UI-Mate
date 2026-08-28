import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function ProjectsPage() {
  const { state, navigate, openWorkbook } = useApp()
  const { projects, workbooks, dataSources } = state
  const [selectedProject, setSelectedProject] = useState(null)
  const [search, setSearch] = useState('')

  const filteredProjects = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const project = selectedProject ? projects.find(p => p.id === selectedProject) : null
  const projectWorkbooks = project ? workbooks.filter(w => w.projectId === project.id) : []
  const projectDataSources = project ? dataSources.filter(ds => ds.projectId === project.id) : []

  return (
    <div className="page-projects">
      <div className="page-header">
        <h1>Projects</h1>
        <div className="ds-toolbar">
          <div className="explore-search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#9CA3AF" strokeWidth="1.5"/>
              <line x1="11" y1="11" x2="14" y2="14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="projects-layout">
        <div className="projects-list">
          {filteredProjects.map(p => (
            <div
              key={p.id}
              className={`project-item ${selectedProject === p.id ? 'active' : ''}`}
              onClick={() => setSelectedProject(p.id)}
            >
              <div className="project-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 6h6l2-2h8v12H2V6z" stroke="#FF7F0E" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="project-info">
                <div className="project-name">{p.name}</div>
                <div className="project-counts">{p.workbookCount} workbooks, {p.datasourceCount} data sources</div>
              </div>
              <div className="project-permission">
                <span className={`permission-badge ${p.permissions.toLowerCase()}`}>{p.permissions}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="project-detail">
          {project ? (
            <>
              <div className="project-detail-header">
                <h2>{project.name}</h2>
                <p className="project-detail-desc">{project.description}</p>
                <div className="project-detail-meta">
                  <span>Owner: {project.owner}</span>
                  <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span>Permission: {project.permissions}</span>
                </div>
              </div>

              {projectWorkbooks.length > 0 && (
                <div className="project-detail-section">
                  <h3>Workbooks ({projectWorkbooks.length})</h3>
                  {projectWorkbooks.map(wb => (
                    <div key={wb.id} className="project-content-item" onClick={() => openWorkbook(wb.id)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="12" height="12" rx="2" stroke="#1F77B4" strokeWidth="1.2"/>
                        <rect x="4" y="8" width="2" height="4" fill="#1F77B4"/>
                        <rect x="7" y="6" width="2" height="6" fill="#FF7F0E"/>
                        <rect x="10" y="4" width="2" height="8" fill="#2CA02C"/>
                      </svg>
                      <span>{wb.name}</span>
                      <span className="project-content-meta">{wb.viewCount} views</span>
                    </div>
                  ))}
                </div>
              )}

              {projectDataSources.length > 0 && (
                <div className="project-detail-section">
                  <h3>Data Sources ({projectDataSources.length})</h3>
                  {projectDataSources.map(ds => (
                    <div key={ds.id} className="project-content-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <ellipse cx="8" cy="5" rx="5" ry="2" stroke="#1F77B4" strokeWidth="1.2"/>
                        <path d="M3 5v6c0 1.1 2.2 2 5 2s5-.9 5-2V5" stroke="#1F77B4" strokeWidth="1.2"/>
                      </svg>
                      <span>{ds.name}</span>
                      <span className="project-content-meta">{ds.connectionType}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="project-detail-empty">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M6 16h16l6-6h14v32H6V16z" stroke="#D1D5DB" strokeWidth="2" fill="none" strokeLinejoin="round"/>
              </svg>
              <div>Select a project to see its contents</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
