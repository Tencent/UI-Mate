import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft, Paperclip, X } from 'lucide-react'
import '../styles/common.css'

export default function ComposeMessage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedProvider = searchParams.get('provider')

  const [to, setTo] = useState(preselectedProvider || '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState([])
  const [draftSaved, setDraftSaved] = useState(false)
  const [draftId] = useState(() => `draft-${Date.now()}`)
  const fileInputRef = useRef(null)

  const providers = state.providers || []

  const handleSend = () => {
    const selectedProvider = providers.find(p => p.id === to)
    const threadId = `thread-new-${Date.now()}`
    const newMsg = {
      id: `msg-new-${Date.now()}`,
      threadId,
      parentId: null,
      from: {
        id: 'patient-1',
        name: state.currentUser?.fullName || 'Sarah Chen',
        type: 'patient'
      },
      to: selectedProvider
        ? { id: selectedProvider.id, name: selectedProvider.fullName, type: 'provider' }
        : { id: 'provider-1', name: 'Elizabeth Morrison, MD', type: 'provider' },
      subject: subject || '(No subject)',
      body,
      date: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      folder: 'sent',
      hasAttachment: attachments.length > 0,
      attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type })),
      isUrgent: false
    }
    dispatch({ type: 'ADD_MESSAGE', payload: newMsg })
    // Remove draft if one was saved
    dispatch({ type: 'DELETE_DRAFT', payload: draftId })
    navigate('/messages')
  }

  const handleSaveDraft = () => {
    const selectedProvider = providers.find(p => p.id === to)
    dispatch({
      type: 'SAVE_DRAFT',
      payload: {
        id: draftId,
        to,
        toName: selectedProvider ? selectedProvider.fullName : '',
        subject,
        body,
        attachmentCount: attachments.length,
        savedAt: new Date().toISOString()
      }
    })
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2000)
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
    // Reset input so same file can be reselected
    e.target.value = ''
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="back-btn" onClick={() => navigate('/messages')}>
          <ChevronLeft size={16} /> Back to Messages
        </button>
        <h1 className="page-title">New Message</h1>
      </div>

      <div className="section-card">
        <div className="section-card-body">
          <div className="form-group">
            <label className="form-label">To</label>
            <select className="form-select" value={to} onChange={e => setTo(e.target.value)}>
              <option value="">Select a provider...</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} — {p.specialty}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter subject..."
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              placeholder="Type your message..."
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
            />
          </div>

          {/* Attachments list */}
          {attachments.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Attachments ({attachments.length})
              </div>
              {attachments.map((file, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', background: 'var(--color-section-bg)',
                  borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: 'var(--font-sm)'
                }}>
                  <Paperclip size={12} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 2 }}
                    onClick={() => removeAttachment(i)}
                    title="Remove attachment"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn--primary"
              onClick={handleSend}
              disabled={!body.trim()}
            >
              Send Message
            </button>
            <button className="btn btn--gray" onClick={handleSaveDraft}>
              {draftSaved ? '✓ Draft saved' : 'Save Draft'}
            </button>
            <button className="btn btn--gray" onClick={handleAttachClick}>
              <Paperclip size={14} /> Attach
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button className="btn btn--gray" style={{ marginLeft: 'auto' }} onClick={() => navigate('/messages')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
