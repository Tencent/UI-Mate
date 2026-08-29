import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, List, AlignJustify, LayoutGrid, Receipt, FileText, Car, Clock, ArrowUp, ArrowDown, Trash2, AlertTriangle } from 'lucide-react';
import NewExpenseModal from '../components/NewExpenseModal';
import ExpenseDetailModal from '../components/ExpenseDetailModal';

function formatAmount(cents) {
  const dollars = Math.floor(Math.abs(cents) / 100);
  const c = String(Math.abs(cents) % 100).padStart(2, '0');
  return { dollars: '$' + dollars.toLocaleString(), cents: '.' + c };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TypeIcon({ type }) {
  if (type === 'distance') return <Car size={16} style={{ color: '#8B959E', marginRight: 6 }} />;
  if (type === 'time') return <Clock size={16} style={{ color: '#8B959E', marginRight: 6 }} />;
  return <FileText size={16} style={{ color: '#8B959E', marginRight: 6 }} />;
}

// Helpers to serialize/deserialize expense filters to/from URL search params
function filtersToParams(filters, sortBy, sortDir, viewMode) {
  const p = new URLSearchParams();
  if (filters.merchant) p.set('merchant', filters.merchant);
  if (filters.dateFrom) p.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) p.set('dateTo', filters.dateTo);
  if (filters.categories && filters.categories.length) p.set('categories', filters.categories.join(','));
  if (filters.tags && filters.tags.length) p.set('tags', filters.tags.join(','));
  if (filters.policies && filters.policies.length) p.set('policies', filters.policies.join(','));
  if (filters.statuses && filters.statuses.length) p.set('statuses', filters.statuses.join(','));
  if (filters.billableFilter && filters.billableFilter !== 'all') p.set('billableFilter', filters.billableFilter);
  if (sortBy && sortBy !== 'date') p.set('sortBy', sortBy);
  if (sortDir && sortDir !== 'desc') p.set('sortDir', sortDir);
  if (viewMode && viewMode !== 'list') p.set('view', viewMode);
  return p;
}

function paramsToFilters(sp) {
  const filters = {};
  if (sp.get('merchant')) filters.merchant = sp.get('merchant');
  if (sp.get('dateFrom')) filters.dateFrom = sp.get('dateFrom');
  if (sp.get('dateTo')) filters.dateTo = sp.get('dateTo');
  if (sp.get('categories')) filters.categories = sp.get('categories').split(',');
  if (sp.get('tags')) filters.tags = sp.get('tags').split(',');
  if (sp.get('policies')) filters.policies = sp.get('policies').split(',');
  if (sp.get('statuses')) filters.statuses = sp.get('statuses').split(',');
  if (sp.get('billableFilter')) filters.billableFilter = sp.get('billableFilter');
  return {
    filters,
    sortBy: sp.get('sortBy') || 'date',
    sortDir: sp.get('sortDir') || 'desc',
    viewMode: sp.get('view') || 'list',
  };
}

