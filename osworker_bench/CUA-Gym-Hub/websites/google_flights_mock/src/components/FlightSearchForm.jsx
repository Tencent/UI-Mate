import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { AIRPORTS, generatePriceCalendar } from '../lib/data';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function useOutsideClick(ref, onClose) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

function ChevronDown({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5z"/>
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368">
      <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
    </svg>
  );
}

function CalendarIcon({ color = '#5f6368' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
      <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
    </svg>
  );
}

function LocationPin({ color = '#5f6368' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  );
}

// ─── Airport Autocomplete Input ──────────────────────────────────────────────

function AirportInput({ value, onChange, placeholder, style = {} }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useOutsideClick(wrapRef, () => setOpen(false));

  // Sync display text with selected airport code
  useEffect(() => {
    if (value) {
      const apt = AIRPORTS.find(a => a.code === value);
      if (apt) setQuery(`${apt.city} (${apt.code})`);
    } else {
      setQuery('');
    }
  }, [value]);

  const filtered = query.length > 0
    ? AIRPORTS.filter(a =>
        a.city.toLowerCase().includes(query.toLowerCase()) ||
        a.code.toLowerCase().includes(query.toLowerCase()) ||
        a.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : AIRPORTS.slice(0, 6);

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, ...style }}>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <LocationPin color="#5f6368" />
        </span>
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(''); }}
          onFocus={() => setOpen(true)}
          style={{
            width: '100%',
            height: '56px',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '0 12px 0 40px',
            fontSize: '14px',
            color: '#202124',
            outline: 'none',
            background: '#fff',
            fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
            cursor: 'text',
            boxSizing: 'border-box',
          }}
          onFocusCapture={e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 1px #1a73e8'; }}
          onBlurCapture={e => { e.target.style.borderColor = '#dadce0'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: 'none', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 200,
          margin: 0, padding: '8px 0', listStyle: 'none',
          maxHeight: '280px', overflowY: 'auto',
        }}>
          {filtered.map(apt => (
            <li
              key={apt.code}
              onMouseDown={() => { onChange(apt.code); setQuery(`${apt.city} (${apt.code})`); setOpen(false); }}
              style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <LocationPin color="#9aa0a6" />
              <div>
                <div style={{ fontSize: '14px', color: '#202124', fontWeight: 500 }}>{apt.city} ({apt.code})</div>
                <div style={{ fontSize: '12px', color: '#70757a' }}>{apt.name}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Passenger Popover ────────────────────────────────────────────────────────

function PassengerPopover({ passengers, onChange, onClose }) {
  const ref = useRef(null);
  useOutsideClick(ref, onClose);

  const adjust = (type, delta) => {
    const current = passengers[type];
    const next = Math.max(0, current + delta);
    const total = passengers.adults + passengers.children + passengers.infantsInSeat + passengers.infantsOnLap;
    // Max 9 total, min 1 adult
    if (type === 'adults' && next < 1) return;
    if (delta > 0 && total >= 9) return;
    onChange({ ...passengers, [type]: next });
  };

  const CountRow = ({ label, sub, field }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f3f4' }}>
      <div>
        <div style={{ fontSize: '14px', color: '#202124', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color: '#70757a' }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => adjust(field, -1)}
          disabled={field === 'adults' ? passengers[field] <= 1 : passengers[field] <= 0}
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: '1px solid #dadce0', background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: '#5f6368', opacity: (field === 'adults' && passengers[field] <= 1) || passengers[field] <= 0 ? 0.3 : 1,
          }}>−</button>
        <span style={{ width: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 500 }}>{passengers[field]}</span>
        <button
          onClick={() => adjust(field, 1)}
          style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #dadce0', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#5f6368' }}>+</button>
      </div>
    </div>
  );

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 300,
      background: '#fff', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      width: '280px', padding: '16px',
    }}>
      <CountRow label="Adults" sub="Age 12+" field="adults" />
      <CountRow label="Children" sub="Ages 2–11" field="children" />
      <CountRow label="Infants" sub="In seat" field="infantsInSeat" />
      <CountRow label="Infants" sub="On lap" field="infantsOnLap" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
        <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#1a73e8', fontWeight: 500 }}>Cancel</button>
        <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#1a73e8', fontWeight: 500 }}>Done</button>
      </div>
    </div>
  );
}

