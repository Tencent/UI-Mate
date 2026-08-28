import React from 'react'
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

const NETWORK_SETTINGS = [
  { key: 'http2', label: 'HTTP/2', desc: 'Accelerates your website with HTTP/2 support for visitors.' },
  { key: 'http3', label: 'HTTP/3 (with QUIC)', desc: 'Accelerates HTTP requests by using QUIC, which provides encryption and performance improvements.' },
  { key: 'websockets', label: 'WebSockets', desc: 'Allow WebSocket connections to your origin server.' },
  { key: 'grpc', label: 'gRPC', desc: 'Route gRPC traffic to your origin and get the benefits of Xloudflare.' },
  { key: 'ip_geolocation', label: 'IP Geolocation', desc: 'Include the country code of the visitor location with all requests to your website.' }
]

export default function NetworkPage() {
  const { zoneId } = useParams()
  const { state, updateNetworkSettings } = useApp()
  const network = state.networkSettings?.[zoneId] || {}

  function setNetwork(key, val) {
    updateNetworkSettings(zoneId, { [key]: val })
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Network</h1>
        <p className="page-subtitle">Configure network protocol settings</p>
      </div>

      {NETWORK_SETTINGS.map(setting => (
        <div key={setting.key} className="module-card">
          <div className="module-card-info">
            <h3 className="module-card-title">{setting.label}</h3>
            <p className="module-card-desc">{setting.desc}</p>
          </div>
          <Toggle
            checked={!!network[setting.key]}
            onChange={v => setNetwork(setting.key, v)}
          />
        </div>
      ))}

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Onion Routing</h3>
          <p className="module-card-desc">Allows Tor users to access your site through the Xloudflare Tor onion service.</p>
        </div>
        <Toggle
          checked={network.onion_routing === 'on'}
          onChange={v => setNetwork('onion_routing', v ? 'on' : 'off')}
        />
      </div>
    </div>
  )
}
