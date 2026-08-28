import React, { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

const PRESETS = ['Custom', 'Today', 'Yesterday', '7D', '14D', '30D', '3M', '6M', '12M']
const GRANULARITIES = ['Hour', 'Day', 'Week', 'Month']

export default function DatePickerBar({
  activePreset = '30D',
  onPresetChange,
  dateRangeText = 'Dec 23, 2025 - Jan 22, 2026',
  granularity,
  onGranularityChange,
  chartType,
  onChartTypeChange,
  showGranularity = false,
  showChartType = false,
}) {
  const [granOpen, setGranOpen] = useState(false)

  return (
    <div style={{
      height: 42, display: 'flex', alignItems: 'center',
      padding: '0 20px', borderBottom: '1px solid #E4E4E8',
      background: '#fff', flexShrink: 0, gap: 4, overflow: 'hidden'
    }}>
      <button style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 8px', border: 'none', borderRadius: 4,
        background: 'none', cursor: 'pointer', color: '#1B1B2E', fontSize: 13
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#F7F7F8'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <Calendar size={14} color="#8E8EA0" />
        <span>{dateRangeText}</span>
      </button>

      <div style={{ width: 1, height: 20, background: '#E4E4E8', margin: '0 4px' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {PRESETS.map(preset => (
          <button key={preset} onClick={() => onPresetChange && onPresetChange(preset)} style={{
            padding: '3px 10px', borderRadius: 4, border: 'none',
            background: activePreset === preset ? '#4F44E0' : 'transparent',
            color: activePreset === preset ? '#fff' : '#8E8EA0',
            fontSize: 12, fontWeight: activePreset === preset ? 600 : 500,
            cursor: 'pointer', transition: 'background 0.15s, color 0.15s'
          }}
          onMouseEnter={e => { if (activePreset !== preset) e.currentTarget.style.background = '#F7F7F8' }}
          onMouseLeave={e => { if (activePreset !== preset) e.currentTarget.style.background = 'transparent' }}>
            {preset}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {showGranularity && (
        <div style={{ position: 'relative' }}>
          <button onClick={() => setGranOpen(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', border: '1px solid #E4E4E8', borderRadius: 4,
            background: 'none', cursor: 'pointer', color: '#1B1B2E', fontSize: 13
          }}>
            {granularity || 'Day'} <ChevronDown size={12} color="#8E8EA0" />
          </button>
          {granOpen && (
            <SimpleDropdown
              items={GRANULARITIES}
              active={granularity}
              onClose={() => setGranOpen(false)}
              onSelect={v => { onGranularityChange && onGranularityChange(v); setGranOpen(false) }} />
          )}
        </div>
      )}

      {showChartType && (
        <div style={{ display: 'flex', gap: 2 }}>
          {[
            { type: 'line', label: 'Line' },
            { type: 'bar', label: 'Bar' },
            { type: 'pie', label: 'Pie' },
          ].map(({ type, label }) => (
            <button key={type} onClick={() => onChartTypeChange && onChartTypeChange(type)} style={{
              padding: '3px 10px', borderRadius: 4,
              border: '1px solid ' + (chartType === type ? '#4F44E0' : '#E4E4E8'),
              background: chartType === type ? '#F0EFFC' : 'none',
              color: chartType === type ? '#4F44E0' : '#8E8EA0',
              fontSize: 12, fontWeight: 500, cursor: 'pointer'
            }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SimpleDropdown({ items, active, onClose, onSelect }) {
  React.useEffect(() => {
    function handler() { onClose() }
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [onClose])

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, zIndex: 200, marginTop: 4,
      background: '#fff', border: '1px solid #E4E4E8', borderRadius: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: 4, minWidth: 120
    }}>
      {items.map(item => (
        <button key={item} onClick={e => { e.stopPropagation(); onSelect(item) }} style={{
          width: '100%', padding: '6px 10px', border: 'none', borderRadius: 4,
          background: active === item ? '#F0EFFC' : 'none',
          color: active === item ? '#4F44E0' : '#1B1B2E',
          fontSize: 13, cursor: 'pointer', textAlign: 'left',
          transition: 'background 0.15s'
        }}
        onMouseEnter={e => { if (active !== item) e.currentTarget.style.background = '#F7F7F8' }}
        onMouseLeave={e => { if (active !== item) e.currentTarget.style.background = 'none' }}>
          {item}
        </button>
      ))}
    </div>
  )
}
