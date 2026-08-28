import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import ChartWidget from '../components/ChartWidget'

export default function WorkbookPage() {
  const { state, navigate, selectSheet, toggleFavorite, setDashboardFilter } = useApp()
  const { uiState, workbooks } = state
  const workbook = workbooks.find(w => w.id === uiState.selectedWorkbook)
  const [fullscreen, setFullscreen] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  if (!workbook) {
    return (
      <div className="page-workbook">
        <div className="empty-state">
          <div className="empty-state-title">Workbook not found</div>
          <button className="btn-primary" onClick={() => navigate('explore')}>Browse Workbooks</button>
        </div>
      </div>
    )
  }

  const activeSheet = workbook.sheets?.find(s => s.id === uiState.selectedSheet) || workbook.sheets?.[0]
  const isDashboard = workbook.sheets?.length > 1

  return (
    <div className={`page-workbook ${fullscreen ? 'fullscreen' : ''}`}>
      {/* Workbook toolbar */}
      <div className="wb-toolbar">
        <div className="wb-toolbar-left">
          <button className="wb-toolbar-back" onClick={() => navigate('explore')}>
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="wb-toolbar-title">
            <h2>{workbook.name}</h2>
            <span className="wb-toolbar-project">{workbook.project}</span>
          </div>
        </div>
        <div className="wb-toolbar-right">
          <button className={`wb-toolbar-btn ${workbook.isFavorite ? 'favorited' : ''}`} onClick={() => toggleFavorite(workbook.id)} title="Favorite">
            {workbook.isFavorite ? (
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1.5l2 4.1 4.5.6-3.3 3.2.8 4.5L8 11.7l-4 2.2.8-4.5L1.5 6.2 6 5.6z" fill="#FFB400" stroke="#FFB400" strokeWidth="1"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1.5l2 4.1 4.5.6-3.3 3.2.8 4.5L8 11.7l-4 2.2.8-4.5L1.5 6.2 6 5.6z" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg>
            )}
          </button>
          <button className="wb-toolbar-btn" onClick={() => setShowFilters(!showFilters)} title="Toggle Filters">
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 3h12L9 9v4l-2 1V9z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/></svg>
          </button>
          <button className="wb-toolbar-btn" onClick={() => setFullscreen(!fullscreen)} title="Fullscreen">
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="wb-toolbar-btn" onClick={() => setShowInfo(!showInfo)} title="Info">
            <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M8 7v4M8 5h0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      <div className="wb-content">
        {/* Sheet tabs */}
        <div className="wb-sheet-tabs">
          {workbook.sheets?.map(sheet => (
            <button
              key={sheet.id}
              className={`wb-sheet-tab ${activeSheet?.id === sheet.id ? 'active' : ''}`}
              onClick={() => selectSheet(sheet.id)}
            >
              {sheet.name}
            </button>
          ))}
        </div>

        <div className="wb-view-area">
          {/* Filter panel */}
          {showFilters && activeSheet?.filters?.length > 0 && (
            <div className="wb-filter-panel">
              <div className="wb-filter-header">Filters</div>
              {activeSheet.filters.map(filter => (
                <FilterControl
                  key={filter.id}
                  filter={filter}
                  sheetId={activeSheet.id}
                  onUpdate={(filterId, selected) => setDashboardFilter(activeSheet.id, filterId, selected)}
                  dashboardFilters={uiState.dashboardFilters}
                />
              ))}
            </div>
          )}

          {/* Chart area */}
          <div className="wb-chart-area">
            {activeSheet ? (
              <>
                <div className="wb-chart-title">{activeSheet.name}</div>
                <div className="wb-chart-container">
                  <ChartWidget config={getFilteredConfig(activeSheet, uiState.dashboardFilters)} height={460} />
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No sheets available</div>
              </div>
            )}
          </div>

          {/* Info panel */}
          {showInfo && (
            <div className="wb-info-panel">
              <div className="wb-info-header">Details</div>
              <div className="wb-info-row">
                <span className="wb-info-label">Owner</span>
                <span className="wb-info-value">{workbook.owner}</span>
              </div>
              <div className="wb-info-row">
                <span className="wb-info-label">Project</span>
                <span className="wb-info-value">{workbook.project}</span>
              </div>
              <div className="wb-info-row">
                <span className="wb-info-label">Created</span>
                <span className="wb-info-value">{new Date(workbook.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="wb-info-row">
                <span className="wb-info-label">Modified</span>
                <span className="wb-info-value">{new Date(workbook.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="wb-info-row">
                <span className="wb-info-label">Views</span>
                <span className="wb-info-value">{workbook.viewCount}</span>
              </div>
              <div className="wb-info-row">
                <span className="wb-info-label">Favorites</span>
                <span className="wb-info-value">{workbook.favoriteCount}</span>
              </div>
              {workbook.description && (
                <div className="wb-info-row">
                  <span className="wb-info-label">Description</span>
                  <span className="wb-info-value">{workbook.description}</span>
                </div>
              )}
              {workbook.tags?.length > 0 && (
                <div className="wb-info-row">
                  <span className="wb-info-label">Tags</span>
                  <div className="wb-info-tags">
                    {workbook.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterControl({ filter, sheetId, onUpdate, dashboardFilters }) {
  const selected = dashboardFilters?.[sheetId]?.[filter.id] || filter.selected || filter.values

  const toggle = (val) => {
    const next = selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]
    onUpdate(filter.id, next)
  }

  const selectAll = () => onUpdate(filter.id, [...filter.values])
  const selectNone = () => onUpdate(filter.id, [])

  return (
    <div className="wb-filter-control">
      <div className="wb-filter-label">{filter.field}</div>
      <div className="wb-filter-actions">
        <button className="wb-filter-action" onClick={selectAll}>All</button>
        <button className="wb-filter-action" onClick={selectNone}>None</button>
      </div>
      <div className="wb-filter-options">
        {filter.values.map(val => (
          <label key={val} className="wb-filter-option">
            <input type="checkbox" checked={selected.includes(val)} onChange={() => toggle(val)} />
            <span>{val}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function getFilteredConfig(sheet, dashboardFilters) {
  const config = sheet.chartConfig
  if (!config) return config

  const filters = sheet.filters || []
  if (filters.length === 0) return config

  // Apply filters to data if applicable
  const activeFilters = filters.reduce((acc, f) => {
    const selected = dashboardFilters?.[sheet.id]?.[f.id] || f.selected || f.values
    if (selected.length < f.values.length) {
      acc[f.field] = selected
    }
    return acc
  }, {})

  if (Object.keys(activeFilters).length === 0) return config

  // For bar/line/area charts, filter data rows
  if (config.data && Array.isArray(config.data)) {
    const filteredData = config.data.filter(row => {
      return Object.entries(activeFilters).every(([field, vals]) => {
        if (row[field] !== undefined) return vals.includes(row[field])
        return true
      })
    })
    return { ...config, data: filteredData }
  }

  return config
}
