import React, { useState } from 'react'
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronDown, ChevronRight, Star, Bell, MoreHorizontal,
  Archive, CheckCircle, User, Tag, ChevronUp, ExternalLink,
  AlertCircle, Activity, Clock, MessageSquare, X
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { formatRelativeTime, formatDate, formatCount, getInitials, getAvatarColor } from '../utils/helpers.js'
import { withCurrentSearch } from '../utils/navigation.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'
const LEVEL_COLORS = { fatal: '#E03E2F', error: '#E03E2F', warning: '#F5B000', info: '#3B6ECC', debug: '#80708F' }
const PRIORITY_CONFIG = {
  critical: { color: '#E03E2F', label: 'Critical' },
  high: { color: '#F5B000', label: 'High' },
  medium: { color: '#80708F', label: 'Medium' },
  low: { color: '#3B6ECC', label: 'Low' },
}

const BREADCRUMB_ICONS = {
  error: { icon: '●', color: '#E03E2F' },
  exception: { icon: '●', color: '#E03E2F' },
  navigation: { icon: '→', color: '#2BA185' },
  'ui.click': { icon: '◆', color: ACCENT },
  ui: { icon: '◆', color: ACCENT },
  fetch: { icon: '↑', color: '#3B6ECC' },
  http: { icon: '↑', color: '#3B6ECC' },
  console: { icon: '▶', color: '#F5B000' },
  default: { icon: '●', color: '#80708F' },
}

function CollapsibleSection({ title, children, defaultOpen = true, extra }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, marginBottom: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', cursor: 'pointer',
        userSelect: 'none'
      }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {open ? <ChevronDown size={14} color={TEXT_SEC} /> : <ChevronRight size={14} color={TEXT_SEC} />}
          <span style={{ fontWeight: 600, fontSize: 14, color: TEXT_PRI }}>{title}</span>
        </div>
        {extra && <div onClick={e => e.stopPropagation()}>{extra}</div>}
      </div>
      {open && <div style={{ padding: '0 24px 20px' }}>{children}</div>}
    </div>
  )
}

