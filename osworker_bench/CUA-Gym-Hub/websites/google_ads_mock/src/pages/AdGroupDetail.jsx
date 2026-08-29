import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export default function AdGroupDetail() {
  const { campaignId, adGroupId } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('keywords')
  const [showCreate, setShowCreate] = useState(false)
  const [createMode, setCreateMode] = useState('keyword')
  const [createNegative, setCreateNegative] = useState(false)
  const [agSettingsEdit, setAgSettingsEdit] = useState(null)
  const [agSettingsSaved, setAgSettingsSaved] = useState(false)

  const campaign = state?.campaigns?.find(c => c.id === campaignId)
  const adGroup = state?.adGroups?.find(ag => ag.id === adGroupId)
  const keywords = useMemo(() => (state?.keywords || []).filter(kw => kw.adGroupId === adGroupId && kw.status !== 'REMOVED' && !kw.isNegative), [state, adGroupId])
  const negKeywords = useMemo(() => (state?.keywords || []).filter(kw => kw.adGroupId === adGroupId && kw.isNegative), [state, adGroupId])
  const ads = useMemo(() => (state?.ads || []).filter(ad => ad.adGroupId === adGroupId && ad.status !== 'REMOVED'), [state, adGroupId])

  if (!adGroup) return <div style={{ padding: 24 }}>Ad group not found.</div>

  const kwColumns = [
    { key: 'status', label: '', sortable: false, nowrap: true, render: (v, row) => <StatusToggle entityType="keyword" status={v} onChange={s => dispatch({ type: 'UPDATE_KEYWORD', payload: { id: row.id, status: s } })} /> },
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
    { key: 'ctr', label: 'CTR', align: 'right', render: (v, row) => fmt.pct(row.metrics?.ctr) },
    { key: 'avgCpc', label: 'Avg. CPC', align: 'right', render: (v, row) => fmt.usd(row.metrics?.avgCpc) },
    { key: 'cost', label: 'Cost', align: 'right', render: (v, row) => fmt.usd(row.metrics?.cost) },
  ]

  const adColumns = [
    { key: 'status', label: '', sortable: false, nowrap: true, render: (v, row) => <StatusToggle entityType="ad" status={v} onChange={s => dispatch({ type: 'UPDATE_AD', payload: { id: row.id, status: s } })} /> },
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
        <span style={{ color: '#1A73E8', cursor: 'pointer' }} onClick={() => navigate(`/campaigns/${campaignId}`)}>{campaign?.name}</span>
        <span>&gt;</span>
        <span>{adGroup.name}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>{adGroup.name}</h1>
        <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 12, background: adGroup.status === 'ENABLED' ? '#E6F4EA' : '#F1F3F4', color: adGroup.status === 'ENABLED' ? '#188038' : '#5F6368', fontWeight: 500 }}>
          {adGroup.status}
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <MetricCard label="Clicks" value={fmt.num(adGroup.metrics?.clicks)} />
        <MetricCard label="Impressions" value={fmt.num(adGroup.metrics?.impressions)} />
        <MetricCard label="CTR" value={fmt.pct(adGroup.metrics?.ctr)} />
        <MetricCard label="Avg. CPC" value={fmt.usd(adGroup.metrics?.avgCpc)} />
        <MetricCard label="Cost" value={fmt.usd(adGroup.metrics?.cost)} />
        <MetricCard label="Conv." value={fmt.num(adGroup.metrics?.conversions)} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #DADCE0', marginBottom: 16 }}>
        <button style={tabStyle('keywords')} onClick={() => setTab('keywords')}>Keywords</button>
        <button style={tabStyle('ads')} onClick={() => setTab('ads')}>Ads</button>
        <button style={tabStyle('negkeywords')} onClick={() => setTab('negkeywords')}>Negative keywords</button>
        <button style={tabStyle('settings')} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'keywords' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{keywords.length} keyword{keywords.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setCreateMode('keyword'); setShowCreate(true) }} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Keyword</button>
          </div>
          <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
            <SortableTable columns={kwColumns} rows={keywords} emptyMessage="No keywords" />
          </div>
        </div>
      )}

      {tab === 'ads' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{ads.length} ad{ads.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setCreateMode('ad'); setShowCreate(true) }} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Ad</button>
          </div>
          <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
            <SortableTable columns={adColumns} rows={ads} emptyMessage="No ads" />
          </div>
        </div>
      )}

      {tab === 'negkeywords' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{negKeywords.length} negative keyword{negKeywords.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => { setCreateMode('keyword'); setCreateNegative(true); setShowCreate(true) }}
              style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}
            >
              + Negative keyword
            </button>
          </div>
          <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
            <SortableTable
              columns={[
                { key: 'text', label: 'Keyword', render: (v, row) => <span><span style={{ color: '#D93025', fontSize: 11, marginRight: 6, border: '1px solid #D93025', padding: '1px 6px', borderRadius: 10 }}>Negative</span>{v}</span> },
                { key: 'matchType', label: 'Match type' },
              ]}
              rows={negKeywords}
              emptyMessage="No negative keywords"
            />
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 24, maxWidth: 500 }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Ad group settings</h3>
          {agSettingsSaved && (
            <div style={{ marginBottom: 16, padding: '8px 14px', background: '#E6F4EA', color: '#188038', borderRadius: 6, fontSize: 13 }}>
              Settings saved successfully.
            </div>
          )}
          {/* Name */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
            <span style={{ minWidth: 140, fontSize: 13, color: '#5F6368' }}>Name</span>
            <input
              style={{ fontSize: 13, border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 10px', flex: 1, outline: 'none', color: '#202124' }}
              value={agSettingsEdit !== null ? agSettingsEdit.name : adGroup.name}
              onChange={e => setAgSettingsEdit(s => ({ ...(s || adGroup), name: e.target.value }))}
              onFocus={() => { if (!agSettingsEdit) setAgSettingsEdit({ ...adGroup }) }}
            />
          </div>
          {/* Status */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
            <span style={{ minWidth: 140, fontSize: 13, color: '#5F6368' }}>Status</span>
            <select
              style={{ fontSize: 13, border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 10px', color: '#202124', background: '#fff', cursor: 'pointer' }}
              value={agSettingsEdit !== null ? agSettingsEdit.status : adGroup.status}
              onChange={e => setAgSettingsEdit(s => ({ ...(s || adGroup), status: e.target.value }))}
              onFocus={() => { if (!agSettingsEdit) setAgSettingsEdit({ ...adGroup }) }}
            >
              <option value="ENABLED">ENABLED</option>
              <option value="PAUSED">PAUSED</option>
            </select>
          </div>
          {/* Default CPC bid */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
            <span style={{ minWidth: 140, fontSize: 13, color: '#5F6368' }}>Default CPC bid ($)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              style={{ fontSize: 13, border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 10px', width: 100, outline: 'none', color: '#202124' }}
              value={agSettingsEdit !== null ? agSettingsEdit.defaultBid : (adGroup.defaultBid || 0)}
              onChange={e => setAgSettingsEdit(s => ({ ...(s || adGroup), defaultBid: parseFloat(e.target.value) || 0 }))}
              onFocus={() => { if (!agSettingsEdit) setAgSettingsEdit({ ...adGroup }) }}
            />
          </div>
          {/* Campaign (read-only) */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <span style={{ minWidth: 140, fontSize: 13, color: '#5F6368' }}>Campaign</span>
            <span style={{ fontSize: 13 }}>{campaign?.name}</span>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                if (agSettingsEdit) {
                  dispatch({ type: 'UPDATE_AD_GROUP', payload: agSettingsEdit })
                  setAgSettingsEdit(null)
                  setAgSettingsSaved(true)
                  setTimeout(() => setAgSettingsSaved(false), 3000)
                }
              }}
              style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Save
            </button>
            <button
              onClick={() => setAgSettingsEdit(null)}
              style={{ background: 'transparent', color: '#5F6368', border: '1px solid #DADCE0', borderRadius: 4, padding: '8px 20px', fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCreate && <CreateModal mode={createMode} campaignId={campaignId} adGroupId={adGroupId} isNegative={createNegative} onClose={() => { setShowCreate(false); setCreateNegative(false) }} />}
    </div>
  )
}
