import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const modalityColors = { CT: '#2196f3', MR: '#4caf50', CR: '#ff9800', US: '#9c27b0', NM: '#e91e63', PT: '#ff5722' };
const statusColors = { unread: '#f44336', in_progress: '#ffeb3b', read: '#2196f3', reported: '#4caf50' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PreferencesDialog({ onClose, state, setSettings, setUiState }) {
  const [localSettings, setLocalSettings] = useState({ ...state.settings });

  const handleSave = () => {
    setSettings(localSettings);
    setUiState({ showPreferencesDialog: false });
    onClose();
  };

  const inputStyle = {
    background: '#0a1628',
    border: '1px solid var(--color-border)',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '13px',
    width: '100%',
  };

  const labelStyle = {
    color: 'var(--color-text-secondary)',
    fontSize: '12px',
    marginBottom: '4px',
    display: 'block',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0a1628', border: '1px solid var(--color-border)', borderRadius: '8px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        {/* Dialog header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>Preferences</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Dialog body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Show Overlays */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>Show DICOM Overlays</label>
            <input type="checkbox" checked={localSettings.showOverlays}
              onChange={e => setLocalSettings(s => ({ ...s, showOverlays: e.target.checked }))}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-accent)' }} />
          </div>

          {/* Show Orientation Markers */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>Show Orientation Markers</label>
            <input type="checkbox" checked={localSettings.showOrientationMarkers}
              onChange={e => setLocalSettings(s => ({ ...s, showOrientationMarkers: e.target.checked }))}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-accent)' }} />
          </div>

          {/* Interpolation */}
          <div>
            <label style={labelStyle}>Image Interpolation</label>
            <select value={localSettings.interpolation}
              onChange={e => setLocalSettings(s => ({ ...s, interpolation: e.target.value }))}
              style={inputStyle}>
              <option value="bilinear">Bilinear</option>
              <option value="nearest">Nearest Neighbor</option>
            </select>
          </div>

          {/* Cine Frame Rate */}
          <div>
            <label style={labelStyle}>Cine Frame Rate (fps)</label>
            <input type="number" min="1" max="60" value={localSettings.cineFrameRate}
              onChange={e => setLocalSettings(s => ({ ...s, cineFrameRate: Math.max(1, Math.min(60, parseInt(e.target.value) || 24)) }))}
              style={inputStyle} />
          </div>
        </div>

        {/* Dialog footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 20px', borderTop: '1px solid var(--color-border)' }}>
          <button onClick={onClose}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
            Cancel
          </button>
          <button onClick={handleSave}
            style={{ padding: '8px 16px', background: 'var(--color-accent)', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudyList() {
  const navigate = useNavigate();
  const { state, setStudyListFilters, setStudyListSort, setStudyListPage, setUiState, setSettings } = useAppContext();
  const { studies, patients, series } = state;
  const { studyListFilters, studyListSort, studyListPage, studyListPageSize, showPreferencesDialog } = state.uiState;

  const studyList = useMemo(() => {
    let list = Object.values(studies).map(study => {
      const patient = patients[study.patientId] || {};
      const studySeries = Object.values(series).filter(s => s.studyId === study.id);
      return { ...study, patient, seriesCount: studySeries.length };
    });

    // Filter
    if (studyListFilters.patientName) {
      const f = studyListFilters.patientName.toLowerCase();
      list = list.filter(s => s.patient.displayName?.toLowerCase().includes(f));
    }
    if (studyListFilters.mrn) {
      const f = studyListFilters.mrn.toLowerCase();
      list = list.filter(s => s.patient.mrn?.toLowerCase().includes(f));
    }
    if (studyListFilters.studyDate) {
      list = list.filter(s => s.studyDate && s.studyDate.includes(studyListFilters.studyDate));
    }
    if (studyListFilters.description) {
      const f = studyListFilters.description.toLowerCase();
      list = list.filter(s => s.studyDescription?.toLowerCase().includes(f));
    }
    if (studyListFilters.modality) {
      list = list.filter(s => s.modalities?.includes(studyListFilters.modality));
    }
    if (studyListFilters.accession) {
      const f = studyListFilters.accession.toLowerCase();
      list = list.filter(s => s.accessionNumber?.toLowerCase().includes(f));
    }

    // Sort
    const { field, direction } = studyListSort;
    list.sort((a, b) => {
      let va, vb;
      if (field === 'patientName') { va = a.patient.displayName || ''; vb = b.patient.displayName || ''; }
      else if (field === 'mrn') { va = a.patient.mrn || ''; vb = b.patient.mrn || ''; }
      else if (field === 'studyDate') { va = a.studyDate || ''; vb = b.studyDate || ''; }
      else if (field === 'description') { va = a.studyDescription || ''; vb = b.studyDescription || ''; }
      else if (field === 'modality') { va = (a.modalities || [])[0] || ''; vb = (b.modalities || [])[0] || ''; }
      else if (field === 'status') { va = a.status || ''; vb = b.status || ''; }
      else { va = a[field] || ''; vb = b[field] || ''; }
      if (va < vb) return direction === 'asc' ? -1 : 1;
      if (va > vb) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [studies, patients, series, studyListFilters, studyListSort]);

  const totalStudies = studyList.length;
  const start = (studyListPage - 1) * studyListPageSize;
  const pagedStudies = studyList.slice(start, start + studyListPageSize);
  const totalPages = Math.max(1, Math.ceil(totalStudies / studyListPageSize));

  const handleSort = (field) => {
    if (studyListSort.field === field) {
      setStudyListSort({ field, direction: studyListSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setStudyListSort({ field, direction: 'asc' });
    }
  };

  const sortArrow = (field) => {
    if (studyListSort.field !== field) return '';
    return studyListSort.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const handleFilter = (key, value) => {
    setStudyListFilters({ [key]: value });
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setUiState({ studyListPageSize: newSize, studyListPage: 1 });
  };

  const columns = [
    { key: 'patientName', label: 'Patient Name' },
    { key: 'mrn', label: 'MRN' },
    { key: 'studyDate', label: 'Study Date' },
    { key: 'description', label: 'Description' },
    { key: 'modality', label: 'Modality' },
    { key: 'accession', label: 'Accession #' },
    { key: 'seriesCount', label: '# Series' },
    { key: 'numberOfInstances', label: '# Instances' },
    { key: 'status', label: 'Status' },
  ];

  const inputStyle = {
    background: 'var(--color-bg-panel)',
    border: '1px solid var(--color-border)',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '13px',
  };

  return (
    <div style={{ background: 'var(--color-bg-shell)', minHeight: '100vh', color: 'var(--color-text-primary)', fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>XACS Viewer</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#000' }}>SC</div>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{state.currentUser.name}</span>
          <span
            onClick={() => setUiState({ showPreferencesDialog: true })}
            title="Preferences"
            style={{ cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '18px', lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
            ⚙
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 24px', flexWrap: 'wrap' }}>
        <input placeholder="Patient Name" value={studyListFilters.patientName} onChange={e => handleFilter('patientName', e.target.value)}
          style={{ ...inputStyle, width: '150px' }} />
        <input placeholder="MRN" value={studyListFilters.mrn} onChange={e => handleFilter('mrn', e.target.value)}
          style={{ ...inputStyle, width: '120px' }} />
        <input placeholder="Study Date (YYYY-MM-DD)" value={studyListFilters.studyDate} onChange={e => handleFilter('studyDate', e.target.value)}
          style={{ ...inputStyle, width: '200px' }} />
        <input placeholder="Description" value={studyListFilters.description} onChange={e => handleFilter('description', e.target.value)}
          style={{ ...inputStyle, width: '180px' }} />
        <select value={studyListFilters.modality} onChange={e => handleFilter('modality', e.target.value)}
          style={inputStyle}>
          <option value="">All Modalities</option>
          <option value="CT">CT</option>
          <option value="MR">MR</option>
          <option value="CR">CR</option>
          <option value="US">US</option>
        </select>
        <input placeholder="Accession #" value={studyListFilters.accession} onChange={e => handleFilter('accession', e.target.value)}
          style={{ ...inputStyle, width: '130px' }} />
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#0d1117' }}>
              {columns.map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)}
                  style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--color-text-secondary)', fontWeight: '600', cursor: 'pointer', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  {col.label}{sortArrow(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedStudies.map((study, i) => (
              <tr key={study.id} onClick={() => navigate(`/viewer/${study.id}`)}
                style={{ background: i % 2 === 0 ? 'var(--color-bg-shell)' : '#0b0f2a', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1e2a3a'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--color-bg-shell)' : '#0b0f2a'}>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #111a2e' }}>{study.patient.displayName}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #111a2e', color: 'var(--color-text-secondary)' }}>{study.patient.mrn}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #111a2e' }}>{formatDate(study.studyDate)}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #111a2e', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{study.studyDescription}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #111a2e' }}>
                  {(study.modalities || []).map(m => (
                    <span key={m} style={{ background: modalityColors[m] || '#666', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', marginRight: '4px' }}>{m}</span>
                  ))}
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #111a2e', color: 'var(--color-text-secondary)' }}>{study.accessionNumber}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #111a2e', textAlign: 'center' }}>{study.seriesCount}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #111a2e', textAlign: 'center' }}>{study.numberOfInstances}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #111a2e' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[study.status] || '#666', display: 'inline-block' }} />
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'capitalize' }}>{study.status?.replace('_', ' ')}</span>
                  </span>
                </td>
              </tr>
            ))}
            {pagedStudies.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  No studies match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
        <span>Showing {totalStudies === 0 ? 0 : start + 1}–{Math.min(start + studyListPageSize, totalStudies)} of {totalStudies} studies</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setStudyListPage(Math.max(1, studyListPage - 1))}
              disabled={studyListPage <= 1}
              style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', color: studyListPage <= 1 ? '#334' : 'var(--color-text-secondary)', padding: '4px 10px', borderRadius: '4px', cursor: studyListPage <= 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
              ‹ Prev
            </button>
            <span style={{ padding: '0 8px' }}>Page {studyListPage} / {totalPages}</span>
            <button
              onClick={() => setStudyListPage(Math.min(totalPages, studyListPage + 1))}
              disabled={studyListPage >= totalPages}
              style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', color: studyListPage >= totalPages ? '#334' : 'var(--color-text-secondary)', padding: '4px 10px', borderRadius: '4px', cursor: studyListPage >= totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
              Next ›
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Page size:</span>
            <select value={studyListPageSize} onChange={handlePageSizeChange}
              style={{ background: 'var(--color-bg-panel)', border: '1px solid var(--color-border)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferences Dialog */}
      {showPreferencesDialog && (
        <PreferencesDialog
          onClose={() => setUiState({ showPreferencesDialog: false })}
          state={state}
          setSettings={setSettings}
          setUiState={setUiState}
        />
      )}
    </div>
  );
}
