import React, { useState } from 'react'
import { X, Search, Monitor, Video, ShoppingBag, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useNavigate } from 'react-router-dom'

const CAMPAIGN_TYPES = [
  { type: 'SEARCH', icon: Search, label: 'Search', desc: 'Reach customers searching on Google' },
  { type: 'DISPLAY', icon: Monitor, label: 'Display', desc: 'Reach customers across websites and apps' },
  { type: 'VIDEO', icon: Video, label: 'Video', desc: 'Reach customers on YouTube' },
  { type: 'SHOPPING', icon: ShoppingBag, label: 'Shopping', desc: 'Promote your products on Google' },
  { type: 'PERFORMANCE_MAX', icon: Zap, label: 'Performance Max', desc: 'Access all Google ad inventory' },
]

const BIDDING_OPTIONS = ['MANUAL_CPC', 'MAXIMIZE_CLICKS', 'MAXIMIZE_CONVERSIONS', 'TARGET_CPA', 'TARGET_ROAS']

const inputStyle = {
  width: '100%', border: '1px solid #DADCE0', borderRadius: 4, padding: '8px 12px',
  fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#202124'
}

const labelStyle = { fontSize: 13, fontWeight: 500, color: '#202124', marginBottom: 4, display: 'block' }

export default function CreateModal({ onClose, mode = 'campaign', campaignId, adGroupId, isNegative = false }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  // Routing modes: campaign, adGroup, keyword, ad
  const [activeMode, setActiveMode] = useState(mode)
  const [step, setStep] = useState(1)

  // Campaign wizard state
  const [campType, setCampType] = useState('')
  const [campForm, setCampForm] = useState({
    name: '', budget: '', biddingStrategy: 'MANUAL_CPC', startDate: '2025-01-01', endDate: '',
    locations: ['United States'], languages: ['English']
  })
  const [agForm, setAgForm] = useState({ name: '', defaultBid: '' })
  const [kwText, setKwText] = useState('')
  const [kwMatchType, setKwMatchType] = useState('BROAD')
  const [adForm, setAdForm] = useState({
    headlines: ['', '', ''],
    descriptions: ['', ''],
    finalUrl: '', displayUrl: ''
  })

  // Simple forms
  const [simpleAdGroup, setSimpleAdGroup] = useState({ name: '', defaultBid: '', campaignId: campaignId || '' })
  const [simpleKeyword, setSimpleKeyword] = useState({ text: '', matchType: 'BROAD', bid: '', campaignId: campaignId || '', adGroupId: adGroupId || '' })
  const [simpleAd, setSimpleAd] = useState({
    headlines: ['', '', ''], descriptions: ['', ''],
    finalUrl: '', displayUrl: '', campaignId: campaignId || '', adGroupId: adGroupId || ''
  })

  const handleCampSubmit = () => {
    const keywords = kwText.split('\n').filter(t => t.trim()).map(t => ({
      text: t.trim(), matchType: kwMatchType, bid: null
    }))
    const newCamp = {
      name: campForm.name || 'New Campaign',
      type: campType || 'SEARCH',
      status: 'ENABLED',
      budget: parseFloat(campForm.budget) || 50,
      biddingStrategy: campForm.biddingStrategy,
      startDate: campForm.startDate,
      endDate: campForm.endDate || null,
      locations: campForm.locations,
      languages: campForm.languages,
    }
    const action = {
      type: 'CREATE_CAMPAIGN',
      payload: newCamp,
      adGroup: agForm.name ? { name: agForm.name, defaultBid: parseFloat(agForm.defaultBid) || 2 } : null,
      ad: (adForm.finalUrl && adForm.headlines.some(h => h)) ? {
        headlines: adForm.headlines.filter(h => h),
        descriptions: adForm.descriptions.filter(d => d),
        finalUrl: adForm.finalUrl,
        displayUrl: adForm.displayUrl || adForm.finalUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
      } : null,
      keywords: keywords.length > 0 ? keywords : null
    }
    dispatch(action)
    onClose()
  }

  const handleAdGroupSubmit = () => {
    if (!simpleAdGroup.name || !simpleAdGroup.campaignId) return
    dispatch({
      type: 'CREATE_AD_GROUP',
      payload: {
        name: simpleAdGroup.name,
        campaignId: simpleAdGroup.campaignId,
        defaultBid: parseFloat(simpleAdGroup.defaultBid) || 2,
      }
    })
    onClose()
  }

  const handleKeywordSubmit = () => {
    const lines = simpleKeyword.text.split('\n').filter(t => t.trim())
    if (!lines.length || !simpleKeyword.campaignId || !simpleKeyword.adGroupId) return
    dispatch({
      type: 'CREATE_KEYWORD',
      payload: lines.map(t => ({
        text: t.trim(), matchType: simpleKeyword.matchType,
        bid: isNegative ? null : (parseFloat(simpleKeyword.bid) || null),
        campaignId: simpleKeyword.campaignId,
        adGroupId: simpleKeyword.adGroupId,
        isNegative: isNegative,
      }))
    })
    onClose()
  }

  const handleAdSubmit = () => {
    if (!simpleAd.campaignId || !simpleAd.adGroupId || !simpleAd.finalUrl) return
    dispatch({
      type: 'CREATE_AD',
      payload: {
        headlines: simpleAd.headlines.filter(h => h),
        descriptions: simpleAd.descriptions.filter(d => d),
        finalUrl: simpleAd.finalUrl,
        displayUrl: simpleAd.displayUrl || simpleAd.finalUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
        campaignId: simpleAd.campaignId,
        adGroupId: simpleAd.adGroupId,
      }
    })
    onClose()
  }

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }
  const modal = { background: '#fff', borderRadius: 8, width: '90%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }
  const header = { padding: '16px 24px', borderBottom: '1px solid #DADCE0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }

  const renderModeSelect = () => (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>What would you like to create?</h3>
      {[
        { key: 'campaign', label: 'Campaign', desc: 'Set up a new advertising campaign' },
        { key: 'adGroup', label: 'Ad group', desc: 'Add an ad group to an existing campaign' },
        { key: 'keyword', label: 'Keyword', desc: 'Add keywords to an ad group' },
        { key: 'ad', label: 'Ad', desc: 'Create a new responsive search ad' },
      ].map(item => (
        <div key={item.key} onClick={() => { setActiveMode(item.key); setStep(1) }}
          style={{ padding: 16, border: '1px solid #DADCE0', borderRadius: 8, marginBottom: 8, cursor: 'pointer', display: 'flex', gap: 12 }}
          onMouseEnter={e => e.currentTarget.style.background = '#F8F9FA'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: '#5F6368' }}>{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderCampaignStep1 = () => (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Choose campaign type</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CAMPAIGN_TYPES.map(ct => (
          <div key={ct.type} onClick={() => setCampType(ct.type)}
            style={{
              padding: 16, border: `2px solid ${campType === ct.type ? '#1A73E8' : '#DADCE0'}`,
              borderRadius: 8, cursor: 'pointer', background: campType === ct.type ? '#E8F0FE' : '#fff',
              display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center'
            }}
          >
            <ct.icon size={28} color={campType === ct.type ? '#1A73E8' : '#5F6368'} />
            <div style={{ fontWeight: 500, fontSize: 14, color: campType === ct.type ? '#1A73E8' : '#202124' }}>{ct.label}</div>
            <div style={{ fontSize: 12, color: '#5F6368' }}>{ct.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button onClick={() => { setActiveMode(null); setStep(0) }} style={{ border: '1px solid #DADCE0', background: '#fff', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Back</button>
        <button onClick={() => setStep(2)} disabled={!campType} style={{ background: campType ? '#1A73E8' : '#DADCE0', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: campType ? 'pointer' : 'not-allowed', fontWeight: 500 }}>Next</button>
      </div>
    </div>
  )

  const renderCampaignStep2 = () => (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Campaign settings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Campaign name *</label>
          <input style={inputStyle} value={campForm.name} onChange={e => setCampForm(f => ({ ...f, name: e.target.value }))} placeholder="My Campaign" />
        </div>
        <div>
          <label style={labelStyle}>Daily budget ($)</label>
          <input style={inputStyle} type="number" value={campForm.budget} onChange={e => setCampForm(f => ({ ...f, budget: e.target.value }))} placeholder="50" />
        </div>
        <div>
          <label style={labelStyle}>Bidding strategy</label>
          <select style={inputStyle} value={campForm.biddingStrategy} onChange={e => setCampForm(f => ({ ...f, biddingStrategy: e.target.value }))}>
            {BIDDING_OPTIONS.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start date</label>
            <input style={inputStyle} type="date" value={campForm.startDate} onChange={e => setCampForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End date (optional)</label>
            <input style={inputStyle} type="date" value={campForm.endDate} onChange={e => setCampForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button onClick={() => setStep(1)} style={{ border: '1px solid #DADCE0', background: '#fff', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Back</button>
        <button onClick={() => setStep(3)} style={{ background: '#1A73E8', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>Next</button>
      </div>
    </div>
  )

  const renderCampaignStep3 = () => (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Create ad group</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Ad group name</label>
          <input style={inputStyle} value={agForm.name} onChange={e => setAgForm(f => ({ ...f, name: e.target.value }))} placeholder="My Ad Group" />
        </div>
        <div>
          <label style={labelStyle}>Default CPC bid ($)</label>
          <input style={inputStyle} type="number" step="0.01" value={agForm.defaultBid} onChange={e => setAgForm(f => ({ ...f, defaultBid: e.target.value }))} placeholder="2.00" />
        </div>
        <div>
          <label style={labelStyle}>Keywords (one per line)</label>
          <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }} value={kwText} onChange={e => setKwText(e.target.value)} placeholder="running shoes&#10;buy running shoes online" />
        </div>
        <div>
          <label style={labelStyle}>Match type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['BROAD', 'PHRASE', 'EXACT'].map(mt => (
              <button key={mt} onClick={() => setKwMatchType(mt)} style={{ padding: '6px 14px', border: `1px solid ${kwMatchType === mt ? '#1A73E8' : '#DADCE0'}`, borderRadius: 4, background: kwMatchType === mt ? '#E8F0FE' : '#fff', color: kwMatchType === mt ? '#1A73E8' : '#202124', cursor: 'pointer', fontWeight: kwMatchType === mt ? 500 : 400 }}>
                {mt}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button onClick={() => setStep(2)} style={{ border: '1px solid #DADCE0', background: '#fff', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Back</button>
        <button onClick={() => setStep(4)} style={{ background: '#1A73E8', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>Next</button>
      </div>
    </div>
  )

  const renderCampaignStep4 = () => (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Create ad</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={labelStyle}>Headlines (up to 15, max 30 chars each)</label>
        {adForm.headlines.map((h, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input style={{ ...inputStyle, flex: 1 }} maxLength={30} value={h}
              onChange={e => setAdForm(f => { const hs = [...f.headlines]; hs[i] = e.target.value; return { ...f, headlines: hs } })}
              placeholder={`Headline ${i + 1}`} />
            <span style={{ fontSize: 11, color: '#5F6368', minWidth: 30 }}>{h.length}/30</span>
          </div>
        ))}
        <button onClick={() => setAdForm(f => ({ ...f, headlines: [...f.headlines, ''] }))} style={{ border: '1px dashed #DADCE0', background: '#fff', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', color: '#1A73E8', fontSize: 13, width: 'fit-content' }}>
          + Add headline
        </button>

        <label style={{ ...labelStyle, marginTop: 8 }}>Descriptions (up to 4, max 90 chars each)</label>
        {adForm.descriptions.map((d, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <textarea style={{ ...inputStyle, flex: 1, height: 60, resize: 'vertical' }} maxLength={90} value={d}
              onChange={e => setAdForm(f => { const ds = [...f.descriptions]; ds[i] = e.target.value; return { ...f, descriptions: ds } })}
              placeholder={`Description ${i + 1}`} />
            <span style={{ fontSize: 11, color: '#5F6368', minWidth: 30, alignSelf: 'flex-start', paddingTop: 8 }}>{d.length}/90</span>
          </div>
        ))}
        {adForm.descriptions.length < 4 && (
          <button onClick={() => setAdForm(f => ({ ...f, descriptions: [...f.descriptions, ''] }))} style={{ border: '1px dashed #DADCE0', background: '#fff', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', color: '#1A73E8', fontSize: 13, width: 'fit-content' }}>
            + Add description
          </button>
        )}

        <div>
          <label style={{ ...labelStyle, marginTop: 8 }}>Final URL</label>
          <input style={inputStyle} value={adForm.finalUrl} onChange={e => setAdForm(f => ({ ...f, finalUrl: e.target.value }))} placeholder="https://www.example.com" />
        </div>
        <div>
          <label style={labelStyle}>Display URL</label>
          <input style={inputStyle} value={adForm.displayUrl} onChange={e => setAdForm(f => ({ ...f, displayUrl: e.target.value }))} placeholder="www.example.com/shoes" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button onClick={() => setStep(3)} style={{ border: '1px solid #DADCE0', background: '#fff', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Back</button>
        <button onClick={() => setStep(5)} style={{ background: '#1A73E8', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>Next</button>
      </div>
    </div>
  )

  const renderCampaignStep5 = () => (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Review & Launch</h3>
      <div style={{ background: '#F8F9FA', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, marginBottom: 8 }}><strong>Campaign:</strong> {campForm.name || '(unnamed)'} — {campType}</div>
        <div style={{ fontSize: 13, marginBottom: 8 }}><strong>Budget:</strong> ${campForm.budget || 50}/day</div>
        <div style={{ fontSize: 13, marginBottom: 8 }}><strong>Bidding:</strong> {campForm.biddingStrategy}</div>
        {agForm.name && <div style={{ fontSize: 13, marginBottom: 8 }}><strong>Ad Group:</strong> {agForm.name}</div>}
        {adForm.finalUrl && <div style={{ fontSize: 13 }}><strong>Ad URL:</strong> {adForm.finalUrl}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={() => setStep(4)} style={{ border: '1px solid #DADCE0', background: '#fff', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Back</button>
        <button onClick={handleCampSubmit} style={{ background: '#1A73E8', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>
          Create campaign
        </button>
      </div>
    </div>
  )

  const renderAdGroupForm = () => (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Create Ad Group</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Campaign *</label>
          <select style={inputStyle} value={simpleAdGroup.campaignId} onChange={e => setSimpleAdGroup(f => ({ ...f, campaignId: e.target.value }))}>
            <option value="">Select campaign</option>
            {state?.campaigns?.filter(c => c.status !== 'REMOVED').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Ad group name *</label>
          <input style={inputStyle} value={simpleAdGroup.name} onChange={e => setSimpleAdGroup(f => ({ ...f, name: e.target.value }))} placeholder="My Ad Group" />
        </div>
        <div>
          <label style={labelStyle}>Default CPC bid ($)</label>
          <input style={inputStyle} type="number" step="0.01" value={simpleAdGroup.defaultBid} onChange={e => setSimpleAdGroup(f => ({ ...f, defaultBid: e.target.value }))} placeholder="2.00" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button onClick={() => setActiveMode(null)} style={{ border: '1px solid #DADCE0', background: '#fff', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Back</button>
        <button onClick={handleAdGroupSubmit} disabled={!simpleAdGroup.name || !simpleAdGroup.campaignId}
          style={{ background: simpleAdGroup.name && simpleAdGroup.campaignId ? '#1A73E8' : '#DADCE0', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>
          Create ad group
        </button>
      </div>
    </div>
  )

  const renderKeywordForm = () => (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Add Keywords</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Campaign *</label>
          <select style={inputStyle} value={simpleKeyword.campaignId} onChange={e => setSimpleKeyword(f => ({ ...f, campaignId: e.target.value, adGroupId: '' }))}>
            <option value="">Select campaign</option>
            {state?.campaigns?.filter(c => c.status !== 'REMOVED').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Ad group *</label>
          <select style={inputStyle} value={simpleKeyword.adGroupId} onChange={e => setSimpleKeyword(f => ({ ...f, adGroupId: e.target.value }))}>
            <option value="">Select ad group</option>
            {state?.adGroups?.filter(ag => ag.campaignId === simpleKeyword.campaignId && ag.status !== 'REMOVED').map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Keywords (one per line) *</label>
          <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }} value={simpleKeyword.text} onChange={e => setSimpleKeyword(f => ({ ...f, text: e.target.value }))} placeholder="running shoes&#10;buy running shoes online" />
        </div>
        <div>
          <label style={labelStyle}>Match type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['BROAD', 'PHRASE', 'EXACT'].map(mt => (
              <button key={mt} onClick={() => setSimpleKeyword(f => ({ ...f, matchType: mt }))} style={{ padding: '6px 14px', border: `1px solid ${simpleKeyword.matchType === mt ? '#1A73E8' : '#DADCE0'}`, borderRadius: 4, background: simpleKeyword.matchType === mt ? '#E8F0FE' : '#fff', color: simpleKeyword.matchType === mt ? '#1A73E8' : '#202124', cursor: 'pointer' }}>
                {mt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Max CPC bid (optional, $)</label>
          <input style={inputStyle} type="number" step="0.01" value={simpleKeyword.bid} onChange={e => setSimpleKeyword(f => ({ ...f, bid: e.target.value }))} placeholder="2.00" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button onClick={() => setActiveMode(null)} style={{ border: '1px solid #DADCE0', background: '#fff', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Back</button>
        <button onClick={handleKeywordSubmit} style={{ background: '#1A73E8', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>
          Add keywords
        </button>
      </div>
    </div>
  )

  const renderAdForm = () => (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Create Ad</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={labelStyle}>Campaign *</label>
          <select style={inputStyle} value={simpleAd.campaignId} onChange={e => setSimpleAd(f => ({ ...f, campaignId: e.target.value, adGroupId: '' }))}>
            <option value="">Select campaign</option>
            {state?.campaigns?.filter(c => c.status !== 'REMOVED').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Ad group *</label>
          <select style={inputStyle} value={simpleAd.adGroupId} onChange={e => setSimpleAd(f => ({ ...f, adGroupId: e.target.value }))}>
            <option value="">Select ad group</option>
            {state?.adGroups?.filter(ag => ag.campaignId === simpleAd.campaignId && ag.status !== 'REMOVED').map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
          </select>
        </div>
        <label style={labelStyle}>Headlines</label>
        {simpleAd.headlines.map((h, i) => (
          <input key={i} style={inputStyle} maxLength={30} value={h}
            onChange={e => setSimpleAd(f => { const hs = [...f.headlines]; hs[i] = e.target.value; return { ...f, headlines: hs } })}
            placeholder={`Headline ${i + 1} (max 30 chars)`} />
        ))}
        {simpleAd.headlines.length < 15 && (
          <button onClick={() => setSimpleAd(f => ({ ...f, headlines: [...f.headlines, ''] }))} style={{ border: '1px dashed #DADCE0', background: '#fff', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', color: '#1A73E8', fontSize: 13, width: 'fit-content' }}>+ Add headline</button>
        )}
        <label style={{ ...labelStyle, marginTop: 8 }}>Descriptions</label>
        {simpleAd.descriptions.map((d, i) => (
          <textarea key={i} style={{ ...inputStyle, height: 60, resize: 'vertical' }} maxLength={90} value={d}
            onChange={e => setSimpleAd(f => { const ds = [...f.descriptions]; ds[i] = e.target.value; return { ...f, descriptions: ds } })}
            placeholder={`Description ${i + 1} (max 90 chars)`} />
        ))}
        {simpleAd.descriptions.length < 4 && (
          <button onClick={() => setSimpleAd(f => ({ ...f, descriptions: [...f.descriptions, ''] }))} style={{ border: '1px dashed #DADCE0', background: '#fff', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', color: '#1A73E8', fontSize: 13, width: 'fit-content' }}>+ Add description</button>
        )}
        <div>
          <label style={{ ...labelStyle, marginTop: 8 }}>Final URL *</label>
          <input style={inputStyle} value={simpleAd.finalUrl} onChange={e => setSimpleAd(f => ({ ...f, finalUrl: e.target.value }))} placeholder="https://www.example.com" />
        </div>
        <div>
          <label style={labelStyle}>Display URL</label>
          <input style={inputStyle} value={simpleAd.displayUrl} onChange={e => setSimpleAd(f => ({ ...f, displayUrl: e.target.value }))} placeholder="www.example.com/shoes" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button onClick={() => setActiveMode(null)} style={{ border: '1px solid #DADCE0', background: '#fff', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Back</button>
        <button onClick={handleAdSubmit} style={{ background: '#1A73E8', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>
          Create ad
        </button>
      </div>
    </div>
  )

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modal}>
        <div style={header}>
          <h2 style={{ fontSize: 18, fontWeight: 500 }}>
            {activeMode === 'campaign' ? 'New Campaign' :
             activeMode === 'adGroup' ? 'New Ad Group' :
             activeMode === 'keyword' ? (isNegative ? 'Add Negative Keywords' : 'Add Keywords') :
             activeMode === 'ad' ? 'New Ad' : 'Create'}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5F6368' }}>
            <X size={20} />
          </button>
        </div>

        {!activeMode && renderModeSelect()}
        {activeMode === 'campaign' && step === 1 && renderCampaignStep1()}
        {activeMode === 'campaign' && step === 2 && renderCampaignStep2()}
        {activeMode === 'campaign' && step === 3 && renderCampaignStep3()}
        {activeMode === 'campaign' && step === 4 && renderCampaignStep4()}
        {activeMode === 'campaign' && step === 5 && renderCampaignStep5()}
        {activeMode === 'adGroup' && renderAdGroupForm()}
        {activeMode === 'keyword' && renderKeywordForm()}
        {activeMode === 'ad' && renderAdForm()}
      </div>
    </div>
  )
}
