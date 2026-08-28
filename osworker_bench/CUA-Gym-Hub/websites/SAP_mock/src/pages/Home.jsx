import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const ICON_MAP = {
  'shopping-cart': 'cart',
  'clipboard': 'list',
  'purchase-order': 'doc',
  'add': 'plus',
  'check': 'ok',
  'list': 'list',
  'info': 'info',
  'grid': 'grid',
  'person': 'bp',
  'truck': 'ship',
  'document': 'doc',
  'chart': 'kpi',
  'customer': 'bp',
  'warning': 'warn',
  'cube': 'mat',
  'dollar': 'cur',
  'bar-chart': 'kpi',
  'add-document': 'new',
  'error': 'err'
}

function TileIcon({ icon }) {
  if (!icon) return null
  return (
    <span className="launchpad-tile-icon" aria-hidden="true">
      {ICON_MAP[icon] || 'doc'}
    </span>
  )
}

function Tile({ tile }) {
  const navigate = useNavigate()

  function handleClick() {
    if (tile.appRoute) navigate(tile.appRoute)
  }

  const baseStyle = {
    background: '#fff',
    border: '1px solid var(--xap-border)',
    borderRadius: '4px',
    padding: '14px 16px',
    cursor: 'pointer',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.15s',
    position: 'relative'
  }

  if (tile.type === 'static') {
    return (
      <div
        style={baseStyle}
        onClick={handleClick}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 1px var(--xap-blue), 0 0.125rem 0.5rem rgba(34,53,72,0.12)'; e.currentTarget.style.borderColor = 'var(--xap-blue)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--xap-border)' }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--xap-text-primary)', lineHeight: '1.3', marginBottom: '4px' }}>
            {tile.title}
          </div>
          {tile.subtitle && <div style={{ fontSize: '12px', color: 'var(--xap-text-secondary)' }}>{tile.subtitle}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <TileIcon icon={tile.icon} />
          <span style={{ color: 'var(--xap-blue)', fontSize: '18px', lineHeight: 1 }}>›</span>
        </div>
      </div>
    )
  }

  if (tile.type === 'numeric') {
    return (
      <div
        style={baseStyle}
        onClick={handleClick}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 1px var(--xap-blue), 0 0.125rem 0.5rem rgba(34,53,72,0.12)'; e.currentTarget.style.borderColor = 'var(--xap-blue)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--xap-border)' }}
      >
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--xap-text-primary)' }}>{tile.title}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <span style={{ fontSize: '36px', fontWeight: 300, color: 'var(--xap-blue)', lineHeight: 1 }}>
            {tile.numericValue}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--xap-text-secondary)', paddingBottom: '4px' }}>
            {tile.numericUnit}
          </span>
        </div>
      </div>
    )
  }

  if (tile.type === 'kpi') {
    const statusColor = tile.kpiData?.status === 'warning' ? 'var(--xap-status-warning)'
      : tile.kpiData?.status === 'success' ? 'var(--xap-status-success)'
      : tile.kpiData?.status === 'error' ? 'var(--xap-status-error)'
      : 'var(--xap-blue)'
    const trendIcon = tile.kpiData?.trend === 'up' ? '↑' : tile.kpiData?.trend === 'down' ? '↓' : '→'

    return (
      <div
        style={baseStyle}
        onClick={handleClick}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 1px var(--xap-blue), 0 0.125rem 0.5rem rgba(34,53,72,0.12)'; e.currentTarget.style.borderColor = 'var(--xap-blue)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--xap-border)' }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--xap-text-primary)' }}>{tile.title}</div>
          {tile.subtitle && <div style={{ fontSize: '11px', color: 'var(--xap-text-secondary)' }}>{tile.subtitle}</div>}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '30px', fontWeight: 300, color: statusColor, lineHeight: 1 }}>
              {tile.numericValue}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--xap-text-secondary)', paddingBottom: '3px' }}>
              {tile.numericUnit}
            </span>
            <span style={{ fontSize: '18px', color: statusColor, paddingBottom: '3px' }}>{trendIcon}</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function Home() {
  const { state } = useApp()
  const { tileGroups, tiles, activeTab } = state

  const visibleGroups = tileGroups
    .filter(g => g.tabKey === activeTab)
    .sort((a, b) => a.order - b.order)

  if (visibleGroups.length === 0) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--xap-text-secondary)' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏠</div>
        <div style={{ fontSize: '16px', marginBottom: '8px' }}>No apps in this area yet</div>
        <div style={{ fontSize: '13px' }}>Select a different tab to explore available apps.</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 24px' }}>
      {visibleGroups.map(group => {
        const groupTiles = tiles
          .filter(t => t.groupId === group.id && t.isActive)
          .sort((a, b) => a.order - b.order)

        return (
          <div key={group.id} style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--xap-text-secondary)',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {group.title}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(176px, 200px))',
              gap: '12px'
            }}>
              {groupTiles.map(tile => (
                <Tile key={tile.id} tile={tile} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
