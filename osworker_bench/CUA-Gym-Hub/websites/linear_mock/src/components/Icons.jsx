import React from 'react';

// Priority Icons
export function PriorityIcon({ priority, size = 16 }) {
  const s = size;
  if (priority === 0) {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <rect x="1" y="7.5" width="14" height="1" rx="0.5" fill="#62666d"/>
      </svg>
    );
  }
  if (priority === 1) {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="12" rx="2" fill="#eb5757"/>
        <path d="M8 4.5v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="10.5" r="0.75" fill="#fff"/>
      </svg>
    );
  }
  if (priority === 2) {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="8" width="3" height="5.5" rx="0.5" fill="#f2994a"/>
        <rect x="6.5" y="5" width="3" height="8.5" rx="0.5" fill="#f2994a"/>
        <rect x="11.5" y="2" width="3" height="11.5" rx="0.5" fill="#f2994a"/>
      </svg>
    );
  }
  if (priority === 3) {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="8" width="3" height="5.5" rx="0.5" fill="#f2c94c"/>
        <rect x="6.5" y="5" width="3" height="8.5" rx="0.5" fill="#f2c94c"/>
        <rect x="11.5" y="2" width="3" height="11.5" rx="0.5" fill="rgba(242,201,76,0.3)"/>
      </svg>
    );
  }
  if (priority === 4) {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="8" width="3" height="5.5" rx="0.5" fill="#5e6ad2"/>
        <rect x="6.5" y="5" width="3" height="8.5" rx="0.5" fill="rgba(94,106,210,0.3)"/>
        <rect x="11.5" y="2" width="3" height="11.5" rx="0.5" fill="rgba(94,106,210,0.3)"/>
      </svg>
    );
  }
  return null;
}

export const PRIORITY_LABELS = {
  0: 'No priority',
  1: 'Urgent',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};

// Status Icons
export function StatusIcon({ state, size = 16 }) {
  if (!state) return null;
  const s = size;
  const c = state.color;
  const cat = state.category;

  if (cat === 'triage') {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.5" strokeDasharray="3 2"/>
      </svg>
    );
  }
  if (cat === 'backlog') {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.5" strokeDasharray="4 3"/>
      </svg>
    );
  }
  if (cat === 'unstarted') {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.5"/>
      </svg>
    );
  }
  if (cat === 'started' && state.name === 'In Progress') {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.5"/>
        <path d="M8 1.5 A6.5 6.5 0 0 1 14.5 8" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (cat === 'started') {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.5"/>
        <path d="M8 1.5 A6.5 6.5 0 1 1 1.5 8" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (cat === 'completed') {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill={c}/>
        <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (cat === 'canceled') {
    return (
      <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.5"/>
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }
  return <svg width={s} height={s} viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.5"/></svg>;
}

// User Avatar
export function Avatar({ user, size = 24 }) {
  if (!user) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: '1.5px dashed #62666d',
        background: 'transparent',
        flexShrink: 0,
      }} />
    );
  }
  return (
    <img
      src={user.avatarUrl}
      alt={user.displayName}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
      }}
    />
  );
}

// Format relative time
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// Label pill
export function LabelPill({ label, small = false }) {
  if (!label) return null;
  const hex = label.color;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '1px 5px' : '2px 7px',
      borderRadius: 9999,
      background: `rgba(${r},${g},${b},0.15)`,
      color: label.color,
      fontSize: small ? 10 : 11,
      fontWeight: 510,
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {label.name}
    </span>
  );
}

export function LabelDot({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;
}
