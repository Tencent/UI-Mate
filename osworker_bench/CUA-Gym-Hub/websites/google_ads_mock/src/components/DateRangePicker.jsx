import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const PRESETS = [
  { label: 'Today', days: 1 },
  { label: 'Yesterday', days: 1, offset: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This month', days: 'thisMonth' },
  { label: 'Last month', days: 'lastMonth' },
  { label: 'Custom', days: 'custom' },
]

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

function getPresetDates(preset) {
  const today = new Date(2025, 2, 30) // March 30 2025
  if (preset.days === 'thisMonth') {
    return { start: '2025-03-01', end: '2025-03-30', label: preset.label }
  }
  if (preset.days === 'lastMonth') {
    return { start: '2025-02-01', end: '2025-02-28', label: preset.label }
  }
  if (preset.days === 'custom') return null
  const offset = preset.offset || 0
  const end = new Date(today)
  end.setDate(end.getDate() - offset)
  const start = new Date(end)
  start.setDate(start.getDate() - preset.days + 1)
  return { start: formatDate(start), end: formatDate(end), label: preset.label }
}

export default function DateRangePicker() {
  const { state, dispatch } = useApp()
  const dateRange = state?.selectedDateRange || { start: '2025-03-01', end: '2025-03-30', label: 'Last 30 days' }
  const [open, setOpen] = useState(false)
  const [customStart, setCustomStart] = useState(dateRange.start)
  const [customEnd, setCustomEnd] = useState(dateRange.end)
  const [selectedPreset, setSelectedPreset] = useState(dateRange.label)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePreset = (preset) => {
    setSelectedPreset(preset.label)
    if (preset.days === 'custom') return
    const range = getPresetDates(preset)
    if (range) {
      setCustomStart(range.start)
      setCustomEnd(range.end)
      dispatch({ type: 'SET_DATE_RANGE', payload: range })
      setOpen(false)
    }
  }

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      dispatch({ type: 'SET_DATE_RANGE', payload: { start: customStart, end: customEnd, label: 'Custom' } })
      setOpen(false)
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: '#fff', border: '1px solid #DADCE0', borderRadius: 4,
          padding: '6px 12px', fontSize: 13, color: '#5F6368', display: 'flex',
          alignItems: 'center', gap: 8, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <Calendar size={14} />
        {dateRange.label || `${dateRange.start} – ${dateRange.end}`}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4,
          background: '#fff', border: '1px solid #DADCE0', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 200,
          display: 'flex', minWidth: 420,
        }}>
          {/* Presets */}
          <div style={{ borderRight: '1px solid #F1F3F4', padding: 8, minWidth: 160 }}>
            {PRESETS.map(p => (
              <div
                key={p.label}
                onClick={() => handlePreset(p)}
                style={{
                  padding: '8px 12px', borderRadius: 4, cursor: 'pointer',
                  fontSize: 13, color: selectedPreset === p.label ? '#1A73E8' : '#202124',
                  background: selectedPreset === p.label ? '#E8F0FE' : 'transparent',
                  fontWeight: selectedPreset === p.label ? 500 : 400,
                }}
                onMouseEnter={e => { if (selectedPreset !== p.label) e.currentTarget.style.background = '#F1F3F4' }}
                onMouseLeave={e => { if (selectedPreset !== p.label) e.currentTarget.style.background = selectedPreset === p.label ? '#E8F0FE' : 'transparent' }}
              >
                {p.label}
              </div>
            ))}
          </div>

          {/* Custom date inputs */}
          <div style={{ padding: 16, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#5F6368', marginBottom: 12 }}>Custom date range</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: '#5F6368', display: 'block', marginBottom: 2 }}>Start date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={e => { setCustomStart(e.target.value); setSelectedPreset('Custom') }}
                  style={{
                    width: '100%', border: '1px solid #DADCE0', borderRadius: 4,
                    padding: '6px 10px', fontSize: 13, outline: 'none', color: '#202124',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#5F6368', display: 'block', marginBottom: 2 }}>End date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => { setCustomEnd(e.target.value); setSelectedPreset('Custom') }}
                  style={{
                    width: '100%', border: '1px solid #DADCE0', borderRadius: 4,
                    padding: '6px 10px', fontSize: 13, outline: 'none', color: '#202124',
                  }}
                />
              </div>
              <button
                onClick={handleApplyCustom}
                style={{
                  background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4,
                  padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                Apply
              </button>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#5F6368' }}>
              {customStart} to {customEnd}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
