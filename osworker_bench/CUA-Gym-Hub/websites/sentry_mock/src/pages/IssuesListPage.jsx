import React, { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Search, ChevronDown, CheckSquare, Square, ArrowUp, ArrowDown,
  Minus, AlertTriangle, User, MoreHorizontal, X, Plus
} from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import {
  formatRelativeTime, formatRelativeShort, formatCount,
  getInitials, getAvatarColor
} from '../utils/helpers.js'
import { withCurrentSearch } from '../utils/navigation.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'
const ROW_HOVER = '#FAF9FB'

const LEVEL_COLORS = { fatal: '#E03E2F', error: '#E03E2F', warning: '#F5B000', info: '#3B6ECC', debug: '#80708F' }
const PRIORITY_CONFIG = {
  critical: { color: '#E03E2F', icon: '⬆⬆', label: 'Critical' },
  high: { color: '#F5B000', icon: '⬆', label: 'High' },
  medium: { color: '#80708F', icon: '—', label: 'Medium' },
  low: { color: '#3B6ECC', icon: '⬇', label: 'Low' },
}
const TREND_CONFIG = {
  escalating: { color: '#E03E2F', bg: '#FFF0F0', label: 'Escalating' },
  new: { color: '#6C5FC7', bg: '#F0EEFF', label: 'New' },
  ongoing: { color: '#3B6ECC', bg: '#EEF4FF', label: 'Ongoing' },
  regression: { color: '#F5B000', bg: '#FFF8E8', label: 'Regressed' },
}

const TABS = [
  { key: 'unresolved', label: 'All Unresolved' },
  { key: 'forReview', label: 'For Review' },
  { key: 'regressed', label: 'Regressed' },
  { key: 'escalating', label: 'Escalating' },
  { key: 'archived', label: 'Archived' },
]

const SORT_OPTIONS = [
  { value: 'lastSeen', label: 'Last Seen' },
  { value: 'firstSeen', label: 'First Seen' },
  { value: 'trends', label: 'Trends' },
  { value: 'events', label: 'Events' },
  { value: 'users', label: 'Users' },
]

function PriorityIcon({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium
  return (
    <span style={{ color: cfg.color, fontSize: 14, fontWeight: 700, letterSpacing: -1 }} title={cfg.label}>
      {priority === 'critical' ? '↑↑' : priority === 'high' ? '↑' : priority === 'medium' ? '—' : '↓'}
    </span>
  )
}

function TrendBadge({ trend }) {
  const cfg = TREND_CONFIG[trend] || TREND_CONFIG.ongoing
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 500,
      color: cfg.color, backgroundColor: cfg.bg,
      borderRadius: 4, padding: '1px 5px', marginTop: 2
    }}>{cfg.label}</span>
  )
}

