import React from 'react';

export default function CalendarView({ board }) {
  const today = new Date();
  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const items = (board?.groups || []).flatMap((g) => g.items || []);
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3">{monthLabel}</h3>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }, (_, i) => {
          const day = i + 1;
          const dayItems = items.filter((it) => {
            const d = it.startDate ? new Date(it.startDate) : null;
            return d && d.getDate() === day && d.getMonth() === today.getMonth();
          });
          return (
            <div key={day} className="border border-gray-200 rounded p-2 min-h-[64px] text-xs">
              <div className="font-medium text-gray-700">{day}</div>
              {dayItems.map((it) => (
                <div key={it.id} className="mt-1 px-1 py-0.5 bg-blue-100 text-blue-700 rounded truncate">
                  {it.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
