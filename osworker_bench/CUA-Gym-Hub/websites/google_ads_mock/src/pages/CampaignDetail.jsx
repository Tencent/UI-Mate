import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import MetricCard from '../components/MetricCard.jsx'
import SortableTable from '../components/SortableTable.jsx'
import StatusToggle from '../components/StatusToggle.jsx'
import CreateModal from '../components/CreateModal.jsx'

const fmt = {
  num: n => n == null ? '-' : n.toLocaleString(),
  usd: n => n == null ? '-' : '$' + n.toFixed(2),
  pct: n => n == null ? '-' : (n * 100).toFixed(2) + '%',
}

export default function CampaignDetail() {
  const { campaignId } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('adgroups')
  const [showCreate, setShowCreate] = useState(false)
  const [createMode, setCreateMode] = useState('adGroup')
  const [settingsEdit, setSettingsEdit] = useState(null)
  const [settingsSaved, setSettingsSaved] = useState(false)

  const campaign = state?.campaigns?.find(c => c.id === campaignId)
  const adGroups = useMemo(() => (state?.adGroups || []).filter(ag => ag.campaignId === campaignId && ag.status !== 'REMOVED'), [state, campaignId])
  const ads = useMemo(() => (state?.ads || []).filter(ad => ad.campaignId === campaignId && ad.status !== 'REMOVED'), [state, campaignId])
  const keywords = useMemo(() => (state?.keywords || []).filter(kw => kw.campaignId === campaignId && kw.status !== 'REMOVED' && !kw.isNegative), [state, campaignId])

  if (!campaign) {
    return <div style={{ padding: 24 }}>Campaign not found. <Link to="/campaigns" style={{ color: '#1A73E8' }}>Back to campaigns</Link></div>
  }

  const agColumns = [
    {
      key: 'status', label: '', sortable: false, nowrap: true,
      render: (v, row) => <StatusToggle entityType="ad group" status={v} onChange={s => dispatch({ type: 'UPDATE_AD_GROUP', payload: { id: row.id, status: s } })} />
    },
    {
      key: 'name', label: 'Ad group',
      render: (v, row) => <span style={{ color: '#1A73E8', fontWeight: 500, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); navigate(`/campaigns/${campaignId}/ad-groups/${row.id}`) }}>{v}</span>
    },
    { key: 'defaultBid', label: 'Default bid', align: 'right', render: v => `$${(v||0).toFixed(2)}` },
    { key: 'clicks', label: 'Clicks', align: 'right', render: (v, row) => fmt.num(row.metrics?.clicks) },
    { key: 'impressions', label: 'Impressions', align: 'right', render: (v, row) => fmt.num(row.metrics?.impressions) },
    { key: 'ctr', label: 'CTR', align: 'right', render: (v, row) => fmt.pct(row.metrics?.ctr) },
    { key: 'avgCpc', label: 'Avg. CPC', align: 'right', render: (v, row) => fmt.usd(row.metrics?.avgCpc) },
    { key: 'cost', label: 'Cost', align: 'right', render: (v, row) => fmt.usd(row.metrics?.cost) },
    { key: 'conversions', label: 'Conv.', align: 'right', render: (v, row) => fmt.num(row.metrics?.conversions) },
  ]

  const adsColumns = [
    {
      key: 'status', label: '', sortable: false, nowrap: true,
      render: (v, row) => <StatusToggle entityType="ad" status={v} onChange={s => dispatch({ type: 'UPDATE_AD', payload: { id: row.id, status: s } })} />
    },
    {
      key: 'headlines', label: 'Ad',
      render: (v, row) => (
        <div>
          <div style={{ color: '#1A73E8', fontSize: 13, fontWeight: 500 }}>{(v || []).slice(0, 3).join(' | ')}</div>
          <div style={{ color: '#5F6368', fontSize: 12 }}>{(row.descriptions || [])[0] || ''}</div>
          <div style={{ color: '#188038', fontSize: 12 }}>{row.displayUrl}</div>
        </div>
      )
    },
    { key: 'clicks', label: 'Clicks', align: 'right', render: (v, row) => fmt.num(row.metrics?.clicks) },
    { key: 'impressions', label: 'Impressions', align: 'right', render: (v, row) => fmt.num(row.metrics?.impressions) },
    { key: 'cost', label: 'Cost', align: 'right', render: (v, row) => fmt.usd(row.metrics?.cost) },
    { key: 'conversions', label: 'Conv.', align: 'right', render: (v, row) => fmt.num(row.metrics?.conversions) },
  ]

  const kwColumns = [
    {
      key: 'status', label: '', sortable: false, nowrap: true,
      render: (v, row) => <StatusToggle entityType="keyword" status={v} onChange={s => dispatch({ type: 'UPDATE_KEYWORD', payload: { id: row.id, status: s } })} />
    },
    {
      key: 'text', label: 'Keyword',
      render: (v, row) => (
        <span>
          {v}
          <span style={{ marginLeft: 6, fontSize: 11, background: '#F1F3F4', padding: '1px 6px', borderRadius: 10, color: '#5F6368' }}>{row.matchType}</span>
        </span>
      )
    },
    { key: 'bid', label: 'Max CPC', align: 'right', render: v => v != null ? `$${v.toFixed(2)}` : '-' },
    {
      key: 'qualityScore', label: 'Qual. Score', align: 'right',
      render: v => {
        if (v == null) return '-'
        const color = v >= 7 ? '#188038' : v >= 4 ? '#F9AB00' : '#D93025'
        return <span style={{ color, fontWeight: 600 }}>{v}</span>
      }
    },
    { key: 'clicks', label: 'Clicks', align: 'right', render: (v, row) => fmt.num(row.metrics?.clicks) },
    { key: 'impressions', label: 'Impressions', align: 'right', render: (v, row) => fmt.num(row.metrics?.impressions) },
    { key: 'cost', label: 'Cost', align: 'right', render: (v, row) => fmt.usd(row.metrics?.cost) },
  ]

  const settingsForm = campaign

  const tabStyle = (t) => ({
    padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: tab === t ? 500 : 400,
    color: tab === t ? '#1A73E8' : '#5F6368',
    borderBottom: `2px solid ${tab === t ? '#1A73E8' : 'transparent'}`,
    marginBottom: -1
  })

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: '#5F6368', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: '#1A73E8', cursor: 'pointer' }} onClick={() => navigate('/campaigns')}>All campaigns</span>
        <span>&gt;</span>
        <span style={{ color: '#202124' }}>{campaign.name}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>{campaign.name}</h1>
        <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 12, background: campaign.status === 'ENABLED' ? '#E6F4EA' : '#F1F3F4', color: campaign.status === 'ENABLED' ? '#188038' : '#5F6368', fontWeight: 500 }}>
          {campaign.status}
        </span>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <MetricCard label="Clicks" value={fmt.num(campaign.metrics?.clicks)} />
        <MetricCard label="Impressions" value={fmt.num(campaign.metrics?.impressions)} />
        <MetricCard label="CTR" value={fmt.pct(campaign.metrics?.ctr)} />
        <MetricCard label="Avg. CPC" value={fmt.usd(campaign.metrics?.avgCpc)} />
        <MetricCard label="Cost" value={fmt.usd(campaign.metrics?.cost)} />
        <MetricCard label="Conv." value={fmt.num(campaign.metrics?.conversions)} />
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #DADCE0', marginBottom: 16 }}>
        <button style={tabStyle('adgroups')} onClick={() => setTab('adgroups')}>Ad groups</button>
        <button style={tabStyle('ads')} onClick={() => setTab('ads')}>Ads & assets</button>
        <button style={tabStyle('keywords')} onClick={() => setTab('keywords')}>Keywords</button>
        <button style={tabStyle('settings')} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'adgroups' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{adGroups.length} ad group{adGroups.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setCreateMode('adGroup'); setShowCreate(true) }} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Ad group</button>
          </div>
          <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
            <SortableTable columns={agColumns} rows={adGroups} onRowClick={row => navigate(`/campaigns/${campaignId}/ad-groups/${row.id}`)} emptyMessage="No ad groups" />
          </div>
        </div>
      )}

      {tab === 'ads' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{ads.length} ad{ads.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setCreateMode('ad'); setShowCreate(true) }} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Ad</button>
          </div>
          <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
            <SortableTable columns={adsColumns} rows={ads} emptyMessage="No ads" />
          </div>
        </div>
      )}

      {tab === 'keywords' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{keywords.length} keyword{keywords.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setCreateMode('keyword'); setShowCreate(true) }} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Keyword</button>
          </div>
          <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
            <SortableTable columns={kwColumns} rows={keywords} emptyMessage="No keywords" />
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 24, maxWidth: 600 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Campaign settings</h2>
          {settingsSaved && (
            <div style={{ marginBottom: 16, padding: '8px 14px', background: '#E6F4EA', color: '#188038', borderRadius: 6, fontSize: 13 }}>
              Settings saved successfully.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Campaign name */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ minWidth: 160, fontSize: 13, color: '#5F6368' }}>Campaign name</span>
              <input
                type="text"
                style={{ fontSize: 13, border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 10px', flex: 1, outline: 'none', color: '#202124' }}
                value={settingsEdit !== null ? settingsEdit.name : campaign.name}
                onChange={e => setSettingsEdit(s => ({ ...(s || campaign), name: e.target.value }))}
                onFocus={() => { if (!settingsEdit) setSettingsEdit({ ...campaign }) }}
              />
            </div>
            {/* Status */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ minWidth: 160, fontSize: 13, color: '#5F6368' }}>Status</span>
              <select
                style={{ fontSize: 13, border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 10px', color: '#202124', background: '#fff', cursor: 'pointer' }}
                value={settingsEdit !== null ? settingsEdit.status : campaign.status}
                onChange={e => setSettingsEdit(s => ({ ...(s || campaign), status: e.target.value }))}
                onFocus={() => { if (!settingsEdit) setSettingsEdit({ ...campaign }) }}
              >
                <option value="ENABLED">ENABLED</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>
            {/* Type (read-only) */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ minWidth: 160, fontSize: 13, color: '#5F6368' }}>Type</span>
              <span style={{ fontSize: 13, color: '#202124' }}>{campaign.type}</span>
            </div>
            {/* Daily budget */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ minWidth: 160, fontSize: 13, color: '#5F6368' }}>Daily budget ($)</span>
              <input
                type="number"
                min="1"
                step="0.01"
                style={{ fontSize: 13, border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 10px', width: 120, outline: 'none', color: '#202124' }}
                value={settingsEdit !== null ? settingsEdit.budget : campaign.budget}
                onChange={e => setSettingsEdit(s => ({ ...(s || campaign), budget: parseFloat(e.target.value) || 0 }))}
                onFocus={() => { if (!settingsEdit) setSettingsEdit({ ...campaign }) }}
              />
            </div>
            {/* Bidding strategy */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ minWidth: 160, fontSize: 13, color: '#5F6368' }}>Bidding strategy</span>
              <select
                style={{ fontSize: 13, border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 10px', color: '#202124', background: '#fff', cursor: 'pointer' }}
                value={settingsEdit !== null ? settingsEdit.biddingStrategy : campaign.biddingStrategy}
                onChange={e => setSettingsEdit(s => ({ ...(s || campaign), biddingStrategy: e.target.value }))}
                onFocus={() => { if (!settingsEdit) setSettingsEdit({ ...campaign }) }}
              >
                {['MANUAL_CPC', 'MAXIMIZE_CLICKS', 'MAXIMIZE_CONVERSIONS', 'TARGET_CPA', 'TARGET_ROAS'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {/* Start date (read-only) */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ minWidth: 160, fontSize: 13, color: '#5F6368' }}>Start date</span>
              <span style={{ fontSize: 13, color: '#202124' }}>{campaign.startDate}</span>
            </div>
            {/* End date (read-only) */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ minWidth: 160, fontSize: 13, color: '#5F6368' }}>End date</span>
              <span style={{ fontSize: 13, color: '#202124' }}>{campaign.endDate || '—'}</span>
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                if (settingsEdit) {
                  dispatch({ type: 'UPDATE_CAMPAIGN', payload: settingsEdit })
                  setSettingsEdit(null)
                  setSettingsSaved(true)
                  setTimeout(() => setSettingsSaved(false), 3000)
                }
              }}
              style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Save
            </button>
            <button
              onClick={() => setSettingsEdit(null)}
              style={{ background: 'transparent', color: '#5F6368', border: '1px solid #DADCE0', borderRadius: 4, padding: '8px 20px', fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCreate && <CreateModal mode={createMode} campaignId={campaignId} onClose={() => setShowCreate(false)} />}
    </div>
  )
}
