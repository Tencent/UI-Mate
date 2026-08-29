import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { ChevronDown, ChevronRight, Check, Info } from 'lucide-react'

const BIDDING_STRATEGIES = [
  { value: 'MANUAL_CPC', label: 'Manual CPC', desc: 'Set your own maximum cost-per-click bids for your ads.' },
  { value: 'MAXIMIZE_CLICKS', label: 'Maximize clicks', desc: 'Get the most clicks within your budget.' },
  { value: 'MAXIMIZE_CONVERSIONS', label: 'Maximize conversions', desc: 'Get the most conversions within your budget.' },
  { value: 'TARGET_CPA', label: 'Target CPA', desc: 'Set bids to get as many conversions as possible at the target cost-per-action.' },
  { value: 'TARGET_ROAS', label: 'Target ROAS', desc: 'Set bids to get as much conversion value as possible at the target return on ad spend.' },
]

const NETWORKS = [
  { value: 'SEARCH', label: 'Google Search Network' },
  { value: 'SEARCH_PARTNERS', label: 'Search partners' },
  { value: 'DISPLAY', label: 'Google Display Network' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'DISCOVER', label: 'Discover' },
  { value: 'GMAIL', label: 'Gmail' },
  { value: 'MAPS', label: 'Maps' },
]

const LOCATIONS = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
  'France', 'Japan', 'Brazil', 'India', 'Mexico', 'Spain', 'Italy',
  'Netherlands', 'South Korea', 'Sweden',
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Japanese',
  'Portuguese', 'Italian', 'Dutch', 'Korean', 'Chinese',
  'Arabic', 'Hindi', 'Russian', 'Swedish', 'Polish',
]

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

const sectionStyle = { background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 24, marginBottom: 20 }
const sectionHeaderStyle = { fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }
const labelStyle = { fontSize: 13, fontWeight: 500, color: '#5F6368', minWidth: 180, flexShrink: 0 }
const rowStyle = { display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #F1F3F4' }
const inputStyle = { border: '1px solid #DADCE0', borderRadius: 4, padding: '8px 12px', fontSize: 13, outline: 'none', color: '#202124', fontFamily: 'inherit' }
const chipStyle = (active) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px',
  borderRadius: 16, border: `1px solid ${active ? '#1A73E8' : '#DADCE0'}`,
  background: active ? '#E8F0FE' : '#fff', color: active ? '#1A73E8' : '#5F6368',
  fontSize: 12, cursor: 'pointer', fontWeight: active ? 500 : 400, marginRight: 6, marginBottom: 6,
})

