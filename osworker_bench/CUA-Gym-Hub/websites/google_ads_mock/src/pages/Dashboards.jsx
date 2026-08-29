import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

export default function Dashboards() {
  const { state } = useApp()
  const totalClicks = (state?.campaigns || []).reduce((s, c) => s + (c.metrics?.clicks || 0), 0)
  const totalCost = (state?.campaigns || []).reduce((s, c) => s + (c.metrics?.cost || 0), 0)
  const totalConversions = (state?.campaigns || []).reduce((s, c) => s + (c.metrics?.conversions || 0), 0)

  const widgets = [
    { title: 'Total clicks', value: totalClicks.toLocaleString(), color: '#1A73E8' },
    { title: 'Total cost', value: `$${totalCost.toFixed(2)}`, color: '#188038' },
    { title: 'Total conversions', value: totalConversions.toLocaleString(), color: '#F9AB00' },
    { title: 'Active campaigns', value: String((state?.campaigns || []).filter(c => c.status === 'ENABLED').length), color: '#8430CE' },
    { title: 'Active ad groups', value: String((state?.adGroups || []).filter(ag => ag.status === 'ENABLED').length), color: '#D93025' },
    { title: 'Total keywords', value: String((state?.keywords || []).filter(kw => !kw.isNegative && kw.status !== 'REMOVED').length), color: '#1A73E8' },
  ]

  const top3Campaigns = [...(state?.campaigns || [])]
    .filter(c => c.status !== 'REMOVED')
    .sort((a, b) => (b.metrics?.cost || 0) - (a.metrics?.cost || 0))
    .slice(0, 3)
    .map(c => ({
      name: c.name.length > 20 ? c.name.slice(0, 18) + '…' : c.name,
      spend: parseFloat((c.metrics?.cost || 0).toFixed(2)),
    }))

  const BAR_COLORS = ['#1A73E8', '#188038', '#F9AB00']

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Dashboards</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {widgets.map(w => (
          <div key={w.title} style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 8 }}>{w.title}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: w.color }}>{w.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#202124', marginBottom: 4 }}>Top Campaigns by Spend</div>
        <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 20 }}>Showing top 3 campaigns by total cost</div>
        {top3Campaigns.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top3Campaigns} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F4" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5F6368' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5F6368' }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(val) => [`$${val.toFixed(2)}`, 'Spend']}
                contentStyle={{ border: '1px solid #DADCE0', borderRadius: 6, fontSize: 12 }} />
              <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                {top3Campaigns.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', color: '#5F6368', padding: 40 }}>No campaign data available.</div>
        )}
      </div>
    </div>
  )
}
