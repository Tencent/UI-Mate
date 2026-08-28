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

export default function ScrapeShieldPage() {
  const { zoneId } = useParams()
  const { state, updateScrapeShieldSettings } = useApp()
  const ss = state.scrapeShieldSettings?.[zoneId] || {}

  function setSS(key, val) {
    updateScrapeShieldSettings(zoneId, { [key]: val })
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Scrape Shield</h1>
        <p className="page-subtitle">Protect your content from being scraped</p>
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Email Address Obfuscation</h3>
          <p className="module-card-desc">Protect your email addresses from being harvested by spammers. Email addresses are scrambled via JavaScript.</p>
        </div>
        <Toggle checked={ss.email_obfuscation || false} onChange={v => setSS('email_obfuscation', v)} />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Server-side Excludes</h3>
          <p className="module-card-desc">Automatically hide specific content on your page from suspicious visitors by wrapping content in a special tag.</p>
        </div>
        <Toggle checked={ss.server_side_excludes || false} onChange={v => setSS('server_side_excludes', v)} />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Hotlink Protection</h3>
          <p className="module-card-desc">Prevent other sites from linking directly to your images and other content, reducing bandwidth usage.</p>
        </div>
        <Toggle checked={ss.hotlink_protection || false} onChange={v => setSS('hotlink_protection', v)} />
      </div>
    </div>
  )
}
