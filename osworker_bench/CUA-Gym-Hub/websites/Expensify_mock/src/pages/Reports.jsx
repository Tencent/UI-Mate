import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, Star, ArrowUp, ArrowDown, Trash2, Download, File } from 'lucide-react';
import NewReportModal from '../components/NewReportModal';

function formatAmount(cents) {
  const dollars = Math.floor(Math.abs(cents) / 100);
  const c = String(Math.abs(cents) % 100).padStart(2, '0');
  return { dollars: '$' + dollars.toLocaleString(), cents: '.' + c };
}

function formatAmountFlat(cents) {
  return '$' + (cents / 100).toFixed(2);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Helpers to serialize/deserialize report filters to/from URL search params
function reportFiltersToParams(filters, sortBy, sortDir) {
  const p = new URLSearchParams();
  if (filters.dateFrom) p.set('rDateFrom', filters.dateFrom);
  if (filters.dateTo) p.set('rDateTo', filters.dateTo);
  if (filters.policies && filters.policies.length) p.set('rPolicies', filters.policies.join(','));
  if (filters.statuses && filters.statuses.length) p.set('rStatuses', filters.statuses.join(','));
  if (sortBy && sortBy !== 'name') p.set('rSortBy', sortBy);
  if (sortDir && sortDir !== 'desc') p.set('rSortDir', sortDir);
  return p;
}

function paramsToReportFilters(sp) {
  const filters = {};
  if (sp.get('rDateFrom')) filters.dateFrom = sp.get('rDateFrom');
  if (sp.get('rDateTo')) filters.dateTo = sp.get('rDateTo');
  if (sp.get('rPolicies')) filters.policies = sp.get('rPolicies').split(',');
  if (sp.get('rStatuses')) filters.statuses = sp.get('rStatuses').split(',');
  return {
    filters,
    sortBy: sp.get('rSortBy') || 'name',
    sortDir: sp.get('rSortDir') || 'desc',
  };
}

export default function Reports() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const ui = state.ui;
  const [showNewModal, setShowNewModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);
  const [page, setPage] = useState(0);
  const perPage = 25;
  const [initialized, setInitialized] = useState(false);

  // On mount, restore filters from URL params
  useEffect(() => {
    const hasFilterParams = searchParams.get('rDateFrom') || searchParams.get('rDateTo') || searchParams.get('rPolicies') || searchParams.get('rStatuses') || searchParams.get('rSortBy') || searchParams.get('rSortDir');
    if (hasFilterParams) {
      const restored = paramsToReportFilters(searchParams);
      dispatch({ type: 'UPDATE_UI', payload: {
        reportFilters: restored.filters,
        reportSortBy: restored.sortBy,
        reportSortDir: restored.sortDir,
      }});
    }
    setInitialized(true);
  }, []);

  const filtersVisible = ui.reportFiltersVisible;
  const filters = ui.reportFilters || {};
  const sortBy = ui.reportSortBy || 'name';
  const sortDir = ui.reportSortDir || 'desc';

  // Sync filters to URL when they change (after initialization)
  useEffect(() => {
    if (!initialized) return;
    const newParams = reportFiltersToParams(filters, sortBy, sortDir);
    // Preserve sid param if present
    const sid = searchParams.get('sid');
    if (sid) newParams.set('sid', sid);
    setSearchParams(newParams, { replace: true });
  }, [filters, sortBy, sortDir, initialized]);

  // Build query string for navigating to report detail (preserving filter params)
  const qs = searchParams.toString();
  const qsStr = qs ? '?' + qs : '';

  const filtered = useMemo(() => {
    let list = [...state.reports];
    if (filters.dateFrom) list = list.filter(r => (r.submittedDate||r.createdAt) >= filters.dateFrom);
    if (filters.dateTo) list = list.filter(r => (r.submittedDate||r.createdAt) <= filters.dateTo);
    if (filters.policies && filters.policies.length) list = list.filter(r => filters.policies.includes(r.policyId));
    if (filters.statuses && filters.statuses.length) list = list.filter(r => filters.statuses.includes(r.status));

    list.sort((a, b) => {
      let av, bv;
      if (sortBy === 'name') { av = a.title.toLowerCase(); bv = b.title.toLowerCase(); }
      else if (sortBy === 'total') { av = a.total; bv = b.total; }
      else if (sortBy === 'policy') { av = (a.policyName||'').toLowerCase(); bv = (b.policyName||'').toLowerCase(); }
      else if (sortBy === 'from') { av = (a.createdByEmail||'').toLowerCase(); bv = (b.createdByEmail||'').toLowerCase(); }
      else if (sortBy === 'submitted') { av = a.submittedDate||''; bv = b.submittedDate||''; }
      else { av = a.title.toLowerCase(); bv = b.title.toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [state.reports, filters, sortBy, sortDir]);

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const selected = ui.selectedReportIds || [];

  const handleSort = (col) => {
    if (sortBy === col) {
      dispatch({ type: 'UPDATE_UI', payload: { reportSortDir: sortDir === 'asc' ? 'desc' : 'asc' } });
    } else {
      dispatch({ type: 'UPDATE_UI', payload: { reportSortBy: col, reportSortDir: 'desc' } });
    }
  };

  const SortArrow = ({ col }) => {
    if (sortBy !== col) return null;
    return sortDir === 'asc' ? <ArrowUp size={10} className="sort-arrow" /> : <ArrowDown size={10} className="sort-arrow" />;
  };

  const allSelected = paged.length > 0 && paged.every(r => selected.includes(r.id));
  const toggleAll = () => {
    if (allSelected) {
      const ids = paged.map(r => r.id);
      dispatch({ type: 'UPDATE_UI', payload: { selectedReportIds: selected.filter(x => !ids.includes(x)) } });
    } else {
      const ids = new Set([...selected, ...paged.map(r => r.id)]);
      dispatch({ type: 'UPDATE_UI', payload: { selectedReportIds: [...ids] } });
    }
  };

  const setFilter = (key, value) => {
    dispatch({ type: 'UPDATE_UI', payload: { reportFilters: { ...filters, [key]: value } } });
  };

  const statusOpts = ['open','submitted','approved','reimbursed','closed','archived'];

  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const bulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    selected.forEach(id => dispatch({ type: 'DELETE_REPORT', payload: id }));
    dispatch({ type: 'UPDATE_UI', payload: { selectedReportIds: [] } });
    setShowBulkDeleteConfirm(false);
  };

  const exportCSV = (reportList) => {
    const headers = ['Report Name', 'Report Number', 'Total', 'Policy', 'Status', 'From', 'Submitted', 'Exported'];
    const rows = reportList.map(r => [
      r.title, r.reportNumber, formatAmountFlat(r.total), r.policyName, r.status,
      r.createdByEmail, r.submittedDate || '', r.exportedDate || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = (reportList) => {
    // Generate a plain-text PDF-like document and trigger download as .txt
    // In a real app this would use a PDF library; here we produce a text representation
    const lines = [
      'XPENSIFY REPORTS EXPORT',
      '========================',
      'Generated: ' + new Date().toLocaleString(),
      '',
      ...reportList.map(r => [
        'Report: ' + r.title,
        'Number: #' + r.reportNumber,
        'Status: ' + r.status,
        'Total: ' + formatAmountFlat(r.total),
        'Policy: ' + r.policyName,
        'From: ' + r.createdByEmail,
        'Submitted: ' + (r.submittedDate ? formatDate(r.submittedDate) : 'N/A'),
        '---',
      ].join('\n')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports_export.pdf.txt';
    a.click();
    URL.revokeObjectURL(url);
    // Mark selected reports as exported in state
    const now = new Date().toISOString();
    reportList.forEach(r => {
      dispatch({ type: 'UPDATE_REPORT', payload: { id: r.id, exported: true, exportedDate: now } });
    });
    setExportNotice(reportList.length + ' report(s) exported as PDF.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExport = (format) => {
    setShowExportDropdown(false);
    const reportList = selected.length > 0
      ? state.reports.filter(r => selected.includes(r.id))
      : filtered;
    if (format === 'csv') {
      exportCSV(reportList);
      // Mark as exported
      const now = new Date().toISOString();
      reportList.forEach(r => {
        dispatch({ type: 'UPDATE_REPORT', payload: { id: r.id, exported: true, exportedDate: now } });
      });
      setExportNotice(reportList.length + ' report(s) exported as CSV.');
      setTimeout(() => setExportNotice(null), 4000);
    } else {
      exportPDF(reportList);
    }
  };

  return (
    <div>
      {exportNotice && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#03D47C', color: 'white', padding: '12px 20px', borderRadius: 8, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {exportNotice}
        </div>
      )}
      {showBulkDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="modal-card" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Reports</h2>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 20 }}>Are you sure you want to delete <strong>{selected.length}</strong> report(s)? This action cannot be undone. Expenses linked to these reports will be unlinked and set to unreported.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmBulkDelete}>Delete</button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowBulkDeleteConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <div className="page-actions">
          <div className="dropdown-container">
            <button className="btn btn-outline" onClick={() => setShowExportDropdown(!showExportDropdown)}>
              Export to <ChevronDown size={14} />
            </button>
            {showExportDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => handleExport('csv')}>CSV</button>
                <button className="dropdown-item" onClick={() => handleExport('pdf')}>PDF</button>
              </div>
            )}
          </div>
          <div className="dropdown-container">
            <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
              New Report <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bulk-action-bar">
          <span style={{ fontWeight: 600 }}>{selected.length} selected</span>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleExport('csv')}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={bulkDelete}>
            <Trash2 size={14} /> Delete
          </button>
          <button className="btn-link" style={{ marginLeft: 'auto' }} onClick={() => dispatch({ type: 'UPDATE_UI', payload: { selectedReportIds: [] } })}>
            Clear selection
          </button>
        </div>
      )}

      <button className="filter-toggle" onClick={() => dispatch({ type: 'UPDATE_UI', payload: { reportFiltersVisible: !filtersVisible } })}>
        <SlidersHorizontal size={14} /> {filtersVisible ? 'Hide Filters' : 'Show Filters'}
      </button>

      {filtersVisible && (
        <div className="filter-panel">
          <div className="filter-row">
            <input className="filter-input" type="date" placeholder="From" value={filters.dateFrom||''} onChange={e => setFilter('dateFrom', e.target.value)} />
            <input className="filter-input" type="date" placeholder="To" value={filters.dateTo||''} onChange={e => setFilter('dateTo', e.target.value)} />
            <select className="filter-select" value="" onChange={e => { if (e.target.value) setFilter('policies', [...(filters.policies||[]), e.target.value]); }}>
              <option value="">All policies</option>
              {state.policies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="filter-row">
            {statusOpts.map(s => (
              <label key={s} className={'filter-chip' + ((filters.statuses||[]).includes(s) ? ' active' : '')} onClick={() => {
                const curr = filters.statuses || [];
                setFilter('statuses', curr.includes(s) ? curr.filter(x=>x!==s) : [...curr, s]);
              }}>
                <span className="chip-dot" style={{ background: s==='open'?'#03D47C':s==='approved'?'#0B8043':s==='reimbursed'?'#E85E95':s==='closed'?'#8B959E':s==='submitted'?'#0185FF':'#C4C9D1' }}></span>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </label>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <File size={64} style={{ color: '#C4C9D1', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No reports yet</h2>
          <p style={{ color: '#8B959E', marginBottom: 20 }}>Create your first report to organize expenses</p>
          <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>New Report</button>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
              <th onClick={() => handleSort('name')}>Name <SortArrow col="name" /></th>
              <th onClick={() => handleSort('total')}>Total <SortArrow col="total" /></th>
              <th onClick={() => handleSort('policy')}>Policy <SortArrow col="policy" /></th>
              <th onClick={() => handleSort('from')}>From <SortArrow col="from" /></th>
              <th>To</th>
              <th onClick={() => handleSort('submitted')}>Submitted <SortArrow col="submitted" /></th>
              <th>Exported</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(rpt => {
              const amt = formatAmount(rpt.total);
              return (
                <tr key={rpt.id} style={{ height: 80 }} onClick={() => navigate('/reports/' + rpt.id + qsStr)}>
                  <td className="checkbox-cell" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(rpt.id)} onChange={() => dispatch({ type: 'TOGGLE_REPORT_SELECTION', payload: rpt.id })} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className={'star-btn' + (rpt.starred ? ' starred' : '')} onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_REPORT_STAR', payload: rpt.id }); }}>
                        <Star size={16} fill={rpt.starred ? '#F5A623' : 'none'} />
                      </button>
                      <div>
                        {rpt.isRetracted && <span style={{ color: '#D93025', fontSize: 11, fontWeight: 700, display: 'block' }}>RETRACTED</span>}
                        <span style={{ fontWeight: 500 }}>Expense Report #{rpt.reportNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div><span className={'status-badge ' + rpt.status}>{rpt.status}</span></div>
                    <span className="amount-display" style={{ marginTop: 4, display: 'inline-block' }}>
                      <span className="amount-dollars">{amt.dollars}</span>
                      <span className="amount-cents">{amt.cents}</span>
                    </span>
                  </td>
                  <td>{rpt.policyName}</td>
                  <td className="text-truncate" style={{ maxWidth: 140 }}>{rpt.createdByEmail}</td>
                  <td className="text-truncate" style={{ maxWidth: 140 }}>{rpt.submittedToEmail}</td>
                  <td>{formatDate(rpt.submittedDate)}</td>
                  <td>{formatDate(rpt.exportedDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {filtered.length > 0 && (
        <div className="pagination">
          <span>Reports {page * perPage + 1} to {Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</span>
          <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
          <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
        </div>
      )}

      {showNewModal && <NewReportModal onClose={() => setShowNewModal(false)} />}
    </div>
  );
}
