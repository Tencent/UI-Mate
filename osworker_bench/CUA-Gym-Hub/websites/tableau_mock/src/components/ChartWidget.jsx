import React, { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Treemap
} from 'recharts'

const PALETTE = ['#4E79A7','#F28E2B','#E15759','#76B7B2','#59A14F','#EDC948','#B07AA1','#FF9DA7','#9C755F','#BAB0AC']

function formatNum(n) {
  if (n == null) return ''
  if (Math.abs(n) >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (Math.abs(n) >= 1000) return `${(n/1000).toFixed(0)}K`
  return n.toLocaleString()
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="recharts-custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color || p.fill }} />
          <span className="tooltip-name">{p.name || p.dataKey}: </span>
          <span className="tooltip-value">{typeof p.value === 'number' ? formatNum(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

const TreemapContent = ({ x, y, width, height, name, size, color }) => {
  if (width < 30 || height < 20) return null
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color || '#4E79A7'} stroke="#fff" strokeWidth={2} rx={2} />
      {width > 50 && height > 30 && (
        <>
          <text x={x + 6} y={y + 16} fill="#fff" fontSize={11} fontWeight={600}>{name}</text>
          {height > 40 && <text x={x + 6} y={y + 30} fill="rgba(255,255,255,0.8)" fontSize={10}>{formatNum(size)}</text>}
        </>
      )}
    </g>
  )
}

export default function ChartWidget({ config, height = 320 }) {
  if (!config) return null

  switch (config.type) {
    case 'bar':
    case 'stackedBar':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={config.data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={config.xKey} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickFormatter={formatNum} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {config.bars.map((bar, i) => (
              <Bar key={bar.key} dataKey={bar.key} fill={bar.color || PALETTE[i]} stackId={bar.stackId || undefined} radius={bar.stackId ? 0 : [2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )

    case 'line':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={config.data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={config.xKey} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickFormatter={formatNum} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {config.lines.map((line, i) => (
              <Line key={line.key} type="monotone" dataKey={line.key} name={line.name || line.key} stroke={line.color || PALETTE[i]} strokeWidth={line.strokeWidth || 2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )

    case 'area':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={config.data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={config.xKey} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickFormatter={formatNum} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {config.areas.map((area, i) => (
              <Area key={area.key} type="monotone" dataKey={area.key} stroke={area.color || PALETTE[i]} fill={area.color || PALETTE[i]} fillOpacity={0.15} strokeWidth={2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={config.data} cx="50%" cy="50%" outerRadius={Math.min(height * 0.35, 120)} innerRadius={0} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true} style={{ fontSize: 10 }}>
              {config.data.map((entry, i) => (
                <Cell key={i} fill={entry.color || PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )

    case 'scatter':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="x" name={config.xLabel || 'X'} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickFormatter={formatNum} type="number" />
            <YAxis dataKey="y" name={config.yLabel || 'Y'} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickFormatter={formatNum} type="number" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]?.payload
              return (
                <div className="recharts-custom-tooltip">
                  {d.label && <div className="tooltip-label">{d.label}</div>}
                  <div className="tooltip-row"><span className="tooltip-name">{config.xLabel}: </span><span className="tooltip-value">{formatNum(d.x)}</span></div>
                  <div className="tooltip-row"><span className="tooltip-name">{config.yLabel}: </span><span className="tooltip-value">{formatNum(d.y)}</span></div>
                </div>
              )
            }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {config.datasets.map((ds, i) => (
              <Scatter key={ds.name} name={ds.name} data={ds.data} fill={ds.color || PALETTE[i]} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      )

    case 'treemap':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <Treemap data={config.data} dataKey="size" nameKey="name" content={<TreemapContent />} />
        </ResponsiveContainer>
      )

    default:
      return <div style={{ padding: 24, color: '#9CA3AF', textAlign: 'center' }}>Unsupported chart type: {config.type}</div>
  }
}
