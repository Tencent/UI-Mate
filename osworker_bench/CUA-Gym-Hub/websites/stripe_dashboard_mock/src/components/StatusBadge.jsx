import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}