function StackFrame({ frame, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <div style={{
      borderRadius: 4, border: `1px solid ${BORDER}`,
      marginBottom: 4, overflow: 'hidden',
      backgroundColor: frame.inApp ? '#fff' : '#FAF9FB'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px', cursor: 'pointer', userSelect: 'none'
      }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {expanded ? <ChevronDown size={12} color={TEXT_SEC} /> : <ChevronRight size={12} color={TEXT_SEC} />}
          <span style={{
            fontFamily: '"Source Code Pro", monospace', fontSize: 12,
            color: frame.inApp ? TEXT_PRI : TEXT_SEC,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {frame.filename}
          </span>
          <span style={{ fontSize: 12, color: ACCENT, fontFamily: '"Source Code Pro", monospace', flexShrink: 0 }}>
            in {frame.function}
          </span>
          <span style={{ fontSize: 11, color: TEXT_SEC, flexShrink: 0 }}>
            line {frame.lineNo}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {frame.inApp
            ? <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, backgroundColor: '#E8F8F5', color: '#2BA185', fontWeight: 600 }}>In App</span>
            : <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, backgroundColor: '#F4F2F7', color: TEXT_SEC }}>library</span>
          }
        </div>
      </div>
      {expanded && frame.context && frame.context.length > 0 && (
        <div style={{
          fontFamily: '"Source Code Pro", monospace', fontSize: 12,
          backgroundColor: '#1A1228', color: '#C9BFD8',
          borderTop: `1px solid ${BORDER}`, overflowX: 'auto'
        }}>
          {frame.context.map(([lineNum, code], idx) => (
            <div key={lineNum} style={{
              display: 'flex', padding: '2px 0',
              backgroundColor: lineNum === frame.lineNo ? '#3D1A1A' : 'transparent'
            }}>
              <span style={{
                width: 40, textAlign: 'right', paddingRight: 12, flexShrink: 0,
                color: lineNum === frame.lineNo ? '#E03E2F' : '#6E5F8A',
                userSelect: 'none', fontSize: 11
              }}>{lineNum}</span>
              <span style={{ color: lineNum === frame.lineNo ? '#FFCDD2' : '#C9BFD8', whiteSpace: 'pre' }}>{code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BreadcrumbEntry({ crumb }) {
  const category = crumb.category || crumb.type || 'default'
  const iconCfg = BREADCRUMB_ICONS[category] || BREADCRUMB_ICONS.default
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '24px 100px 1fr auto',
      gap: 12, padding: '6px 0', alignItems: 'start',
      borderBottom: `1px solid #F4F2F7`, fontSize: 12
    }}>
      <span style={{ color: iconCfg.color, fontWeight: 700, textAlign: 'center' }}>{iconCfg.icon}</span>
      <span style={{ fontWeight: 600, color: TEXT_PRI, textTransform: 'capitalize' }}>
        {crumb.category || crumb.type}
      </span>
      <div>
        {crumb.message && <div style={{ color: TEXT_PRI }}>{crumb.message}</div>}
        {crumb.data && Object.keys(crumb.data).length > 0 && (
          <div style={{ color: TEXT_SEC, fontSize: 11, marginTop: 2 }}>
            {Object.entries(crumb.data).map(([k, v]) => (
              <span key={k} style={{ marginRight: 8 }}><strong>{k}:</strong> {String(v)}</span>
            ))}
          </div>
        )}
      </div>
      <span style={{ color: TEXT_SEC, whiteSpace: 'nowrap', fontSize: 11 }}>
        {formatRelativeTime(crumb.timestamp)}
      </span>
    </div>
  )
}

export default function IssueDetailPage() {
  const { issueId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { state, resolveIssue, unresolveIssue, archiveIssue, setIssueAssignee, setIssuePriority, toggleBookmark, toggleSubscribe, addComment } = useApp()

  const { issues = [], events = {}, users = [], projects = [], currentUser, bookmarkedIssues = [], subscribedIssues = [], comments = {} } = state

  const issue = issues.find(i => i.id === issueId)
  const issueEvents = events[issueId] || []
  const currentEvent = issueEvents[0] || null
  const proj = projects.find(p => p.id === issue?.project)
  const issueComments = comments[issueId] || []

  const [commentText, setCommentText] = useState('')
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [tagTab, setTagTab] = useState('all')

  if (!issue) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: TEXT_SEC }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Issue not found</div>
        <button onClick={() => navigate(withCurrentSearch('/issues/', location.search))} style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          ← Back to Issues
        </button>
      </div>
    )
  }

  const bookmarked = (bookmarkedIssues || []).includes(issue.id)
  const subscribed = (subscribedIssues || []).includes(issue.id)

  // Event distribution bar chart
  const chartData = (issue.stats14d || []).map((v, i) => ({
    day: `Day ${i + 1}`, value: v
  }))

  const assignee = users.find(u => u.id === issue.assignee)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Breadcrumb header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: `1px solid ${BORDER}`,
          backgroundColor: '#FAF9FB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Link to={withCurrentSearch('/issues/', location.search)} style={{ color: ACCENT }}>Issues</Link>
            <ChevronRight size={13} color={TEXT_SEC} />
            <span style={{ color: TEXT_SEC, fontFamily: '"Source Code Pro", monospace' }}>{issue.shortId}</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: TEXT_PRI }}>{formatCount(issue.count)}</div>
              <div style={{ fontSize: 11, color: TEXT_SEC }}>Events</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: TEXT_PRI }}>{formatCount(issue.userCount)}</div>
              <div style={{ fontSize: 11, color: TEXT_SEC }}>Users</div>
            </div>
          </div>
        </div>

        {/* Issue title section */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: TEXT_PRI }}>
            {issue.title}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: TEXT_SEC }}>{issue.subtitle}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: LEVEL_COLORS[issue.level] || '#80708F', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: TEXT_SEC, fontFamily: '"Source Code Pro", monospace' }}>{issue.culprit}</span>
          </div>
        </div>

        {/* Action toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 24px', borderBottom: `1px solid ${BORDER}`,
          backgroundColor: '#FAF9FB', gap: 8, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Resolve button */}
            <div style={{ display: 'flex', position: 'relative' }}>
              <button onClick={() => issue.status === 'resolved' ? unresolveIssue(issue.id) : resolveIssue(issue.id)}
                style={{
                  backgroundColor: issue.status === 'resolved' ? '#2BA185' : ACCENT,
                  color: '#fff', border: 'none', borderRadius: '4px 0 0 4px',
                  padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500
                }}>
                {issue.status === 'resolved' ? '✓ Resolved' : 'Resolve'}
              </button>
              <button onClick={() => setResolveOpen(o => !o)}
                style={{
                  backgroundColor: issue.status === 'resolved' ? '#2BA185' : ACCENT,
                  color: '#fff', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '0 4px 4px 0', padding: '6px 6px', cursor: 'pointer'
                }}>
                <ChevronDown size={12} />
              </button>
              {resolveOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 200,
                  backgroundColor: '#fff', border: `1px solid ${BORDER}`,
                  borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  minWidth: 180, marginTop: 4
                }} onMouseLeave={() => setResolveOpen(false)}>
                  {['Immediately', 'In next release', 'In current release'].map(opt => (
                    <div key={opt} onClick={() => { resolveIssue(issue.id); setResolveOpen(false) }}
                      style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: TEXT_PRI }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Archive */}
            <button onClick={() => archiveIssue(issue.id)}
              style={{
                border: `1px solid ${BORDER}`, borderRadius: 4, padding: '6px 14px',
                backgroundColor: issue.status === 'archived' ? '#F4F2F7' : '#fff',
                fontSize: 13, cursor: 'pointer', fontWeight: 500
              }}>
              Archive
            </button>

            {/* Bookmark */}
            <button onClick={() => toggleBookmark(issue.id)}
              style={{
                border: `1px solid ${BORDER}`, borderRadius: 4, padding: '6px 8px',
                backgroundColor: bookmarked ? '#FFF8E8' : '#fff',
                cursor: 'pointer'
              }}>
              <Star size={14} color={bookmarked ? '#F5B000' : TEXT_SEC} fill={bookmarked ? '#F5B000' : 'none'} />
            </button>

            {/* Subscribe */}
            <button onClick={() => toggleSubscribe(issue.id)} style={{
              border: `1px solid ${BORDER}`, borderRadius: 4, padding: '6px 8px',
              backgroundColor: subscribed ? '#F0EEFF' : '#fff', cursor: 'pointer'
            }}>
              <Bell size={14} color={subscribed ? ACCENT : TEXT_SEC} fill={subscribed ? ACCENT : 'none'} />
            </button>

            {/* More */}
            <button style={{
              border: `1px solid ${BORDER}`, borderRadius: 4, padding: '6px 8px',
              backgroundColor: '#fff', cursor: 'pointer'
            }}>
              <MoreHorizontal size={14} color={TEXT_SEC} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Priority dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setPriorityOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: `1px solid ${BORDER}`, borderRadius: 4, padding: '5px 10px',
                  backgroundColor: '#fff', fontSize: 13, cursor: 'pointer'
                }}>
                <span style={{ color: PRIORITY_CONFIG[issue.priority]?.color }}>●</span>
                {PRIORITY_CONFIG[issue.priority]?.label || 'Medium'}
                <ChevronDown size={12} color={TEXT_SEC} />
              </button>
              {priorityOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 200,
                  backgroundColor: '#fff', border: `1px solid ${BORDER}`,
                  borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  minWidth: 140, marginTop: 4
                }} onMouseLeave={() => setPriorityOpen(false)}>
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <div key={key} onClick={() => { setIssuePriority(issue.id, key); setPriorityOpen(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: TEXT_PRI }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <span style={{ color: cfg.color }}>●</span> {cfg.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assignee dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setAssigneeOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: `1px solid ${BORDER}`, borderRadius: 4, padding: '5px 10px',
                  backgroundColor: '#fff', fontSize: 13, cursor: 'pointer'
                }}>
                {assignee ? (
                  <>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      backgroundColor: getAvatarColor(assignee.name),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0
                    }}>{getInitials(assignee.name)}</div>
                    {assignee.name}
                  </>
                ) : (
                  <><User size={13} color={TEXT_SEC} /> Assign</>
                )}
                <ChevronDown size={12} color={TEXT_SEC} />
              </button>
              {assigneeOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 200,
                  backgroundColor: '#fff', border: `1px solid ${BORDER}`,
                  borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  minWidth: 180, marginTop: 4
                }} onMouseLeave={() => setAssigneeOpen(false)}>
                  <div onClick={() => { setIssueAssignee(issue.id, null); setAssigneeOpen(false) }}
                    style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: TEXT_SEC }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    Unassign
                  </div>
                  {users.map(u => (
                    <div key={u.id} onClick={() => { setIssueAssignee(issue.id, u.id); setAssigneeOpen(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: TEXT_PRI }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: getAvatarColor(u.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>
                        {getInitials(u.name)}
                      </div>
                      {u.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event distribution chart */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={2}>
                <Bar dataKey="value" fill={ACCENT} radius={[2, 2, 0, 0]} />
                <Tooltip
                  formatter={(v) => [v, 'Events']}
                  contentStyle={{ fontSize: 12, border: `1px solid ${BORDER}` }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            <div style={{ fontSize: 13, color: TEXT_SEC }}><strong style={{ color: TEXT_PRI }}>{formatCount(issue.count)}</strong> events</div>
            <div style={{ fontSize: 13, color: TEXT_SEC }}><strong style={{ color: TEXT_PRI }}>{formatCount(issue.userCount)}</strong> users</div>
          </div>
        </div>

        {/* Event navigation */}
        {currentEvent && (
          <div style={{ padding: '12px 24px', borderBottom: `1px solid ${BORDER}`, backgroundColor: '#FAF9FB' }}>
            <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 6 }}>Events in this issue</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {['First', 'Last', 'Recommended', 'All Events'].map(label => (
                <button key={label} style={{
                  border: `1px solid ${BORDER}`, borderRadius: 4, padding: '4px 10px',
                  backgroundColor: label === 'Recommended' ? ACCENT : '#fff',
                  color: label === 'Recommended' ? '#fff' : TEXT_PRI,
                  fontSize: 12, cursor: 'pointer'
                }}>{label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: '"Source Code Pro", monospace', color: ACCENT }}>{currentEvent.eventId}</span>
              <span style={{ color: TEXT_SEC }}>{formatRelativeTime(currentEvent.timestamp)}</span>
              {currentEvent.user?.email && <span style={{ color: TEXT_SEC }}>{currentEvent.user.email}</span>}
              {currentEvent.contexts?.browser && (
                <span style={{ backgroundColor: '#F4F2F7', borderRadius: 4, padding: '1px 6px' }}>
                  {currentEvent.contexts.browser.name} {currentEvent.contexts.browser.version}
                </span>
              )}
              {currentEvent.contexts?.os && (
                <span style={{ backgroundColor: '#F4F2F7', borderRadius: 4, padding: '1px 6px' }}>
                  {currentEvent.contexts.os.name}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Event Highlights */}
        {currentEvent?.highlights && (
          <CollapsibleSection title="Event Highlights" extra={
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: '3px 10px', fontSize: 12, backgroundColor: '#fff', cursor: 'pointer' }}>View All</button>
              <button style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: '3px 10px', fontSize: 12, backgroundColor: '#fff', cursor: 'pointer' }}>Edit</button>
            </div>
          }>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, backgroundColor: BORDER }}>
              {Object.entries(currentEvent.highlights).map(([key, value], idx) => (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 12px',
                  backgroundColor: idx % 2 === 0 ? '#FAF9FB' : '#fff',
                  fontSize: 12
                }}>
                  <span style={{ color: TEXT_SEC, textTransform: 'capitalize', fontWeight: 500 }}>
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span style={{ color: TEXT_PRI, fontFamily: key.includes('id') || key === 'release' ? '"Source Code Pro", monospace' : 'inherit', maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Stack Trace */}
        {currentEvent?.exception && (
          <CollapsibleSection title="Stack Trace">
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#E03E2F' }}>{currentEvent.exception.type}</div>
              <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 2 }}>{currentEvent.exception.value}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: '4px 10px', fontSize: 12, backgroundColor: ACCENT, color: '#fff', cursor: 'pointer' }}>Most Relevant</button>
              <button style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: '4px 10px', fontSize: 12, backgroundColor: '#fff', cursor: 'pointer' }}>Full Stack Trace</button>
            </div>
            {[...(currentEvent.exception.stacktrace?.frames || [])].reverse().map((frame, idx) => (
              <StackFrame key={idx} frame={frame} defaultExpanded={frame.inApp && idx === 0} />
            ))}
          </CollapsibleSection>
        )}

        {/* Breadcrumbs */}
        {currentEvent?.breadcrumbs && currentEvent.breadcrumbs.length > 0 && (
          <CollapsibleSection title="Breadcrumbs" extra={
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: '3px 10px', fontSize: 12, backgroundColor: '#fff', cursor: 'pointer' }}>Give Feedback</button>
            </div>
          }>
            {currentEvent.breadcrumbs.map((crumb, idx) => (
              <BreadcrumbEntry key={idx} crumb={crumb} />
            ))}
          </CollapsibleSection>
        )}

        {/* Tags */}
        {currentEvent?.tags && (
          <CollapsibleSection title="Tags">
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {['all', 'custom', 'application', 'other'].map(t => (
                <button key={t} onClick={() => setTagTab(t)}
                  style={{
                    border: `1px solid ${BORDER}`, borderRadius: 4, padding: '4px 10px',
                    fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
                    backgroundColor: tagTab === t ? ACCENT : '#fff',
                    color: tagTab === t ? '#fff' : TEXT_PRI
                  }}>{t}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {Object.entries(currentEvent.tags).map(([key, value]) => (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '5px 10px', borderRadius: 4, backgroundColor: '#FAF9FB',
                  border: `1px solid ${BORDER}`, fontSize: 12
                }}>
                  <span style={{ color: TEXT_SEC }}>{key}</span>
                  <span style={{ color: TEXT_PRI, fontFamily: '"Source Code Pro", monospace' }}>{String(value)}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>

      {/* Right sidebar */}
      <aside style={{ width: 280, borderLeft: `1px solid ${BORDER}`, flexShrink: 0, padding: 16, fontSize: 12 }}>
        {/* Last/First seen */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: TEXT_SEC }}>Last seen </span>
            <span style={{ color: TEXT_PRI, fontWeight: 500 }}>{formatRelativeTime(issue.lastSeen)}</span>
          </div>
          <div>
            <span style={{ color: TEXT_SEC }}>First seen </span>
            <span style={{ color: TEXT_PRI, fontWeight: 500 }}>{formatRelativeTime(issue.firstSeen)}</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: BORDER, marginBottom: 16 }} />

        {/* Issue Tracking */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: TEXT_PRI }}>Issue Tracking</span>
            <button style={{ border: 'none', background: 'none', color: ACCENT, cursor: 'pointer', fontSize: 12 }}>Manage</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Asana', 'GitHub', 'Jira'].map(intg => (
              <button key={intg} style={{
                border: `1px solid ${BORDER}`, borderRadius: 4, padding: '4px 8px',
                backgroundColor: '#fff', fontSize: 11, cursor: 'pointer', color: TEXT_SEC
              }}>{intg}</button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: BORDER, marginBottom: 16 }} />

        {/* Activity */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: TEXT_PRI, marginBottom: 8 }}>Activity</div>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            style={{
              width: '100%', border: `1px solid ${BORDER}`, borderRadius: 4,
              padding: 8, fontSize: 12, resize: 'vertical', minHeight: 64,
              fontFamily: 'inherit', color: TEXT_PRI, outline: 'none'
            }}
          />
          {commentText && (
            <button onClick={() => { addComment(issue.id, commentText); setCommentText('') }}
              style={{
                marginTop: 6, backgroundColor: ACCENT, color: '#fff', border: 'none',
                borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer', width: '100%'
              }}>
              Post Comment
            </button>
          )}

          {/* Activity timeline */}
          {[
            ...issueComments.map(c => ({ type: 'comment', text: `${c.author}: ${c.text}`, time: c.timestamp })),
            { type: 'system', text: `Assigned to ${assignee?.name || 'Unassigned'}`, time: issue.lastSeen },
            { type: 'system', text: 'First seen', time: issue.firstSeen },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: item.type === 'comment' ? ACCENT : '#E2DBE8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.type === 'comment' ? <MessageSquare size={10} color="#fff" /> : <Activity size={10} color={TEXT_SEC} />}
              </div>
              <div>
                <div style={{ color: TEXT_PRI }}>{item.text}</div>
                <div style={{ color: TEXT_SEC, fontSize: 11 }}>{formatRelativeTime(item.time)}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, backgroundColor: BORDER, marginBottom: 16 }} />

        {/* People */}
        <div>
          <div style={{ fontWeight: 600, color: TEXT_PRI, marginBottom: 8 }}>People</div>
          <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 6 }}>
            {users.length} participating
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {users.slice(0, 4).map(u => (
              <div key={u.id} style={{
                width: 24, height: 24, borderRadius: '50%',
                backgroundColor: getAvatarColor(u.name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#fff'
              }} title={u.name}>
                {getInitials(u.name)}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
