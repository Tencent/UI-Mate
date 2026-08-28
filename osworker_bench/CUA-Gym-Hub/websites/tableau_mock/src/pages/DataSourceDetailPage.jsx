import React from 'react'
import { useApp } from '../context/AppContext'

export default function DataSourceDetailPage() {
  const { state, navigate } = useApp()
  const dsId = state.uiState.selectedDataSource
  const ds = state.dataSources.find(d => d.id === dsId)

  if (!ds) {
    return (
      <div className="page-ds-detail">
        <div className="empty-state">
          <div className="empty-state-title">Data source not found</div>
          <button className="btn-primary" onClick={() => navigate('datasources')}>Back to Data Sources</button>
        </div>
      </div>
    )
  }

  const usedWorkbooks = (ds.usedByWorkbooks || [])
    .map(id => state.workbooks.find(w => w.id === id))
    .filter(Boolean)

  return (
    <div className="page-ds-detail">
      <div className="wb-toolbar">
        <div className="wb-toolbar-left">
          <button className="wb-toolbar-back" onClick={() => navigate('datasources')}>
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="wb-toolbar-title">
            <h2>{ds.name}</h2>
            <span className="wb-toolbar-project">{ds.project}</span>
          </div>
        </div>
      </div>

      <div className="ds-detail-content">
        {/* Summary */}
        <div className="ds-detail-section">
          <h3>Connection Details</h3>
          <div className="ds-detail-grid">
            <div className="ds-detail-item">
              <span className="ds-detail-label">Connection Type</span>
              <span className="ds-detail-value">{ds.connectionType}</span>
            </div>
            <div className="ds-detail-item">
              <span className="ds-detail-label">Type</span>
              <span className="ds-detail-value">
                <span className={`ds-badge ${ds.type === 'Live' ? 'live' : 'extract'}`}>{ds.type}</span>
              </span>
            </div>
            <div className="ds-detail-item">
              <span className="ds-detail-label">Owner</span>
              <span className="ds-detail-value">{ds.owner}</span>
            </div>
            <div className="ds-detail-item">
              <span className="ds-detail-label">Last Modified</span>
              <span className="ds-detail-value">{new Date(ds.updatedAt).toLocaleString()}</span>
            </div>
            <div className="ds-detail-item">
              <span className="ds-detail-label">Row Count</span>
              <span className="ds-detail-value">{ds.rowCount?.toLocaleString()}</span>
            </div>
            <div className="ds-detail-item">
              <span className="ds-detail-label">Field Count</span>
              <span className="ds-detail-value">{ds.fieldCount}</span>
            </div>
            {ds.isCertified && (
              <div className="ds-detail-item">
                <span className="ds-detail-label">Certified By</span>
                <span className="ds-detail-value ds-certified">{ds.certifiedBy}</span>
              </div>
            )}
          </div>
          {ds.description && <p className="ds-detail-desc">{ds.description}</p>}
        </div>

        {/* Fields */}
        {ds.fields?.length > 0 && (
          <div className="ds-detail-section">
            <h3>Fields ({ds.fields.length})</h3>
            <div className="ds-fields-table">
              <div className="ds-fields-header">
                <div className="ds-field-name-col">Name</div>
                <div className="ds-field-type-col">Data Type</div>
                <div className="ds-field-role-col">Role</div>
              </div>
              {ds.fields.map((f, i) => (
                <div key={i} className="ds-fields-row">
                  <div className="ds-field-name-col">
                    <span className={`field-icon-sm ${f.role === 'Measure' ? 'measure' : 'dimension'}`}>
                      {f.role === 'Measure' ? '#' : 'Abc'}
                    </span>
                    {f.name}
                  </div>
                  <div className="ds-field-type-col">{f.type}</div>
                  <div className="ds-field-role-col">{f.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Data */}
        {ds.sampleData?.length > 0 && (
          <div className="ds-detail-section">
            <h3>Data Preview</h3>
            <div className="ds-data-preview">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    {Object.keys(ds.sampleData[0]).map(k => <th key={k}>{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {ds.sampleData.map((row, i) => (
                    <tr key={i}>
                      <td className="row-num">{i + 1}</td>
                      {Object.values(row).map((v, j) => (
                        <td key={j} style={{ textAlign: typeof v === 'number' ? 'right' : 'left' }}>{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Used By */}
        {usedWorkbooks.length > 0 && (
          <div className="ds-detail-section">
            <h3>Used by Workbooks</h3>
            <div className="ds-used-by">
              {usedWorkbooks.map(wb => (
                <div key={wb.id} className="ds-used-by-item" onClick={() => {
                  const { openWorkbook } = useApp
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="2" stroke="#1F77B4" strokeWidth="1.2"/>
                    <rect x="4" y="8" width="2" height="4" fill="#1F77B4"/>
                    <rect x="7" y="6" width="2" height="6" fill="#FF7F0E"/>
                    <rect x="10" y="4" width="2" height="8" fill="#2CA02C"/>
                  </svg>
                  {wb.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {ds.tags?.length > 0 && (
          <div className="ds-detail-section">
            <h3>Tags</h3>
            <div className="ds-tags">
              {ds.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
