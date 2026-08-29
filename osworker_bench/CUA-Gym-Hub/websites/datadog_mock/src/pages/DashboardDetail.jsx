import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';
import TimeseriesWidget from '../components/widgets/TimeseriesWidget';
import QueryValueWidget from '../components/widgets/QueryValueWidget';
import TopListWidget from '../components/widgets/TopListWidget';
import TableWidget from '../components/widgets/TableWidget';
import HeatmapWidget from '../components/widgets/HeatmapWidget';

const widgetComponents = {
  timeseries: TimeseriesWidget,
  query_value: QueryValueWidget,
  toplist: TopListWidget,
  table: TableWidget,
  heatmap: HeatmapWidget,
};

const WIDGET_TYPES = [
  { type: 'timeseries', label: 'Timeseries', icon: '\u{1F4C8}', desc: 'Graph metric over time' },
  { type: 'query_value', label: 'Query Value', icon: '\u{1F522}', desc: 'Single metric value' },
  { type: 'toplist', label: 'Top List', icon: '\u{1F3C6}', desc: 'Ranked list of values' },
  { type: 'table', label: 'Table', icon: '\u{1F4CB}', desc: 'Tabular data view' },
  { type: 'heatmap', label: 'Heatmap', icon: '\u{1F525}', desc: 'Distribution over time' },
];

