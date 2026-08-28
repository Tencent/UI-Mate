import React from 'react'
import { MessageSquare, ExternalLink } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { formatRelativeTime } from '../utils/helpers.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

const FEEDBACK_DATA = [
  { id: 'fb-1', name: 'Sarah Johnson', email: 'sarah@example.com', message: 'The checkout page keeps crashing when I try to apply a coupon code. I\'ve tried multiple browsers and the same error occurs.', issueId: 'issue-9', timestamp: '2025-04-09T11:30:00Z' },
  { id: 'fb-2', name: 'Mike Torres', email: 'mike.t@company.co', message: 'Getting a blank white screen after logging in on Safari. Console shows TypeError. Happens every time I try to access my dashboard.', issueId: 'issue-1', timestamp: '2025-04-09T09:15:00Z' },
  { id: 'fb-3', name: 'Lisa Wang', email: 'lisa.wang@gmail.com', message: 'Product search is extremely slow, sometimes takes 10+ seconds to return results. Started happening about a week ago.', issueId: 'issue-7', timestamp: '2025-04-08T16:45:00Z' },
  { id: 'fb-4', name: 'James Miller', email: 'james@startup.io', message: 'Cannot register a new account. The form submits but then shows a generic error message. My username should be unique.', issueId: 'issue-3', timestamp: '2025-04-08T14:20:00Z' },
  { id: 'fb-5', name: 'Ana Rodriguez', email: 'ana.r@test.com', message: 'The product list page shows "undefined" instead of product names intermittently. Refreshing sometimes fixes it.', issueId: 'issue-6', timestamp: '2025-04-07T18:00:00Z' },
]

export default function UserFeedbackPage() {
  const { state } = useApp()
  const { issues = [], projects = [] } = state
  const [expandedId, setExpandedId] = React.useState(null)

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>User Feedback</h1>

      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
        {FEEDBACK_DATA.map((fb, idx) => {
          const linkedIssue = issues.find(i => i.id === fb.issueId)
          const expanded = expandedId === fb.id

          return (
            <div key={fb.id}
              onClick={() => setExpandedId(expanded ? null : fb.id)}
              style={{
                padding: '14px 20px', borderBottom: idx < FEEDBACK_DATA.length - 1 ? `1px solid ${BORDER}` : 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={14} color={ACCENT} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: TEXT_PRI }}>{fb.name}</span>
                  <span style={{ fontSize: 12, color: TEXT_SEC }}>{fb.email}</span>
                </div>
                <span style={{ fontSize: 12, color: TEXT_SEC }}>{formatRelativeTime(fb.timestamp)}</span>
              </div>

              <div style={{
                fontSize: 13, color: TEXT_PRI, lineHeight: 1.5,
                overflow: expanded ? 'visible' : 'hidden',
                maxHeight: expanded ? 'none' : '40px',
                textOverflow: expanded ? 'unset' : 'ellipsis'
              }}>
                {fb.message}
              </div>

              {linkedIssue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12 }}>
                  <ExternalLink size={11} color={ACCENT} />
                  <span style={{ color: ACCENT }}>{linkedIssue.shortId}</span>
                  <span style={{ color: TEXT_SEC }}>- {linkedIssue.title}: {linkedIssue.subtitle}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
