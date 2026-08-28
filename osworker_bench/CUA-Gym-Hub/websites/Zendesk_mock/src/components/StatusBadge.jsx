import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return <span className="status-badge">—</span>;
  return <span className={`status-badge ${status}`}>{status}</span>;
}