export default function DashboardDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboard = state.dashboards.find(d => d.id === id);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState('');
  const [templateVars, setTemplateVars] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState('timeseries');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [widgetError, setWidgetError] = useState('');

  if (!dashboard) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Dashboard not found. <button className="btn btn-ghost" onClick={() => navigate(withCurrentSearch('/dashboards', location.search))}>Back</button></div>;
  }

  function toggleStar() {
    dispatch({ type: 'UPDATE_DASHBOARD', payload: { id: dashboard.id, isStarred: !dashboard.isStarred } });
  }

  function startEditTitle() {
    setTitleText(dashboard.title);
    setEditingTitle(true);
  }

  function saveTitle() {
    if (titleText.trim()) {
      dispatch({ type: 'UPDATE_DASHBOARD', payload: { id: dashboard.id, title: titleText.trim(), modified: new Date().toISOString() } });
    }
    setEditingTitle(false);
  }

  function handleClone() {
    const cloneId = 'dash-' + Date.now();
    dispatch({ type: 'ADD_DASHBOARD', payload: {
      ...dashboard,
      id: cloneId,
      title: dashboard.title + ' (Clone)',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      isStarred: false,
    } });
    navigate(withCurrentSearch(`/dashboards/${cloneId}`, location.search));
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_DASHBOARD', payload: dashboard.id });
    navigate(withCurrentSearch('/dashboards', location.search));
  }

  function addWidget() {
    if (!newWidgetTitle.trim()) {
      setWidgetError('Enter a widget title before adding it.');
      return;
    }
    const widgetId = 'w-' + Date.now();
    const widgetDefaults = {
      timeseries: { width: 6, height: 2, definition: { requests: [{ query: 'avg:system.cpu.user{*}', displayType: 'line', color: '#7B68EE' }], yaxis: { min: 0 } } },
      query_value: { width: 3, height: 1, definition: { query: 'avg:system.cpu.user{*}', precision: 1, unit: '%', value: Math.round(Math.random() * 80 + 10), conditionalFormats: [] } },
      toplist: { width: 6, height: 2, definition: { query: 'top(avg:system.cpu.user{*} by {host}, 10, "mean", "desc")' } },
      table: { width: 12, height: 2, definition: { query: 'system.cpu.user{*} by {host}', columns: ['Host', 'CPU %', 'Memory %', 'Status'] } },
      heatmap: { width: 6, height: 2, definition: { query: 'avg:system.cpu.user{*} by {host}' } },
    };
    const defaults = widgetDefaults[newWidgetType] || widgetDefaults.timeseries;
    dispatch({ type: 'ADD_WIDGET', payload: {
      dashboardId: dashboard.id,
      widget: { id: widgetId, type: newWidgetType, title: newWidgetTitle.trim(), x: 0, y: 99, ...defaults },
    }});
    setShowAddWidget(false);
    setNewWidgetTitle('');
    setWidgetError('');
  }

  function removeWidget(widgetId) {
    dispatch({ type: 'REMOVE_WIDGET', payload: { dashboardId: dashboard.id, widgetId } });
  }

  // Widget height mapping: 1 grid unit = ~80px
  const ROW_HEIGHT = 80;

  return (
    <div>
      {/* Dashboard header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={`star-btn${dashboard.isStarred ? ' starred' : ''}`} onClick={toggleStar} style={{ fontSize: 22 }}>
          {dashboard.isStarred ? '\u2605' : '\u2606'}
        </button>
        {editingTitle ? (
          <input
            value={titleText}
            onChange={e => setTitleText(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => e.key === 'Enter' && saveTitle()}
            autoFocus
            style={{ fontSize: 20, fontWeight: 600, border: '1px solid var(--color-brand)', borderRadius: 4, padding: '2px 8px', outline: 'none' }}
          />
        ) : (
          <h1 style={{ fontSize: 20, fontWeight: 600, cursor: 'pointer' }} onClick={startEditTitle}>{dashboard.title}</h1>
        )}
        <span style={{ flex: 1 }} />
        {!dashboard.isReadOnly && (
          <>
            <button
              className={`btn btn-sm ${editMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Done Editing' : 'Edit'}
            </button>
            {editMode && (
              <button className="btn btn-sm btn-primary" onClick={() => setShowAddWidget(true)}>
                + Add Widget
              </button>
            )}
          </>
        )}
        <button className="btn btn-secondary btn-sm" onClick={handleClone}>Clone</button>
        {!dashboard.isReadOnly && (
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
        )}
        {dashboard.isReadOnly && <span className="tag tag-sm" style={{ background: '#f0f0f0', color: '#666' }}>Read Only</span>}
      </div>

      {/* Template variables */}
      {dashboard.templateVariables.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {dashboard.templateVariables.map(tv => (
            <div key={tv.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>${tv.name}:</span>
              <select
                value={templateVars[tv.name] || tv.default}
                onChange={e => setTemplateVars(prev => ({ ...prev, [tv.name]: e.target.value }))}
                style={{ padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: 4, fontSize: 13 }}
              >
                {tv.availableValues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Widget grid */}
      <div className="widget-grid">
        {dashboard.widgets.map(widget => {
          const WidgetComp = widgetComponents[widget.type];
          if (!WidgetComp) return null;

          return (
            <div
              key={widget.id}
              className="widget-card"
              style={{
                gridColumn: `span ${widget.width}`,
                gridRow: `span ${widget.height}`,
                minHeight: widget.height * ROW_HEIGHT,
                position: 'relative',
              }}
            >
              <div className="widget-header">
                <span className="widget-title">{widget.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {editMode && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, padding: '0 4px', color: 'var(--color-alert)' }}
                      onClick={() => removeWidget(widget.id)}
                      title="Remove widget"
                    >
                      {'\u2715'}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ height: `calc(100% - 32px)` }}>
                <WidgetComp widget={widget} />
              </div>
            </div>
          );
        })}
      </div>

      {dashboard.widgets.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>This dashboard is empty</p>
          <p style={{ fontSize: 13, marginBottom: 16 }}>Add widgets to get started</p>
          {!dashboard.isReadOnly && (
            <button className="btn btn-primary" onClick={() => { setEditMode(true); setShowAddWidget(true); }}>+ Add Widget</button>
          )}
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="modal-overlay" onClick={() => setShowAddWidget(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 560 }}>
            <h2>Add Widget</h2>
            <div className="form-group">
              <label>Widget Title</label>
              <input value={newWidgetTitle} onChange={e => setNewWidgetTitle(e.target.value)} placeholder="Enter widget title" autoFocus />
            </div>
            <div className="form-group">
              <label>Widget Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {WIDGET_TYPES.map(wt => (
                  <div
                    key={wt.type}
                    className={`step-card${newWidgetType === wt.type ? ' selected' : ''}`}
                    onClick={() => setNewWidgetType(wt.type)}
                    style={{ padding: 12 }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{wt.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{wt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{wt.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowAddWidget(false)}>Cancel</button>
              {widgetError && <span style={{ color: 'var(--color-alert)', fontSize: 12, marginRight: 'auto' }}>{widgetError}</span>}
              <button className="btn btn-primary" onClick={addWidget}>Add Widget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
