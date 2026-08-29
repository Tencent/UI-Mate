import React from 'react';

const arrows = {
  urgent: '\u2193',
  high: '\u2191',
  normal: '\u2014',
  low: '\u2193',
};

export default function PriorityBadge({ priority }) {
  if (!priority) return <span style={{ color: '#87929D' }}>—</span>;
  return (
    <span className={`priority-badge ${priority}`}>
      <span className="priority-arrow">{arrows[priority] || ''}</span>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}
