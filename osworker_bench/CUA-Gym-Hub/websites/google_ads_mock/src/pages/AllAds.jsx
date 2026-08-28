import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'
import StatusToggle from '../components/StatusToggle.jsx'
import CreateModal from '../components/CreateModal.jsx'
import DateRangePicker from '../components/DateRangePicker.jsx'

const fmt = {
  num: n => n == null ? '-' : n.toLocaleString(),
  usd: n => n == null ? '-' : '$' + n.toFixed(2),
  pct: n => n == null ? '-' : (n * 100).toFixed(2) + '%',
}

export default function AllAds() {
  const { state, dispatch } = useApp()
  const [campaignFilter, setCampaignFilter] = useState('ALL')
  const [adGroupFilter, setAdGroupFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedAd, setSelectedAd] = useState(null)
  const [editForm, setEditForm] = useState(null)

  const campaigns = state?.campaigns?.filter(c => c.status !== 'REMOVED') || []
  const allAdGroups = state?.adGroups?.filter(ag => ag.status !== 'REMOVED') || []
  const getCampName = id => campaigns.find(c => c.id === id)?.name || id
  const getAgName = id => allAdGroups.find(ag => ag.id === id)?.name || id

  const filteredAdGroups = useMemo(() =>
    campaignFilter === 'ALL' ? allAdGroups : allAdGroups.filter(ag => ag.campaignId === campaignFilter),
    [campaignFilter, allAdGroups]
  )

  const ads = useMemo(() => {
    return (state?.ads || [])
      .filter(ad => ad.status !== 'REMOVED')
      .filter(ad => campaignFilter === 'ALL' || ad.campaignId === campaignFilter)
      .filter(ad => adGroupFilter === 'ALL' || ad.adGroupId === adGroupFilter)
  }, [state, campaignFilter, adGroupFilter])

  const handleSelectAd = (ad) => {
    setSelectedAd(ad)
    setEditForm({ ...ad, headlines: [...ad.headlines], descriptions: [...ad.descriptions] })
  }

  const handleSave = () => {
    dispatch({ type: 'UPDATE_AD', payload: { ...editForm } })
    setSelectedAd(null)
    setEditForm(null)
  }

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Ads & assets</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <DateRangePicker />
            <button onClick={() => setShowCreate(true)} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              + Ad
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <select value={campaignFilter} onChange={e => { setCampaignFilter(e.target.value); setAdGroupFilter('ALL') }}
            style={{ border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 12px', fontSize: 13, background: '#fff', outline: 'none' }}>
            <option value="ALL">All campaigns</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={adGroupFilter} onChange={e => setAdGroupFilter(e.target.value)}
            style={{ border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 12px', fontSize: 13, background: '#fff', outline: 'none' }}>
            <option value="ALL">All ad groups</option>
            {filteredAdGroups.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
          </select>
        </div>

        {/* Ad cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {ads.map(ad => (
            <div key={ad.id} onClick={() => handleSelectAd(ad)}
              style={{
                background: '#fff', border: `2px solid ${selectedAd?.id === ad.id ? '#1A73E8' : '#DADCE0'}`,
                borderRadius: 8, padding: 16, cursor: 'pointer',
                boxShadow: selectedAd?.id === ad.id ? '0 2px 8px rgba(26,115,232,0.2)' : 'none'
              }}
              onMouseEnter={e => { if (selectedAd?.id !== ad.id) e.currentTarget.style.borderColor = '#9AA0A6' }}
              onMouseLeave={e => { if (selectedAd?.id !== ad.id) e.currentTarget.style.borderColor = '#DADCE0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, background: ad.status === 'ENABLED' ? '#E6F4EA' : '#F1F3F4', color: ad.status === 'ENABLED' ? '#188038' : '#5F6368', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
                  {ad.status}
                </span>
                <span style={{ fontSize: 11, color: '#5F6368' }}>{ad.type?.replace(/_/g, ' ')}</span>
              </div>
              {/* Google Ad Preview Format */}
              <div style={{ fontSize: 11, color: '#202124', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ background: '#202124', color: '#fff', fontSize: 9, padding: '1px 4px', borderRadius: 2, fontWeight: 700, letterSpacing: 0.5 }}>Ad</span>
                <span style={{ color: '#188038', fontSize: 12 }}>{ad.displayUrl}</span>
              </div>
              <div style={{ color: '#1A0DAB', fontWeight: 500, fontSize: 16, marginBottom: 2, lineHeight: 1.3 }}>
                {(ad.headlines || []).slice(0, 3).join(' | ')}
              </div>
              <div style={{ color: '#4D5156', fontSize: 13, lineHeight: 1.4, marginBottom: 8 }}>{(ad.descriptions || [])[0]}</div>
              <div style={{ borderTop: '1px solid #F1F3F4', paddingTop: 8, display: 'flex', gap: 12, fontSize: 12, color: '#5F6368', flexWrap: 'wrap' }}>
                <span>{getCampName(ad.campaignId)}</span>
                <span style={{ color: '#DADCE0' }}>|</span>
                <span>{getAgName(ad.adGroupId)}</span>
              </div>
              <div style={{ borderTop: '1px solid #F1F3F4', paddingTop: 8, marginTop: 8, display: 'flex', gap: 16, fontSize: 11, color: '#5F6368' }}>
                <span><strong style={{ color: '#202124' }}>{fmt.num(ad.metrics?.clicks)}</strong> clicks</span>
                <span><strong style={{ color: '#202124' }}>{fmt.num(ad.metrics?.impressions)}</strong> impr.</span>
                <span><strong style={{ color: '#202124' }}>{fmt.usd(ad.metrics?.cost)}</strong> cost</span>
              </div>
            </div>
          ))}
          {ads.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#5F6368', gridColumn: '1/-1', background: '#fff', border: '1px solid #DADCE0', borderRadius: 8 }}>
              No ads found
            </div>
          )}
        </div>
      </div>

      {/* Ad preview / edit panel */}
      {selectedAd && editForm && (
        <div style={{ width: 380, background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 20, alignSelf: 'flex-start', position: 'sticky', top: 0, maxHeight: '80vh', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 500, fontSize: 14 }}>Edit ad</span>
            <button onClick={() => { setSelectedAd(null); setEditForm(null) }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5F6368', fontSize: 18 }}>×</button>
          </div>

          {/* Preview */}
          <div style={{ background: '#F8F9FA', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#5F6368', marginBottom: 6 }}>Ad Preview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ background: '#202124', color: '#fff', fontSize: 9, padding: '1px 4px', borderRadius: 2, fontWeight: 700 }}>Ad</span>
              <span style={{ color: '#188038', fontSize: 12 }}>{editForm.displayUrl || editForm.finalUrl}</span>
            </div>
            <div style={{ color: '#1A0DAB', fontSize: 16, fontWeight: 500, marginBottom: 2, lineHeight: 1.3 }}>
              {(editForm.headlines || []).filter(h => h).slice(0, 3).join(' | ') || 'Headlines will appear here'}
            </div>
            <div style={{ fontSize: 13, color: '#4D5156', lineHeight: 1.4 }}>{(editForm.descriptions || []).filter(d => d)[0] || 'Description will appear here'}</div>
          </div>

          {/* Edit fields */}
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Headlines</div>
          {(editForm.headlines || []).map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <input value={h} maxLength={30} onChange={e => { const hs = [...editForm.headlines]; hs[i] = e.target.value; setEditForm(f => ({ ...f, headlines: hs })) }}
                style={{ flex: 1, border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 8px', fontSize: 13, outline: 'none' }} />
              <span style={{ fontSize: 11, color: '#5F6368', minWidth: 28 }}>{h.length}/30</span>
            </div>
          ))}
          {(editForm.headlines || []).length < 15 && (
            <button onClick={() => setEditForm(f => ({ ...f, headlines: [...f.headlines, ''] }))} style={{ border: '1px dashed #DADCE0', background: '#fff', color: '#1A73E8', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginBottom: 12 }}>+ Add headline</button>
          )}

          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Descriptions</div>
          {(editForm.descriptions || []).map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <textarea value={d} maxLength={90} onChange={e => { const ds = [...editForm.descriptions]; ds[i] = e.target.value; setEditForm(f => ({ ...f, descriptions: ds })) }}
                style={{ flex: 1, border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 8px', fontSize: 13, outline: 'none', height: 56, resize: 'vertical' }} />
            </div>
          ))}

          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Final URL</div>
          <input value={editForm.finalUrl || ''} onChange={e => setEditForm(f => ({ ...f, finalUrl: e.target.value }))}
            style={{ width: '100%', border: '1px solid #DADCE0', borderRadius: 4, padding: '6px 8px', fontSize: 13, outline: 'none', marginBottom: 12 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StatusToggle entityType="ad" status={editForm.status} onChange={s => setEditForm(f => ({ ...f, status: s }))} />
            <button onClick={handleSave} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontWeight: 500 }}>Save</button>
          </div>
        </div>
      )}

      {showCreate && <CreateModal mode="ad" onClose={() => setShowCreate(false)} />}
    </div>
  )
}
