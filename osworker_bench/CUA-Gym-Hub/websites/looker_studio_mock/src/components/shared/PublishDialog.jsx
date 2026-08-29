import React, { useState } from 'react'
import { X, Link, Code, Globe } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function PublishDialog() {
  const { state, dispatch } = useApp()
  const reportId = state.publishDialog?.reportId
  const report = state.reports.find(r => r.id === reportId)
  const [published, setPublished] = useState(report?.published || false)
  const [embedEnabled, setEmbedEnabled] = useState(report?.embedEnabled || false)
  const [copied, setCopied] = useState(null)

  if (!report) return null

  const reportUrl = `${window.location.origin}/report/${reportId}/view`
  const embedCode = `<iframe width="800" height="600" src="${reportUrl}" frameborder="0" style="border:0" allowfullscreen></iframe>`

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const save = () => {
    dispatch({ type: 'PUBLISH_REPORT', payload: { reportId, published, embedEnabled } })
    dispatch({ type: 'CLOSE_PUBLISH_DIALOG' })
  }

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'CLOSE_PUBLISH_DIALOG' })}>
      <div className="modal" style={{ width: '520px', padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #DADCE0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#202124' }}>Publish report</div>
            <button className="icon-btn" onClick={() => dispatch({ type: 'CLOSE_PUBLISH_DIALOG' })}>
              <X size={20} />
            </button>
          </div>
          <div style={{ fontSize: '13px', color: '#5F6368', marginTop: '8px' }}>
            Make this report accessible to anyone with the link.
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Enable publishing toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '20px' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#1A73E8' }} />
            <div>
              <div style={{ fontSize: '14px', color: '#202124', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} /> Enable link sharing
              </div>
              <div style={{ fontSize: '12px', color: '#5F6368', marginTop: '2px' }}>Anyone with the link can view this report</div>
            </div>
          </label>

          {published && (
            <>
              {/* Report link */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#5F6368', fontWeight: 500, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Link size={14} /> Report link
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input readOnly value={reportUrl}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '13px', color: '#5F6368', background: '#F8F9FA' }} />
                  <button className="btn-secondary" onClick={() => copyToClipboard(reportUrl, 'link')}>
                    {copied === 'link' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Embed toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '16px' }}>
                <input type="checkbox" checked={embedEnabled} onChange={e => setEmbedEnabled(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#1A73E8' }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#202124', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={16} /> Enable embedding
                  </div>
                  <div style={{ fontSize: '12px', color: '#5F6368', marginTop: '2px' }}>Allow this report to be embedded in other websites</div>
                </div>
              </label>

              {embedEnabled && (
                <div>
                  <div style={{ fontSize: '12px', color: '#5F6368', fontWeight: 500, marginBottom: '6px' }}>Embed code</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea readOnly value={embedCode}
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '12px', color: '#5F6368', background: '#F8F9FA', height: '60px', resize: 'none', fontFamily: 'monospace' }} />
                    <button className="btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => copyToClipboard(embedCode, 'embed')}>
                      {copied === 'embed' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #DADCE0' }}>
          <button className="btn-secondary" onClick={() => dispatch({ type: 'CLOSE_PUBLISH_DIALOG' })}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
