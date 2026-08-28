import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'

const PATH_COLORS = ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#059669', '#0891B2', '#D97706', '#DC2626', '#6B7280']

function SankeyDiagram({ paths, width = 800, height = 450 }) {
  // Build node positions
  const steps = {}
  paths.forEach(p => {
    if (!steps[p.from]) steps[p.from] = { name: p.from, value: 0, step: 0 }
    if (!steps[p.to]) steps[p.to] = { name: p.to, value: 0, step: 0 }
    steps[p.from].value += p.value
  })

  // Assign steps based on order of appearance
  const ordered = []
  const visited = new Set()
  paths.forEach(p => {
    if (!visited.has(p.from)) { ordered.push(p.from); visited.add(p.from) }
    if (!visited.has(p.to)) { ordered.push(p.to); visited.add(p.to) }
  })

  // Group into columns
  const columns = [[], [], [], []]
  const startEvents = ['Start Session', 'Login', 'Page View']
  const endEvents = ['Purchase', 'Sign Up', 'End Session', 'Form Submit']

  ordered.forEach(name => {
    if (startEvents.includes(name) && columns[0].length < 3) columns[0].push(name)
    else if (endEvents.includes(name)) columns[3].push(name)
    else if (columns[1].length <= columns[2].length) columns[1].push(name)
    else columns[2].push(name)
  })

  // Remove empty columns
  const filteredCols = columns.filter(c => c.length > 0)

  const colWidth = width / (filteredCols.length + 1)
  const nodeWidth = 20
  const nodeGap = 16

  // Calculate node positions
  const nodePositions = {}
  filteredCols.forEach((col, ci) => {
    const x = colWidth * (ci + 0.5)
    const totalHeight = col.length * 40 + (col.length - 1) * nodeGap
    const startY = (height - totalHeight) / 2

    col.forEach((name, ni) => {
      const totalFlow = paths.reduce((s, p) => s + (p.from === name || p.to === name ? p.value : 0), 0)
      const barHeight = Math.max(20, Math.min(80, totalFlow / 3))
      nodePositions[name] = {
        x, y: startY + ni * (40 + nodeGap),
        width: nodeWidth, height: barHeight,
        name, totalFlow,
      }
    })
  })

  // Generate link paths
  const links = paths.map((p, i) => {
    const source = nodePositions[p.from]
    const target = nodePositions[p.to]
    if (!source || !target) return null

    const sx = source.x + source.width
    const sy = source.y + source.height / 2
    const tx = target.x
    const ty = target.y + target.height / 2
    const mx = (sx + tx) / 2
    const thickness = Math.max(2, Math.min(30, p.value / 10))

    return { sx, sy, tx, ty, mx, thickness, value: p.value, from: p.from, to: p.to, color: PATH_COLORS[i % PATH_COLORS.length] }
  }).filter(Boolean)

  const [hoveredLink, setHoveredLink] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* Links */}
      {links.map((link, i) => (
        <g key={i}
          onMouseEnter={() => setHoveredLink(i)}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <path
            d={`M ${link.sx} ${link.sy} C ${link.mx} ${link.sy}, ${link.mx} ${link.ty}, ${link.tx} ${link.ty}`}
            fill="none"
            stroke={hoveredLink === i ? link.color : `${link.color}40`}
            strokeWidth={link.thickness}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.2s, stroke-width 0.2s', cursor: 'pointer' }}
          />
          {hoveredLink === i && (
            <text
              x={link.mx}
              y={(link.sy + link.ty) / 2 - 8}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill={link.color}
            >
              {link.value} users
            </text>
          )}
        </g>
      ))}

      {/* Nodes */}
      {Object.values(nodePositions).map((node, i) => (
        <g key={node.name}
          onMouseEnter={() => setHoveredNode(node.name)}
          onMouseLeave={() => setHoveredNode(null)}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            rx={4}
            fill={hoveredNode === node.name ? '#7C3AED' : '#8B5CF6'}
            style={{ transition: 'fill 0.2s' }}
          />
          <text
            x={node.x + node.width + 8}
            y={node.y + node.height / 2 + 4}
            fontSize="12"
            fontWeight="500"
            fill={hoveredNode === node.name ? '#7C3AED' : '#374151'}
          >
            {node.name}
          </text>
          <text
            x={node.x + node.width + 8}
            y={node.y + node.height / 2 + 18}
            fontSize="10"
            fill="#9CA3AF"
          >
            {node.totalFlow} events
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function UserPaths() {
  const { state } = useApp()
  const [startEvent, setStartEvent] = useState('Start Session')
  const [direction, setDirection] = useState('forward')
  const [depth, setDepth] = useState(4)
  const [showEventPicker, setShowEventPicker] = useState(false)
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(800)

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth - 48)
    }
  }, [])

  // Generate path data based on selected start event
  const pathData = generatePaths(state.events, startEvent, direction, depth)

  return (
    <div style={{ padding: '24px', background: 'white', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>User Paths</h1>
      </div>
      <p className="page-subtitle">
        Explore the paths users take through your product, starting with or ending at a specific event.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Paths</span>
          <select
            className="input"
            style={{ width: 120, height: 34 }}
            value={direction}
            onChange={e => setDirection(e.target.value)}
          >
            <option value="forward">starting with</option>
            <option value="backward">ending with</option>
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            className="btn-outline"
            onClick={() => setShowEventPicker(!showEventPicker)}
            style={{ minWidth: 160 }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
            {startEvent}
            <ChevronDown size={14} />
          </button>
          {showEventPicker && (
            <>
              <div className="overlay" onClick={() => setShowEventPicker(false)} />
              <div className="dropdown" style={{ position: 'absolute', top: 38, left: 0, width: 260, zIndex: 200, maxHeight: 300, overflowY: 'auto' }}>
                {state.eventDefinitions.map(evt => (
                  <button
                    key={evt.id}
                    className="dropdown-item"
                    onClick={() => { setStartEvent(evt.name); setShowEventPicker(false) }}
                    style={{ fontWeight: startEvent === evt.name ? 600 : 400 }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: evt.color, display: 'inline-block', flexShrink: 0 }} />
                    {evt.name}
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>{evt.occurrencesLast30d}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Depth:</span>
          {[3, 4, 5, 6].map(d => (
            <button
              key={d}
              className={depth === d ? 'btn-primary' : 'btn-outline'}
              style={{ width: 36, height: 34, padding: 0, justifyContent: 'center' }}
              onClick={() => setDepth(d)}
            >
              {d}
            </button>
          ))}
        </div>

        <button className="btn-outline">
          Last 30 days <ChevronDown size={14} />
        </button>
      </div>

      {/* Sankey diagram */}
      <div ref={containerRef} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, background: 'var(--page-bg)', minHeight: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Step 1', 'Step 2', 'Step 3', 'Step 4'].slice(0, depth).map((s, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: containerWidth / depth }}>
                {s}
              </div>
            ))}
          </div>
        </div>
        <SankeyDiagram paths={pathData} width={containerWidth} height={420} />
      </div>

      {/* Path table */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Top Paths</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 16px', textAlign: 'left', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)' }}>#</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)' }}>Path</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)' }}>Users</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)' }}>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {pathData.slice(0, 8).map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-sep)' }}>
                <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>{i + 1}</td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{p.from}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>&rarr;</span>
                    <span style={{ fontWeight: 500 }}>{p.to}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600 }}>{p.value}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                  {Math.round(p.value / pathData.reduce((s, pp) => s + pp.value, 0) * 1000) / 10}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function generatePaths(events, startEvent, direction, depth) {
  // Build paths from actual event data
  const userSessions = {}
  events.forEach(e => {
    if (!userSessions[e.userId]) userSessions[e.userId] = []
    userSessions[e.userId].push(e)
  })

  const pathCounts = {}
  Object.values(userSessions).forEach(userEvents => {
    const sorted = userEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    for (let i = 0; i < sorted.length - 1; i++) {
      if (direction === 'forward' && sorted[i].name === startEvent) {
        for (let j = i; j < Math.min(i + depth, sorted.length - 1); j++) {
          const key = `${sorted[j].name}|||${sorted[j + 1].name}`
          pathCounts[key] = (pathCounts[key] || 0) + 1
        }
      } else if (direction === 'backward' && sorted[i + 1].name === startEvent) {
        const key = `${sorted[i].name}|||${sorted[i + 1].name}`
        pathCounts[key] = (pathCounts[key] || 0) + 1
      }
    }
  })

  const paths = Object.entries(pathCounts)
    .map(([key, value]) => {
      const [from, to] = key.split('|||')
      return { from, to, value }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 12)

  if (paths.length === 0) {
    // Fallback synthetic data
    return [
      { from: startEvent, to: 'Page View', value: 180 },
      { from: startEvent, to: 'Button Click', value: 95 },
      { from: 'Page View', to: 'Button Click', value: 120 },
      { from: 'Page View', to: 'Search', value: 65 },
      { from: 'Button Click', to: 'Add to Cart', value: 45 },
      { from: 'Button Click', to: 'Page View', value: 80 },
      { from: 'Search', to: 'Page View', value: 55 },
      { from: 'Add to Cart', to: 'Purchase', value: 22 },
    ]
  }

  return paths
}
