import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MetricCard({ label, value, delta, deltaLabel, positive }) {
  const isPositive = positive !== undefined ? positive : (delta >= 0)

  return (
    <div style={{
      background: '#fff', border: '1px solid #DADCE0', borderRadius: 8,
      padding: 16, minWidth: 140, flex: 1
    }}>
      <div style={{ fontSize: 11, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#202124', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
        {value}
      </div>
      {deltaLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12 }}>
          {isPositive
            ? <TrendingUp size={12} color="#188038" />
            : <TrendingDown size={12} color="#D93025" />
          }
          <span style={{ color: isPositive ? '#188038' : '#D93025' }}>{deltaLabel}</span>
        </div>
      )}
    </div>
  )
}
