import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DateRangePicker.css';

const presets = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last_7_days', label: 'Last 7 days' },
  { key: 'last_14_days', label: 'Last 14 days' },
  { key: 'last_30_days', label: 'Last 30 days' },
  { key: 'this_month', label: 'This month' },
  { key: 'last_month', label: 'Last month' },
  { key: 'maximum', label: 'Maximum' },
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isInRange(d, start, end) {
  if (!start || !end) return false;
  const t = d.getTime();
  const s = start.getTime();
  const e = end.getTime();
  return t > Math.min(s, e) && t < Math.max(s, e);
}

function MonthCalendar({ year, month, startDate, endDate, hoverDate, onDayClick, onDayHover }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const rangeEnd = hoverDate && startDate && !endDate ? hoverDate : endDate;

  return (
    <div className="drp-month">
      <div className="drp-month-title">{MONTHS[month]} {year}</div>
      <div className="drp-weekdays">
        {DAYS.map(d => <div key={d} className="drp-weekday">{d}</div>)}
      </div>
      <div className="drp-days">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="drp-day drp-day--empty" />;
          const isStart = isSameDay(day, startDate);
          const isEnd = rangeEnd && isSameDay(day, rangeEnd);
          const inRange = isInRange(day, startDate, rangeEnd);
          const isToday = isSameDay(day, new Date());
          let cls = 'drp-day';
          if (isStart || isEnd) cls += ' drp-day--selected';
          else if (inRange) cls += ' drp-day--in-range';
          if (isToday) cls += ' drp-day--today';
          return (
            <button
              key={i}
              className={cls}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => onDayHover(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({ value, onChange, onClose }) {
  const today = new Date();
  const [activePreset, setActivePreset] = useState(value);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  // Left calendar = month before current, right = current
  const [leftYear, setLeftYear] = useState(today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear());
  const [leftMonth, setLeftMonth] = useState(today.getMonth() === 0 ? 11 : today.getMonth() - 1);

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;

  const prevMonth = () => {
    if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); }
    else setLeftMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); }
    else setLeftMonth(m => m + 1);
  };

  const handleDayClick = (day) => {
    setActivePreset(null);
    if (!startDate || (startDate && endDate)) {
      setStartDate(day); setEndDate(null);
    } else {
      if (day < startDate) { setStartDate(day); setEndDate(startDate); }
      else if (isSameDay(day, startDate)) { setEndDate(day); }
      else setEndDate(day);
    }
  };

  const handlePreset = (key) => {
    setActivePreset(key);
    setStartDate(null); setEndDate(null);
  };

  const handleApply = () => {
    if (activePreset) { onChange(activePreset); return; }
    if (startDate && endDate) {
      const fmt = (d) => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
      const s = startDate < endDate ? startDate : endDate;
      const e = startDate < endDate ? endDate : startDate;
      onChange({ type: 'custom', startDate: s.toISOString(), endDate: e.toISOString(), label: `${fmt(s)} - ${fmt(e)}` });
    } else if (startDate) {
      const fmt = (d) => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
      onChange({ type: 'custom', startDate: startDate.toISOString(), endDate: startDate.toISOString(), label: fmt(startDate) });
    }
  };

  const canApply = activePreset || startDate;

  return (
    <div className="date-picker-dropdown date-picker-dropdown--wide">
      <div className="date-picker-body">
        <div className="date-picker-presets">
          <div className="date-picker-presets-title">Date Range</div>
          {presets.map(p => (
            <button
              key={p.key}
              className={`date-preset-btn ${activePreset === p.key ? 'date-preset-btn--active' : ''}`}
              onClick={() => handlePreset(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="date-picker-calendar-area">
          <div className="date-picker-calendar-nav">
            <button className="drp-nav-btn" onClick={prevMonth}><ChevronLeft size={14} /></button>
            <div className="drp-calendar-months">
              <MonthCalendar
                year={leftYear} month={leftMonth}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onDayClick={handleDayClick} onDayHover={setHoverDate}
              />
              <MonthCalendar
                year={rightYear} month={rightMonth}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onDayClick={handleDayClick} onDayHover={setHoverDate}
              />
            </div>
            <button className="drp-nav-btn drp-nav-btn--right" onClick={nextMonth}><ChevronRight size={14} /></button>
          </div>

          {startDate && !endDate && (
            <div className="drp-hint">Click another date to set end of range</div>
          )}
        </div>
      </div>

      <div className="date-picker-footer">
        <button className="btn-outline btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn-primary btn-sm" disabled={!canApply} onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
}
