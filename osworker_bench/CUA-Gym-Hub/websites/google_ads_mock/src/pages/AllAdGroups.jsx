import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'
import StatusToggle from '../components/StatusToggle.jsx'
import { useNavigate } from 'react-router-dom'
import CreateModal from '../components/CreateModal.jsx'

const fmt = {
  num: n => n == null ? '-' : n.toLocaleString(),
  usd: n => n == null ? '-' : '$' + n.toFixed(2),
  pct: n => n == null ? '-' : (n * 100).toFixed(2) + '%',
}

export default function AllAdGroups() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [campaignFilter, setCampaignFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)

  const adGroups = useMemo(() => {
    return (state?.adGroups || [])
      .filter(ag => ag.status !== 'REMOVED')
      .filter(ag => campaignFilter === 'ALL' || ag.campaignId === campaignFilter)
  }, [state, campaignFilter])

  const campaigns = state?.campaigns?.filter(c => c.status !== 'REMOVED') || []

  const getCampName = (id) => campaigns.find(c => c.id === id)?.name || id

  const columns = [
    { key: 'status', label: '', sortable: false, nowrap: true, render: (v, row) => <StatusToggle entityType="ad group" status={v} onChange={s => dispatch({ type: 'UPDATE_AD_GROUP', payload: { id: row.id, status: s } })} /> },
    { key: 'name', label: 'Ad group', render: (v, row) => <span style={{ color: '#1A73E8', fontWeight: 500 }}>{v}</span> },
    { key: 'campaignId', label: 'Campaign', render: v => getCampName(v) },
    { key: 'defaultBid', label: 'Default bid', align: 'right', render: v => v != null ? `$${v.toFixed(2)}` : '-' },
    { key: 'clicks', label: 'Clicks', align: 'right', render: (v, row) => fmt.num(row.metrics?.clicks) },
    { key: 'impressions', label: 'Impressions', align: 'right', render: (v, row) => fmt.num(row.metrics?.impressions) },
    { key: 'ctr', label: 'CTR', align: 'right', render: (v, row) => fmt.pct(row.metrics?.ctr) },
    { key: 'avgCpc', label: 'Avg. CPC', align: 'right', render: (v, row) => fmt.usd(row.metrics?.avgCpc) },
    { key: 'cost', label: 'Cost', align: 'right', render: (v, row) => fmt.usd(row.metrics?.cost) },
    { key: 'conversions', label: 'Conv.', align: 'right', render: (v, row) => fmt.num(row.metrics?.conversions) },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Ad groups</h1>
        <button onClick={() => setShowCreate(true)} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          + Ad group
        </button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
          style={{ border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 12px', fontSize: 13, outline: 'none', background: '#fff' }}>
          <option value="ALL">All campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
        <SortableTable
          columns={columns}
          rows={adGroups}
          onRowClick={row => navigate(`/campaigns/${row.campaignId}/ad-groups/${row.id}`)}
          emptyMessage="No ad groups"
        />
      </div>
      {showCreate && <CreateModal mode="adGroup" onClose={() => setShowCreate(false)} />}
    </div>
  )
}
