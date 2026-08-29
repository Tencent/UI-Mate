import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { Bell, X } from 'lucide-react';

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

export default function AlertButton() {
  const { state, addAlert } = useAppContext();
  const [open, setOpen] = useState(false);
  const modalRef = useRef(null);

  const sym = state.symbols[state.chartState.symbolId] || {};
  const [form, setForm] = useState({
    condition: 'crossing_up',
    value: '',
    expiration: '1m',
    name: '',
    message: '',
    notifications: { popup: true, email: true, sound: true, webhook: false },
  });

  // Reset form when symbol changes or dialog opens
  useEffect(() => {
    if (open) {
      const s = state.symbols[state.chartState.symbolId] || {};
      setForm(f => ({
        ...f,
        value: String(s.price || ''),
        name: `${state.chartState.symbolId} ${f.condition === 'crossing_up' ? 'above' : 'below'} ${s.price || ''}`,
        message: `${state.chartState.symbolId} alert triggered`,
      }));
    }
  }, [open, state.chartState.symbolId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Alt+A shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key === 'a') { e.preventDefault(); setOpen(o => !o); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function getExpiresAt(exp) {
    const now = new Date();
    const map = { '1h': 3600000, '4h': 14400000, '24h': 86400000, '1w': 604800000, '1m': 2592000000, '2m': 5184000000 };
    return new Date(now.getTime() + (map[exp] || 2592000000)).toISOString();
  }

  const handleCreate = () => {
    const condLabel = CONDITIONS.find(c => c.value === form.condition)?.label || '';
    addAlert({
      symbolId: state.chartState.symbolId,
      name: form.name || `${state.chartState.symbolId} ${condLabel} ${form.value}`,
      condition: form.condition,
      value: parseFloat(form.value) || 0,
      value2: null,
      source: 'price',
      status: 'active',
      createdAt: new Date().toISOString(),
      triggeredAt: null,
      expiresAt: getExpiresAt(form.expiration),
      message: form.message,
      notifications: { ...form.notifications },
      frequency: 'once',
    });
    setOpen(false);
  };

  return (
    <>
      <button
        className="tv-icon-btn"
        title="Create Alert (Alt+A)"
        style={{
          width: 32, height: 32,
          color: state.alerts.some(a => a.status === 'active') ? 'var(--accent)' : undefined,
        }}
        onClick={() => setOpen(true)}
      >
        <Bell size={16} />
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div ref={modalRef} style={{
            width: 440,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-light)',
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>Create Alert</span>
              <button className="tv-icon-btn" style={{ width: 28, height: 28 }} onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Symbol Row */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Symbol</label>
                  <input readOnly value={state.chartState.symbolId} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Condition</label>
                  <select
                    value={form.condition}
                    onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                    style={{ width: '100%' }}
                  >
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Value */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Price Value</label>
                <input
                  type="number"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  style={{ width: '100%' }}
                  placeholder="Enter target price..."
                />
              </div>

              {/* Expiration */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Expiration</label>
                <select
                  value={form.expiration}
                  onChange={e => setForm(f => ({ ...f, expiration: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  {EXPIRATIONS.map(exp => <option key={exp.value} value={exp.value}>{exp.label}</option>)}
                </select>
              </div>

              {/* Alert name */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Alert Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%' }}
                  placeholder="Alert name..."
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={2}
                  style={{ width: '100%', resize: 'none' }}
                  placeholder="Alert message..."
                />
              </div>

              {/* Notifications */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Notifications</label>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {['popup', 'email', 'sound', 'webhook'].map(key => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={form.notifications[key]}
                        onChange={e => setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: e.target.checked } }))}
                        style={{ width: 14, height: 14, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    padding: '7px 16px', borderRadius: 4, fontSize: 13,
                    background: 'var(--bg-hover)', color: 'var(--text-primary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  style={{
                    padding: '7px 16px', borderRadius: 4, fontSize: 13,
                    background: 'var(--accent)', color: '#fff',
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
