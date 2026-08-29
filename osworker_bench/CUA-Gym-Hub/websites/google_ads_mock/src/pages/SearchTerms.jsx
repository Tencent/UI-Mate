import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'

const fmt = {
  num: n => n == null ? '-' : n.toLocaleString(),
  usd: n => n == null ? '-' : '$' + n.toFixed(2),
  pct: n => n == null ? '-' : (n * 100).toFixed(2) + '%',
}

export default function SearchTerms() {
  const { state } = useApp()
  const [campaignFilter, setCampaignFilter] = useState('ALL')

  const campaigns = state?.campaigns?.filter(c => c.status !== 'REMOVED') || []
  const allAdGroups = state?.adGroups || []
  const getCampName = id => campaigns.find(c => c.id === id)?.name || id
  const getAgName = id => allAdGroups.find(ag => ag.id === id)?.name || id

  const searchTerms = useMemo(() => {
    return (state?.searchTerms || [])
      .filter(st => campaignFilter === 'ALL' || st.campaignId === campaignFilter)
  }, [state, campaignFilter])

  const columns = [
    { key: 'searchTerm', label: 'Search term' },
    { key: 'campaignId', label: 'Campaign', render: v => getCampName(v) },
    { key: 'adGroupId', label: 'Ad group', render: v => getAgName(v) },
    { key: 'clicks', label: 'Clicks', align: 'right', render: v => fmt.num(v) },
    { key: 'impressions', label: 'Impressions', align: 'right', render: v => fmt.num(v) },
    { key: 'cost', label: 'Cost', align: 'right', render: v => fmt.usd(v) },
    { key: 'conversions', label: 'Conv.', align: 'right', render: v => fmt.num(v) },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Search terms</h1>
      <div style={{ marginBottom: 16 }}>
        <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
          style={{ border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 12px', fontSize: 13, background: '#fff', outline: 'none' }}>
          <option value="ALL">All campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
        <SortableTable columns={columns} rows={searchTerms} emptyMessage="No search terms" />
      </div>
    </div>
  )
}
