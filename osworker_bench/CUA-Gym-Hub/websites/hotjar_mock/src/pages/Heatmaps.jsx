import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Plus, Download, Monitor, Tablet, Smartphone, X, ChevronDown, ChevronRight, Target } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { withCurrentSearch } from '../utils/navigation.js'

function HeatmapCanvas({ heatmap, mapType, selectedDevice }) {
  if (!heatmap) return null

  const data = mapType === 'move' ? heatmap.moveData :
               mapType === 'scroll' ? null :
               heatmap.clickData

  return (
    <div style={{ position: 'relative', flex: 1, background: '#F3F4F6', overflow: 'hidden', minHeight: 400 }}>
      {/* Mock website page */}
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'auto' }}>
        {/* Fake website content */}
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
          <div style={{ height: 48, background: '#E5E7EB', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
            <div style={{ width: 80, height: 20, background: '#D1D5DB', borderRadius: 4 }} />
            <div style={{ flex: 1 }} />
            {[1,2,3,4].map(i => <div key={i} style={{ width: 50, height: 16, background: '#D1D5DB', borderRadius: 4 }} />)}
          </div>
          <div style={{ height: 220, background: '#E5E7EB', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 200, height: 20, background: '#D1D5DB', borderRadius: 4, marginBottom: 12, margin: '0 auto 12px' }} />
              <div style={{ width: 140, height: 12, background: '#D1D5DB', borderRadius: 4, marginBottom: 8, margin: '0 auto 8px' }} />
              <div style={{ display: 'inline-block', padding: '8px 24px', background: '#FF3C00', borderRadius: 4, width: 120, height: 32 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 160, background: '#E5E7EB', borderRadius: 8 }} />
            ))}
          </div>
          <div style={{ height: 120, background: '#E5E7EB', borderRadius: 8, marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 140, background: '#E5E7EB', borderRadius: 8 }} />
            ))}
          </div>
        </div>

        {/* Heatmap overlay */}
        {mapType !== 'scroll' && data && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              {data.map((pt, i) => (
                <radialGradient key={i} id={`heat-${heatmap.id}-${i}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FF0000" stopOpacity={Math.min(0.8, pt.percentage / 10)} />
                  <stop offset="40%" stopColor="#FF8800" stopOpacity={Math.min(0.5, pt.percentage / 15)} />
                  <stop offset="70%" stopColor="#FFFF00" stopOpacity={Math.min(0.3, pt.percentage / 20)} />
                  <stop offset="100%" stopColor="#0000FF" stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>
            {data.map((pt, i) => {
              const radius = Math.max(30, Math.min(80, pt.percentage * 5))
              return (
                <ellipse
                  key={i}
                  cx={`${pt.x}%`}
                  cy={`${pt.y}%`}
                  rx={radius}
                  ry={radius}
                  fill={`url(#heat-${heatmap.id}-${i})`}
                />
              )
            })}
            {/* Top click badges */}
            {data.slice(0, 5).map((pt, i) => (
              <g key={`badge-${i}`} style={{ cursor: 'pointer' }}>
                <circle cx={`${pt.x}%`} cy={`${pt.y}%`} r="12" fill="#2D3038" opacity="0.85" />
                <text x={`${pt.x}%`} y={`${pt.y}%`} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="bold">{i + 1}</text>
              </g>
            ))}
          </svg>
        )}

        {/* Scroll map */}
        {mapType === 'scroll' && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {heatmap.scrollData?.reachPercentages?.map((pct, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: `${(i / 8) * 100}%`,
                  left: 0,
                  right: 0,
                  height: '12.5%',
                  background: `rgba(0, ${Math.round(pct * 2.55)}, ${Math.round((100 - pct) * 2.55)}, 0.3)`,
                }}
              />
            ))}
            {/* Average fold line */}
            <div style={{ position: 'absolute', top: `${heatmap.scrollData?.averageFold || 60}%`, left: 0, right: 0, borderTop: '2px dashed #FF3C00', display: 'flex', alignItems: 'center' }}>
              <div style={{ background: '#FF3C00', color: 'white', fontSize: 11, padding: '2px 6px', borderRadius: 3 }}>Average fold: {heatmap.scrollData?.averageFold}%</div>
            </div>
          </div>
        )}

        {/* Left scroll depth indicator */}
        <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 40, pointerEvents: 'none' }}>
          {heatmap.scrollData?.reachPercentages?.map((pct, i) => (
            <div key={i} style={{ position: 'absolute', top: `${(i / 8) * 100}%`, fontSize: 10, color: '#6B7280' }}>{pct}%</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeatmapRightPanel({ heatmap, mapType, onMapTypeChange, onClose }) {
  const [expandedSections, setExpandedSections] = useState(['map-types', 'stats'])

  function toggleSection(section) {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    )
  }

  const mapTypes = [
    { id: 'click', label: 'All clicks' },
    { id: 'move', label: 'Move' },
    { id: 'scroll', label: 'Scroll' },
    { id: 'engagement', label: 'Engagement zones' },
    { id: 'rage', label: 'Rage clicks' },
  ]

  return (
    <div style={{ width: 280, borderLeft: '1px solid #E5E7EB', overflow: 'auto', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>About this heatmap</div>
        <button className="header-icon-btn" onClick={onClose}><X size={16} /></button>
      </div>

      {/* Map types section */}
      <div style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
          onClick={() => toggleSection('map-types')}
        >
          Map types
          {expandedSections.includes('map-types') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        {expandedSections.includes('map-types') && (
          <div style={{ padding: '0 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {mapTypes.map(mt => (
              <div
                key={mt.id}
                onClick={() => onMapTypeChange(mt.id)}
                style={{
                  padding: '8px 10px',
                  border: `2px solid ${mapType === mt.id ? '#FF3C00' : '#E5E7EB'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  color: mapType === mt.id ? '#FF3C00' : '#6B7280',
                  background: mapType === mt.id ? '#FFF7F5' : '#FFFFFF',
                  textAlign: 'center',
                  transition: 'border-color 0.15s, color 0.15s'
                }}
              >
                {mt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats section */}
      <div>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
          onClick={() => toggleSection('stats')}
        >
          Stats
          {expandedSections.includes('stats') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        {expandedSections.includes('stats') && (
          <div style={{ padding: '0 16px 12px' }}>
            {[
              { label: 'Total clicks', value: heatmap?.clickData?.reduce((a, b) => a + b.clicks, 0) || 0 },
              { label: 'Rage clicks', value: heatmap?.pageStats?.rageClicks || 0 },
              { label: 'Avg. time on page', value: heatmap?.pageStats?.avgTimeOnPage || '0:00' },
              { label: 'Avg. scroll depth', value: `${heatmap?.scrollData?.averageFold || 0}%` },
              { label: 'Drop-off rate', value: `${heatmap?.pageStats?.dropOffRate || 0}%` },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{stat.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2D3038' }}>{stat.value?.toLocaleString?.() ?? stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Heatmaps() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [mapType, setMapType] = useState('click')
  const [selectedDevice, setSelectedDevice] = useState('all')
  const [newHeatmapUrl, setNewHeatmapUrl] = useState('')
  const [showNewHeatmapInput, setShowNewHeatmapInput] = useState(false)
  const [notice, setNotice] = useState('')

  const siteHeatmaps = state.heatmaps.filter(h => h.siteId === state.activeSiteId)
  const selectedHeatmap = id ? siteHeatmaps.find(h => h.id === id) : siteHeatmaps[0]

  function handleCreateHeatmap() {
    if (!newHeatmapUrl.trim()) {
      setNotice('Enter a page URL before saving the heatmap.')
      return
    }
    const newId = `heatmap-${Date.now()}`
    dispatch({
      type: 'CREATE_HEATMAP',
      payload: {
        id: newId,
        siteId: state.activeSiteId,
        name: newHeatmapUrl,
        pageUrl: newHeatmapUrl,
        status: 'recording',
        createdAt: new Date().toISOString(),
        sessionsCount: 0,
        deviceBreakdown: { desktop: 0, tablet: 0, mobile: 0 },
        screenshotUrl: null,
        clickData: [],
        scrollData: { averageFold: 50, reachPercentages: [100, 80, 60, 45, 30, 20, 10, 5] },
        moveData: [],
        pageStats: { uTurns: 0, rageClicks: 0, dropOffRate: 0, avgTimeOnPage: '0:00', totalErrors: 0 }
      }
    })
    setNewHeatmapUrl('')
    setShowNewHeatmapInput(false)
    navigate(withCurrentSearch(`/heatmaps/${newId}`, location.search))
    setNotice('Heatmap created and recording started.')
  }

  function handleDownloadHeatmap() {
    if (!selectedHeatmap) return
    const rows = [
      ['name', 'page_url', 'sessions', 'device', 'map_type', 'total_clicks', 'rage_clicks', 'average_fold', 'drop_off_rate'],
      [
        selectedHeatmap.name,
        selectedHeatmap.pageUrl,
        selectedHeatmap.sessionsCount || 0,
        selectedDevice,
        mapType,
        selectedHeatmap.clickData?.reduce((sum, pt) => sum + (pt.clicks || 0), 0) || 0,
        selectedHeatmap.pageStats?.rageClicks || 0,
        selectedHeatmap.scrollData?.averageFold || 0,
        selectedHeatmap.pageStats?.dropOffRate || 0
      ]
    ]
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedHeatmap.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${mapType}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setNotice('Heatmap CSV downloaded.')
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sub-sidebar */}
      <div style={{ width: 220, minWidth: 220, borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflow: 'auto', flexShrink: 0, background: '#FAFBFC' }}>
        <div style={{ padding: 12 }}>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, color: '#FF3C00', borderColor: '#FF3C00' }} onClick={() => setShowNewHeatmapInput(!showNewHeatmapInput)}>
            <Plus size={14} />
            New heatmap
          </button>
          {showNewHeatmapInput && (
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                placeholder="Enter page URL"
                value={newHeatmapUrl}
                onChange={e => setNewHeatmapUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateHeatmap()}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #D1D5DB', borderRadius: 4, fontSize: 12, fontFamily: 'inherit', marginBottom: 6, outline: 'none' }}
              />
              <button className="btn-blue" style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '5px 8px' }} onClick={handleCreateHeatmap}>
                Save
              </button>
            </div>
          )}
        </div>
        <div style={{ padding: '4px 12px 4px', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SAVED HEATMAPS</div>
        {siteHeatmaps.length === 0 ? (
          <div style={{ padding: '8px 12px', fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>
            When you save heatmaps, they'll appear here
          </div>
        ) : (
          siteHeatmaps.map(h => (
            <div
              key={h.id}
              className={`sub-sidebar-item ${selectedHeatmap?.id === h.id ? 'active' : ''}`}
              onClick={() => navigate(withCurrentSearch(`/heatmaps/${h.id}`, location.search))}
              style={{ fontSize: 13 }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{h.name}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{h.sessionsCount?.toLocaleString()} sessions</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main heatmap viewer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedHeatmap ? (
          <>
            {/* Toolbar */}
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF' }}>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{selectedHeatmap.name}</div>
              <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => navigate(withCurrentSearch('/recordings', location.search))}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                View recordings
              </button>
              <button className="btn-secondary" style={{ fontSize: 13 }} onClick={handleDownloadHeatmap}>
                <Download size={14} />
                Download
              </button>
              {!showRightPanel && (
                <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setShowRightPanel(true)}>
                  <Target size={14} />
                  About
                </button>
              )}
            </div>
            {notice && (
              <div style={{ padding: '6px 16px', borderBottom: '1px solid #E5E7EB', background: '#F0FDF4', color: '#047857', fontSize: 13 }}>
                {notice}
              </div>
            )}

            {/* Heatmap content area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <HeatmapCanvas heatmap={selectedHeatmap} mapType={mapType} selectedDevice={selectedDevice} />
              {showRightPanel && (
                <HeatmapRightPanel
                  heatmap={selectedHeatmap}
                  mapType={mapType}
                  onMapTypeChange={setMapType}
                  onClose={() => setShowRightPanel(false)}
                />
              )}
            </div>

            {/* Bottom device bar */}
            <div style={{ padding: '8px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 16, background: '#FFFFFF' }}>
              {[
                { key: 'all', label: 'All', count: selectedHeatmap.sessionsCount },
                { key: 'desktop', label: 'Desktop', count: selectedHeatmap.deviceBreakdown?.desktop, Icon: Monitor },
                { key: 'tablet', label: 'Tablet', count: selectedHeatmap.deviceBreakdown?.tablet, Icon: Tablet },
                { key: 'mobile', label: 'Mobile', count: selectedHeatmap.deviceBreakdown?.mobile, Icon: Smartphone },
              ].map(({ key, label, count, Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedDevice(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 8px', borderRadius: 4,
                    border: selectedDevice === key ? '1px solid #FF3C00' : '1px solid transparent',
                    background: selectedDevice === key ? '#FFF7F5' : 'transparent',
                    color: selectedDevice === key ? '#FF3C00' : '#6B7280',
                    cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                    fontWeight: selectedDevice === key ? 600 : 400
                  }}
                >
                  {Icon && <Icon size={14} />}
                  {label}: {count?.toLocaleString()}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Select an area to highlight, then save it to add comments, labels, and collections</div>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ flex: 1 }}>
            <Target size={48} color="#D1D5DB" />
            <div className="empty-state-title" style={{ marginTop: 16 }}>No heatmap selected</div>
            <p>Create a new heatmap to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