function Sparkline({ data }) {
  const chartData = data.map((v, i) => ({ v }))
  return (
    <div style={{ width: 60, height: 24 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={1}>
          <Bar dataKey="v" fill="#6C5FC7" radius={[1, 1, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function AssigneeAvatar({ userId, users, size = 24 }) {
  const user = users.find(u => u.id === userId)
  if (!user) return (
    <div style={{
      width: size, height: size, borderRadius: '50%', border: `1.5px dashed ${BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: TEXT_SEC, cursor: 'pointer'
    }}>
      <Plus size={10} />
    </div>
  )
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: getAvatarColor(user.name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 700, color: '#fff', cursor: 'pointer',
      flexShrink: 0
    }} title={user.name}>
      {getInitials(user.name)}
    </div>
  )
}

function Dropdown({ label, value, options, onChange, width = 160 }) {
  const [open, setOpen] = useState(false)
  const current = options.find(o => o.value === value)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        border: `1px solid ${BORDER}`, borderRadius: 4,
        padding: '5px 10px', backgroundColor: '#fff',
        fontSize: 13, color: TEXT_PRI, cursor: 'pointer',
        whiteSpace: 'nowrap'
      }}>
        {current ? current.label : label}
        <ChevronDown size={13} color={TEXT_SEC} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 200,
          backgroundColor: '#fff', border: `1px solid ${BORDER}`,
          borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          minWidth: width, marginTop: 4, overflow: 'hidden'
        }} onMouseLeave={() => setOpen(false)}>
          {options.map(opt => (
            <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                backgroundColor: value === opt.value ? '#F0EEFF' : 'transparent',
                color: value === opt.value ? ACCENT : TEXT_PRI,
                fontWeight: value === opt.value ? 500 : 400
              }}
              onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.backgroundColor = '#FAF9FB' }}
              onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.backgroundColor = 'transparent' }}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function IssuesListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    state, setSort, setTab, setSearch, setSelectedIssues, saveIssueView,
    setProjectFilter, setEnvFilter, setDateRange, bulkResolve, bulkArchive, mergeIssues
  } = useApp()

  const {
    issues = [], users = [], projects = [],
    issueListSort, issueListTab, issueSearchQuery,
    selectedProject, selectedEnvironment, dateRange, selectedIssues = []
  } = state

  const [searchInput, setSearchInput] = useState(issueSearchQuery || '')
  const [saveMessage, setSaveMessage] = useState('')

  function handleSaveView() {
    saveIssueView({
      id: 'issue-view-' + Date.now(),
      name: searchInput.trim() || 'Saved issue view',
      query: searchInput,
      tab: issueListTab,
      sort: issueListSort,
      project: selectedProject,
      environment: selectedEnvironment,
      dateRange,
      createdAt: new Date().toISOString(),
    })
    setSaveMessage('Saved')
  }

  const projectOptions = [
    { value: 'all', label: 'My Projects' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ]
  const envOptions = [
    { value: 'all', label: 'All Envs' },
    { value: 'production', label: 'production' },
    { value: 'staging', label: 'staging' },
    { value: 'development', label: 'development' },
  ]
  const dateOptions = [
    { value: '1h', label: '1 hour' },
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '14d', label: '14 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
  ]

  const filteredIssues = useMemo(() => {
    let list = [...issues]

    // Tab filtering
    if (issueListTab === 'unresolved') list = list.filter(i => i.status === 'unresolved')
    else if (issueListTab === 'forReview') list = list.filter(i => i.status === 'unresolved' && i.priority === 'high' || i.priority === 'critical')
    else if (issueListTab === 'regressed') list = list.filter(i => i.trend === 'regression')
    else if (issueListTab === 'escalating') list = list.filter(i => i.trend === 'escalating')
    else if (issueListTab === 'archived') list = list.filter(i => i.status === 'archived')

    // Project filter
    if (selectedProject !== 'all') list = list.filter(i => i.project === selectedProject)

    // Search
    const q = searchInput.replace('is:unresolved', '').replace('is:resolved', '').trim().toLowerCase()
    if (q) list = list.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.subtitle.toLowerCase().includes(q) ||
      i.shortId.toLowerCase().includes(q)
    )

    // Sort
    if (issueListSort === 'lastSeen') list.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
    else if (issueListSort === 'firstSeen') list.sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen))
    else if (issueListSort === 'events') list.sort((a, b) => b.count - a.count)
    else if (issueListSort === 'users') list.sort((a, b) => b.userCount - a.userCount)
    else if (issueListSort === 'trends') {
      const trendOrder = { escalating: 0, new: 1, regression: 2, ongoing: 3 }
      list.sort((a, b) => (trendOrder[a.trend] || 3) - (trendOrder[b.trend] || 3))
    }

    return list
  }, [issues, issueListTab, issueListSort, selectedProject, searchInput])

  // Tab counts
  const tabCounts = useMemo(() => ({
    unresolved: issues.filter(i => i.status === 'unresolved').length,
    forReview: issues.filter(i => i.status === 'unresolved' && (i.priority === 'high' || i.priority === 'critical')).length,
    regressed: issues.filter(i => i.trend === 'regression').length,
    escalating: issues.filter(i => i.trend === 'escalating').length,
    archived: issues.filter(i => i.status === 'archived').length,
  }), [issues])

  const allChecked = filteredIssues.length > 0 && filteredIssues.every(i => selectedIssues.includes(i.id))

  function toggleAll() {
    if (allChecked) setSelectedIssues([])
    else setSelectedIssues(filteredIssues.map(i => i.id))
  }

  function toggleIssue(id, e) {
    e.stopPropagation()
    if (selectedIssues.includes(id)) setSelectedIssues(selectedIssues.filter(x => x !== id))
    else setSelectedIssues([...selectedIssues, id])
  }

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Issues</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Dropdown label="Last Seen" value={issueListSort} options={SORT_OPTIONS} onChange={setSort} width={140} />
          <button onClick={handleSaveView} style={{
            border: `1px solid ${ACCENT}`, borderRadius: 4, padding: '5px 14px',
            backgroundColor: 'transparent', color: ACCENT, fontSize: 13, cursor: 'pointer', fontWeight: 500
          }}>Save As</button>
          {saveMessage && <span style={{ alignSelf: 'center', color: '#2BA185', fontSize: 13 }}>{saveMessage}</span>}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Dropdown label="My Projects" value={selectedProject} options={projectOptions} onChange={setProjectFilter} width={180} />
        <Dropdown label="All Envs" value={selectedEnvironment} options={envOptions} onChange={setEnvFilter} width={160} />
        <Dropdown label="14d" value={dateRange} options={dateOptions} onChange={setDateRange} width={130} />
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: TEXT_SEC }} />
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
          placeholder="Search for events, users, tags, and more"
          style={{
            width: '100%', padding: '8px 12px 8px 34px',
            border: `1px solid ${BORDER}`, borderRadius: 4,
            fontSize: 13, color: TEXT_PRI, outline: 'none',
            backgroundColor: '#fff'
          }}
        />
        {searchInput && (
          <button onClick={() => { setSearchInput('is:unresolved'); setSearch('is:unresolved') }}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: TEXT_SEC }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, marginBottom: 0 }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setTab(tab.key)}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: issueListTab === tab.key ? 600 : 400,
              color: issueListTab === tab.key ? ACCENT : TEXT_SEC,
              border: 'none', borderBottom: issueListTab === tab.key ? `2px solid ${ACCENT}` : '2px solid transparent',
              backgroundColor: 'transparent', cursor: 'pointer', marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
            {tab.label}
            <span style={{
              backgroundColor: issueListTab === tab.key ? '#F0EEFF' : '#F4F2F7',
              color: issueListTab === tab.key ? ACCENT : TEXT_SEC,
              borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 600
            }}>
              {tabCounts[tab.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedIssues.length > 0 && (
        <div style={{
          backgroundColor: '#F0EEFF', border: `1px solid #DDD8F8`,
          borderRadius: 4, padding: '8px 16px', marginTop: 8,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 13, color: ACCENT, fontWeight: 500 }}>
            {selectedIssues.length} selected
          </span>
          <button onClick={() => bulkResolve(selectedIssues)} style={{
            border: `1px solid ${ACCENT}`, borderRadius: 4, padding: '4px 12px',
            backgroundColor: ACCENT, color: '#fff', fontSize: 12, cursor: 'pointer'
          }}>Resolve</button>
          <button onClick={() => bulkArchive(selectedIssues)} style={{
            border: `1px solid ${BORDER}`, borderRadius: 4, padding: '4px 12px',
            backgroundColor: '#fff', color: TEXT_PRI, fontSize: 12, cursor: 'pointer'
          }}>Archive</button>
          {selectedIssues.length >= 2 && (
            <button onClick={() => mergeIssues(selectedIssues)} style={{
              border: `1px solid ${BORDER}`, borderRadius: 4, padding: '4px 12px',
              backgroundColor: '#fff', color: TEXT_PRI, fontSize: 12, cursor: 'pointer'
            }}>Merge</button>
          )}
          <button onClick={() => setSelectedIssues([])} style={{
            border: 'none', background: 'none', color: TEXT_SEC, cursor: 'pointer', fontSize: 12
          }}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 4, overflow: 'hidden', marginTop: selectedIssues.length > 0 ? 8 : 0 }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 90px 70px 90px 70px 60px 50px 40px',
          padding: '8px 12px',
          backgroundColor: '#FAF9FB',
          borderBottom: `1px solid ${BORDER}`,
          fontSize: 12, fontWeight: 600, color: TEXT_SEC,
          userSelect: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: TEXT_SEC }}>
              {allChecked ? <CheckSquare size={15} color={ACCENT} /> : <Square size={15} />}
            </button>
          </div>
          <div>Issue</div>
          <div style={{ textAlign: 'right' }}>Last Seen</div>
          <div style={{ textAlign: 'right' }}>Age</div>
          <div style={{ textAlign: 'center' }}>Trend</div>
          <div style={{ textAlign: 'right' }}>Events</div>
          <div style={{ textAlign: 'right' }}>Users</div>
          <div style={{ textAlign: 'center' }}>P</div>
          <div></div>
        </div>

        {/* Rows */}
        {filteredIssues.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: TEXT_SEC }}>
            <AlertTriangle size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No issues match your filters</div>
            <div style={{ fontSize: 13 }}>Try adjusting your search criteria or tab selection</div>
          </div>
        ) : (
          filteredIssues.map((issue, idx) => {
            const proj = projects.find(p => p.id === issue.project)
            const checked = selectedIssues.includes(issue.id)
            return (
              <div key={issue.id}
                onClick={() => navigate(withCurrentSearch(`/issues/${issue.id}/`, location.search))}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 90px 70px 90px 70px 60px 50px 40px',
                  padding: '10px 12px',
                  borderBottom: idx < filteredIssues.length - 1 ? `1px solid ${BORDER}` : 'none',
                  cursor: 'pointer', alignItems: 'center',
                  backgroundColor: checked ? '#F0EEFF' : 'transparent'
                }}
                onMouseEnter={e => { if (!checked) e.currentTarget.style.backgroundColor = ROW_HOVER }}
                onMouseLeave={e => { if (!checked) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {/* Checkbox */}
                <div onClick={e => toggleIssue(issue.id, e)} style={{ display: 'flex', alignItems: 'center' }}>
                  {checked
                    ? <CheckSquare size={15} color={ACCENT} />
                    : <Square size={15} color={TEXT_SEC} />
                  }
                </div>

                {/* Issue */}
                <div style={{ minWidth: 0, paddingRight: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: LEVEL_COLORS[issue.level] || '#80708F'
                    }} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: TEXT_PRI }}>
                      {issue.title}
                    </span>
                    {issue.isUnhandled && (
                      <span style={{
                        fontSize: 10, padding: '1px 5px', borderRadius: 3,
                        backgroundColor: '#FFE8E6', color: '#E03E2F', fontWeight: 600
                      }}>Unhandled</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.subtitle}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                    {proj && (
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 3, fontWeight: 500,
                        backgroundColor: proj.color + '22', color: proj.color, border: `1px solid ${proj.color}44`
                      }}>{proj.name}</span>
                    )}
                    <span style={{ fontSize: 11, color: TEXT_SEC, fontFamily: '"Source Code Pro", monospace' }}>
                      {issue.shortId}
                    </span>
                  </div>
                </div>

                {/* Last seen */}
                <div style={{ textAlign: 'right', fontSize: 12, color: TEXT_SEC }}>
                  {formatRelativeTime(issue.lastSeen)}
                </div>

                {/* Age */}
                <div style={{ textAlign: 'right', fontSize: 12, color: TEXT_SEC }}>
                  {formatRelativeShort(issue.firstSeen)}
                </div>

                {/* Trend */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Sparkline data={issue.stats14d || []} />
                  <TrendBadge trend={issue.trend} />
                </div>

                {/* Events */}
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 500, color: TEXT_PRI }}>
                  {formatCount(issue.count)}
                </div>

                {/* Users */}
                <div style={{ textAlign: 'right', fontSize: 12, color: TEXT_SEC }}>
                  {formatCount(issue.userCount)}
                </div>

                {/* Priority */}
                <div style={{ textAlign: 'center' }}>
                  <PriorityIcon priority={issue.priority} />
                </div>

                {/* Assignee */}
                <div style={{ display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                  <AssigneeAvatar userId={issue.assignee} users={users} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
