import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CHART_TYPES = [
  { type: 'table', label: 'Table' },
  { type: 'pivot_table', label: 'Pivot Table' },
  { type: 'scorecard', label: 'Scorecard' },
  { type: 'time_series', label: 'Time Series' },
  { type: 'bar', label: 'Bar Chart' },
  { type: 'stacked_bar', label: 'Stacked Bar' },
  { type: 'column', label: 'Column Chart' },
  { type: 'line', label: 'Line Chart' },
  { type: 'area', label: 'Area Chart' },
  { type: 'pie', label: 'Pie Chart' },
  { type: 'donut', label: 'Donut Chart' },
  { type: 'geo', label: 'Geo Map' },
  { type: 'scatter', label: 'Scatter Chart' },
  { type: 'gauge', label: 'Gauge' },
  { type: 'treemap', label: 'Treemap' },
  { type: 'combo', label: 'Combo Chart' }
]

function SectionHeader({ label }) {
  return (
    <div style={{ padding: '12px 16px 4px', fontSize: '11px', fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </div>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: '#E8EAED', margin: '8px 0' }} />
}

function FieldPill({ field, color, onRemove }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: color, color: 'white',
      borderRadius: '12px', padding: '3px 10px',
      fontSize: '12px', fontWeight: 500, margin: '2px'
    }}>
      {field.name}
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}>
          <X size={12} />
        </button>
      )}
    </div>
  )
}

