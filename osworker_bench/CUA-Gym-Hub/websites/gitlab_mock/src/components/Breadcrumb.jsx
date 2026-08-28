import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumb({ items }) {
  // items: [{ label, to? }]
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '14px', flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {i > 0 && <ChevronRight size={12} color="var(--gl-text-tertiary)" />}
          {item.to ? (
            <Link to={item.to} style={{ color: 'var(--gl-text-secondary)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gl-purple)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--gl-text-secondary)'}>
              {item.label}
            </Link>
          ) : (
            <span style={{ color: 'var(--gl-text-primary)', fontWeight: 500 }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
