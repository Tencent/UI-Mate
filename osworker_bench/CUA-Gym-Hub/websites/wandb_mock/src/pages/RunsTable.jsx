import { useState, useMemo, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowUp, ArrowDown, Check, XCircle, Clock, Square, Columns, Filter, Layers, Download, X, Plus, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(seconds) {
  if (!seconds) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StateIcon({ state }) {
  switch (state) {
    case 'finished': return <Check size={12} color="var(--success-green)" />;
    case 'crashed': return <XCircle size={12} color="var(--error-red)" />;
    case 'running': return <Clock size={12} color="var(--warning-amber)" />;
    case 'killed': return <Square size={10} color="var(--text-muted)" />;
    default: return null;
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function getRunValue(run, col) {
  if (col.startsWith('config.')) return getNestedValue(run, col);
  if (col.startsWith('summary.')) return run.summary?.[col.replace('summary.', '')];
  if (['name', 'state', 'createdAt', 'duration', 'user'].includes(col)) return run[col];
  // Check summary for metric-like keys
  return run.summary?.[col];
}

// Column Customization Dropdown
function ColumnsDropdown({ allColumns, activeColumns, onToggle, onClose }) {
  return (
    <div className="dropdown-panel" onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Columns</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {allColumns.map(col => (
          <label key={col} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={activeColumns.includes(col)} onChange={() => onToggle(col)} />
            {getColumnLabel(col)}
          </label>
        ))}
      </div>
    </div>
  );
}

// Filter Builder
function FilterBuilder({ filters, allColumns, onChange, onClose }) {
  const operators = ['=', '!=', '>', '<', 'contains'];

  const addFilter = () => {
    onChange([...filters, { column: allColumns[0] || 'name', operator: '=', value: '' }]);
  };

  const updateFilter = (idx, field, val) => {
    const next = filters.map((f, i) => i === idx ? { ...f, [field]: val } : f);
    onChange(next);
  };

  const removeFilter = (idx) => {
    onChange(filters.filter((_, i) => i !== idx));
  };

  return (
    <div className="dropdown-panel" style={{ minWidth: 400 }} onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Filters</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      {filters.map((f, i) => (
        <div key={i} className="flex items-center gap-2" style={{ padding: '4px 12px' }}>
          <select className="form-input" style={{ fontSize: 12, padding: '3px 6px', width: 120 }} value={f.column} onChange={e => updateFilter(i, 'column', e.target.value)}>
            {allColumns.map(c => <option key={c} value={c}>{getColumnLabel(c)}</option>)}
          </select>
          <select className="form-input" style={{ fontSize: 12, padding: '3px 6px', width: 80 }} value={f.operator} onChange={e => updateFilter(i, 'operator', e.target.value)}>
            {operators.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
          <input className="form-input" style={{ fontSize: 12, padding: '3px 6px', flex: 1 }} value={f.value} onChange={e => updateFilter(i, 'value', e.target.value)} placeholder="value" />
          <button onClick={() => removeFilter(i)} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
        </div>
      ))}
      <div style={{ padding: '6px 12px' }}>
        <button className="btn-secondary" style={{ fontSize: 12, padding: '3px 10px' }} onClick={addFilter}>
          <Plus size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Add filter
        </button>
      </div>
    </div>
  );
}

// Group Dropdown
function GroupDropdown({ allColumns, groupBy, onChange, onClose }) {
  return (
    <div className="dropdown-panel" onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>Group by</span>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
      </div>
      <label className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>
        <input type="radio" checked={!groupBy} onChange={() => onChange(null)} /> None
      </label>
      {allColumns.filter(c => c.startsWith('config.') || c === 'state' || c === 'user').map(col => (
        <label key={col} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>
          <input type="radio" checked={groupBy === col} onChange={() => onChange(col)} /> {getColumnLabel(col)}
        </label>
      ))}
    </div>
  );
}

function getColumnLabel(col) {
  if (col.startsWith('config.')) return col.replace('config.', '');
  if (col.startsWith('summary.')) return col.replace('summary.', '');
  switch (col) {
    case 'createdAt': return 'Created';
    case 'name': return 'Name';
    case 'state': return 'State';
    case 'duration': return 'Duration';
    case 'user': return 'User';
    default: return col;
  }
}

function applyFilters(runs, filters) {
  return runs.filter(run => {
    return filters.every(f => {
      const val = getRunValue(run, f.column);
      const strVal = val !== undefined ? String(val) : '';
      const fVal = f.value;
      switch (f.operator) {
        case '=': return strVal === fVal;
        case '!=': return strVal !== fVal;
        case '>': return Number(val) > Number(fVal);
        case '<': return Number(val) < Number(fVal);
        case 'contains': return strVal.toLowerCase().includes(fVal.toLowerCase());
        default: return true;
      }
    });
  });
}

export default function RunsTable() {
  const { entity, project } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const proj = state.projects.find(p => p.name === project && p.entity === entity);
  const projectRuns = state.runs.filter(r => r.projectId === (proj?.id || ''));
  const { workspace } = state;
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showColumns, setShowColumns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const allAvailableColumns = useMemo(() => {
    const cols = new Set(['name', 'state', 'createdAt', 'duration', 'user']);
    projectRuns.forEach(r => {
      Object.keys(r.config || {}).forEach(k => cols.add(`config.${k}`));
      Object.keys(r.summary || {}).forEach(k => cols.add(k));
    });
    return [...cols];
  }, [projectRuns]);

  const columns = workspace.runTableColumns || ['name', 'state', 'createdAt', 'duration'];

  const handleToggleColumn = (col) => {
    const next = columns.includes(col) ? columns.filter(c => c !== col) : [...columns, col];
    dispatch({ type: 'UPDATE_WORKSPACE', payload: { runTableColumns: next } });
  };

  const filteredRuns = useMemo(() => {
    return workspace.filters?.length ? applyFilters(projectRuns, workspace.filters) : projectRuns;
  }, [projectRuns, workspace.filters]);

  const sortedRuns = useMemo(() => {
    const sorted = [...filteredRuns];
    const { sortBy, sortOrder } = workspace;
    sorted.sort((a, b) => {
      let va = getRunValue(a, sortBy);
      let vb = getRunValue(b, sortBy);
      if (va === undefined) va = '';
      if (vb === undefined) vb = '';
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortOrder === 'asc' ? va - vb : vb - va;
      }
      return sortOrder === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return sorted;
  }, [filteredRuns, workspace.sortBy, workspace.sortOrder]);

  const groupedRuns = useMemo(() => {
    if (!workspace.groupBy) return null;
    const groups = {};
    sortedRuns.forEach(run => {
      const val = String(getRunValue(run, workspace.groupBy) ?? 'N/A');
      if (!groups[val]) groups[val] = [];
      groups[val].push(run);
    });
    return groups;
  }, [sortedRuns, workspace.groupBy]);

  const handleSort = (col) => {
    const newOrder = workspace.sortBy === col && workspace.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch({ type: 'SET_SORT', payload: { sortBy: col, sortOrder: newOrder } });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedRuns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedRuns.map(r => r.id)));
    }
  };

  const handleSelect = (id, e) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach(id => dispatch({ type: 'DELETE_RUN', payload: id }));
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  };

  const handleAddTagToSelected = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    selectedIds.forEach(id => {
      const run = state.runs.find(r => r.id === id);
      if (run && !run.tags.includes(tag)) {
        dispatch({ type: 'ADD_RUN_TAG', payload: { runId: id, tag } });
      }
    });
    setTagInput('');
    setShowTagInput(false);
  };

  const handleExportCSV = () => {
    const rows = sortedRuns.map(run => {
      const row = {};
      columns.forEach(col => {
        row[getColumnLabel(col)] = getCellValue(run, col);
      });
      row['Tags'] = run.tags.join(', ');
      return row;
    });
    const headers = [...columns.map(getColumnLabel), 'Tags'];
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proj?.name || 'runs'}_runs.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCellValue = (run, col) => {
    switch (col) {
      case 'name': return run.name;
      case 'state': return run.state;
      case 'createdAt': return timeAgo(run.createdAt);
      case 'duration': return formatDuration(run.duration);
      case 'user': return run.user;
      default: {
        const val = getRunValue(run, col);
        if (val === undefined) return '-';
        return typeof val === 'number' ? (Number.isInteger(val) ? String(val) : val.toFixed(4)) : String(val);
      }
    }
  };

  const SortIndicator = ({ col }) => {
    if (workspace.sortBy !== col) return null;
    return workspace.sortOrder === 'asc'
      ? <ArrowUp size={12} style={{ marginLeft: 4 }} />
      : <ArrowDown size={12} style={{ marginLeft: 4 }} />;
  };

  const toggleGroupCollapse = (groupKey) => {
    const next = new Set(collapsedGroups);
    if (next.has(groupKey)) next.delete(groupKey); else next.add(groupKey);
    setCollapsedGroups(next);
  };

  const renderRow = (run) => (
    <tr key={run.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/${entity}/${project}/runs/${run.id}/overview`)}>
      <td onClick={e => e.stopPropagation()}>
        <input type="checkbox" checked={selectedIds.has(run.id)} onChange={e => handleSelect(run.id, e)} style={{ cursor: 'pointer' }} />
      </td>
      {columns.map(col => {
        if (col === 'name') {
          return (
            <td key={col}>
              <span className="flex items-center gap-2">
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: run.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 500 }}>{run.name}</span>
              </span>
            </td>
          );
        }
        if (col === 'state') {
          return (
            <td key={col}>
              <span className="flex items-center gap-2">
                <StateIcon state={run.state} />
                <span className={`state-badge ${run.state}`}>{run.state}</span>
              </span>
            </td>
          );
        }
        return <td key={col} className="text-muted text-small">{getCellValue(run, col)}</td>;
      })}
      <td>{run.tags.map(t => <span key={t} className="tag-pill" style={{ marginRight: 4 }}>{t}</span>)}</td>
    </tr>
  );

  return (
    <div className="page-container" style={{ maxWidth: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Runs</h1>
        <div className="flex gap-2">
          <div style={{ position: 'relative' }}>
            <button className="btn-secondary flex items-center gap-2" style={{ fontSize: 12 }} onClick={() => { setShowFilters(!showFilters); setShowColumns(false); setShowGroup(false); }}>
              <Filter size={14} /> Filter
              {workspace.filters?.length > 0 && <span className="section-badge">{workspace.filters.length}</span>}
            </button>
            {showFilters && (
              <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: 4 }}>
                <FilterBuilder
                  filters={workspace.filters || []}
                  allColumns={allAvailableColumns}
                  onChange={f => dispatch({ type: 'SET_FILTER', payload: f })}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn-secondary flex items-center gap-2" style={{ fontSize: 12 }} onClick={() => { setShowGroup(!showGroup); setShowColumns(false); setShowFilters(false); }}>
              <Layers size={14} /> Group
            </button>
            {showGroup && (
              <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: 4 }}>
                <GroupDropdown
                  allColumns={allAvailableColumns}
                  groupBy={workspace.groupBy}
                  onChange={g => { dispatch({ type: 'SET_GROUP_BY', payload: g }); setShowGroup(false); }}
                  onClose={() => setShowGroup(false)}
                />
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn-secondary flex items-center gap-2" style={{ fontSize: 12 }} onClick={() => { setShowColumns(!showColumns); setShowFilters(false); setShowGroup(false); }}>
              <Columns size={14} /> Columns
            </button>
            {showColumns && (
              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 100, marginTop: 4 }}>
                <ColumnsDropdown
                  allColumns={allAvailableColumns}
                  activeColumns={columns}
                  onToggle={handleToggleColumn}
                  onClose={() => setShowColumns(false)}
                />
              </div>
            )}
          </div>
          <button className="btn-secondary flex items-center gap-2" style={{ fontSize: 12 }} onClick={handleExportCSV}>
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* Active filter pills */}
      {workspace.filters?.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {workspace.filters.map((f, i) => (
            <span key={i} className="tag-pill">
              {getColumnLabel(f.column)} {f.operator} {f.value}
              <button className="remove-tag" onClick={() => {
                const next = workspace.filters.filter((_, j) => j !== i);
                dispatch({ type: 'SET_FILTER', payload: next });
              }}><X size={10} /></button>
            </span>
          ))}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="floating-action-bar">
          <span>{selectedIds.size} selected</span>
          <button className="btn-danger" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => setShowDeleteConfirm(true)}>Delete</button>
          {showTagInput ? (
            <span className="flex items-center gap-2">
              <input className="form-input" style={{ fontSize: 12, padding: '3px 8px', width: 120 }} placeholder="tag name" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTagToSelected()} autoFocus />
              <button className="btn-secondary" style={{ fontSize: 11, padding: '2px 8px' }} onClick={handleAddTagToSelected}>Add</button>
              <button onClick={() => setShowTagInput(false)} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
            </span>
          ) : (
            <button className="btn-secondary" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => setShowTagInput(true)}>Add tag</button>
          )}
        </div>
      )}

      <p className="text-muted text-small mb-4">Showing {sortedRuns.length} runs</p>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" checked={selectedIds.size === sortedRuns.length && sortedRuns.length > 0} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
              </th>
              {columns.map(col => (
                <th key={col} onClick={() => handleSort(col)}>
                  <span className="flex items-center">{getColumnLabel(col)}<SortIndicator col={col} /></span>
                </th>
              ))}
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {groupedRuns ? (
              Object.entries(groupedRuns).map(([groupVal, groupRuns]) => (
                <Fragment key={groupVal}>
                  <tr className="group-header-row" onClick={() => toggleGroupCollapse(groupVal)} style={{ cursor: 'pointer' }}>
                    <td colSpan={columns.length + 2} style={{ background: 'var(--bg-surface)', padding: '6px 12px', fontWeight: 600, fontSize: 13 }}>
                      <span className="flex items-center gap-2">
                        {collapsedGroups.has(groupVal) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        {getColumnLabel(workspace.groupBy)}: {groupVal}
                        <span className="section-badge">{groupRuns.length}</span>
                      </span>
                    </td>
                  </tr>
                  {!collapsedGroups.has(groupVal) && groupRuns.map(renderRow)}
                </Fragment>
              ))
            ) : (
              sortedRuns.map(renderRow)
            )}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color="var(--error-red)" /> Delete Runs
              </span>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Are you sure you want to delete {selectedIds.size} run{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button className="btn-danger" onClick={handleDeleteSelected}>Delete {selectedIds.size} run{selectedIds.size > 1 ? 's' : ''}</button>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

