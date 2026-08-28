import React, { useState } from 'react';
import { useStore } from '../store/store';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView = ({ table, view }) => {
  const { dispatch, ACTIONS } = useStore();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Determine which field to use for dates
  const dateFieldId = view?.dateFieldId;
  const dateField = table.fields.find(f => f.id === dateFieldId) || table.fields.find(f => f.type === 'date');
  const primaryField = table.fields.find(f => f.primary) || table.fields[0];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // total cells: enough to fill complete weeks
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) {
      cells.push({ day: daysInPrevMonth - firstDay + i + 1, currentMonth: false, date: new Date(year, month - 1, daysInPrevMonth - firstDay + i + 1) });
    } else if (i < firstDay + daysInMonth) {
      const d = i - firstDay + 1;
      cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
    } else {
      cells.push({ day: i - firstDay - daysInMonth + 1, currentMonth: false, date: new Date(year, month + 1, i - firstDay - daysInMonth + 1) });
    }
  }

  // Map records to dates
  const recordsByDate = {};
  table.records.forEach(record => {
    if (!dateField) return;
    const dateVal = record.fields[dateField.id];
    if (!dateVal) return;
    // Normalize: parse YYYY-MM-DD without timezone offset
    let dateKey;
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
      dateKey = dateVal.slice(0, 10);
    } else {
      const d = new Date(dateVal);
      if (isNaN(d)) return;
      dateKey = d.toISOString().slice(0, 10);
    }
    if (!recordsByDate[dateKey]) recordsByDate[dateKey] = [];
    recordsByDate[dateKey].push(record);
  });

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handleAddRecord = (date) => {
    if (!dateField) return;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dispatch({
      type: ACTIONS.ADD_RECORD,
      payload: { tableId: table.id, initialFields: { [dateField.id]: dateStr } }
    });
  };

  const handleRecordClick = (e, recordId) => {
    e.stopPropagation();
    dispatch({ type: ACTIONS.SET_EXPANDED_RECORD, payload: recordId });
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={goToday}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={prevMonth}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>
        {dateField && (
          <div className="text-xs text-gray-400">
            Date field: <span className="font-medium text-gray-600">{dateField.name}</span>
          </div>
        )}
        {!dateField && (
          <div className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
            No date field configured for this view
          </div>
        )}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 shrink-0">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2 border-r border-gray-100 last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 h-full" style={{ minHeight: `${Math.ceil(totalCells / 7) * 120}px` }}>
          {cells.map((cell, idx) => {
            const cellKey = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`;
            const cellRecords = recordsByDate[cellKey] || [];
            const isToday = cellKey === todayKey;
            const isCurrentMonth = cell.currentMonth;

            return (
              <div
                key={idx}
                className={cn(
                  "border-b border-r border-gray-100 p-1 flex flex-col min-h-[120px] last:border-r-0 group/cell",
                  !isCurrentMonth && "bg-gray-50/60",
                  isCurrentMonth && "bg-white hover:bg-blue-50/20 cursor-pointer"
                )}
                onClick={() => isCurrentMonth && handleAddRecord(cell.date)}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday ? "bg-blue-600 text-white" : isCurrentMonth ? "text-gray-700" : "text-gray-400"
                  )}>
                    {cell.day}
                  </span>
                  {isCurrentMonth && (
                    <button
                      className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                      onClick={(e) => { e.stopPropagation(); handleAddRecord(cell.date); }}
                      title="Add record"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                </div>

                {/* Records */}
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {cellRecords.slice(0, 3).map(record => {
                    const label = primaryField ? (record.fields[primaryField.id] || 'Unnamed') : 'Unnamed';
                    return (
                      <div
                        key={record.id}
                        className="text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 truncate cursor-pointer hover:bg-blue-200 transition-colors"
                        onClick={(e) => handleRecordClick(e, record.id)}
                        title={label}
                      >
                        {label}
                      </div>
                    );
                  })}
                  {cellRecords.length > 3 && (
                    <div className="text-xs text-gray-400 px-1">
                      +{cellRecords.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