export default function Expenses() {
  const { state, dispatch } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const ui = state.ui;
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [modalTab, setModalTab] = useState(null);
  const [detailExpense, setDetailExpense] = useState(null);
  const [page, setPage] = useState(0);
  const perPage = 25;
  const [initialized, setInitialized] = useState(false);

  // On mount, restore filters from URL params
  useEffect(() => {
    const hasFilterParams = searchParams.get('merchant') || searchParams.get('dateFrom') || searchParams.get('dateTo') || searchParams.get('categories') || searchParams.get('tags') || searchParams.get('policies') || searchParams.get('statuses') || searchParams.get('billableFilter') || searchParams.get('sortBy') || searchParams.get('sortDir') || searchParams.get('view');
    if (hasFilterParams) {
      const restored = paramsToFilters(searchParams);
      dispatch({ type: 'UPDATE_UI', payload: {
        expenseFilters: restored.filters,
        expenseSortBy: restored.sortBy,
        expenseSortDir: restored.sortDir,
        expenseViewMode: restored.viewMode,
      }});
    }
    setInitialized(true);
  }, []);

  const viewMode = ui.expenseViewMode || 'list';
  const filtersVisible = ui.expenseFiltersVisible;
  const filters = ui.expenseFilters || {};
  const sortBy = ui.expenseSortBy || 'date';
  const sortDir = ui.expenseSortDir || 'desc';

  // Sync filters to URL when they change (after initialization)
  useEffect(() => {
    if (!initialized) return;
    const newParams = filtersToParams(filters, sortBy, sortDir, viewMode);
    // Preserve sid param if present
    const sid = searchParams.get('sid');
    if (sid) newParams.set('sid', sid);
    setSearchParams(newParams, { replace: true });
  }, [filters, sortBy, sortDir, viewMode, initialized]);

  const filtered = useMemo(() => {
    let list = [...state.expenses];
    if (filters.merchant) list = list.filter(e => e.merchant.toLowerCase().includes(filters.merchant.toLowerCase()));
    if (filters.dateFrom) list = list.filter(e => e.date >= filters.dateFrom);
    if (filters.dateTo) list = list.filter(e => e.date <= filters.dateTo);
    if (filters.categories && filters.categories.length) list = list.filter(e => filters.categories.includes(e.categoryId));
    if (filters.tags && filters.tags.length) list = list.filter(e => filters.tags.includes(e.tagId));
    if (filters.policies && filters.policies.length) list = list.filter(e => filters.policies.includes(e.policyId));
    if (filters.statuses && filters.statuses.length) list = list.filter(e => filters.statuses.includes(e.status));
    if (filters.billableFilter === 'billable') list = list.filter(e => e.billable);
    if (filters.billableFilter === 'reimbursable') list = list.filter(e => e.reimbursable);

    list.sort((a, b) => {
      let av, bv;
      if (sortBy === 'date') { av = a.date; bv = b.date; }
      else if (sortBy === 'merchant') { av = a.merchant.toLowerCase(); bv = b.merchant.toLowerCase(); }
      else if (sortBy === 'amount') { av = a.amount; bv = b.amount; }
      else if (sortBy === 'category') { av = (a.category||'').toLowerCase(); bv = (b.category||'').toLowerCase(); }
      else if (sortBy === 'policy') { av = (a.policyId||''); bv = (b.policyId||''); }
      else { av = a.date; bv = b.date; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [state.expenses, filters, sortBy, sortDir]);

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSort = (col) => {
    if (sortBy === col) {
      dispatch({ type: 'UPDATE_UI', payload: { expenseSortDir: sortDir === 'asc' ? 'desc' : 'asc' } });
    } else {
      dispatch({ type: 'UPDATE_UI', payload: { expenseSortBy: col, expenseSortDir: 'desc' } });
    }
  };

  const SortArrow = ({ col }) => {
    if (sortBy !== col) return null;
    return sortDir === 'asc' ? <ArrowUp size={10} className="sort-arrow" /> : <ArrowDown size={10} className="sort-arrow" />;
  };

  const setFilter = (key, value) => {
    dispatch({ type: 'UPDATE_UI', payload: { expenseFilters: { ...filters, [key]: value } } });
  };

  const resetFilters = () => {
    dispatch({ type: 'UPDATE_UI', payload: { expenseFilters: { merchant: '', dateFrom: '', dateTo: '', categories: [], tags: [], policies: [], statuses: [], billableFilter: 'all' } } });
  };

  const getReport = (reportId) => state.reports.find(r => r.id === reportId);
  const getPolicy = (policyId) => state.policies.find(p => p.id === policyId);
  const selected = ui.selectedExpenseIds || [];
  const allSelected = paged.length > 0 && paged.every(e => selected.includes(e.id));
  const [bulkReportDropdown, setBulkReportDropdown] = useState(false);
  const [bulkCategoryDropdown, setBulkCategoryDropdown] = useState(false);

  const openReports = state.reports.filter(r => r.status === 'open');

  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const bulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    selected.forEach(id => dispatch({ type: 'DELETE_EXPENSE', payload: id }));
    dispatch({ type: 'UPDATE_UI', payload: { selectedExpenseIds: [] } });
    setShowBulkDeleteConfirm(false);
  };

  const bulkAddToReport = (reportId) => {
    selected.forEach(id => dispatch({ type: 'UPDATE_EXPENSE', payload: { id, reportId, status: 'open' } }));
    const report = state.reports.find(r => r.id === reportId);
    if (report) {
      const newTotal = state.expenses
        .filter(e => e.reportId === reportId || selected.includes(e.id))
        .reduce((s, e) => s + e.amount, 0);
      dispatch({ type: 'UPDATE_REPORT', payload: { id: reportId, total: newTotal, expenseCount: state.expenses.filter(e => e.reportId === reportId || selected.includes(e.id)).length } });
    }
    dispatch({ type: 'UPDATE_UI', payload: { selectedExpenseIds: [] } });
    setBulkReportDropdown(false);
  };

  const bulkCategorize = (categoryId) => {
    const cat = state.categories.find(c => c.id === categoryId);
    selected.forEach(id => dispatch({ type: 'UPDATE_EXPENSE', payload: { id, categoryId, category: cat ? cat.name : '' } }));
    dispatch({ type: 'UPDATE_UI', payload: { selectedExpenseIds: [] } });
    setBulkCategoryDropdown(false);
  };

  const getViolations = (expense) => {
    const policy = state.policies.find(p => p.id === expense.policyId);
    if (!policy) return [];
    const violations = [];
    if (policy.requiresCategory && !expense.categoryId) violations.push('Category is required');
    if (policy.requiresTag && !expense.tagId) violations.push('Tag is required');
    if (policy.maxExpenseAmount && expense.amount > policy.maxExpenseAmount * 100) violations.push('Exceeds max expense amount ($' + policy.maxExpenseAmount + ')');
    if (policy.maxExpenseAge) {
      const days = Math.floor((Date.now() - new Date(expense.date).getTime()) / 86400000);
      if (days > policy.maxExpenseAge) violations.push('Expense is older than ' + policy.maxExpenseAge + ' days');
    }
    return violations;
  };

  const toggleAll = () => {
    if (allSelected) {
      const ids = paged.map(e => e.id);
      dispatch({ type: 'UPDATE_UI', payload: { selectedExpenseIds: selected.filter(x => !ids.includes(x)) } });
    } else {
      const ids = new Set([...selected, ...paged.map(e => e.id)]);
      dispatch({ type: 'UPDATE_UI', payload: { selectedExpenseIds: [...ids] } });
    }
  };

  const statusColors = [
    { status: 'unreported', label: 'Unreported', color: '#C4C9D1' },
    { status: 'open', label: 'Open', color: '#03D47C' },
    { status: 'processing', label: 'Processing', color: '#F5A623' },
    { status: 'approved', label: 'Approved', color: '#0B8043' },
    { status: 'reimbursed', label: 'Reimbursed', color: '#E85E95' },
    { status: 'closed', label: 'Closed', color: '#8B959E' },
    { status: 'deleted', label: 'Deleted', color: '#D93025' },
  ];

  const toggleStatus = (s) => {
    const curr = filters.statuses || [];
    const next = curr.includes(s) ? curr.filter(x => x !== s) : [...curr, s];
    setFilter('statuses', next);
  };

  return (
    <div>
      {showBulkDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="modal-card" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Expenses</h2>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 20 }}>Are you sure you want to delete <strong>{selected.length}</strong> expense(s)? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmBulkDelete}>Delete</button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowBulkDeleteConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <div className="page-actions">
          <div className="dropdown-container">
            <button className="btn btn-primary" onClick={() => setShowNewDropdown(!showNewDropdown)}>
              New Expense <ChevronDown size={16} />
            </button>
            {showNewDropdown && (
              <div className="dropdown-menu">
                {['Expense','Distance','Time','Multiple'].map(tab => (
                  <button key={tab} className="dropdown-item" onClick={() => { setModalTab(tab.toLowerCase()); setShowNewDropdown(false); }}>
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button className="filter-toggle" onClick={() => dispatch({ type: 'UPDATE_UI', payload: { expenseFiltersVisible: !filtersVisible } })}>
          <SlidersHorizontal size={14} /> {filtersVisible ? 'Hide Filters' : 'Show Filters'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#8B959E', marginRight: 8 }}>View:</span>
          <div className="view-toggle">
            {[{m:'list',I:List},{m:'compact',I:AlignJustify},{m:'grid',I:LayoutGrid},{m:'receipt',I:Receipt}].map(({m,I}) => (
              <button key={m} className={'view-toggle-btn' + (viewMode===m?' active':'')} onClick={() => dispatch({ type:'UPDATE_UI', payload:{expenseViewMode:m}})}>
                <I size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bulk-action-bar">
          <span style={{ fontWeight: 600 }}>{selected.length} selected</span>
          <button className="btn btn-danger" onClick={bulkDelete}><Trash2 size={14} /> Delete</button>
          <div className="dropdown-container">
            <button className="btn btn-outline" onClick={() => { setBulkReportDropdown(!bulkReportDropdown); setBulkCategoryDropdown(false); }}>
              Add to Report <ChevronDown size={14} />
            </button>
            {bulkReportDropdown && (
              <div className="dropdown-menu">
                {openReports.length === 0 && <div className="dropdown-item" style={{ color: '#8B959E' }}>No open reports</div>}
                {openReports.map(r => (
                  <button key={r.id} className="dropdown-item" onClick={() => bulkAddToReport(r.id)}>{r.title}</button>
                ))}
              </div>
            )}
          </div>
          <div className="dropdown-container">
            <button className="btn btn-outline" onClick={() => { setBulkCategoryDropdown(!bulkCategoryDropdown); setBulkReportDropdown(false); }}>
              Categorize <ChevronDown size={14} />
            </button>
            {bulkCategoryDropdown && (
              <div className="dropdown-menu">
                {state.categories.filter(c => c.enabled).map(c => (
                  <button key={c.id} className="dropdown-item" onClick={() => bulkCategorize(c.id)}>{c.name}</button>
                ))}
              </div>
            )}
          </div>
          <button className="btn-link" style={{ marginLeft: 'auto' }} onClick={() => dispatch({ type: 'UPDATE_UI', payload: { selectedExpenseIds: [] } })}>Clear selection</button>
        </div>
      )}

      {filtersVisible && (
        <div className="filter-panel">
          <div className="filter-row">
            <input className="filter-input" placeholder="Merchant" value={filters.merchant||''} onChange={e => setFilter('merchant', e.target.value)} />
            <input className="filter-input" type="date" value={filters.dateFrom||''} onChange={e => setFilter('dateFrom', e.target.value)} />
            <input className="filter-input" type="date" value={filters.dateTo||''} onChange={e => setFilter('dateTo', e.target.value)} />
            <div style={{ display: 'flex', gap: 0 }}>
              {['all','billable','reimbursable'].map(f => (
                <button key={f} style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: filters.billableFilter===f?'var(--primary-blue)':'white', color: filters.billableFilter===f?'white':'var(--text-primary)', fontSize: 12, cursor: 'pointer', borderRadius: f==='all'?'4px 0 0 4px':f==='reimbursable'?'0 4px 4px 0':'0' }}
                  onClick={() => setFilter('billableFilter', f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <select className="filter-select" value="" onChange={e => { if (e.target.value) setFilter('categories', [...(filters.categories||[]), e.target.value]); }}>
              <option value="">All categories</option>
              {state.categories.filter(c=>c.enabled).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="filter-select" value="" onChange={e => { if (e.target.value) setFilter('tags', [...(filters.tags||[]), e.target.value]); }}>
              <option value="">All tags</option>
              {state.tags.filter(t=>t.enabled).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="filter-select" value="" onChange={e => { if (e.target.value) setFilter('policies', [...(filters.policies||[]), e.target.value]); }}>
              <option value="">All policies</option>
              {state.policies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="filter-row">
            {statusColors.map(({ status, label, color }) => (
              <label key={status} className={'filter-chip' + ((filters.statuses||[]).includes(status) ? ' active' : '')} style={{ color }}
                onClick={() => toggleStatus(status)}>
                <span className="chip-dot" style={{ background: color }}></span> {label}
              </label>
            ))}
            <button className="btn-link" style={{ marginLeft: 'auto' }} onClick={resetFilters}>Reset</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Receipt size={64} style={{ color: '#C4C9D1', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No expenses yet</h2>
          <p style={{ color: '#8B959E', marginBottom: 20 }}>Create your first expense to get started</p>
          <button className="btn btn-primary" onClick={() => setModalTab('expense')}>New Expense</button>
        </div>
      ) : viewMode === 'receipt' ? (
        <div className="receipt-wall">
          {paged.map(exp => {
            const amt = formatAmount(exp.amount);
            const violations = getViolations(exp);
            return (
              <div key={exp.id} className="receipt-card" onClick={() => setDetailExpense(exp)}>
                <div className="receipt-card-image">
                  <Receipt size={32} />
                </div>
                <div className="receipt-card-info">
                  <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {exp.merchant}
                    {violations.length > 0 && (
                      <span title={violations.join('; ')} style={{ color: '#F5A623', cursor: 'help', display: 'inline-flex' }}>
                        <AlertTriangle size={13} />
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#03D47C' }}>{amt.dollars}{amt.cents}</div>
                  <div style={{ fontSize: 12, color: '#8B959E' }}>{formatDate(exp.date)}</div>
                  <span className={'status-badge ' + exp.status} style={{ fontSize: 10 }}>{exp.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="expense-grid">
          {paged.map(exp => {
            const amt = formatAmount(exp.amount);
            const violations = getViolations(exp);
            return (
              <div key={exp.id} className="expense-grid-card" onClick={() => setDetailExpense(exp)}>
                <div className="expense-grid-receipt"><Receipt size={32} /></div>
                <div className="expense-grid-merchant">
                  {exp.merchant}
                  {violations.length > 0 && (
                    <span title={violations.join('; ')} style={{ color: '#F5A623', marginLeft: 4, cursor: 'help', display: 'inline-flex' }}>
                      <AlertTriangle size={13} />
                    </span>
                  )}
                </div>
                <div className="expense-grid-amount">{amt.dollars}{amt.cents}</div>
                <div className="expense-grid-meta">
                  <span style={{ fontSize: 12, color: '#8B959E' }}>{formatDate(exp.date)}</span>
                  {exp.category && <span className={'status-badge ' + exp.status} style={{ fontSize: 10 }}>{exp.status}</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
              <th onClick={() => handleSort('date')}>Date <SortArrow col="date" /></th>
              <th onClick={() => handleSort('merchant')}>Merchant <SortArrow col="merchant" /></th>
              <th onClick={() => handleSort('amount')}>Amount <SortArrow col="amount" /></th>
              <th onClick={() => handleSort('policy')}>Policy <SortArrow col="policy" /></th>
              <th onClick={() => handleSort('category')}>Category <SortArrow col="category" /></th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(exp => {
              const amt = formatAmount(exp.amount);
              const report = getReport(exp.reportId);
              const policy = getPolicy(exp.policyId);
              const isCompact = viewMode === 'compact';
              const violations = getViolations(exp);
              return (
                <tr key={exp.id} style={{ height: isCompact ? 48 : 70 }} onClick={() => setDetailExpense(exp)}>
                  <td className="checkbox-cell" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(exp.id)} onChange={() => dispatch({ type: 'TOGGLE_EXPENSE_SELECTION', payload: exp.id })} />
                  </td>
                  <td>
                    <div style={{ fontSize: isCompact ? 13 : 12, color: '#8B959E' }}>{formatDate(exp.date)}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {!isCompact && <TypeIcon type={exp.type} />}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: isCompact ? 13 : 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {exp.merchant}
                          {violations.length > 0 && (
                            <span title={violations.join('; ')} style={{ color: '#F5A623', cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
                              <AlertTriangle size={14} />
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                          <span className={'status-badge ' + exp.status}>{exp.status}</span>
                          {report && <span style={{ fontSize: 12, color: '#8B959E' }}>{report.title} #{report.reportNumber}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="amount-display">
                      <span className="amount-dollars">{amt.dollars}</span>
                      <span className="amount-cents">{amt.cents}</span>
                    </span>
                  </td>
                  <td style={{ fontSize: isCompact ? 13 : 14 }}>{policy ? policy.name : ''}</td>
                  <td style={{ fontSize: isCompact ? 13 : 14 }}>{exp.category}</td>
                  <td className="text-truncate" style={{ maxWidth: 200, fontSize: isCompact ? 13 : 14 }}>{exp.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <span>Expenses {filtered.length === 0 ? 0 : page * perPage + 1} to {Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</span>
        <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
        <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
      </div>

      {modalTab && <NewExpenseModal initialTab={modalTab} onClose={() => setModalTab(null)} />}
      {detailExpense && <ExpenseDetailModal expense={detailExpense} onClose={() => setDetailExpense(null)} />}
    </div>
  );
}
