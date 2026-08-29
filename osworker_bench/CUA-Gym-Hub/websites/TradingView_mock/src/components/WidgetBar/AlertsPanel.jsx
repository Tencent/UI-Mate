import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { Plus, Bell, BellOff, Trash2, MoreHorizontal, X } from 'lucide-react';

const STATUS_COLORS = {
  active: '#26A69A',
  triggered: '#FF9800',
  paused: '#787B86',
};

const CONDITION_LABELS = {
  crossing_up: 'Crossing Up',
  crossing_down: 'Crossing Down',
  greater_than: 'Greater Than',
  less_than: 'Less Than',
  entering_channel: 'Entering Channel',
  exiting_channel: 'Exiting Channel',
};

const CONDITIONS = [
  { value: 'crossing_up', label: 'Crossing Up' },
  { value: 'crossing_down', label: 'Crossing Down' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'entering_channel', label: 'Entering Channel' },
  { value: 'exiting_channel', label: 'Exiting Channel' },
];

const EXPIRATIONS = [
  { value: '1h', label: '1 hour' },
  { value: '4h', label: '4 hours' },
  { value: '24h', label: '24 hours' },
  { value: '1w', label: '1 week' },
  { value: '1m', label: '1 month' },
  { value: '2m', label: '2 months' },
];

function formatValue(value, symbolId) {
  if (value == null) return '';
  if (symbolId?.includes('USD') && !symbolId?.startsWith('BTC') && !symbolId?.startsWith('ETH')) {
    return value.toFixed(4);
  }
  return value >= 1000 ? value.toLocaleString('en-US', { minimumFractionDigits: 2 }) : value.toFixed(2);
}

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

function getExpiresAt(exp) {
  const now = new Date();
  const map = { '1h': 3600000, '4h': 14400000, '24h': 86400000, '1w': 604800000, '1m': 2592000000, '2m': 5184000000 };
  return new Date(now.getTime() + (map[exp] || 2592000000)).toISOString();
}

