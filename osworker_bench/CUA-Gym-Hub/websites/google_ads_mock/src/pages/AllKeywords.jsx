import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'
import StatusToggle from '../components/StatusToggle.jsx'
import CreateModal from '../components/CreateModal.jsx'
import DateRangePicker from '../components/DateRangePicker.jsx'
import { X, MoreVertical, Info } from 'lucide-react'

const fmt = {
  num: n => n == null ? '-' : n.toLocaleString(),
  usd: n => n == null ? '-' : '$' + n.toFixed(2),
  pct: n => n == null ? '-' : (n * 100).toFixed(2) + '%',
}

const MATCH_TYPE_STYLE = {
  BROAD: { bg: '#E8F0FE', color: '#1A73E8', display: 'broad match' },
  PHRASE: { bg: '#FFF3E0', color: '#E65100', display: '"phrase match"' },
  EXACT: { bg: '#E8F5E9', color: '#1B5E20', display: '[exact match]' },
}

const QS_LABELS = {
  ABOVE_AVERAGE: { label: 'Above average', color: '#188038' },
  AVERAGE: { label: 'Average', color: '#F9AB00' },
  BELOW_AVERAGE: { label: 'Below average', color: '#D93025' },
}

function QualityScorePopover({ score, components, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  if (score == null) return null
  const color = score >= 7 ? '#188038' : score >= 4 ? '#F9AB00' : '#D93025'

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '100%', left: -40, marginTop: 4,
      background: '#fff', border: '1px solid #DADCE0', borderRadius: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 100, padding: 16,
      minWidth: 260,
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 18, background: color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color,
        }}>{score}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>Quality Score: {score}/10</div>
          <div style={{ fontSize: 12, color: '#5F6368' }}>
            {score >= 7 ? 'Good' : score >= 4 ? 'Needs improvement' : 'Poor'}
          </div>
        </div>
      </div>
      {components && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { key: 'expectedCtr', label: 'Expected CTR' },
            { key: 'adRelevance', label: 'Ad relevance' },
            { key: 'landingPageExp', label: 'Landing page experience' },
          ].map(({ key, label }) => {
            const val = components[key]
            const qs = QS_LABELS[val] || { label: val, color: '#5F6368' }
            return (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: '#5F6368' }}>{label}</span>
                <span style={{ fontWeight: 500, color: qs.color }}>{qs.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AllKeywords() {
  const { state, dispatch } = useApp()
  const [campaignFilter, setCampaignFilter] = useState('ALL')
  const [adGroupFilter, setAdGroupFilter] = useState('ALL')
  const [matchTypeFilter, setMatchTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showNegative, setShowNegative] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editingBid, setEditingBid] = useState(null)
  const [bidValue, setBidValue] = useState('')
  const [menuOpen, setMenuOpen] = useState(null)
  const [qsPopover, setQsPopover] = useState(null)

  const campaigns = state?.campaigns?.filter(c => c.status !== 'REMOVED') || []
  const getCampName = id => campaigns.find(c => c.id === id)?.name || id

  const allAdGroups = state?.adGroups?.filter(ag => ag.status !== 'REMOVED') || []
  const getAgName = id => allAdGroups.find(ag => ag.id === id)?.name || id

  const filteredAdGroups = useMemo(() =>
    campaignFilter === 'ALL' ? allAdGroups : allAdGroups.filter(ag => ag.campaignId === campaignFilter),
    [campaignFilter, allAdGroups]
  )

  const keywords = useMemo(() => {
    return (state?.keywords || [])
      .filter(kw => kw.status !== 'REMOVED')
      .filter(kw => kw.isNegative === showNegative)
      .filter(kw => campaignFilter === 'ALL' || kw.campaignId === campaignFilter)
      .filter(kw => adGroupFilter === 'ALL' || kw.adGroupId === adGroupFilter)
      .filter(kw => matchTypeFilter === 'ALL' || kw.matchType === matchTypeFilter)
      .filter(kw => statusFilter === 'ALL' || kw.status === statusFilter)
  }, [state, showNegative, campaignFilter, adGroupFilter, matchTypeFilter, statusFilter])

  const handleEditBid = (kw) => {
    setEditingBid(kw.id)
    setBidValue(kw.bid != null ? String(kw.bid) : '')
    setMenuOpen(null)
  }

  const saveBid = (id) => {
    const val = parseFloat(bidValue)
    dispatch({ type: 'UPDATE_KEYWORD', payload: { id, bid: isNaN(val) ? null : val } })
    setEditingBid(null)
  }

  const columns = [
    {
      key: 'status', label: '', sortable: false, nowrap: true,
      render: (v, row) => <StatusToggle entityType="keyword" status={v} onChange={s => dispatch({ type: 'UPDATE_KEYWORD', payload: { id: row.id, status: s } })} />
    },
    {
      key: 'text', label: 'Keyword',
      render: (v, row) => {
        const ms = MATCH_TYPE_STYLE[row.matchType] || {}
        return (
          <span>
            {showNegative && <span style={{ color: '#D93025', fontSize: 11, marginRight: 6, border: '1px solid #D93025', padding: '1px 5px', borderRadius: 10 }}>Neg</span>}
            <span style={{ fontWeight: 500 }}>
              {row.matchType === 'EXACT' ? `[${v}]` : row.matchType === 'PHRASE' ? `"${v}"` : v}
            </span>
            <span style={{ marginLeft: 8, fontSize: 11, background: ms.bg || '#F1F3F4', color: ms.color || '#5F6368', padding: '1px 8px', borderRadius: 10, fontWeight: 500 }}>{row.matchType}</span>
          </span>
        )
      }
    },
    { key: 'campaignId', label: 'Campaign', render: v => <span style={{ fontSize: 12 }}>{getCampName(v)}</span> },
    { key: 'adGroupId', label: 'Ad group', render: v => <span style={{ fontSize: 12 }}>{getAgName(v)}</span> },
    {
      key: 'bid', label: 'Max CPC', align: 'right', nowrap: true,
      render: (v, row) => {
        if (editingBid === row.id) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
              <span style={{ fontSize: 12 }}>$</span>
              <input autoFocus value={bidValue} onChange={e => setBidValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveBid(row.id); if (e.key === 'Escape') setEditingBid(null) }}
                style={{ width: 60, border: '1px solid #1A73E8', borderRadius: 2, padding: '2px 4px', fontSize: 12, outline: 'none' }} />
              <button onClick={() => saveBid(row.id)} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 2, padding: '2px 6px', cursor: 'pointer', fontSize: 11 }}>Save</button>
              <button onClick={() => setEditingBid(null)} style={{ background: '#fff', color: '#5F6368', border: '1px solid #DADCE0', borderRadius: 2, padding: '2px 6px', cursor: 'pointer', fontSize: 11 }}>
                <X size={10} />
              </button>
            </div>
          )
        }
        if (v == null) return <span style={{ color: '#9AA0A6' }}>---</span>
        return (
          <span
            style={{ cursor: 'pointer', borderBottom: '1px dashed #DADCE0' }}
            onClick={e => { e.stopPropagation(); handleEditBid(row) }}
            title="Click to edit bid"
          >
            ${v.toFixed(2)}
          </span>
        )
      }
    },
    {
      key: 'qualityScore', label: 'Qual. Score', align: 'right', nowrap: true,
      render: (v, row) => {
        if (v == null) return <span style={{ color: '#9AA0A6' }}>---</span>
        const color = v >= 7 ? '#188038' : v >= 4 ? '#F9AB00' : '#D93025'
        return (
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
            <span style={{ color, fontWeight: 600 }}>{v}/10</span>
            <button
              onClick={() => setQsPopover(qsPopover === row.id ? null : row.id)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9AA0A6', padding: 0, display: 'flex' }}
            >
              <Info size={12} />
            </button>
            {qsPopover === row.id && (
              <QualityScorePopover
                score={v}
                components={row.qualityScoreComponents}
                onClose={() => setQsPopover(null)}
              />
            )}
          </div>
        )
      }
    },
    { key: 'clicks', label: 'Clicks', align: 'right', render: (v, row) => fmt.num(row.metrics?.clicks) },
    { key: 'impressions', label: 'Impr.', align: 'right', render: (v, row) => fmt.num(row.metrics?.impressions) },
    { key: 'ctr', label: 'CTR', align: 'right', render: (v, row) => fmt.pct(row.metrics?.ctr) },
    { key: 'avgCpc', label: 'Avg. CPC', align: 'right', render: (v, row) => fmt.usd(row.metrics?.avgCpc) },
    { key: 'cost', label: 'Cost', align: 'right', render: (v, row) => fmt.usd(row.metrics?.cost) },
    {
      key: 'actions', label: '', sortable: false, nowrap: true,
      render: (v, row) => (
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button onClick={() => setMenuOpen(menuOpen === row.id ? null : row.id)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5F6368', padding: 4, borderRadius: 4 }}>
            <MoreVertical size={14} />
          </button>
          {menuOpen === row.id && (
            <div style={{ position: 'absolute', right: 0, top: 24, background: '#fff', border: '1px solid #DADCE0', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50, minWidth: 130 }}>
              <div onClick={() => handleEditBid(row)} style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F3F4'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Edit bid</div>
              <div onClick={() => { dispatch({ type: 'UPDATE_KEYWORD', payload: { id: row.id, status: row.status === 'ENABLED' ? 'PAUSED' : 'ENABLED' } }); setMenuOpen(null) }}
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F3F4'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                {row.status === 'ENABLED' ? 'Pause' : 'Enable'}
              </div>
              <div onClick={() => { dispatch({ type: 'DELETE_KEYWORD', payload: row.id }); setMenuOpen(null) }}
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#D93025' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F1F3F4'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Remove</div>
            </div>
          )}
        </div>
      )
    },
  ]

  return (
    <div onClick={() => { setMenuOpen(null); setQsPopover(null) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Keywords</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <DateRangePicker />
          <button onClick={() => setShowCreate(true)} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            + Keyword
          </button>
        </div>
      </div>

      {/* Toggle: regular vs negative */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, border: '1px solid #DADCE0', borderRadius: 4, overflow: 'hidden', width: 'fit-content' }}>
        <button onClick={() => setShowNegative(false)} style={{ padding: '6px 16px', border: 'none', background: !showNegative ? '#E8F0FE' : '#fff', color: !showNegative ? '#1A73E8' : '#5F6368', cursor: 'pointer', fontSize: 13, fontWeight: !showNegative ? 500 : 400 }}>Search keywords</button>
        <button onClick={() => setShowNegative(true)} style={{ padding: '6px 16px', border: 'none', background: showNegative ? '#E8F0FE' : '#fff', color: showNegative ? '#1A73E8' : '#5F6368', cursor: 'pointer', fontSize: 13, fontWeight: showNegative ? 500 : 400 }}>Negative keywords</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={campaignFilter} onChange={e => { setCampaignFilter(e.target.value); setAdGroupFilter('ALL') }}
          style={{ border: '1px solid #DADCE0', borderRadius: 16, padding: '4px 12px', fontSize: 12, background: campaignFilter !== 'ALL' ? '#E8F0FE' : '#fff', color: campaignFilter !== 'ALL' ? '#1A73E8' : '#5F6368', outline: 'none', fontWeight: campaignFilter !== 'ALL' ? 500 : 400 }}>
          <option value="ALL">All campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={adGroupFilter} onChange={e => setAdGroupFilter(e.target.value)}
          style={{ border: '1px solid #DADCE0', borderRadius: 16, padding: '4px 12px', fontSize: 12, background: adGroupFilter !== 'ALL' ? '#E8F0FE' : '#fff', color: adGroupFilter !== 'ALL' ? '#1A73E8' : '#5F6368', outline: 'none', fontWeight: adGroupFilter !== 'ALL' ? 500 : 400 }}>
          <option value="ALL">All ad groups</option>
          {filteredAdGroups.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
        </select>
        {['ALL', 'BROAD', 'PHRASE', 'EXACT'].map(m => (
          <button key={m} onClick={() => setMatchTypeFilter(m)} style={{
            padding: '4px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
            border: `1px solid ${matchTypeFilter === m ? '#1A73E8' : '#DADCE0'}`,
            background: matchTypeFilter === m ? '#E8F0FE' : '#fff',
            color: matchTypeFilter === m ? '#1A73E8' : '#5F6368',
            fontWeight: matchTypeFilter === m ? 500 : 400,
          }}>
            {m === 'ALL' ? 'All match' : m.charAt(0) + m.slice(1).toLowerCase()}
          </button>
        ))}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ border: '1px solid #DADCE0', borderRadius: 16, padding: '4px 12px', fontSize: 12, background: statusFilter !== 'ALL' ? '#E8F0FE' : '#fff', color: statusFilter !== 'ALL' ? '#1A73E8' : '#5F6368', outline: 'none', fontWeight: statusFilter !== 'ALL' ? 500 : 400 }}>
          <option value="ALL">All statuses</option>
          <option value="ENABLED">Enabled</option>
          <option value="PAUSED">Paused</option>
        </select>
        <span style={{ fontSize: 12, color: '#5F6368', marginLeft: 4 }}>{keywords.length} keyword{keywords.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
        <SortableTable columns={columns} rows={keywords} emptyMessage="No keywords found" />
      </div>

      {showCreate && <CreateModal mode="keyword" onClose={() => setShowCreate(false)} />}
    </div>
  )
}
