import React from 'react';

export default function TimelineView({ board }) {
  const items = (board?.groups || []).flatMap((g) => (g.items || []).map((it) => ({ ...it, group: g.name || g.title })));
  if (!items.length) {
    return <div className="p-8 text-sm text-gray-500">No items to show in the timeline.</div>;
  }
  return (
    <div className="p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold mb-3">Timeline</h3>
      <div className="space-y-2 min-w-[600px]">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 border-b border-gray-100 py-2">
            <div className="w-40 text-xs text-gray-500">{it.group}</div>
            <div className="flex-1 text-sm">{it.name || 'Item'}</div>
            <div className="w-32 text-xs text-gray-500">{it.startDate || ''} → {it.endDate || ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
