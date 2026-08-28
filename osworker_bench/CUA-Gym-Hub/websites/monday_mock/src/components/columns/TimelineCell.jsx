import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function TimelineCell({ column, item, value }) {
  const { dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const cellRef = useRef(null);
  const timeline = value?.value;

  const startStr = timeline?.start || null;
  const endStr = timeline?.end || null;

  const [startViewDate, setStartViewDate] = useState(() => {
    if (startStr) return new Date(startStr + 'T00:00:00');
    return new Date();
  });
  const [endViewDate, setEndViewDate] = useState(() => {
    if (endStr) return new Date(endStr + 'T00:00:00');
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  });

  const [pendingStart, setPendingStart] = useState(startStr);
  const [pendingEnd, setPendingEnd] = useState(endStr);

  const formatShort = (str) => {
    if (!str) return '';
    const d = new Date(str + 'T00:00:00');
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
  };

  const formatDateStr = (year, month, day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleOpen = () => {
    setPendingStart(startStr);
    setPendingEnd(endStr);
    if (startStr) setStartViewDate(new Date(startStr + 'T00:00:00'));
    else setStartViewDate(new Date());
    if (endStr) setEndViewDate(new Date(endStr + 'T00:00:00'));
    else {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      setEndViewDate(d);
    }
    setOpen(true);
  };

  const handleSelectStart = (day) => {
    const dateStr = formatDateStr(startViewDate.getFullYear(), startViewDate.getMonth(), day);
    setPendingStart(dateStr);
    // Auto-adjust end if start > end
    if (pendingEnd && dateStr > pendingEnd) {
      setPendingEnd(dateStr);
    }
  };

  const handleSelectEnd = (day) => {
    const dateStr = formatDateStr(endViewDate.getFullYear(), endViewDate.getMonth(), day);
    setPendingEnd(dateStr);
    // Auto-adjust start if end < start
    if (pendingStart && dateStr < pendingStart) {
      setPendingStart(dateStr);
    }
  };

  const handleSave = () => {
    if (pendingStart && pendingEnd) {
      dispatch({
        type: 'UPDATE_COLUMN_VALUE',
        payload: {
          itemId: item.id,
          columnId: column.id,
          newValue: { start: pendingStart, end: pendingEnd },
        },
      });
    }
    setOpen(false);
  };

  const handleClear = () => {
    dispatch({
      type: 'UPDATE_COLUMN_VALUE',
      payload: {
        itemId: item.id,
        columnId: column.id,
        newValue: null,
      },
    });
    setOpen(false);
  };

  // Compute progress for display bar color
  let barColor = '#579BFC';
  if (startStr && endStr) {
    const start = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');
    const now = new Date();
    const totalMs = end - start;
    const elapsedMs = now - start;
    const progress = totalMs > 0 ? Math.min(1, Math.max(0, elapsedMs / totalMs)) : 0;
    barColor = progress >= 1 ? '#00C875' : progress > 0.5 ? '#579BFC' : '#0073EA';
  }

  const rect = cellRef.current?.getBoundingClientRect();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const renderMiniCalendar = (viewDate, setViewDate, selectedDate, onSelect) => {
    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    return (
      <div className="timeline-mini-calendar">
        <div className="date-popover-header">
          <button
            className="date-popover-nav"
            onClick={(e) => {
              e.stopPropagation();
              setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
            }}
          >
            &lsaquo;
          </button>
          <span>{MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
          <button
            className="date-popover-nav"
            onClick={(e) => {
              e.stopPropagation();
              setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
            }}
          >
            &rsaquo;
          </button>
        </div>
        <div className="date-popover-grid">
          {DAYS.map(d => <div key={d} className="date-popover-day-header">{d}</div>)}
          {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const cellDate = formatDateStr(viewDate.getFullYear(), viewDate.getMonth(), day);
            const isToday = cellDate === todayStr;
            const isSelected = cellDate === selectedDate;
            const isInRange = pendingStart && pendingEnd && cellDate >= pendingStart && cellDate <= pendingEnd;
            return (
              <button
                key={day}
                className={`date-popover-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${isInRange && !isSelected ? ' in-range' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(day);
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        ref={cellRef}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
        onClick={handleOpen}
      >
        {startStr && endStr ? (
          <div className="timeline-bar" style={{ background: barColor, width: `${Math.max(40, 90)}%` }}>
            {formatShort(startStr)} - {formatShort(endStr)}
          </div>
        ) : (
          <div className="timeline-cell-empty" />
        )}
      </div>
      {open && (
        <>
          <div className="popover-overlay" onClick={() => setOpen(false)} />
          <div
            className="popover timeline-popover"
            style={{
              top: rect ? rect.bottom + 4 : 0,
              left: rect ? rect.left - 100 : 0,
            }}
          >
            <div className="timeline-popover-section">
              <div className="timeline-popover-label">Start Date</div>
              <div className="timeline-popover-date-display">
                {pendingStart ? formatShort(pendingStart) : 'Select date'}
              </div>
              {renderMiniCalendar(startViewDate, setStartViewDate, pendingStart, handleSelectStart)}
            </div>
            <div className="timeline-popover-divider" />
            <div className="timeline-popover-section">
              <div className="timeline-popover-label">End Date</div>
              <div className="timeline-popover-date-display">
                {pendingEnd ? formatShort(pendingEnd) : 'Select date'}
              </div>
              {renderMiniCalendar(endViewDate, setEndViewDate, pendingEnd, handleSelectEnd)}
            </div>
            <div className="timeline-popover-actions">
              <button className="timeline-popover-clear" onClick={handleClear}>Clear</button>
              <button className="timeline-popover-save" onClick={handleSave}>Save</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
