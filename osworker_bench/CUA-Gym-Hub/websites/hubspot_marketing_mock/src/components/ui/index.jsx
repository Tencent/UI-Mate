import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function formatPercent(val) {
  if (val === null || val === undefined) return '—';
  return `${Number(val).toFixed(1)}%`;
}

export function formatNumber(val) {
  if (val === null || val === undefined) return '—';
  return Number(val).toLocaleString();
}

export function getInitials(firstName, lastName) {
  return `${(firstName||'')[0]||''}${(lastName||'')[0]||''}`.toUpperCase();
}

export function getAvatarColor(id) {
  const colors = ['#FF7A59', '#00A4BD', '#00BDA5', '#DBAE17', '#516F90', '#F2545B', '#8C4FFF'];
  const idx = parseInt((id||'0').replace(/\D/g,'')) % colors.length;
  return colors[idx];
}

export function Avatar({ firstName, lastName, size = 32, id }) {
  const initials = getInitials(firstName, lastName);
  const bg = getAvatarColor(id || firstName);
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35, background: bg }}>
      {initials}
    </div>
  );
}

export function Badge({ children, variant = 'gray' }) {
  const variantMap = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    gray: 'badge-gray',
    blue: 'badge-blue',
    orange: 'badge-orange'
  };
  return <span className={`badge ${variantMap[variant] || 'badge-gray'}`}>{children}</span>;
}

export function getStatusBadge(status) {
  const map = {
    active: { label: 'Active', variant: 'success' },
    published: { label: 'Published', variant: 'success' },
    sent: { label: 'Sent', variant: 'success' },
    completed: { label: 'Completed', variant: 'blue' },
    scheduled: { label: 'Scheduled', variant: 'blue' },
    draft: { label: 'Draft', variant: 'gray' },
    archived: { label: 'Archived', variant: 'gray' },
    inactive: { label: 'Inactive', variant: 'gray' },
    paused: { label: 'Paused', variant: 'warning' },
    new: { label: 'New', variant: 'gray' },
    open: { label: 'Open', variant: 'blue' },
    in_progress: { label: 'In Progress', variant: 'warning' },
    open_deal: { label: 'Open Deal', variant: 'success' },
    connected: { label: 'Connected', variant: 'success' },
    unqualified: { label: 'Unqualified', variant: 'danger' },
    attempted_to_contact: { label: 'Attempted', variant: 'warning' },
    appointment_scheduled: { label: 'Appointment Scheduled', variant: 'blue' },
    qualified_to_buy: { label: 'Qualified', variant: 'blue' },
    presentation_scheduled: { label: 'Presentation Scheduled', variant: 'warning' },
    decision_maker_bought_in: { label: 'Decision Maker Bought In', variant: 'warning' },
    contract_sent: { label: 'Contract Sent', variant: 'orange' },
    closed_won: { label: 'Closed Won', variant: 'success' },
    closed_lost: { label: 'Closed Lost', variant: 'danger' }
  };
  const info = map[status] || { label: (status||'').replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase()), variant: 'gray' };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function getLifecycleBadge(stage) {
  const map = {
    subscriber: { label: 'Subscriber', variant: 'gray' },
    lead: { label: 'Lead', variant: 'blue' },
    marketing_qualified_lead: { label: 'MQL', variant: 'orange' },
    sales_qualified_lead: { label: 'SQL', variant: 'warning' },
    opportunity: { label: 'Opportunity', variant: 'orange' },
    customer: { label: 'Customer', variant: 'success' },
    evangelist: { label: 'Evangelist', variant: 'success' },
    other: { label: 'Other', variant: 'gray' }
  };
  const info = map[stage] || { label: stage, variant: 'gray' };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function SortableHeader({ label, field, sortField, sortDir, onSort }) {
  const isActive = sortField === field;
  return (
    <th onClick={() => onSort(field)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        <span style={{ opacity: isActive ? 1 : 0.3 }}>
          {isActive && sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </div>
    </th>
  );
}

export function TrendIndicator({ value }) {
  if (value === undefined || value === null) return null;
  const positive = value >= 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: positive ? 'var(--hs-success)' : 'var(--hs-danger)', fontWeight: 500 }}>
      {positive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 32px', color: 'var(--hs-text-muted)' }}>
      {icon && <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>}
      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--hs-text-primary)', marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ fontSize: 14, maxWidth: 400, margin: '0 auto 20px' }}>{description}</p>}
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}

export function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--hs-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-text-muted)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Drawer({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.2s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--hs-border)', flexShrink: 0 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hs-text-muted)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({ title, description, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="card" style={{ width: 440, padding: 24 }}>
        <h3 style={{ marginBottom: 12, fontSize: 18 }}>{title}</h3>
        <p style={{ color: 'var(--hs-text-secondary)', marginBottom: 24, fontSize: 14 }}>{description}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function FormField({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--hs-text-primary)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--hs-danger)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 12, color: 'var(--hs-text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export function Pagination({ page, totalPages, onPage, perPage = 25, total }) {
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderTop: '1px solid var(--hs-border)' }}>
      <div style={{ fontSize: 13, color: 'var(--hs-text-muted)', flex: 1 }}>
        {total !== undefined ? `${total.toLocaleString()} records` : ''}
      </div>
      <div className="pagination" style={{ padding: 0 }}>
        <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1} style={{ opacity: page === 1 ? 0.4 : 1 }}>‹</button>
        {start > 1 && <><button className="page-btn" onClick={() => onPage(1)}>1</button><span style={{ padding: '0 4px', color: 'var(--hs-text-muted)' }}>…</span></>}
        {pages.map(p => (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
        ))}
        {end < totalPages && <><span style={{ padding: '0 4px', color: 'var(--hs-text-muted)' }}>…</span><button className="page-btn" onClick={() => onPage(totalPages)}>{totalPages}</button></>}
        <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === totalPages} style={{ opacity: page === totalPages ? 0.4 : 1 }}>›</button>
      </div>
      <select style={{ width: 'auto', fontSize: 13, padding: '4px 8px' }} value={perPage} readOnly>
        <option value={25}>25 per page</option>
        <option value={50}>50 per page</option>
      </select>
    </div>
  );
}
