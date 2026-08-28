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

export default function SpeedOptimizationPage() {
  const { zoneId } = useParams()
  const { state, updateSpeedSettings } = useApp()
  const speed = state.speedSettings?.[zoneId] || {}

  function setSpeed(key, val) {
    updateSpeedSettings(zoneId, { [key]: val })
  }

  function setMinify(key, val) {
    updateSpeedSettings(zoneId, { auto_minify: { ...speed.auto_minify, [key]: val } })
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Speed — Optimization</h1>
        <p className="page-subtitle">Configure performance optimization settings</p>
      </div>

      {/* Auto Minify */}
      <div className="module-card" style={{ marginBottom: 12 }}>
        <div className="module-card-info">
          <h3 className="module-card-title">Auto Minify</h3>
          <p className="module-card-desc">Reduce the file size of source code on your website.</p>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {['javascript', 'css', 'html'].map(k => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={speed.auto_minify?.[k] || false}
                  onChange={e => setMinify(k, e.target.checked)}
                />
                <span style={{ fontSize: 14, textTransform: 'capitalize', color: 'var(--cf-text-primary)' }}>{k}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Brotli</h3>
          <p className="module-card-desc">Speed up page load times for your visitor's HTTPS traffic by applying Brotli compression.</p>
        </div>
        <Toggle checked={speed.brotli || false} onChange={v => setSpeed('brotli', v)} />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Rocket Loader</h3>
          <p className="module-card-desc">Improves the paint time for pages which include JavaScript. Defers loading of JavaScript resources.</p>
        </div>
        <Toggle
          checked={speed.rocket_loader === 'on' || speed.rocket_loader === 'automatic'}
          onChange={v => setSpeed('rocket_loader', v ? 'on' : 'off')}
        />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Early Hints</h3>
          <p className="module-card-desc">Allow the browser to begin loading resources while waiting for the origin server to finish preparing the full response.</p>
        </div>
        <Toggle checked={speed.early_hints || false} onChange={v => setSpeed('early_hints', v)} />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">HTTP/2 Prioritization</h3>
          <p className="module-card-desc">Improves page load by sending resources in an optimal order. Works with HTTP/2.</p>
        </div>
        <Toggle checked={speed.http2_prioritization || false} onChange={v => setSpeed('http2_prioritization', v)} />
      </div>
    </div>
  )
}
