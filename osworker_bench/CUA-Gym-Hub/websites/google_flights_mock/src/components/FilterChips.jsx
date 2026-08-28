import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { AIRLINES } from '../lib/data';

function useOutsideClick(ref, onClose) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

function ChevronDown({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5z"/>
    </svg>
  );
}

function Chip({ label, active = false, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '6px 12px', height: '36px',
        border: `1px solid ${active ? '#1a73e8' : '#dadce0'}`,
        borderRadius: '20px',
        background: active ? '#e8f0fe' : '#fff',
        color: active ? '#1a73e8' : '#202124',
        fontSize: '14px', fontWeight: 500,
        cursor: 'pointer', whiteSpace: 'nowrap',
        fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
        transition: 'border-color 0.1s, background 0.1s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f1f3f4'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#fff'; }}
    >
      {label || children}
      <ChevronDown />
    </button>
  );
}

function StopsDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const options = [
    { value: 'any', label: 'Any number of stops' },
    { value: '0', label: 'Nonstop only' },
    { value: '1', label: '1 stop or fewer' },
    { value: '2', label: '2 stops or fewer' },
  ];
  const selected = options.find(o => o.value === (value || 'any'));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Chip label="Stops" active={value && value !== 'any'} onClick={() => setOpen(v => !v)} />
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200, background: '#fff', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', minWidth: '200px', padding: '8px 0' }}>
          {options.map(opt => (
            <div
              key={opt.value}
              onMouseDown={() => { onChange(opt.value); setOpen(false); }}
              style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', color: (value || 'any') === opt.value ? '#1a73e8' : '#202124', fontWeight: (value || 'any') === opt.value ? 500 : 400, display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {(value || 'any') === opt.value && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1a73e8"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              )}
              {(value || 'any') !== opt.value && <div style={{ width: '16px' }} />}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AirlinesDropdown({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const toggle = (id) => {
    const next = value.includes(id) ? value.filter(x => x !== id) : [...value, id];
    onChange(next);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Chip label={value.length > 0 ? `Airlines (${value.length})` : 'Airlines'} active={value.length > 0} onClick={() => setOpen(v => !v)} />
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200, background: '#fff', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', minWidth: '220px', padding: '8px 0', maxHeight: '300px', overflowY: 'auto' }}>
          {AIRLINES.map(a => (
            <label
              key={a.id}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', color: '#202124' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <input type="checkbox" checked={value.includes(a.id)} onChange={() => toggle(a.id)} style={{ accentColor: '#1a73e8', cursor: 'pointer' }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: a.logoColor, color: '#fff', fontSize: '9px', fontWeight: 700, flexShrink: 0 }}>
                {a.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
              {a.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function BagsDropdown({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const bags = [
    { id: 'carryOn', label: 'Carry-on bag' },
    { id: 'checkedBag', label: '1 checked bag' },
  ];

  const toggle = (id) => {
    const next = value.includes(id) ? value.filter(x => x !== id) : [...value, id];
    onChange(next);
  };

  const isActive = value.length > 0;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Chip label={isActive ? `Bags (${value.length})` : 'Bags'} active={isActive} onClick={() => setOpen(v => !v)} />
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200, background: '#fff', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', minWidth: '200px', padding: '8px 0' }}>
          {bags.map(bag => (
            <label
              key={bag.id}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', color: '#202124' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <input
                type="checkbox"
                checked={value.includes(bag.id)}
                onChange={() => toggle(bag.id)}
                style={{ accentColor: '#1a73e8', cursor: 'pointer' }}
              />
              {bag.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const isActive = value && value < 2000;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Chip label={isActive ? `Price: up to $${value}` : 'Price'} active={isActive} onClick={() => setOpen(v => !v)} />
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200, background: '#fff', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', width: '240px', padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#202124', marginBottom: '12px' }}>Max price</div>
          <input
            type="range"
            min={50} max={2000} step={50}
            value={value || 2000}
            onChange={e => onChange(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#1a73e8', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#70757a', marginTop: '8px' }}>
            <span>$50</span>
            <span style={{ color: '#202124', fontWeight: 500 }}>${value || 2000}</span>
          </div>
          <button
            onMouseDown={() => { onChange(2000); setOpen(false); }}
            style={{ marginTop: '12px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, padding: 0 }}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

// Dual-handle range slider helper
function DualRangeSlider({ min, max, step, valueMin, valueMax, onChangeMin, onChangeMax, formatLabel }) {
  return (
    <div style={{ position: 'relative', paddingTop: '4px' }}>
      {/* Min handle */}
      <input
        type="range" min={min} max={max} step={step}
        value={valueMin}
        onChange={e => {
          const v = parseInt(e.target.value);
          if (v < valueMax) onChangeMin(v);
        }}
        style={{ width: '100%', accentColor: '#1a73e8', cursor: 'pointer', position: 'absolute', pointerEvents: 'auto', zIndex: 2 }}
      />
      {/* Max handle */}
      <input
        type="range" min={min} max={max} step={step}
        value={valueMax}
        onChange={e => {
          const v = parseInt(e.target.value);
          if (v > valueMin) onChangeMax(v);
        }}
        style={{ width: '100%', accentColor: '#1a73e8', cursor: 'pointer', position: 'relative', zIndex: 1, marginTop: '8px', display: 'block' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5f6368', marginTop: '4px' }}>
        <span>{formatLabel(valueMin)}</span>
        <span>{formatLabel(valueMax)}</span>
      </div>
    </div>
  );
}

function TimesDropdown({ depRange, arrRange, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const isActive = (depRange && (depRange[0] > 0 || depRange[1] < 1440)) ||
    (arrRange && (arrRange[0] > 0 || arrRange[1] < 1440));

  const formatHour = (mins) => {
    if (mins >= 1440) return '12AM+';
    const h = Math.floor(mins / 60);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}${suffix}`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Chip label="Times" active={isActive} onClick={() => setOpen(v => !v)} />
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200, background: '#fff', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', width: '300px', padding: '16px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '8px' }}>
              Departure: {formatHour(depRange?.[0] || 0)} – {formatHour(depRange?.[1] || 1440)}
            </div>
            <DualRangeSlider
              min={0} max={1440} step={60}
              valueMin={depRange?.[0] || 0}
              valueMax={depRange?.[1] || 1440}
              onChangeMin={v => onChange({ depRange: [v, depRange?.[1] || 1440], arrRange })}
              onChangeMax={v => onChange({ depRange: [depRange?.[0] || 0, v], arrRange })}
              formatLabel={formatHour}
            />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#202124', marginBottom: '8px' }}>
              Arrival: {formatHour(arrRange?.[0] || 0)} – {formatHour(arrRange?.[1] || 1440)}
            </div>
            <DualRangeSlider
              min={0} max={1440} step={60}
              valueMin={arrRange?.[0] || 0}
              valueMax={arrRange?.[1] || 1440}
              onChangeMin={v => onChange({ depRange, arrRange: [v, arrRange?.[1] || 1440] })}
              onChangeMax={v => onChange({ depRange, arrRange: [arrRange?.[0] || 0, v] })}
              formatLabel={formatHour}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── All Filters Modal ────────────────────────────────────────────────────────

function AllFiltersModal({ filters, onClose, onApply }) {
  const [local, setLocal] = useState({ ...filters });

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const update = (fields) => setLocal(prev => ({ ...prev, ...fields }));

  const formatHour = (mins) => {
    if (mins >= 1440) return '12AM+';
    const h = Math.floor(mins / 60);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}${suffix}`;
  };

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const bags = [
    { id: 'carryOn', label: 'Carry-on bag' },
    { id: 'checkedBag', label: '1 checked bag' },
  ];

  const stopOptions = [
    { value: 'any', label: 'Any number of stops' },
    { value: '0', label: 'Nonstop only' },
    { value: '1', label: '1 stop or fewer' },
    { value: '2', label: '2 stops or fewer' },
  ];

  const emissionsOptions = [
    { value: 'any', label: 'Any' },
    { value: 'low', label: 'Low emissions only' },
  ];

  const toggleAirline = (id) => {
    const cur = local.airlines || [];
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    update({ airlines: next });
  };

  const toggleBag = (id) => {
    const cur = local.bags || [];
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    update({ bags: next });
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 500, color: '#202124', borderBottom: '1px solid #f1f3f4', paddingBottom: '8px' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{
        position: 'relative', background: '#fff',
        width: '400px', maxWidth: '100%', height: '100%',
        overflowY: 'auto', zIndex: 1,
        fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #dadce0', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: '#202124' }}>All filters</h2>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px', borderRadius: '50%' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>

          {/* Stops */}
          <Section title="Stops">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stopOptions.map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#202124' }}>
                  <input
                    type="radio"
                    name="stops"
                    value={opt.value}
                    checked={(local.stops || 'any') === opt.value}
                    onChange={() => update({ stops: opt.value })}
                    style={{ accentColor: '#1a73e8', cursor: 'pointer' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Section>

          {/* Airlines */}
          <Section title="Airlines">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
              {AIRLINES.map(a => (
                <label key={a.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', cursor: 'pointer', fontSize: '14px', color: '#202124' }}
                >
                  <input
                    type="checkbox"
                    checked={(local.airlines || []).includes(a.id)}
                    onChange={() => toggleAirline(a.id)}
                    style={{ accentColor: '#1a73e8', cursor: 'pointer' }}
                  />
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: a.logoColor, color: '#fff', fontSize: '9px', fontWeight: 700, flexShrink: 0 }}>
                    {a.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                  {a.name}
                </label>
              ))}
            </div>
          </Section>

          {/* Bags */}
          <Section title="Bags included">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bags.map(bag => (
                <label key={bag.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#202124' }}
                >
                  <input
                    type="checkbox"
                    checked={(local.bags || []).includes(bag.id)}
                    onChange={() => toggleBag(bag.id)}
                    style={{ accentColor: '#1a73e8', cursor: 'pointer' }}
                  />
                  {bag.label}
                </label>
              ))}
            </div>
          </Section>

          {/* Price */}
          <Section title="Price">
            <div style={{ fontSize: '13px', color: '#5f6368', marginBottom: '8px' }}>
              Max price: <strong style={{ color: '#202124' }}>${local.maxPrice || 2000}</strong>
            </div>
            <input
              type="range" min={50} max={2000} step={50}
              value={local.maxPrice || 2000}
              onChange={e => update({ maxPrice: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#1a73e8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#70757a' }}>
              <span>$50</span><span>$2000</span>
            </div>
          </Section>

          {/* Max Duration */}
          <Section title="Max trip duration">
            <div style={{ fontSize: '13px', color: '#5f6368', marginBottom: '8px' }}>
              Up to: <strong style={{ color: '#202124' }}>{formatDuration(local.maxDuration || 1200)}</strong>
              {(local.maxDuration || 1200) >= 1200 && <span style={{ color: '#70757a' }}> (any)</span>}
            </div>
            <input
              type="range" min={60} max={1200} step={30}
              value={local.maxDuration || 1200}
              onChange={e => update({ maxDuration: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#1a73e8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#70757a' }}>
              <span>1h</span><span>20h (any)</span>
            </div>
          </Section>

          {/* Departure time */}
          <Section title="Departure time">
            <div style={{ fontSize: '13px', color: '#5f6368', marginBottom: '8px' }}>
              {formatHour(local.departureTimeRange?.[0] || 0)} – {formatHour(local.departureTimeRange?.[1] || 1440)}
            </div>
            <DualRangeSlider
              min={0} max={1440} step={60}
              valueMin={local.departureTimeRange?.[0] || 0}
              valueMax={local.departureTimeRange?.[1] || 1440}
              onChangeMin={v => update({ departureTimeRange: [v, local.departureTimeRange?.[1] || 1440] })}
              onChangeMax={v => update({ departureTimeRange: [local.departureTimeRange?.[0] || 0, v] })}
              formatLabel={formatHour}
            />
          </Section>

          {/* Arrival time */}
          <Section title="Arrival time">
            <div style={{ fontSize: '13px', color: '#5f6368', marginBottom: '8px' }}>
              {formatHour(local.arrivalTimeRange?.[0] || 0)} – {formatHour(local.arrivalTimeRange?.[1] || 1440)}
            </div>
            <DualRangeSlider
              min={0} max={1440} step={60}
              valueMin={local.arrivalTimeRange?.[0] || 0}
              valueMax={local.arrivalTimeRange?.[1] || 1440}
              onChangeMin={v => update({ arrivalTimeRange: [v, local.arrivalTimeRange?.[1] || 1440] })}
              onChangeMax={v => update({ arrivalTimeRange: [local.arrivalTimeRange?.[0] || 0, v] })}
              formatLabel={formatHour}
            />
          </Section>

          {/* Emissions */}
          <Section title="Emissions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {emissionsOptions.map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#202124' }}>
                  <input
                    type="radio"
                    name="emissions"
                    value={opt.value}
                    checked={(local.emissions || 'any') === opt.value}
                    onChange={() => update({ emissions: opt.value })}
                    style={{ accentColor: '#1a73e8', cursor: 'pointer' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '12px 20px', borderTop: '1px solid #dadce0', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              const reset = {
                stops: 'any', airlines: [], bags: [], maxPrice: 2000,
                departureTimeRange: [0, 1440], arrivalTimeRange: [0, 1440],
                maxDuration: 1200, connectingAirports: [], emissions: 'any',
              };
              setLocal(reset);
            }}
            style={{ background: 'none', border: '1px solid #dadce0', borderRadius: '20px', padding: '8px 20px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#1a73e8', fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e8f0fe'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Reset all
          </button>
          <button
            onClick={() => { onApply(local); onClose(); }}
            style={{ background: '#1a73e8', border: 'none', borderRadius: '20px', padding: '8px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#fff', fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FilterChips() {
  const { state, setFilters } = useAppContext();
  const filters = state.filters || {};
  const [showAllFilters, setShowAllFilters] = useState(false);

  const hasActiveFilters = (
    (filters.stops && filters.stops !== 'any') ||
    (filters.airlines && filters.airlines.length > 0) ||
    (filters.bags && filters.bags.length > 0) ||
    (filters.maxPrice && filters.maxPrice < 2000) ||
    (filters.maxDuration && filters.maxDuration < 1200) ||
    (filters.emissions && filters.emissions !== 'any') ||
    (filters.departureTimeRange && (filters.departureTimeRange[0] > 0 || filters.departureTimeRange[1] < 1440)) ||
    (filters.arrivalTimeRange && (filters.arrivalTimeRange[0] > 0 || filters.arrivalTimeRange[1] < 1440))
  );

  const handleClearAll = () => {
    setFilters({
      stops: 'any',
      airlines: [],
      bags: [],
      maxPrice: 2000,
      departureTimeRange: [0, 1440],
      arrivalTimeRange: [0, 1440],
      maxDuration: 1200,
      connectingAirports: [],
      emissions: 'any',
    });
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {/* All filters chip */}
        <button
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', height: '36px', border: `1px solid ${hasActiveFilters ? '#1a73e8' : '#dadce0'}`, borderRadius: '20px', background: hasActiveFilters ? '#e8f0fe' : '#fff', color: hasActiveFilters ? '#1a73e8' : '#202124', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}
          onClick={() => setShowAllFilters(true)}
          onMouseEnter={e => { if (!hasActiveFilters) e.currentTarget.style.background = '#f1f3f4'; }}
          onMouseLeave={e => { if (!hasActiveFilters) e.currentTarget.style.background = '#fff'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/></svg>
          All filters
        </button>

        <StopsDropdown
          value={filters.stops}
          onChange={v => setFilters({ stops: v })}
        />

        <AirlinesDropdown
          value={filters.airlines || []}
          onChange={v => setFilters({ airlines: v })}
        />

        <BagsDropdown
          value={filters.bags || []}
          onChange={v => setFilters({ bags: v })}
        />

        <PriceDropdown
          value={filters.maxPrice}
          onChange={v => setFilters({ maxPrice: v })}
        />

        <TimesDropdown
          depRange={filters.departureTimeRange || [0, 1440]}
          arrRange={filters.arrivalTimeRange || [0, 1440]}
          onChange={({ depRange, arrRange }) => setFilters({ departureTimeRange: depRange, arrivalTimeRange: arrRange })}
        />

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', height: '36px', border: 'none', borderRadius: '20px', background: 'none', color: '#1a73e8', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e8f0fe'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            Clear all
          </button>
        )}
      </div>

      {showAllFilters && (
        <AllFiltersModal
          filters={filters}
          onClose={() => setShowAllFilters(false)}
          onApply={(newFilters) => setFilters(newFilters)}
        />
      )}
    </>
  );
}