function AlertFormModal({ onClose, editAlert, symbolId, currentPrice, onSave, onAdd }) {
  const isEdit = !!editAlert;
  const [form, setForm] = useState({
    condition: editAlert?.condition || 'crossing_up',
    value: editAlert ? String(editAlert.value) : String(currentPrice || ''),
    expiration: '1m',
    name: editAlert?.name || '',
    message: editAlert?.message || '',
    notifications: editAlert?.notifications || { popup: true, email: true, sound: true, webhook: false },
  });

  const targetSymbolId = editAlert?.symbolId || symbolId;

  const handleSubmit = () => {
    const condLabel = CONDITIONS.find(c => c.value === form.condition)?.label || '';
    const alertData = {
      symbolId: targetSymbolId,
      name: form.name || `${targetSymbolId} ${condLabel} ${form.value}`,
      condition: form.condition,
      value: parseFloat(form.value) || 0,
      value2: editAlert?.value2 || null,
      source: 'price',
      status: editAlert?.status || 'active',
      createdAt: editAlert?.createdAt || new Date().toISOString(),
      triggeredAt: editAlert?.triggeredAt || null,
      expiresAt: isEdit ? editAlert.expiresAt : getExpiresAt(form.expiration),
      message: form.message,
      notifications: { ...form.notifications },
      frequency: editAlert?.frequency || 'once',
    };
    if (isEdit) {
      onSave({ ...editAlert, ...alertData });
    } else {
      onAdd(alertData);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 440, background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
        borderRadius: 6, overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{isEdit ? 'Edit Alert' : 'Create Alert'}</span>
          <button className="tv-icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Symbol</label>
              <input readOnly value={targetSymbolId} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Condition</label>
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} style={{ width: '100%' }}>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Price Value</label>
            <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} style={{ width: '100%' }} placeholder="Enter target price..." />
          </div>
          {!isEdit && (
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Expiration</label>
              <select value={form.expiration} onChange={e => setForm(f => ({ ...f, expiration: e.target.value }))} style={{ width: '100%' }}>
                {EXPIRATIONS.map(exp => <option key={exp.value} value={exp.value}>{exp.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Alert Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} placeholder="Alert name..." />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Message</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={2} style={{ width: '100%', resize: 'none' }} placeholder="Alert message..." />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Notifications</label>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {['popup', 'email', 'sound', 'webhook'].map(key => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={form.notifications[key]} onChange={e => setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: e.target.checked } }))} style={{ width: 14, height: 14, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
                  <span style={{ textTransform: 'capitalize' }}>{key}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 4, fontSize: 13, background: 'var(--bg-hover)', color: 'var(--text-primary)' }}>Cancel</button>
            <button onClick={handleSubmit} style={{ padding: '7px 16px', borderRadius: 4, fontSize: 13, background: 'var(--accent)', color: '#fff' }}>{isEdit ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlertsPanel() {
  const { state, removeAlert, updateState, addAlert, toggleRightPanel, setSymbol } = useAppContext();
  const { alerts, symbols, chartState } = state;
  const [contextMenu, setContextMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editAlert, setEditAlert] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreMenu]);

  const toggleStatus = (alertId, currentStatus) => {
    updateState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a =>
        a.id === alertId
          ? { ...a, status: currentStatus === 'paused' ? 'active' : 'paused' }
          : a
      ),
    }));
  };

  const handleEditSave = (updatedAlert) => {
    updateState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === updatedAlert.id ? updatedAlert : a),
    }));
    setEditAlert(null);
  };

  const handleContextMenu = (e, alertId) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, alertId });
  };

  const handleDeleteAll = () => {
    updateState(prev => ({ ...prev, alerts: [] }));
    setShowMoreMenu(false);
  };

  const handleDeleteTriggered = () => {
    updateState(prev => ({ ...prev, alerts: prev.alerts.filter(a => a.status !== 'triggered') }));
    setShowMoreMenu(false);
  };

  const sym = symbols[chartState.symbolId] || {};

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        borderBottom: '1px solid var(--border)', gap: 6, flexShrink: 0,
      }}>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>
          Alerts
          {alerts.filter(a => a.status === 'active').length > 0 && (
            <span style={{
              marginLeft: 6, background: 'var(--accent)', color: '#fff',
              borderRadius: 9, fontSize: 10, padding: '1px 5px',
            }}>
              {alerts.filter(a => a.status === 'active').length}
            </span>
          )}
        </span>
        <button className="tv-icon-btn" style={{ width: 28, height: 28 }} title="Create alert" onClick={() => setShowCreateModal(true)}>
          <Plus size={15} />
        </button>
        <div style={{ position: 'relative' }} ref={moreMenuRef}>
          <button className="tv-icon-btn" style={{ width: 28, height: 28 }} title="More options" onClick={() => setShowMoreMenu(v => !v)}>
            <MoreHorizontal size={15} />
          </button>
          {showMoreMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 2, zIndex: 200,
              background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
              borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              minWidth: 180,
            }}>
              {[
                { label: 'Create alert', action: () => { setShowCreateModal(true); setShowMoreMenu(false); } },
                { label: 'Remove triggered alerts', action: handleDeleteTriggered },
                { label: 'Remove all alerts', action: handleDeleteAll },
              ].map(item => (
                <div key={item.label} onClick={item.action} style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {alerts.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 24, textAlign: 'center' }}>
            <Bell size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
            <div>No alerts yet</div>
            <button onClick={() => setShowCreateModal(true)} style={{ marginTop: 12, padding: '6px 14px', borderRadius: 4, fontSize: 12, background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}>
              Create Alert
            </button>
          </div>
        )}
        {alerts.map(alert => {
          const statusColor = STATUS_COLORS[alert.status] || '#787B86';
          const condLabel = CONDITION_LABELS[alert.condition] || alert.condition;
          const valStr = formatValue(alert.value, alert.symbolId);

          return (
            <div
              key={alert.id}
              onContextMenu={(e) => handleContextMenu(e, alert.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', padding: '8px 12px', gap: 10,
                cursor: 'pointer',
                opacity: alert.status === 'triggered' ? 0.6 : 1,
                borderLeft: alert.status === 'active' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Status dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: statusColor, flexShrink: 0, marginTop: 4,
              }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{alert.symbolId}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {condLabel} {valStr}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {alert.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {relTime(alert.createdAt)}
                  {alert.status === 'triggered' && alert.triggeredAt && (
                    <span style={{ color: '#FF9800', marginLeft: 6 }}>Triggered {relTime(alert.triggeredAt)}</span>
                  )}
                  {alert.status === 'paused' && (
                    <span style={{ color: '#787B86', marginLeft: 6 }}>Paused</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                <button
                  className="tv-icon-btn"
                  style={{ width: 24, height: 24 }}
                  title={alert.status === 'paused' ? 'Resume' : 'Pause'}
                  onClick={(e) => { e.stopPropagation(); toggleStatus(alert.id, alert.status); }}
                >
                  {alert.status === 'paused' ? <Bell size={12} /> : <BellOff size={12} />}
                </button>
                <button
                  className="tv-icon-btn"
                  style={{ width: 24, height: 24, color: 'var(--down)' }}
                  title="Delete alert"
                  onClick={(e) => { e.stopPropagation(); removeAlert(alert.id); }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed', left: contextMenu.x, top: contextMenu.y,
            zIndex: 9999, background: 'var(--bg-panel)',
            border: '1px solid var(--border-light)', borderRadius: 4,
            overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', minWidth: 150,
          }}
          onClick={() => setContextMenu(null)}
        >
          {[
            {
              label: 'Edit',
              action: () => {
                const a = alerts.find(x => x.id === contextMenu.alertId);
                if (a) setEditAlert(a);
                setContextMenu(null);
              }
            },
            {
              label: alerts.find(a => a.id === contextMenu.alertId)?.status === 'paused' ? 'Resume' : 'Pause',
              action: () => {
                const a = alerts.find(x => x.id === contextMenu.alertId);
                if (a) toggleStatus(a.id, a.status);
              }
            },
            { label: 'Delete', action: () => removeAlert(contextMenu.alertId) },
          ].map(item => (
            <div
              key={item.label}
              onClick={item.action}
              style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Alert Modal */}
      {(showCreateModal || editAlert) && (
        <AlertFormModal
          onClose={() => { setShowCreateModal(false); setEditAlert(null); }}
          editAlert={editAlert}
          symbolId={chartState.symbolId}
          currentPrice={sym.price}
          onSave={handleEditSave}
          onAdd={addAlert}
        />
      )}
    </div>
  );
}
