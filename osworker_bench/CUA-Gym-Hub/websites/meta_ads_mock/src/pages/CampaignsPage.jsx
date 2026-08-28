import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Copy, Pencil, BarChart2, ChevronUp, ChevronDown, Search,
  X, ChevronRight, Calendar, Columns, Grid, ArrowUp, ArrowDown,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import CreateCampaignModal from '../components/CreateCampaignModal';
import DateRangePicker from '../components/DateRangePicker';
import './CampaignsPage.css';

// Column definitions for P2.1
const ALL_COLUMNS = {
  Performance: [
    { key: 'results', label: 'Results' },
    { key: 'reach', label: 'Reach' },
    { key: 'impressions', label: 'Impressions' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'costPerResult', label: 'Cost per result' },
    { key: 'amountSpent', label: 'Amount spent' },
  ],
  Engagement: [
    { key: 'clicks', label: 'Clicks (all)' },
    { key: 'ctr', label: 'CTR' },
    { key: 'cpc', label: 'CPC' },
    { key: 'cpm', label: 'CPM' },
  ],
  Conversions: [
    { key: 'roas', label: 'ROAS' },
    { key: 'purchases', label: 'Purchases' },
    { key: 'addToCart', label: 'Add to cart' },
    { key: 'leads', label: 'Leads' },
  ],
  Settings: [
    { key: 'bidStrategy', label: 'Bid strategy' },
    { key: 'budget', label: 'Budget' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'schedule', label: 'Schedule' },
  ],
};

const COLUMN_PRESETS = {
  Performance: ['results', 'reach', 'impressions', 'costPerResult', 'amountSpent'],
  Delivery: ['delivery', 'bidStrategy', 'budget', 'results', 'reach', 'impressions'],
  Engagement: ['clicks', 'ctr', 'cpc', 'cpm', 'reach', 'impressions'],
};

// Breakdown definitions for P2.2
const BREAKDOWN_OPTIONS = {
  'By Time': ['Day', 'Week', '2 Weeks', 'Month'],
  'By Delivery': ['Age', 'Gender', 'Platform', 'Placement', 'Device'],
  'By Action': ['Conversion device', 'Destination'],
};

const AGE_BUCKETS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const GENDER_BUCKETS = ['Male', 'Female', 'Unknown'];
const PLATFORM_BUCKETS = ['Facebook', 'Instagram', 'Messenger', 'Audience Network'];
const PLACEMENT_BUCKETS = ['Feed', 'Stories', 'Reels', 'Right Column', 'In-Stream Video'];
const DEVICE_BUCKETS = ['Mobile', 'Desktop', 'Tablet'];

function getBuckets(breakdown) {
  if (breakdown === 'Age') return AGE_BUCKETS;
  if (breakdown === 'Gender') return GENDER_BUCKETS;
  if (breakdown === 'Platform') return PLATFORM_BUCKETS;
  if (breakdown === 'Placement') return PLACEMENT_BUCKETS;
  if (breakdown === 'Device') return DEVICE_BUCKETS;
  // Time-based breakdowns
  if (breakdown === 'Day') {
    const buckets = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return buckets;
  }
  if (breakdown === 'Week') {
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  }
  if (breakdown === '2 Weeks') {
    const buckets = [];
    for (let i = 3; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - i * 14);
      const start = new Date(end);
      start.setDate(start.getDate() - 13);
      const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      buckets.push(`${fmt(start)}–${fmt(end)}`);
    }
    return buckets;
  }
  if (breakdown === 'Month') {
    const buckets = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      buckets.push(d.toLocaleDateString('en-US', { month: 'long' }));
    }
    return buckets;
  }
  return [];
}

function generateSubRows(entity, buckets) {
  const total = {
    results: entity.results || 0,
    reach: entity.reach || 0,
    impressions: entity.impressions || 0,
    amountSpent: entity.amountSpent || 0,
    costPerResult: entity.costPerResult || 0,
  };
  // Generate random proportions that sum to ~1
  const raws = buckets.map(() => 0.5 + Math.random());
  const sum = raws.reduce((a, b) => a + b, 0);
  const props = raws.map(r => r / sum);

  return buckets.map((label, i) => ({
    label,
    results: Math.round(total.results * props[i]),
    reach: Math.round(total.reach * props[i]),
    impressions: Math.round(total.impressions * props[i]),
    amountSpent: parseFloat((total.amountSpent * props[i]).toFixed(2)),
    costPerResult: total.costPerResult > 0 ? parseFloat((total.costPerResult * (0.8 + Math.random() * 0.4)).toFixed(2)) : 0,
  }));
}

