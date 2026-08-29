import React from 'react';

export default function ActivityLog({ entries = [] }) {
  if (!entries.length) {
    return <div className="p-4 text-sm text-gray-500">No recent activity.</div>;
  }
  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-semibold mb-2">Activity</h3>
      {entries.map((e, i) => (
        <div key={e.id || i} className="text-xs text-gray-600 border-b border-gray-100 py-1">
          <span className="font-medium text-gray-800">{e.user || 'System'}</span>{' '}
          {e.action || 'updated'}{' '}
          <span className="text-gray-500">{e.target || ''}</span>
          <span className="ml-2 text-gray-400">{e.time || ''}</span>
        </div>
      ))}
    </div>
  );
}