function SetupTab({ component }) {
  const { state, dispatch } = useApp()
  const ds = state.dataSources.find(d => d.id === component.dataSourceId)
  const [showChartPicker, setShowChartPicker] = useState(false)
  const [showDimPicker, setShowDimPicker] = useState(false)
  const [showMetPicker, setShowMetPicker] = useState(false)

  const updateComp = (changes) => {
    dispatch({ type: 'UPDATE_COMPONENT', payload: { id: component.id, ...changes } })
  }

  const dimFields = ds?.fields.filter(f => f.category === 'dimension') || []
  const metFields = ds?.fields.filter(f => f.category === 'metric') || []

  const addDim = (field) => {
    updateComp({ dimensions: [...(component.dimensions || []), { fieldId: field.id, name: field.name, type: field.type }] })
    setShowDimPicker(false)
  }

  const removeDim = (fieldId) => {
    updateComp({ dimensions: (component.dimensions || []).filter(d => d.fieldId !== fieldId) })
  }

  const addMet = (field) => {
    updateComp({ metrics: [...(component.metrics || []), { fieldId: field.id, name: field.name, type: 'number', aggregation: field.aggregation || 'SUM' }] })
    setShowMetPicker(false)
  }

  const removeMet = (fieldId) => {
    updateComp({ metrics: (component.metrics || []).filter(m => m.fieldId !== fieldId) })
  }

  if (component.type === 'text' || component.type === 'shape' || component.type === 'line') {
    return <div style={{ padding: '16px', color: '#5F6368', fontSize: '13px' }}>No data configuration for this element.</div>
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {/* Chart type selector */}
      {component.type === 'chart' && (
        <>
          <SectionHeader label="Chart Type" />
          <div style={{ padding: '4px 16px 8px' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 10px', border: '1px solid #DADCE0', borderRadius: '4px',
                cursor: 'pointer', fontSize: '13px', color: '#202124'
              }}
              onClick={() => setShowChartPicker(v => !v)}
            >
              <span>{CHART_TYPES.find(c => c.type === component.chartType)?.label || component.chartType}</span>
            </div>
            {showChartPicker && (
              <div style={{ marginTop: '4px', border: '1px solid #DADCE0', borderRadius: '4px', background: 'white', maxHeight: '200px', overflowY: 'auto' }}>
                {CHART_TYPES.map(ct => (
                  <div
                    key={ct.type}
                    style={{
                      padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                      color: ct.type === component.chartType ? '#1A73E8' : '#202124',
                      background: ct.type === component.chartType ? '#E8F0FE' : 'transparent'
                    }}
                    onClick={() => { updateComp({ chartType: ct.type }); setShowChartPicker(false) }}
                    onMouseEnter={e => { if (ct.type !== component.chartType) e.target.style.background = '#F1F3F4' }}
                    onMouseLeave={e => { if (ct.type !== component.chartType) e.target.style.background = 'transparent' }}
                  >
                    {ct.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Divider />
        </>
      )}

      {/* Data source */}
      <SectionHeader label="Data Source" />
      <div style={{ padding: '4px 16px 8px' }}>
        <select
          value={component.dataSourceId || ''}
          onChange={e => updateComp({ dataSourceId: e.target.value })}
          style={{ width: '100%', padding: '6px 8px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '13px' }}
        >
          <option value="">Select data source</option>
          {state.dataSources.map(ds => (
            <option key={ds.id} value={ds.id}>{ds.name}</option>
          ))}
        </select>
      </div>

      {component.type !== 'control' && (
        <>
          <Divider />
          {/* Dimensions */}
          <SectionHeader label="Dimension" />
          <div style={{ padding: '4px 16px 8px' }}>
            <div style={{ marginBottom: '4px' }}>
              {(component.dimensions || []).map(d => (
                <FieldPill key={d.fieldId} field={d} color="#188038" onRemove={() => removeDim(d.fieldId)} />
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDimPicker(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1A73E8', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
              >
                <Plus size={14} /> Add dimension
              </button>
              {showDimPicker && (
                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, background: 'white', border: '1px solid #DADCE0', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', maxHeight: '180px', overflowY: 'auto', minWidth: '220px' }}>
                  {dimFields.map(f => (
                    <div key={f.id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}
                      onClick={() => addDim(f)}
                      onMouseEnter={e => e.target.style.background = '#F1F3F4'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      {f.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Divider />
          {/* Metrics */}
          <SectionHeader label="Metric" />
          <div style={{ padding: '4px 16px 8px' }}>
            <div style={{ marginBottom: '4px' }}>
              {(component.metrics || []).map(m => (
                <FieldPill key={m.fieldId} field={m} color="#1A73E8" onRemove={() => removeMet(m.fieldId)} />
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMetPicker(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1A73E8', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
              >
                <Plus size={14} /> Add metric
              </button>
              {showMetPicker && (
                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, background: 'white', border: '1px solid #DADCE0', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', maxHeight: '180px', overflowY: 'auto', minWidth: '220px' }}>
                  {metFields.map(f => (
                    <div key={f.id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}
                      onClick={() => addMet(f)}
                      onMouseEnter={e => e.target.style.background = '#F1F3F4'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      {f.name} ({f.aggregation})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Divider />
          {/* Sort */}
          <SectionHeader label="Sort" />
          <div style={{ padding: '4px 16px 8px', display: 'flex', gap: '8px' }}>
            <select
              value={component.sortField || ''}
              onChange={e => updateComp({ sortField: e.target.value })}
              style={{ flex: 1, padding: '6px 8px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '12px' }}
            >
              <option value="">None</option>
              {[...(component.dimensions || []), ...(component.metrics || [])].map(f => (
                <option key={f.fieldId} value={f.fieldId}>{f.name}</option>
              ))}
            </select>
            <select
              value={component.sortDirection || 'DESC'}
              onChange={e => updateComp({ sortDirection: e.target.value })}
              style={{ width: '80px', padding: '6px 8px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '12px' }}
            >
              <option value="ASC">ASC</option>
              <option value="DESC">DESC</option>
            </select>
          </div>

          <Divider />
          {/* Filter section */}
          <SectionHeader label="Filter" />
          <div style={{ padding: '4px 16px 8px' }}>
            {(component.filters || []).map((filter, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontSize: '12px', background: '#F1F3F4', borderRadius: '4px', padding: '4px 8px' }}>
                <span style={{ flex: 1, color: '#202124' }}>{filter.field} {filter.condition} "{filter.value}"</span>
                <button onClick={() => updateComp({ filters: (component.filters || []).filter((_, fi) => fi !== i) })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5F6368', display: 'flex', padding: 0 }}>
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const field = (component.dimensions || [])[0]?.name || 'Channel'
                const newFilter = { field, condition: 'equals', value: '' }
                updateComp({ filters: [...(component.filters || []), newFilter] })
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1A73E8', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >
              <Plus size={14} /> Add a filter
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function StyleTab({ component }) {
  const { dispatch } = useApp()

  const updateStyle = (key, value) => {
    dispatch({ type: 'UPDATE_COMPONENT', payload: { id: component.id, style: { ...component.style, [key]: value } } })
  }

  const updateComp = (key, value) => {
    dispatch({ type: 'UPDATE_COMPONENT', payload: { id: component.id, [key]: value } })
  }

  const s = component.style || {}

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {/* Title */}
      <SectionHeader label="Title" />
      <div style={{ padding: '4px 16px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="text"
          value={s.title || ''}
          onChange={e => updateStyle('title', e.target.value)}
          placeholder="Chart title"
          style={{ flex: 1, padding: '6px 8px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '12px' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#5F6368', cursor: 'pointer' }}>
          <input type="checkbox" checked={s.showTitle !== false} onChange={e => updateStyle('showTitle', e.target.checked)} />
          Show
        </label>
      </div>

      {/* Colors */}
      {component.type === 'chart' && (
        <>
          <Divider />
          <SectionHeader label="Colors" />
          <div style={{ padding: '4px 16px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(s.colors || ['#4285F4', '#EA4335', '#FBBC04', '#34A853']).map((color, i) => (
              <input
                key={i}
                type="color"
                value={color}
                onChange={e => {
                  const newColors = [...(s.colors || [])]
                  newColors[i] = e.target.value
                  updateStyle('colors', newColors)
                }}
                style={{ width: 28, height: 28, padding: 2, border: '1px solid #DADCE0', borderRadius: '4px', cursor: 'pointer' }}
              />
            ))}
          </div>

          <Divider />
          <SectionHeader label="Legend" />
          <div style={{ padding: '4px 16px 8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={s.showLegend !== false} onChange={e => updateStyle('showLegend', e.target.checked)} />
              Show legend
            </label>
            {s.showLegend !== false && (
              <select
                value={s.legendPosition || 'bottom'}
                onChange={e => updateStyle('legendPosition', e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '12px' }}
              >
                {['top', 'bottom', 'left', 'right', 'none'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            )}
          </div>
        </>
      )}

      {/* For text components */}
      {component.type === 'text' && (
        <>
          <Divider />
          <SectionHeader label="Font" />
          <div style={{ padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={component.textSize || 14}
                min={8} max={96}
                onChange={e => updateComp('textSize', Number(e.target.value))}
                style={{ width: '60px', padding: '6px 8px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '12px' }}
              />
              <input type="color" value={component.textColor || '#202124'} onChange={e => updateComp('textColor', e.target.value)}
                style={{ width: 36, height: 36, padding: 2, border: '1px solid #DADCE0', borderRadius: '4px', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!component.textBold} onChange={e => updateComp('textBold', e.target.checked)} />
                <strong>B</strong>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!component.textItalic} onChange={e => updateComp('textItalic', e.target.checked)} />
                <em>I</em>
              </label>
            </div>
            <select value={component.textAlign || 'left'} onChange={e => updateComp('textAlign', e.target.value)}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '12px' }}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      <Divider />
      <SectionHeader label="Background & Border" />
      <div style={{ padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5F6368' }}>
          Background
          <input type="color" value={s.backgroundColor || '#FFFFFF'} onChange={e => updateStyle('backgroundColor', e.target.value)}
            style={{ width: 28, height: 28, padding: 2, border: '1px solid #DADCE0', borderRadius: '4px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5F6368' }}>
          Border color
          <input type="color" value={s.borderColor || '#DADCE0'} onChange={e => updateStyle('borderColor', e.target.value)}
            style={{ width: 28, height: 28, padding: 2, border: '1px solid #DADCE0', borderRadius: '4px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5F6368' }}>
          Border width
          <input type="number" min={0} max={10} value={s.borderWidth || 0} onChange={e => updateStyle('borderWidth', Number(e.target.value))}
            style={{ width: '60px', padding: '4px 6px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '12px' }} />
        </div>
      </div>

      <Divider />
      <SectionHeader label="Opacity" />
      <div style={{ padding: '4px 16px 12px' }}>
        <input type="range" min={0} max={1} step={0.05} value={s.opacity ?? 1} onChange={e => updateStyle('opacity', Number(e.target.value))}
          style={{ width: '100%' }} />
        <div style={{ fontSize: '12px', color: '#5F6368', textAlign: 'center' }}>{Math.round((s.opacity ?? 1) * 100)}%</div>
      </div>
    </div>
  )
}

export default function PropertiesPanel() {
  const { state, dispatch } = useApp()
  const { editor } = state

  if (!editor.propertiesPanel.visible) return null

  const selectedId = editor.selectedComponentIds[0]
  const component = selectedId ? state.components[selectedId] : null
  const activeTab = editor.propertiesPanel.activeTab

  const setTab = (tab) => {
    dispatch({ type: 'SET_EDITOR', payload: { propertiesPanel: { ...editor.propertiesPanel, activeTab: tab } } })
  }

  return (
    <div style={{
      width: '300px',
      minWidth: '300px',
      background: 'white',
      borderLeft: '1px solid #DADCE0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {!component ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#5F6368', fontSize: '13px', padding: '24px', textAlign: 'center' }}>
          Select a component to see its properties
        </div>
      ) : (
        <>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #DADCE0', flexShrink: 0 }}>
            {['setup', 'style'].map(tab => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: activeTab === tab ? 500 : 400,
                  color: activeTab === tab ? '#1A73E8' : '#5F6368',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #1A73E8' : '2px solid transparent',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {activeTab === 'setup' ? (
              <SetupTab component={component} />
            ) : (
              <StyleTab component={component} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