export default function Settings() {
  const { state, dispatch } = useApp()
  const account = state?.account || {}
  const campaigns = (state?.campaigns || []).filter(c => c.status !== 'REMOVED')

  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '')
  const [editData, setEditData] = useState(null)
  const [saved, setSaved] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    account: true, bidding: true, networks: true, locations: true, languages: true, schedule: false,
  })

  const campaign = campaigns.find(c => c.id === selectedCampaignId)

  const toggleSection = (key) => setExpandedSections(s => ({ ...s, [key]: !s[key] }))

  const edit = editData || campaign || {}

  const startEdit = () => {
    if (!editData && campaign) setEditData({ ...campaign })
  }

  const updateEdit = (field, value) => {
    startEdit()
    setEditData(prev => ({ ...(prev || campaign), [field]: value }))
  }

  const handleSave = () => {
    if (editData) {
      dispatch({ type: 'UPDATE_CAMPAIGN', payload: editData })
      setEditData(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleCancel = () => {
    setEditData(null)
    setSaved(false)
  }

  const toggleNetwork = (network) => {
    startEdit()
    setEditData(prev => {
      const current = prev || campaign
      const nets = current.networks || []
      const newNets = nets.includes(network) ? nets.filter(n => n !== network) : [...nets, network]
      return { ...current, networks: newNets }
    })
  }

  const toggleLocation = (loc) => {
    startEdit()
    setEditData(prev => {
      const current = prev || campaign
      const locs = current.locations || []
      const newLocs = locs.includes(loc) ? locs.filter(l => l !== loc) : [...locs, loc]
      return { ...current, locations: newLocs }
    })
  }

  const toggleLanguage = (lang) => {
    startEdit()
    setEditData(prev => {
      const current = prev || campaign
      const langs = current.languages || []
      const newLangs = langs.includes(lang) ? langs.filter(l => l !== lang) : [...langs, lang]
      return { ...current, languages: newLangs }
    })
  }

  const toggleScheduleEnabled = () => {
    startEdit()
    setEditData(prev => {
      const current = prev || campaign
      const schedule = current.adSchedule || { enabled: false, schedule: [] }
      return { ...current, adSchedule: { ...schedule, enabled: !schedule.enabled } }
    })
  }

  const updateScheduleDay = (day, field, value) => {
    startEdit()
    setEditData(prev => {
      const current = prev || campaign
      const schedule = { ...(current.adSchedule || { enabled: true, schedule: [] }) }
      const entries = [...(schedule.schedule || [])]
      const idx = entries.findIndex(e => e.day === day)
      if (idx >= 0) {
        entries[idx] = { ...entries[idx], [field]: parseInt(value) }
      } else {
        entries.push({ day, startHour: 0, endHour: 24, [field]: parseInt(value) })
      }
      return { ...current, adSchedule: { ...schedule, schedule: entries } }
    })
  }

  const toggleScheduleDay = (day) => {
    startEdit()
    setEditData(prev => {
      const current = prev || campaign
      const schedule = { ...(current.adSchedule || { enabled: true, schedule: [] }) }
      const entries = [...(schedule.schedule || [])]
      const idx = entries.findIndex(e => e.day === day)
      if (idx >= 0) {
        entries.splice(idx, 1)
      } else {
        entries.push({ day, startHour: 8, endHour: 22 })
      }
      return { ...current, adSchedule: { ...schedule, schedule: entries } }
    })
  }

  const SectionHeader = ({ title, sectionKey }) => (
    <div style={{ ...sectionHeaderStyle, cursor: 'pointer' }} onClick={() => toggleSection(sectionKey)}>
      {expandedSections[sectionKey] ? <ChevronDown size={18} color="#5F6368" /> : <ChevronRight size={18} color="#5F6368" />}
      {title}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#202124' }}>Settings</h1>
      </div>

      {saved && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: '#E6F4EA', color: '#188038', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} /> Settings saved successfully.
        </div>
      )}

      {/* Account Information */}
      <div style={sectionStyle}>
        <SectionHeader title="Account information" sectionKey="account" />
        {expandedSections.account && (
          <div>
            {[
              { label: 'Account name', value: account.name },
              { label: 'Account ID', value: account.accountId },
              { label: 'Currency', value: account.currency },
              { label: 'Timezone', value: account.timezone },
              { label: 'Optimization score', value: `${account.optimizationScore}%` },
            ].map(({ label, value }) => (
              <div key={label} style={rowStyle}>
                <span style={labelStyle}>{label}</span>
                <span style={{ fontSize: 13, color: '#202124' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign-level Settings */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#202124' }}>Campaign settings</span>
          <select
            value={selectedCampaignId}
            onChange={e => { setSelectedCampaignId(e.target.value); setEditData(null) }}
            style={{ ...inputStyle, marginLeft: 'auto' }}
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {campaign && (
          <>
            {/* Basic */}
            <div style={rowStyle}>
              <span style={labelStyle}>Campaign name</span>
              <input
                style={{ ...inputStyle, flex: 1, maxWidth: 340 }}
                value={edit.name || ''}
                onChange={e => updateEdit('name', e.target.value)}
              />
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Status</span>
              <select
                style={inputStyle}
                value={edit.status || 'ENABLED'}
                onChange={e => updateEdit('status', e.target.value)}
              >
                <option value="ENABLED">Enabled</option>
                <option value="PAUSED">Paused</option>
              </select>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Campaign type</span>
              <span style={{ fontSize: 13, color: '#202124', padding: '8px 0' }}>{campaign.type}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Daily budget</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 13 }}>$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  style={{ ...inputStyle, width: 120 }}
                  value={edit.budget || ''}
                  onChange={e => updateEdit('budget', parseFloat(e.target.value) || 0)}
                />
                <span style={{ fontSize: 12, color: '#5F6368' }}>/ day</span>
              </div>
            </div>

            {/* Bidding Strategy */}
            <div style={{ marginTop: 8 }}>
              <SectionHeader title="Bidding strategy" sectionKey="bidding" />
              {expandedSections.bidding && (
                <div style={{ paddingLeft: 26 }}>
                  {BIDDING_STRATEGIES.map(bs => {
                    const isActive = (edit.biddingStrategy || campaign.biddingStrategy) === bs.value
                    return (
                      <div key={bs.value}
                        onClick={() => updateEdit('biddingStrategy', bs.value)}
                        style={{
                          padding: '12px 16px', marginBottom: 8, borderRadius: 8, cursor: 'pointer',
                          border: `2px solid ${isActive ? '#1A73E8' : '#DADCE0'}`,
                          background: isActive ? '#E8F0FE' : '#fff',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: 9,
                            border: `2px solid ${isActive ? '#1A73E8' : '#DADCE0'}`,
                            background: isActive ? '#1A73E8' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isActive && <div style={{ width: 6, height: 6, borderRadius: 3, background: '#fff' }} />}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 500, color: isActive ? '#1A73E8' : '#202124' }}>{bs.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#5F6368', marginTop: 4, paddingLeft: 28 }}>{bs.desc}</div>
                      </div>
                    )
                  })}
                  {edit.biddingStrategy === 'TARGET_CPA' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0 4px 28px' }}>
                      <span style={{ fontSize: 13, color: '#5F6368' }}>Target CPA: $</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        style={{ ...inputStyle, width: 100 }}
                        value={edit.targetCpa || ''}
                        onChange={e => updateEdit('targetCpa', parseFloat(e.target.value) || null)}
                      />
                    </div>
                  )}
                  {edit.biddingStrategy === 'TARGET_ROAS' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0 4px 28px' }}>
                      <span style={{ fontSize: 13, color: '#5F6368' }}>Target ROAS:</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        style={{ ...inputStyle, width: 100 }}
                        value={edit.targetRoas || ''}
                        onChange={e => updateEdit('targetRoas', parseFloat(e.target.value) || null)}
                      />
                      <span style={{ fontSize: 12, color: '#5F6368' }}>%</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Networks */}
            <div style={{ marginTop: 8 }}>
              <SectionHeader title="Networks" sectionKey="networks" />
              {expandedSections.networks && (
                <div style={{ paddingLeft: 26, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                  {NETWORKS.map(n => {
                    const active = (edit.networks || []).includes(n.value)
                    return (
                      <label key={n.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px 6px 0', cursor: 'pointer', fontSize: 13, color: '#202124', minWidth: 200 }}>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleNetwork(n.value)}
                          style={{ accentColor: '#1A73E8' }}
                        />
                        {n.label}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Locations */}
            <div style={{ marginTop: 8 }}>
              <SectionHeader title="Location targeting" sectionKey="locations" />
              {expandedSections.locations && (
                <div style={{ paddingLeft: 26 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 8 }}>
                    {LOCATIONS.map(loc => {
                      const active = (edit.locations || []).includes(loc)
                      return (
                        <span key={loc} onClick={() => toggleLocation(loc)} style={chipStyle(active)}>
                          {active && <Check size={12} />}
                          {loc}
                        </span>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 12, color: '#5F6368' }}>
                    {(edit.locations || []).length} location{(edit.locations || []).length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              )}
            </div>

            {/* Languages */}
            <div style={{ marginTop: 8 }}>
              <SectionHeader title="Language targeting" sectionKey="languages" />
              {expandedSections.languages && (
                <div style={{ paddingLeft: 26 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 8 }}>
                    {LANGUAGES.map(lang => {
                      const active = (edit.languages || []).includes(lang)
                      return (
                        <span key={lang} onClick={() => toggleLanguage(lang)} style={chipStyle(active)}>
                          {active && <Check size={12} />}
                          {lang}
                        </span>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 12, color: '#5F6368' }}>
                    {(edit.languages || []).length} language{(edit.languages || []).length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              )}
            </div>

            {/* Ad Schedule */}
            <div style={{ marginTop: 8 }}>
              <SectionHeader title="Ad schedule" sectionKey="schedule" />
              {expandedSections.schedule && (
                <div style={{ paddingLeft: 26 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 16, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={edit.adSchedule?.enabled || false}
                      onChange={toggleScheduleEnabled}
                      style={{ accentColor: '#1A73E8' }}
                    />
                    Enable custom ad schedule
                  </label>
                  {(edit.adSchedule?.enabled) && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '6px 12px', textAlign: 'left', color: '#5F6368', fontWeight: 500 }}>Day</th>
                            <th style={{ padding: '6px 12px', textAlign: 'left', color: '#5F6368', fontWeight: 500 }}>Active</th>
                            <th style={{ padding: '6px 12px', textAlign: 'left', color: '#5F6368', fontWeight: 500 }}>Start hour</th>
                            <th style={{ padding: '6px 12px', textAlign: 'left', color: '#5F6368', fontWeight: 500 }}>End hour</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DAYS.map(day => {
                            const entry = (edit.adSchedule?.schedule || []).find(e => e.day === day)
                            const isActive = !!entry
                            return (
                              <tr key={day} style={{ borderBottom: '1px solid #F1F3F4' }}>
                                <td style={{ padding: '8px 12px', fontSize: 13, color: '#202124' }}>
                                  {day.charAt(0) + day.slice(1).toLowerCase()}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={() => toggleScheduleDay(day)}
                                    style={{ accentColor: '#1A73E8' }}
                                  />
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <select
                                    disabled={!isActive}
                                    value={entry?.startHour ?? 8}
                                    onChange={e => updateScheduleDay(day, 'startHour', e.target.value)}
                                    style={{ ...inputStyle, width: 70, padding: '4px 6px', fontSize: 12, opacity: isActive ? 1 : 0.4 }}
                                  >
                                    {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                                  </select>
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <select
                                    disabled={!isActive}
                                    value={entry?.endHour ?? 22}
                                    onChange={e => updateScheduleDay(day, 'endHour', e.target.value)}
                                    style={{ ...inputStyle, width: 70, padding: '4px 6px', fontSize: 12, opacity: isActive ? 1 : 0.4 }}
                                  >
                                    {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
                                    <option value={24}>24:00</option>
                                  </select>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date range */}
            <div style={rowStyle}>
              <span style={labelStyle}>Start date</span>
              <span style={{ fontSize: 13, color: '#202124', padding: '8px 0' }}>{campaign.startDate}</span>
            </div>
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>End date</span>
              <input
                type="date"
                style={inputStyle}
                value={edit.endDate || ''}
                onChange={e => updateEdit('endDate', e.target.value || null)}
              />
            </div>

            {/* Save/Cancel */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid #DADCE0' }}>
              <button onClick={handleSave} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                Save changes
              </button>
              <button onClick={handleCancel} style={{ background: '#fff', color: '#5F6368', border: '1px solid #DADCE0', borderRadius: 4, padding: '10px 24px', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