// ─── Dropdown Selector ────────────────────────────────────────────────────────

function DropdownSelector({ value, options, onChange, style = {} }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', ...style }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '6px 10px', border: 'none', background: 'none',
          cursor: 'pointer', fontSize: '14px', color: '#202124', fontWeight: 500,
          borderRadius: '4px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        {selected?.label} <ChevronDown />
      </button>
      {open && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 2px)', left: 0, zIndex: 300,
          background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          margin: 0, padding: '8px 0', listStyle: 'none', minWidth: '160px',
        }}>
          {options.map(opt => (
            <li
              key={opt.value}
              onMouseDown={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '10px 20px', cursor: 'pointer', fontSize: '14px',
                color: opt.value === value ? '#1a73e8' : '#202124',
                fontWeight: opt.value === value ? 500 : 400,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Date Picker Calendar Modal ───────────────────────────────────────────────

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function CalendarMonth({ year, month, priceMap, depDate, retDate, tripType, selecting, onSelectDate }) {
  // selecting: 'departure' | 'return'
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  // padding before
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);

  const dateStr = (d) => {
    if (!d) return null;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const isSelected = (d) => {
    if (!d) return false;
    const ds = dateStr(d);
    return ds === depDate || ds === retDate;
  };

  const isInRange = (d) => {
    if (!d || !depDate || !retDate || tripType !== 'roundtrip') return false;
    const ds = dateStr(d);
    return ds > depDate && ds < retDate;
  };

  const isPast = (d) => {
    if (!d) return false;
    const ds = dateStr(d);
    const dt = new Date(ds + 'T00:00:00');
    return dt < today;
  };

  return (
    <div style={{ minWidth: '280px' }}>
      {/* Month header */}
      <div style={{ textAlign: 'center', fontWeight: 500, fontSize: '14px', color: '#202124', marginBottom: '8px', padding: '4px 0' }}>
        {MONTH_NAMES[month]} {year}
      </div>
      {/* Day of week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '4px' }}>
        {DAYS_OF_WEEK.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '12px', color: '#70757a', fontWeight: 500, padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const ds = dateStr(d);
          const priceEntry = priceMap[ds];
          const selected = isSelected(d);
          const inRange = isInRange(d);
          const past = isPast(d);

          return (
            <div
              key={ds}
              onClick={() => { if (!past) onSelectDate(ds); }}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '4px 2px',
                cursor: past ? 'default' : 'pointer',
                borderRadius: selected ? '50%' : inRange ? '0' : '4px',
                background: selected ? '#1a73e8' : inRange ? '#e8f0fe' : 'transparent',
                opacity: past ? 0.35 : 1,
                transition: 'background 0.1s',
                minHeight: '44px',
                justifyContent: 'center',
              }}
              onMouseEnter={e => { if (!past && !selected) e.currentTarget.style.background = inRange ? '#d2e3fc' : '#f1f3f4'; }}
              onMouseLeave={e => { if (!past && !selected) e.currentTarget.style.background = inRange ? '#e8f0fe' : 'transparent'; }}
            >
              <span style={{
                fontSize: '13px',
                fontWeight: selected ? 600 : 400,
                color: selected ? '#fff' : inRange ? '#1a73e8' : '#202124',
                lineHeight: '1.2',
              }}>
                {d}
              </span>
              {priceEntry && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: priceEntry.isCheapest ? 600 : 400,
                  color: selected ? 'rgba(255,255,255,0.85)' : priceEntry.isCheapest ? '#137333' : '#5f6368',
                  lineHeight: '1.1',
                  marginTop: '1px',
                }}>
                  ${priceEntry.price}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DatePickerModal({ depDate, retDate, tripType, origin, destination, onClose, onSelectDep, onSelectRet }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selecting, setSelecting] = useState('departure'); // 'departure' | 'return'

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Generate price calendar for the route
  const priceCalendar = React.useMemo(() => {
    const cal = generatePriceCalendar(origin || 'SFO', destination || 'JFK');
    const map = {};
    cal.forEach(entry => { map[entry.date] = entry; });
    return map;
  }, [origin, destination]);

  // Navigate months
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const month2Year = viewMonth === 11 ? viewYear + 1 : viewYear;
  const month2 = viewMonth === 11 ? 0 : viewMonth + 1;

  // Get price range for bottom bar
  const cal = Object.values(priceCalendar);
  const minPrice = cal.length ? Math.min(...cal.map(e => e.price)) : 0;

  const handleDateClick = (ds) => {
    if (tripType === 'oneway') {
      onSelectDep(ds);
      onClose();
    } else {
      // Round trip: first click = departure, second = return
      if (selecting === 'departure') {
        onSelectDep(ds);
        if (retDate && ds >= retDate) {
          // If new dep >= ret, clear return
          onSelectRet('');
        }
        setSelecting('return');
      } else {
        // Return must be after departure
        if (depDate && ds <= depDate) {
          // Treat as new departure instead
          onSelectDep(ds);
          onSelectRet('');
          setSelecting('return');
        } else {
          onSelectRet(ds);
          setSelecting('departure');
        }
      }
    }
  };

  const formatDate = (d) => {
    if (!d) return '–';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}
      />
      {/* Modal */}
      <div style={{
        position: 'relative', background: '#fff', borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        padding: '20px 24px',
        maxWidth: '680px', width: '100%',
        zIndex: 1,
        fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => setSelecting('departure')}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                padding: '8px 4px',
                borderBottom: `2px solid ${selecting === 'departure' ? '#1a73e8' : 'transparent'}`,
                fontSize: '14px', fontWeight: 500,
                color: selecting === 'departure' ? '#1a73e8' : '#5f6368',
              }}
            >
              Departure: {formatDate(depDate)}
            </button>
            {tripType === 'roundtrip' && (
              <button
                onClick={() => setSelecting('return')}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  padding: '8px 4px',
                  borderBottom: `2px solid ${selecting === 'return' ? '#1a73e8' : 'transparent'}`,
                  fontSize: '14px', fontWeight: 500,
                  color: selecting === 'return' ? '#1a73e8' : '#5f6368',
                }}
              >
                Return: {formatDate(retDate)}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px', borderRadius: '50%' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Month navigation + calendars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={prevMonth}
            style={{ padding: '8px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%', color: '#5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
          </button>

          <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
            <CalendarMonth
              year={viewYear} month={viewMonth}
              priceMap={priceCalendar}
              depDate={depDate} retDate={retDate}
              tripType={tripType}
              selecting={selecting}
              onSelectDate={handleDateClick}
            />
            <CalendarMonth
              year={month2Year} month={month2}
              priceMap={priceCalendar}
              depDate={depDate} retDate={retDate}
              tripType={tripType}
              selecting={selecting}
              onSelectDate={handleDateClick}
            />
          </div>

          <button
            onClick={nextMonth}
            style={{ padding: '8px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%', color: '#5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
          </button>
        </div>

        {/* Price legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '8px 0', borderTop: '1px solid #f1f3f4' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#137333' }}>$</span>
          <span style={{ fontSize: '12px', color: '#5f6368' }}>= Cheapest dates</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#5f6368' }}>
            From <span style={{ color: '#137333', fontWeight: 500 }}>${minPrice}</span> round trip
          </span>
          <button
            onClick={onClose}
            style={{
              background: '#1a73e8', color: '#fff', border: 'none',
              borderRadius: '20px', padding: '8px 20px', fontSize: '14px', fontWeight: 500,
              cursor: 'pointer', marginLeft: '12px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Date Input Button (opens DatePickerModal) ─────────────────────────────

function DateInput({ value, onChange, placeholder = 'Date', onOpenPicker }) {
  const adjustDate = (delta, e) => {
    e.stopPropagation();
    if (!value) return;
    const d = new Date(value + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    onChange(d.toISOString().split('T')[0]);
  };

  const formatDisplay = (dateStr) => {
    if (!dateStr) return placeholder;
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onOpenPicker}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        border: '1px solid #dadce0', borderRadius: '8px', background: '#fff',
        height: '56px', minWidth: '140px', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a73e8'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#dadce0'; }}
    >
      <span style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}>
        <CalendarIcon color={value ? '#1a73e8' : '#5f6368'} />
      </span>
      <span style={{ paddingLeft: '40px', paddingRight: '60px', fontSize: '14px', color: value ? '#202124' : '#70757a', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {formatDisplay(value)}
      </span>
      {value && (
        <div style={{ position: 'absolute', right: '4px', display: 'flex', gap: '0px', zIndex: 3 }}>
          <button onClick={e => adjustDate(-1, e)}
            style={{ width: '26px', height: '26px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#5f6368' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
          </button>
          <button onClick={e => adjustDate(1, e)}
            style={{ width: '26px', height: '26px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#5f6368' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main FlightSearchForm ────────────────────────────────────────────────────

const TRIP_OPTIONS = [
  { value: 'roundtrip', label: 'Round trip' },
  { value: 'oneway', label: 'One way' },
  { value: 'multicity', label: 'Multi-city' },
];

const CABIN_OPTIONS = [
  { value: 'economy', label: 'Economy' },
  { value: 'premiumEconomy', label: 'Premium economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];

export default function FlightSearchForm({ compact = false }) {
  const navigate = useNavigate();
  const { state, setSearch, setMultiLegs } = useAppContext();
  const search = state.search;

  const [showPassengers, setShowPassengers] = useState(false);
  const passRef = useRef(null);
  useOutsideClick(passRef, () => setShowPassengers(false));

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [flexDates, setFlexDates] = useState('exact'); // 'exact' | '1' | '2' | '3' | 'flexible'

  // Multi-city legs: sync from context or use default
  const [multiLegs, setMultiLegsLocal] = useState(() => {
    const savedLegs = search.legs;
    if (savedLegs && savedLegs.length >= 2) return savedLegs;
    return [
      { origin: search.origin || '', destination: '', date: search.departureDate || '' },
      { origin: '', destination: '', date: '' },
    ];
  });

  const pax = search.passengers;
  const totalPax = pax.adults + pax.children + pax.infantsInSeat + pax.infantsOnLap;
  const paxLabel = totalPax === 1 ? '1 passenger' : `${totalPax} passengers`;
  const cabinLabel = CABIN_OPTIONS.find(o => o.value === search.cabinClass)?.label || 'Economy';

  const handleSwap = () => {
    setSearch({ origin: search.destination, destination: search.origin });
  };

  const handleSearch = () => {
    const sid = state.sid || '';

    if (search.tripType === 'multicity') {
      // Save legs to context
      setMultiLegs(multiLegs);
      // Navigate to results with first leg
      const firstLeg = multiLegs[0];
      const params = new URLSearchParams({
        origin: firstLeg.origin || '',
        destination: firstLeg.destination || '',
        date: firstLeg.date || '',
        returnDate: '',
        tripType: 'multicity',
        adults: pax.adults,
        cabin: search.cabinClass,
      });
      if (sid) params.set('sid', sid);
      navigate(`/results?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams({
      origin: search.origin || '',
      destination: search.destination || '',
      date: search.departureDate || '',
      returnDate: search.returnDate || '',
      tripType: search.tripType,
      adults: pax.adults,
      cabin: search.cabinClass,
    });
    if (sid) params.set('sid', sid);
    navigate(`/results?${params.toString()}`);
  };

  const updateLeg = (idx, field, val) => {
    const legs = [...multiLegs];
    legs[idx] = { ...legs[idx], [field]: val };
    setMultiLegsLocal(legs);
  };

  const addLeg = () => {
    if (multiLegs.length < 5) {
      const prev = multiLegs[multiLegs.length - 1];
      setMultiLegsLocal([...multiLegs, { origin: prev.destination || '', destination: '', date: '' }]);
    }
  };

  const removeLeg = (idx) => {
    if (multiLegs.length > 2) setMultiLegsLocal(multiLegs.filter((_, i) => i !== idx));
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 6px rgba(60,64,67,0.15), 0 1px 3px rgba(60,64,67,0.3)',
      padding: compact ? '12px 16px' : '16px 20px 20px',
      fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
    }}>
      {/* Row 1: Trip type, passengers, cabin */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <DropdownSelector
          value={search.tripType}
          options={TRIP_OPTIONS}
          onChange={v => setSearch({ tripType: v })}
        />

        {/* Passengers popover */}
        <div ref={passRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPassengers(v => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', color: '#202124', fontWeight: 500, borderRadius: '4px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '2px' }}>
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            {paxLabel} <ChevronDown />
          </button>
          {showPassengers && (
            <PassengerPopover
              passengers={pax}
              onChange={p => setSearch({ passengers: p })}
              onClose={() => setShowPassengers(false)}
            />
          )}
        </div>

        <DropdownSelector
          value={search.cabinClass}
          options={CABIN_OPTIONS}
          onChange={v => setSearch({ cabinClass: v })}
        />
      </div>

      {/* Row 2: Main inputs */}
      {search.tripType !== 'multicity' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Origin */}
          <AirportInput
            value={search.origin}
            onChange={v => setSearch({ origin: v })}
            placeholder="Where from?"
            style={{ flex: '1 1 160px', minWidth: '150px' }}
          />

          {/* Swap button */}
          <button
            onClick={handleSwap}
            title="Swap origin and destination"
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #dadce0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.2s', position: 'relative', zIndex: 10 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f3f4'; e.currentTarget.querySelector('svg').style.transform = 'rotate(180deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.querySelector('svg').style.transform = 'rotate(0deg)'; }}
          >
            <SwapIcon />
          </button>

          {/* Destination */}
          <AirportInput
            value={search.destination}
            onChange={v => setSearch({ destination: v })}
            placeholder="Where to?"
            style={{ flex: '1 1 160px', minWidth: '150px' }}
          />

          {/* Departure date */}
          <DateInput
            value={search.departureDate}
            onChange={v => setSearch({ departureDate: v })}
            placeholder="Departure"
            onOpenPicker={() => setShowDatePicker(true)}
          />

          {/* Return date (only for roundtrip) */}
          {search.tripType === 'roundtrip' && (
            <DateInput
              value={search.returnDate}
              onChange={v => setSearch({ returnDate: v })}
              placeholder="Return"
              onOpenPicker={() => setShowDatePicker(true)}
            />
          )}

          {/* Search button */}
          <button
            onClick={handleSearch}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#1a73e8', color: '#fff', border: 'none',
              borderRadius: '24px', padding: '0 20px', height: '48px',
              fontSize: '16px', fontWeight: 500, cursor: 'pointer',
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              transition: 'background 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Search
          </button>
        </div>
      ) : (
        /* Multi-city layout */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {multiLegs.map((leg, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <AirportInput value={leg.origin} onChange={v => updateLeg(idx, 'origin', v)} placeholder="Where from?" style={{ flex: '1 1 140px', minWidth: '130px' }} />
              <AirportInput value={leg.destination} onChange={v => updateLeg(idx, 'destination', v)} placeholder="Where to?" style={{ flex: '1 1 140px', minWidth: '130px' }} />
              <DateInput
                value={leg.date}
                onChange={v => updateLeg(idx, 'date', v)}
                placeholder="Date"
                onOpenPicker={() => setShowDatePicker(true)}
              />
              {idx >= 2 && (
                <button onClick={() => removeLeg(idx)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f6368' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            {multiLegs.length < 5 && (
              <button onClick={addLeg} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, padding: '8px', borderRadius: '4px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e8f0fe'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Add flight
              </button>
            )}
            <button onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', padding: '0 20px', height: '48px', fontSize: '16px', fontWeight: 500, cursor: 'pointer', marginLeft: 'auto' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              Search
            </button>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DatePickerModal
          depDate={search.departureDate}
          retDate={search.returnDate}
          tripType={search.tripType}
          origin={search.origin}
          destination={search.destination}
          onClose={() => setShowDatePicker(false)}
          onSelectDep={v => setSearch({ departureDate: v })}
          onSelectRet={v => setSearch({ returnDate: v })}
        />
      )}
    </div>
  );
}
