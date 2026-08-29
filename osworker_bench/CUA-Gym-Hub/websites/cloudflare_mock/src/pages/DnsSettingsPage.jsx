import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}

export default function DnsSettingsPage() {
  const { zoneId } = useParams()
  const { state, getZone, updateZone } = useApp()
  const zone = getZone(zoneId)
  const [dnssecEnabled, setDnssecEnabled] = useState(zone?.meta?.dnssec_enabled || false)
  const [flattenCname, setFlattenCname] = useState(zone?.meta?.cname_flattening || false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!zone) return <div className="page-content"><p>Zone not found</p></div>

  const handleToggleDnssec = (val) => {
    setDnssecEnabled(val)
    updateZone(zoneId, { meta: { ...zone.meta, dnssec_enabled: val } })
    flash()
  }

  const handleToggleFlatten = (val) => {
    setFlattenCname(val)
    updateZone(zoneId, { meta: { ...zone.meta, cname_flattening: val } })
    flash()
  }

  const flash = () => { setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000) }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">DNS Settings</h1>
      </div>

      {showSuccess && <div className="card" style={{ padding: '10px 16px', background: '#e8f5e9', color: '#2e7d32', marginBottom: 16, fontSize: 13 }}>Settings updated successfully.</div>}

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>DNSSEC</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--cf-text-secondary)' }}>DNSSEC adds a layer of trust to DNS by providing authentication for DNS responses. When enabled, it prevents DNS spoofing and cache poisoning attacks.</p>
          </div>
          <Toggle checked={dnssecEnabled} onChange={handleToggleDnssec} />
        </div>
        {dnssecEnabled && (
          <div style={{ marginTop: 16, padding: 16, background: 'var(--cf-bg-secondary)', borderRadius: 8, fontSize: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 16px' }}>
              <span style={{ fontWeight: 600 }}>Status:</span><span style={{ color: 'var(--cf-green)' }}>Active</span>
              <span style={{ fontWeight: 600 }}>Algorithm:</span><span>ECDSAP256SHA256 (13)</span>
              <span style={{ fontWeight: 600 }}>Digest Type:</span><span>SHA-256 (2)</span>
              <span style={{ fontWeight: 600 }}>DS Record:</span>
              <code style={{ fontSize: 11, wordBreak: 'break-all', color: 'var(--cf-text-secondary)' }}>
                {zone.name}. 3600 IN DS 2371 13 2 a]b5c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9
              </code>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>CNAME Flattening</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--cf-text-secondary)' }}>Resolve CNAME records at the zone apex by following the CNAME chain and returning the resulting A/AAAA records instead.</p>
          </div>
          <Toggle checked={flattenCname} onChange={handleToggleFlatten} />
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Custom Nameservers</h3>
        <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', marginBottom: 12 }}>Your zone is currently using these Xloudflare nameservers:</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {zone.name_servers.map((ns, i) => (
            <div key={i} style={{ padding: '8px 16px', background: 'var(--cf-bg-secondary)', borderRadius: 6, fontFamily: 'var(--cf-mono)', fontSize: 13 }}>{ns}</div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--cf-text-muted)', marginTop: 12 }}>To use custom nameservers, upgrade to a Business or Enterprise plan.</p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Multi-signer DNSSEC</h3>
        <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)' }}>Enable multi-signer DNSSEC to allow multiple DNS providers to sign your zone. This requires both providers to support this feature and is available on Enterprise plans.</p>
      </div>
    </div>
  )
}
