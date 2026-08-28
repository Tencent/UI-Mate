import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DateCell({ column, item, value }) {
  const { dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const cellRef = useRef(null);
  const dateStr = value?.value || null;
  const [viewDate, setViewDate] = useState(() => {
    if (dateStr) return new Date(dateStr + 'T00:00:00');
    return new Date();
  });

  const formatDate = (str) => {
    if (!str) return null;
    const d = new Date(str + 'T00:00:00');
    return `${MONTHS[d.getMonth()].substring(0, 3)} ${d.getDate()}`;
  };

  const handleSelect = (day) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    dispatch({ type: 'UPDATE_COLUMN_VALUE', payload: { itemId: item.id, columnId: column.id, newValue: `${y}-${m}-${d}` } });
    setOpen(false);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const rect = cellRef.current?.getBoundingClientRect();

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <>
      <div ref={cellRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }} onClick={() => setOpen(true)}>
        {dateStr ? (
          <span className="date-cell-text">{formatDate(dateStr)}</span>
        ) : (
          <span className="date-cell-empty">&#128197;</span>
        )}
      </div>
      {open && (
        <>
          <div className="popover-overlay" onClick={() => setOpen(false)} />
          <div
            className="popover date-popover"
            style={{
              top: rect ? rect.bottom + 4 : 0,
              left: rect ? rect.left - 70 : 0,
            }}
          >
            <div className="date-popover-header">
              <button className="date-popover-nav" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>&lsaquo;</button>
              <span>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
              <button className="date-popover-nav" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>&rsaquo;</button>
            </div>
            <div className="date-popover-grid">
              {DAYS.map(d => <div key={d} className="date-popover-day-header">{d}</div>)}
              {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const m = String(viewDate.getMonth() + 1).padStart(2, '0');
                const d = String(day).padStart(2, '0');
                const cellDate = `${viewDate.getFullYear()}-${m}-${d}`;
                const isToday = cellDate === todayStr;
                const isSelected = cellDate === dateStr;
                return (
                  <button
                    key={day}
                    className={`date-popover-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
                    onClick={() => handleSelect(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