// ----- Columns Modal (P2.1) -----
function ColumnsModal({ visible, onApply, onClose }) {
  const allKeys = Object.values(ALL_COLUMNS).flat().map(c => c.key);
  const [checked, setChecked] = useState(() => new Set(visible));
  const [ordered, setOrdered] = useState(() => visible.filter(k => allKeys.includes(k)));
  const [activePreset, setActivePreset] = useState(null);

  function toggleCol(key) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setOrdered(o => o.filter(k => k !== key));
      } else {
        next.add(key);
        setOrdered(o => [...o, key]);
      }
      return next;
    });
    setActivePreset(null);
  }

  function applyPreset(name) {
    const keys = COLUMN_PRESETS[name] || [];
    setChecked(new Set(keys));
    setOrdered([...keys]);
    setActivePreset(name);
  }

  function moveUp(idx) {
    if (idx === 0) return;
    setOrdered(o => {
      const n = [...o];
      [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
      return n;
    });
  }

  function moveDown(idx) {
    setOrdered(o => {
      if (idx >= o.length - 1) return o;
      const n = [...o];
      [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
      return n;
    });
  }

  function getLabel(key) {
    for (const cols of Object.values(ALL_COLUMNS)) {
      const found = cols.find(c => c.key === key);
      if (found) return found.label;
    }
    return key;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="columns-modal" onClick={e => e.stopPropagation()}>
        <div className="columns-modal-header">
          <div className="columns-modal-title">Customize columns</div>
          <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="columns-modal-presets">
          <span className="columns-modal-preset-label">Presets:</span>
          {Object.keys(COLUMN_PRESETS).map(name => (
            <button
              key={name}
              className={`columns-preset-btn ${activePreset === name ? 'columns-preset-btn--active' : ''}`}
              onClick={() => applyPreset(name)}
            >
              {name}
            </button>
          ))}
          <button
            className={`columns-preset-btn ${activePreset === null ? 'columns-preset-btn--active' : ''}`}
            onClick={() => setActivePreset(null)}
          >
            Custom
          </button>
        </div>
        <div className="columns-modal-body">
          {/* Left: available columns by group */}
          <div className="columns-left">
            {Object.entries(ALL_COLUMNS).map(([group, cols]) => (
              <div key={group} className="columns-group">
                <div className="columns-group-label">{group}</div>
                {cols.map(col => (
                  <label key={col.key} className="columns-check-item">
                    <input
                      type="checkbox"
                      checked={checked.has(col.key)}
                      onChange={() => toggleCol(col.key)}
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          {/* Right: ordered selected columns */}
          <div className="columns-right">
            <div className="columns-right-header">Selected columns ({ordered.length})</div>
            <div className="columns-right-list">
              {ordered.length === 0 ? (
                <div className="columns-right-empty">No columns selected</div>
              ) : (
                ordered.map((key, idx) => (
                  <div key={key} className="columns-right-item">
                    <span className="columns-right-name">{getLabel(key)}</span>
                    <div className="columns-right-btns">
                      <button
                        className="columns-arrow-btn"
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        title="Move up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        className="columns-arrow-btn"
                        onClick={() => moveDown(idx)}
                        disabled={idx === ordered.length - 1}
                        title="Move down"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        className="columns-arrow-btn columns-remove-btn"
                        onClick={() => toggleCol(key)}
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="columns-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => { onApply(ordered); onClose(); }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

function formatNum(n) {
  if (n === null || n === undefined || n === 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function formatCurrency(n) {
  if (!n) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function DeliveryBadge({ status }) {
  const map = {
    active: { label: 'Active', color: '#31A24C' },
    not_delivering: { label: 'Off', color: '#65676B' },
    scheduled: { label: 'Scheduled', color: '#F7B928' },
    completed: { label: 'Completed', color: '#65676B' },
    in_review: { label: 'In Review', color: '#0866FF' },
    error: { label: 'Error', color: '#FA383E' },
    draft: { label: 'Draft', color: '#8A8D91' },
  };
  const d = map[status] || map['not_delivering'];
  return (
    <span className="delivery-badge">
      <span className="delivery-dot" style={{ background: d.color }} />
      {d.label}
    </span>
  );
}

function StatusToggle({ status, onToggle }) {
  const on = status === 'active';
  return (
    <button
      className={`status-toggle ${on ? 'status-toggle--on' : ''}`}
      onClick={e => { e.stopPropagation(); onToggle(); }}
      title={on ? 'Pause' : 'Activate'}
    >
      <span className="status-toggle-thumb" />
    </button>
  );
}

function BudgetDisplay({ entity }) {
  if (entity.dailyBudget) return <span>{formatCurrency(entity.dailyBudget)}/day</span>;
  if (entity.lifetimeBudget) return <span>{formatCurrency(entity.lifetimeBudget)} lifetime</span>;
  return <span className="text-muted">—</span>;
}

function BidStrategyLabel({ strategy }) {
  const map = {
    lowest_cost: 'Lowest cost',
    cost_cap: 'Cost cap',
    bid_cap: 'Bid cap',
    target_cost: 'Target cost',
  };
  return <span>{map[strategy] || strategy}</span>;
}

function InlineNameEditor({ value, onSave, onCancel }) {
  const [v, setV] = useState(value);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

  function handleKey(e) {
    if (e.key === 'Enter') onSave(v);
    if (e.key === 'Escape') onCancel();
  }

  return (
    <input
      ref={ref}
      className="inline-name-input"
      value={v}
      onChange={e => setV(e.target.value)}
      onKeyDown={handleKey}
      onBlur={() => onSave(v)}
      onClick={e => e.stopPropagation()}
    />
  );
}

function BudgetPopover({ entity, entityType, onSave, onClose }) {
  const [val, setVal] = useState(entity.dailyBudget || entity.lifetimeBudget || 0);
  const [type, setType] = useState(entity.lifetimeBudget ? 'lifetime' : 'daily');
  const ref = useRef(null);

  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  function handleSave() {
    const update = type === 'daily'
      ? { dailyBudget: parseFloat(val), lifetimeBudget: null }
      : { dailyBudget: null, lifetimeBudget: parseFloat(val) };
    onSave(update);
    onClose();
  }

  return (
    <div ref={ref} className="budget-popover" onClick={e => e.stopPropagation()}>
      <div className="budget-popover-type">
        <label>
          <input type="radio" value="daily" checked={type === 'daily'} onChange={() => setType('daily')} />
          Daily budget
        </label>
        <label>
          <input type="radio" value="lifetime" checked={type === 'lifetime'} onChange={() => setType('lifetime')} />
          Lifetime budget
        </label>
      </div>
      <div className="budget-popover-input">
        <span>$</span>
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          min="1"
          step="0.01"
          autoFocus
        />
      </div>
      <div className="budget-popover-actions">
        <button className="btn-outline btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn-primary btn-sm" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

const DATE_RANGE_LABELS = {
  today: 'Today',
  yesterday: 'Yesterday',
  last_7_days: 'Last 7 days',
  last_14_days: 'Last 14 days',
  last_30_days: 'Last 30 days',
  this_month: 'This month',
  last_month: 'Last month',
  maximum: 'Maximum',
};

export default function CampaignsPage({ defaultTab }) {
  const navigate = useNavigate();
  const { state, toggleStatus, duplicateEntity, bulkAction, updateCampaign, updateAdSet, updateAd, setSelectedTab, setSelectedRows, setSearchQuery, setDateRange, setVisibleColumns, setActiveBreakdown } = useApp();
  const { showToast } = useToast();

  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [editingName, setEditingName] = useState(null); // { id, entityType }
  const [editingBudget, setEditingBudget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hoverRow, setHoverRow] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [chartEntityId, setChartEntityId] = useState(null);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [showBreakdownDropdown, setShowBreakdownDropdown] = useState(false);
  // activeBreakdown is tracked in AppContext state (AUDIT-020)
  // Map of entityId -> sub-rows for breakdown
  const [breakdownRows, setBreakdownRows] = useState({});
  const breakdownRef = useRef(null);
  const filterRef = useRef(null);
  const datepickerRef = useRef(null);

  const tab = defaultTab || state.selectedTab || 'campaigns';
  // Use visibleColumns from state (P2.1)
  const defaultCols = ['delivery', 'bidStrategy', 'budget', 'results', 'reach', 'impressions', 'costPerResult', 'amountSpent', 'roas'];
  const visibleColumns = (state.visibleColumns && state.visibleColumns.length > 0) ? state.visibleColumns : defaultCols;

  // Close dropdowns on outside click
  useEffect(() => {
    function h(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterDropdown(false);
      if (datepickerRef.current && !datepickerRef.current.contains(e.target)) setShowDatePicker(false);
      if (breakdownRef.current && !breakdownRef.current.contains(e.target)) setShowBreakdownDropdown(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const entities = useMemo(() => {
    if (tab === 'campaigns') return state.campaigns;
    if (tab === 'adSets') return state.adSets;
    return state.ads;
  }, [tab, state.campaigns, state.adSets, state.ads]);

  const entityType = tab === 'campaigns' ? 'campaigns' : tab === 'adSets' ? 'adSets' : 'ads';

  const filtered = useMemo(() => {
    let items = entities.filter(e => e.status !== 'deleted');
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      items = items.filter(e => e.name.toLowerCase().includes(q));
    }
    if (activeFilters.status?.length) {
      items = items.filter(e => activeFilters.status.includes(e.status));
    }
    if (activeFilters.delivery?.length) {
      items = items.filter(e => activeFilters.delivery.includes(e.deliveryStatus));
    }
    if (activeFilters.objective?.length && tab === 'campaigns') {
      items = items.filter(e => activeFilters.objective.includes(e.objective));
    }
    return items;
  }, [entities, state.searchQuery, activeFilters, tab]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av || '').localeCompare(String(bv || ''))
        : String(bv || '').localeCompare(String(av || ''));
    });
  }, [filtered, sortCol, sortDir]);

  const totals = useMemo(() => ({
    results: sorted.reduce((s, e) => s + (e.results || 0), 0),
    reach: sorted.reduce((s, e) => s + (e.reach || 0), 0),
    impressions: sorted.reduce((s, e) => s + (e.impressions || 0), 0),
    amountSpent: sorted.reduce((s, e) => s + (e.amountSpent || 0), 0),
  }), [sorted]);

  function handleSort(col) {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortCol(null); setSortDir('asc'); }
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  function SortIcon({ col }) {
    if (sortCol !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  }

  function handleRowClick(e, id) {
    if (e.target.closest('.status-toggle') || e.target.closest('input[type=checkbox]') ||
        e.target.closest('.row-action') || e.target.closest('.inline-name-input') ||
        e.target.closest('.budget-cell')) return;
    if (tab === 'campaigns') navigate(`/campaigns/${id}`);
  }

  function handleCheckbox(id, checked) {
    const rows = state.selectedRows || [];
    setSelectedRows(checked ? [...rows, id] : rows.filter(r => r !== id));
  }

  function handleSelectAll(checked) {
    setSelectedRows(checked ? sorted.map(e => e.id) : []);
  }

  function handleToggle(id) {
    toggleStatus(entityType, id);
  }

  function handleDuplicate(id) {
    duplicateEntity(entityType, id);
    showToast('Campaign duplicated. Edit your draft to make changes.');
  }

  function handleBreakdownSelect(opt) {
    if (state.activeBreakdown === opt) {
      setActiveBreakdown(null);
      setBreakdownRows({});
    } else {
      const buckets = getBuckets(opt);
      setActiveBreakdown(opt);
      if (buckets.length > 0) {
        const rows = {};
        sorted.forEach(entity => {
          rows[entity.id] = generateSubRows(entity, buckets);
        });
        setBreakdownRows(rows);
      } else {
        setBreakdownRows({});
      }
      setShowBreakdownDropdown(false);
    }
  }

  function handleApplyColumns(cols) {
    setVisibleColumns(cols);
  }

  function handleBulkAction(action) {
    const ids = state.selectedRows || [];
    if (!ids.length) return;
    bulkAction(entityType, ids, action);
    if (action === 'delete') showToast(`${ids.length} campaign(s) deleted.`);
    else if (action === 'pause') showToast(`${ids.length} campaign(s) paused.`);
    else if (action === 'activate') showToast(`${ids.length} campaign(s) activated.`);
    else if (action === 'duplicate') showToast(`${ids.length} campaign(s) duplicated.`);
  }

  function handleNameSave(id, newName) {
    if (entityType === 'campaigns') updateCampaign(id, { name: newName });
    else if (entityType === 'adSets') updateAdSet(id, { name: newName });
    else updateAd(id, { name: newName });
    setEditingName(null);
  }

  function handleBudgetSave(id, updates) {
    if (entityType === 'campaigns') updateCampaign(id, updates);
    else if (entityType === 'adSets') updateAdSet(id, updates);
    setEditingBudget(null);
    showToast('Budget updated.');
  }

  function removeFilter(key, val) {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (val === null) delete next[key];
      else next[key] = (next[key] || []).filter(v => v !== val);
      if (next[key]?.length === 0) delete next[key];
      return next;
    });
  }

  const selected = state.selectedRows || [];
  const allSelected = sorted.length > 0 && selected.length === sorted.length;
  const someSelected = selected.length > 0 && !allSelected;

  const tabLabels = { campaigns: 'Campaigns', adSets: 'Ad Sets', ads: 'Ads' };
  const tabKeys = ['campaigns', 'adSets', 'ads'];
  const tabCounts = {
    campaigns: state.campaigns.filter(c => c.status !== 'deleted').length,
    adSets: state.adSets.filter(a => a.status !== 'deleted').length,
    ads: state.ads.filter(a => a.status !== 'deleted').length,
  };

  function handleTabChange(t) {
    setSelectedTab(t);
    setSelectedRows([]);
    if (t === 'campaigns') navigate('/campaigns');
    else if (t === 'adSets') navigate('/ad-sets');
    else navigate('/ads');
  }

  return (
    <div className="campaigns-page">
      {/* Tab bar */}
      <div className="tab-bar">
        {tabKeys.map(t => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'tab-btn--active' : ''}`}
            onClick={() => handleTabChange(t)}
          >
            {tabLabels[t]}
            <span className="tab-count">{tabCounts[t]}</span>
          </button>
        ))}
      </div>

      <div className="campaigns-card">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={14} />
              Create
            </button>
            <button
              className="btn-outline"
              disabled={selected.length === 0}
              onClick={() => handleBulkAction('duplicate')}
            >
              <Copy size={14} />
              Duplicate
            </button>
            <button
              className="btn-outline"
              disabled={selected.length !== 1}
              onClick={() => selected.length === 1 && setEditingName({ id: selected[0], entityType })}
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>
          <div className="toolbar-right">
            <div style={{ position: 'relative' }}>
              <button className="btn-outline" onClick={() => { setShowColumnsModal(true); setShowBreakdownDropdown(false); }}>
                <Columns size={14} />
                Columns
              </button>
            </div>
            <div ref={breakdownRef} style={{ position: 'relative' }}>
              <button
                className={`btn-outline ${state.activeBreakdown ? 'btn-outline--active' : ''}`}
                onClick={() => { setShowBreakdownDropdown(v => !v); }}
              >
                <Grid size={14} />
                {state.activeBreakdown ? `Breakdown: ${state.activeBreakdown}` : 'Breakdown'}
              </button>
              {showBreakdownDropdown && (
                <div className="filter-dropdown" style={{ right: 0, left: 'auto', minWidth: 200 }}>
                  <div className="filter-section">
                    <label className="filter-option" style={{ fontStyle: 'italic' }}>
                      <input
                        type="radio"
                        name="breakdown"
                        checked={state.activeBreakdown === null}
                        onChange={() => { setActiveBreakdown(null); setBreakdownRows({}); setShowBreakdownDropdown(false); }}
                      />
                      <span>None</span>
                    </label>
                  </div>
                  {Object.entries(BREAKDOWN_OPTIONS).map(([section, opts]) => (
                    <div key={section} className="filter-section">
                      <div className="filter-section-label">{section}</div>
                      {opts.map(opt => (
                        <label key={opt} className="filter-option">
                          <input
                            type="radio"
                            name="breakdown"
                            checked={state.activeBreakdown === opt}
                            onChange={() => handleBreakdownSelect(opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div ref={datepickerRef} style={{ position: 'relative' }}>
              <button
                className="btn-outline"
                onClick={() => setShowDatePicker(v => !v)}
              >
                <Calendar size={14} />
                {typeof state.selectedDateRange === 'object' && state.selectedDateRange?.label
                  ? state.selectedDateRange.label
                  : (DATE_RANGE_LABELS[state.selectedDateRange] || state.selectedDateRange)}
              </button>
              {showDatePicker && (
                <DateRangePicker
                  value={state.selectedDateRange}
                  onChange={r => { setDateRange(r); setShowDatePicker(false); }}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="search-bar-row">
          <div className="search-input-wrap">
            <Search size={14} className="search-icon" />
            <input
              className="search-input"
              type="text"
              placeholder={`Search ${tab}`}
              value={state.searchQuery || ''}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              className="btn-outline"
              onClick={() => setShowFilterDropdown(v => !v)}
            >
              Filter
            </button>
            {showFilterDropdown && (
              <FilterDropdown
                activeFilters={activeFilters}
                onChange={setActiveFilters}
                onClose={() => setShowFilterDropdown(false)}
                showObjective={tab === 'campaigns'}
              />
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="filter-chips">
            {Object.entries(activeFilters).map(([key, vals]) =>
              vals.map(v => (
                <span key={`${key}-${v}`} className="filter-chip">
                  {key}: {v}
                  <button onClick={() => removeFilter(key, v)}><X size={10} /></button>
                </span>
              ))
            )}
            <button className="filter-chip-clear" onClick={() => setActiveFilters({})}>Clear all</button>
          </div>
        )}

        {/* Bulk action bar */}
        {selected.length > 0 && (
          <div className="bulk-bar">
            <span className="bulk-count">{selected.length} selected</span>
            <button className="bulk-action-btn" onClick={() => handleBulkAction('pause')}>Pause</button>
            <button className="bulk-action-btn" onClick={() => handleBulkAction('activate')}>Activate</button>
            <button className="bulk-action-btn" onClick={() => handleBulkAction('duplicate')}>Duplicate</button>
            <button className="bulk-action-btn bulk-action-btn--danger" onClick={() => handleBulkAction('delete')}>Delete</button>
          </div>
        )}

        {/* Chart panel */}
        {chartEntityId && (() => {
          const chartEntity = sorted.find(e => e.id === chartEntityId);
          if (!chartEntity) return null;
          return <ChartPanel entity={chartEntity} onClose={() => setChartEntityId(null)} />;
        })()}

        {/* Table */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-check">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected; }}
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="col-toggle">On/Off</th>
                <th className="col-name sortable" onClick={() => handleSort('name')}>
                  {tab === 'campaigns' ? 'Campaign name' : tab === 'adSets' ? 'Ad set name' : 'Ad name'}
                  <SortIcon col="name" />
                </th>
                {visibleColumns.includes('delivery') && (
                  <th className="col-delivery">Delivery</th>
                )}
                {tab !== 'ads' && visibleColumns.includes('bidStrategy') && (
                  <th className="col-bid sortable" onClick={() => handleSort('bidStrategy')}>
                    Bid strategy<SortIcon col="bidStrategy" />
                  </th>
                )}
                {tab !== 'ads' && visibleColumns.includes('budget') && (
                  <th className="col-budget sortable" onClick={() => handleSort('dailyBudget')}>
                    Budget<SortIcon col="dailyBudget" />
                  </th>
                )}
                {tab === 'ads' && (
                  <th className="col-review">Review status</th>
                )}
                {visibleColumns.includes('results') && (
                  <th className="col-num sortable" onClick={() => handleSort('results')}>
                    Results<SortIcon col="results" />
                  </th>
                )}
                {visibleColumns.includes('reach') && (
                  <th className="col-num sortable" onClick={() => handleSort('reach')}>
                    Reach<SortIcon col="reach" />
                  </th>
                )}
                {visibleColumns.includes('impressions') && (
                  <th className="col-num sortable" onClick={() => handleSort('impressions')}>
                    Impressions<SortIcon col="impressions" />
                  </th>
                )}
                {visibleColumns.includes('frequency') && (
                  <th className="col-num sortable" onClick={() => handleSort('frequency')}>
                    Frequency<SortIcon col="frequency" />
                  </th>
                )}
                {visibleColumns.includes('clicks') && (
                  <th className="col-num sortable" onClick={() => handleSort('clicks')}>
                    Clicks<SortIcon col="clicks" />
                  </th>
                )}
                {visibleColumns.includes('ctr') && (
                  <th className="col-num sortable" onClick={() => handleSort('ctr')}>
                    CTR<SortIcon col="ctr" />
                  </th>
                )}
                {visibleColumns.includes('cpc') && (
                  <th className="col-num sortable" onClick={() => handleSort('cpc')}>
                    CPC<SortIcon col="cpc" />
                  </th>
                )}
                {visibleColumns.includes('cpm') && (
                  <th className="col-num sortable" onClick={() => handleSort('cpm')}>
                    CPM<SortIcon col="cpm" />
                  </th>
                )}
                {visibleColumns.includes('roas') && (
                  <th className="col-num sortable" onClick={() => handleSort('roas')}>
                    ROAS<SortIcon col="roas" />
                  </th>
                )}
                {visibleColumns.includes('purchases') && (
                  <th className="col-num sortable" onClick={() => handleSort('purchases')}>
                    Purchases<SortIcon col="purchases" />
                  </th>
                )}
                {visibleColumns.includes('addToCart') && (
                  <th className="col-num sortable" onClick={() => handleSort('addToCart')}>
                    Add to cart<SortIcon col="addToCart" />
                  </th>
                )}
                {visibleColumns.includes('leads') && (
                  <th className="col-num sortable" onClick={() => handleSort('leads')}>
                    Leads<SortIcon col="leads" />
                  </th>
                )}
                {visibleColumns.includes('schedule') && tab !== 'ads' && (
                  <th className="col-num">Schedule</th>
                )}
                {visibleColumns.includes('costPerResult') && (
                  <th className="col-num sortable" onClick={() => handleSort('costPerResult')}>
                    Cost/result<SortIcon col="costPerResult" />
                  </th>
                )}
                {visibleColumns.includes('amountSpent') && (
                  <th className="col-num sortable" onClick={() => handleSort('amountSpent')}>
                    Amount spent<SortIcon col="amountSpent" />
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No {tab} found
                  </td>
                </tr>
              ) : (
                sorted.map(entity => (
                <React.Fragment key={entity.id}>
                  <tr
                    key={entity.id}
                    className={`table-row ${(selected.includes(entity.id)) ? 'table-row--selected' : ''}`}
                    onClick={e => handleRowClick(e, entity.id)}
                    onMouseEnter={() => setHoverRow(entity.id)}
                    onMouseLeave={() => setHoverRow(null)}
                  >
                    <td className="col-check" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(entity.id)}
                        onChange={e => handleCheckbox(entity.id, e.target.checked)}
                      />
                    </td>
                    <td className="col-toggle">
                      {entity.status !== 'draft' && entity.status !== 'deleted' && entity.status !== 'completed' && (
                        <StatusToggle status={entity.status} onToggle={() => handleToggle(entity.id)} />
                      )}
                    </td>
                    <td className="col-name">
                      {editingName?.id === entity.id ? (
                        <InlineNameEditor
                          value={entity.name}
                          onSave={v => handleNameSave(entity.id, v)}
                          onCancel={() => setEditingName(null)}
                        />
                      ) : (
                        <div className="name-cell">
                          <span
                            className="entity-name"
                            onDoubleClick={() => setEditingName({ id: entity.id, entityType })}
                          >
                            {entity.name}
                          </span>
                          {entity.status === 'draft' && (
                            <span className="draft-badge">Draft</span>
                          )}
                          {hoverRow === entity.id && (
                            <div className="row-actions">
                              <button
                                className="row-action"
                                title="View charts"
                                onClick={e => { e.stopPropagation(); setChartEntityId(prev => prev === entity.id ? null : entity.id); }}
                              >
                                <BarChart2 size={14} />
                              </button>
                              <button
                                className="row-action"
                                title="Edit"
                                onClick={e => { e.stopPropagation(); setEditingName({ id: entity.id, entityType }); }}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="row-action"
                                title="Duplicate"
                                onClick={e => { e.stopPropagation(); handleDuplicate(entity.id); }}
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    {visibleColumns.includes('delivery') && (
                      <td className="col-delivery">
                        <DeliveryBadge status={entity.status === 'draft' ? 'draft' : entity.deliveryStatus} />
                      </td>
                    )}
                    {tab !== 'ads' && visibleColumns.includes('bidStrategy') && (
                      <td className="col-bid">
                        <BidStrategyLabel strategy={entity.bidStrategy} />
                      </td>
                    )}
                    {tab !== 'ads' && visibleColumns.includes('budget') && (
                      <td
                        className="col-budget budget-cell"
                        onClick={e => { e.stopPropagation(); setEditingBudget({ id: entity.id, entityType }); }}
                        style={{ cursor: 'pointer', position: 'relative' }}
                      >
                        <BudgetDisplay entity={entity} />
                        {editingBudget?.id === entity.id && (
                          <BudgetPopover
                            entity={entity}
                            entityType={entityType}
                            onSave={updates => handleBudgetSave(entity.id, updates)}
                            onClose={() => setEditingBudget(null)}
                          />
                        )}
                      </td>
                    )}
                    {tab === 'ads' && (
                      <td className="col-review">
                        <ReviewBadge status={entity.reviewStatus} />
                      </td>
                    )}
                    {visibleColumns.includes('results') && (
                      <td className="col-num">{entity.results ? formatNum(entity.results) : '—'}</td>
                    )}
                    {visibleColumns.includes('reach') && (
                      <td className="col-num">{entity.reach ? formatNum(entity.reach) : '—'}</td>
                    )}
                    {visibleColumns.includes('impressions') && (
                      <td className="col-num">{entity.impressions ? formatNum(entity.impressions) : '—'}</td>
                    )}
                    {visibleColumns.includes('frequency') && (
                      <td className="col-num">{entity.frequency ? formatNum(entity.frequency) : '—'}</td>
                    )}
                    {visibleColumns.includes('clicks') && (
                      <td className="col-num">{entity.clicks ? formatNum(entity.clicks) : '—'}</td>
                    )}
                    {visibleColumns.includes('ctr') && (
                      <td className="col-num">{entity.ctr ? entity.ctr.toFixed(2) + '%' : '—'}</td>
                    )}
                    {visibleColumns.includes('cpc') && (
                      <td className="col-num">{entity.cpc ? formatCurrency(entity.cpc) : '—'}</td>
                    )}
                    {visibleColumns.includes('cpm') && (
                      <td className="col-num">{entity.cpm ? formatCurrency(entity.cpm) : '—'}</td>
                    )}
                    {visibleColumns.includes('roas') && (
                      <td className="col-num">{entity.roas ? entity.roas.toFixed(2) + 'x' : '—'}</td>
                    )}
                    {visibleColumns.includes('purchases') && (
                      <td className="col-num">{entity.purchases ? formatNum(entity.purchases) : '—'}</td>
                    )}
                    {visibleColumns.includes('addToCart') && (
                      <td className="col-num">{entity.addToCart ? formatNum(entity.addToCart) : '—'}</td>
                    )}
                    {visibleColumns.includes('leads') && (
                      <td className="col-num">{entity.leads ? formatNum(entity.leads) : '—'}</td>
                    )}
                    {visibleColumns.includes('schedule') && tab !== 'ads' && (
                      <td className="col-num">{entity.schedule || '—'}</td>
                    )}
                    {visibleColumns.includes('costPerResult') && (
                      <td className="col-num">{entity.costPerResult ? formatCurrency(entity.costPerResult) : '—'}</td>
                    )}
                    {visibleColumns.includes('amountSpent') && (
                      <td className="col-num">{entity.amountSpent ? formatCurrency(entity.amountSpent) : '—'}</td>
                    )}
                  </tr>
                  {/* Breakdown sub-rows (P2.2) */}
                  {state.activeBreakdown && breakdownRows[entity.id] && breakdownRows[entity.id].map((sub, si) => (
                    <tr key={`${entity.id}-sub-${si}`} className="breakdown-row">
                      <td className="col-check" />
                      <td className="col-toggle" />
                      <td className="col-name">
                        <span className="breakdown-label">{sub.label}</span>
                      </td>
                      {visibleColumns.includes('delivery') && <td className="col-delivery" />}
                      {tab !== 'ads' && visibleColumns.includes('bidStrategy') && <td className="col-bid" />}
                      {tab !== 'ads' && visibleColumns.includes('budget') && <td className="col-budget" />}
                      {tab === 'ads' && <td className="col-review" />}
                      {visibleColumns.includes('results') && (
                        <td className="col-num">{sub.results ? formatNum(sub.results) : '—'}</td>
                      )}
                      {visibleColumns.includes('reach') && (
                        <td className="col-num">{sub.reach ? formatNum(sub.reach) : '—'}</td>
                      )}
                      {visibleColumns.includes('impressions') && (
                        <td className="col-num">{sub.impressions ? formatNum(sub.impressions) : '—'}</td>
                      )}
                      {visibleColumns.includes('frequency') && <td className="col-num">—</td>}
                      {visibleColumns.includes('clicks') && <td className="col-num">—</td>}
                      {visibleColumns.includes('ctr') && <td className="col-num">—</td>}
                      {visibleColumns.includes('cpc') && <td className="col-num">—</td>}
                      {visibleColumns.includes('cpm') && <td className="col-num">—</td>}
                      {visibleColumns.includes('roas') && <td className="col-num">—</td>}
                      {visibleColumns.includes('purchases') && <td className="col-num">—</td>}
                      {visibleColumns.includes('addToCart') && <td className="col-num">—</td>}
                      {visibleColumns.includes('leads') && <td className="col-num">—</td>}
                      {visibleColumns.includes('schedule') && tab !== 'ads' && <td className="col-num">—</td>}
                      {visibleColumns.includes('costPerResult') && (
                        <td className="col-num">{sub.costPerResult ? formatCurrency(sub.costPerResult) : '—'}</td>
                      )}
                      {visibleColumns.includes('amountSpent') && (
                        <td className="col-num">{sub.amountSpent ? formatCurrency(sub.amountSpent) : '—'}</td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
            </tbody>
            {sorted.length > 0 && (
              <tfoot>
                <tr className="totals-row">
                  <td colSpan={3} className="totals-label">Totals</td>
                  {visibleColumns.includes('delivery') && <td />}
                  {tab !== 'ads' && visibleColumns.includes('bidStrategy') && <td />}
                  {tab !== 'ads' && visibleColumns.includes('budget') && <td />}
                  {tab === 'ads' && <td />}
                  {visibleColumns.includes('results') && <td className="col-num">{formatNum(totals.results)}</td>}
                  {visibleColumns.includes('reach') && <td className="col-num">{formatNum(totals.reach)}</td>}
                  {visibleColumns.includes('impressions') && <td className="col-num">{formatNum(totals.impressions)}</td>}
                  {visibleColumns.includes('frequency') && <td className="col-num">—</td>}
                  {visibleColumns.includes('clicks') && <td className="col-num">—</td>}
                  {visibleColumns.includes('ctr') && <td className="col-num">—</td>}
                  {visibleColumns.includes('cpc') && <td className="col-num">—</td>}
                  {visibleColumns.includes('cpm') && <td className="col-num">—</td>}
                  {visibleColumns.includes('roas') && <td className="col-num">—</td>}
                  {visibleColumns.includes('purchases') && <td className="col-num">—</td>}
                  {visibleColumns.includes('addToCart') && <td className="col-num">—</td>}
                  {visibleColumns.includes('leads') && <td className="col-num">—</td>}
                  {visibleColumns.includes('schedule') && tab !== 'ads' && <td className="col-num">—</td>}
                  {visibleColumns.includes('costPerResult') && <td className="col-num">—</td>}
                  {visibleColumns.includes('amountSpent') && <td className="col-num">{formatCurrency(totals.amountSpent)}</td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            showToast('Campaign created successfully!');
          }}
        />
      )}

      {/* P2.1 Columns Modal */}
      {showColumnsModal && (
        <ColumnsModal
          visible={visibleColumns}
          onApply={handleApplyColumns}
          onClose={() => setShowColumnsModal(false)}
        />
      )}
    </div>
  );
}

function ReviewBadge({ status }) {
  const map = {
    approved: { label: 'Approved', bg: '#E6F4EA', color: '#31A24C' },
    pending: { label: 'In Review', bg: '#FFF9E6', color: '#F7B928' },
    rejected: { label: 'Rejected', bg: '#FFF0F0', color: '#FA383E' },
  };
  const s = map[status] || map['pending'];
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function ChartPanel({ entity, onClose }) {
  const DAYS = 14;
  const labels = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (DAYS - 1 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  function makePoints(total, w, h) {
    const vals = Array.from({ length: DAYS }, (_, i) => {
      const base = (total / DAYS) * (0.5 + Math.random());
      return Math.max(0, base);
    });
    const max = Math.max(...vals, 1);
    return vals.map((v, i) => {
      const x = (i / (DAYS - 1)) * w;
      const y = h - (v / max) * h * 0.85;
      return `${x},${y}`;
    }).join(' ');
  }

  const W = 420, H = 100;
  const resultsPoints = makePoints(entity.results || 100, W, H);
  const spentPoints = makePoints(entity.amountSpent || 500, W, H);

  return (
    <div style={{ background: '#F8F9FA', border: '1px solid #E4E6EB', borderRadius: 8, padding: '16px 20px', margin: '0 0 8px 0', height: 300, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1C1E21' }}>Charts: {entity.name}</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#65676B', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#65676B', marginBottom: 8 }}>Results</div>
          <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="none" style={{ display: 'block' }}>
            <polyline fill="none" stroke="#0866FF" strokeWidth="2" points={resultsPoints} />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#65676B', marginTop: 2 }}>
            <span>{labels[0]}</span><span>{labels[Math.floor(DAYS / 2)]}</span><span>{labels[DAYS - 1]}</span>
          </div>
          <div style={{ marginTop: 4, fontWeight: 700, fontSize: 13, color: '#1C1E21' }}>{(entity.results || 0).toLocaleString()} total</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#65676B', marginBottom: 8 }}>Amount Spent</div>
          <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="none" style={{ display: 'block' }}>
            <polyline fill="none" stroke="#31A24C" strokeWidth="2" points={spentPoints} />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#65676B', marginTop: 2 }}>
            <span>{labels[0]}</span><span>{labels[Math.floor(DAYS / 2)]}</span><span>{labels[DAYS - 1]}</span>
          </div>
          <div style={{ marginTop: 4, fontWeight: 700, fontSize: 13, color: '#1C1E21' }}>${(entity.amountSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} total</div>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({ activeFilters, onChange, onClose, showObjective }) {
  const ref = useRef(null);
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  function toggle(key, val) {
    onChange(prev => {
      const cur = prev[key] || [];
      const has = cur.includes(val);
      const next = { ...prev };
      next[key] = has ? cur.filter(v => v !== val) : [...cur, val];
      if (!next[key].length) delete next[key];
      return next;
    });
  }

  function checked(key, val) { return (activeFilters[key] || []).includes(val); }

  return (
    <div ref={ref} className="filter-dropdown">
      <div className="filter-section">
        <div className="filter-section-label">Status</div>
        {['active', 'paused', 'draft', 'completed'].map(s => (
          <label key={s} className="filter-option">
            <input type="checkbox" checked={checked('status', s)} onChange={() => toggle('status', s)} />
            <span style={{ textTransform: 'capitalize' }}>{s}</span>
          </label>
        ))}
      </div>
      <div className="filter-section">
        <div className="filter-section-label">Delivery</div>
        {['active', 'not_delivering', 'error', 'completed'].map(s => (
          <label key={s} className="filter-option">
            <input type="checkbox" checked={checked('delivery', s)} onChange={() => toggle('delivery', s)} />
            <span style={{ textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</span>
          </label>
        ))}
      </div>
      {showObjective && (
        <div className="filter-section">
          <div className="filter-section-label">Objective</div>
          {['awareness', 'traffic', 'engagement', 'leads', 'app_promotion', 'sales'].map(s => (
            <label key={s} className="filter-option">
              <input type="checkbox" checked={checked('objective', s)} onChange={() => toggle('objective', s)} />
              <span style={{ textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
