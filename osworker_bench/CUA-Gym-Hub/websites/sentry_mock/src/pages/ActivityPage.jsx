import React from 'react'
import {
  AlertCircle, CheckCircle, Archive, UserPlus, MessageSquare,
  Package, Bell, Bookmark, GitCommit, Activity as ActivityIcon
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { formatRelativeTime, getInitials, getAvatarColor } from '../utils/helpers.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

const ICON_MAP = {
  'issue.assigned': { icon: UserPlus, color: '#3B6ECC' },
  'issue.resolved': { icon: CheckCircle, color: '#2BA185' },
  'issue.archived': { icon: Archive, color: TEXT_SEC },
  'issue.created': { icon: AlertCircle, color: '#E03E2F' },
  'comment': { icon: MessageSquare, color: ACCENT },
  'deploy': { icon: Package, color: '#33BF9E' },
  'alert.triggered': { icon: Bell, color: '#F5B000' },
  'bookmark': { icon: Bookmark, color: '#F5B000' },
  'commit': { icon: GitCommit, color: TEXT_SEC },
}

const ACTIVITIES = [
  { id: 'act-1', type: 'alert.triggered', user: 'System', description: 'Alert "Error rate too high" triggered on flask-api', timestamp: '2025-04-09T14:30:00Z' },
  { id: 'act-2', type: 'issue.assigned', user: 'Jane Schmidt', description: 'Assigned issue REACT-59F to Keith Ryan', timestamp: '2025-04-09T14:15:00Z' },
  { id: 'act-3', type: 'deploy', user: 'CI/CD Pipeline', description: 'Release d66ac445 deployed to production', timestamp: '2025-04-09T13:00:00Z' },
  { id: 'act-4', type: 'issue.resolved', user: 'Maria Chen', description: 'Resolved issue FLASK-API-C39 (ValueError)', timestamp: '2025-04-09T12:45:00Z' },
  { id: 'act-5', type: 'comment', user: 'Keith Ryan', description: 'Commented on JAVASCRIPT-3B2: "Looking into this, seems related to auth token expiration"', timestamp: '2025-04-09T12:30:00Z' },
  { id: 'act-6', type: 'issue.created', user: 'System', description: 'New issue REACT-APP-2E1: TypeError - Cannot read properties of undefined', timestamp: '2025-04-09T11:00:00Z' },
  { id: 'act-7', type: 'alert.triggered', user: 'System', description: 'Alert "New issue detected in prod" triggered on javascript', timestamp: '2025-04-09T10:30:00Z' },
  { id: 'act-8', type: 'issue.assigned', user: 'Alex Thompson', description: 'Self-assigned issue JAVASCRIPT-7A4', timestamp: '2025-04-09T10:00:00Z' },
  { id: 'act-9', type: 'commit', user: 'Sam Park', description: 'Pushed 3 commits to spring-boot-5 (fix: handle null payment gateway)', timestamp: '2025-04-09T09:30:00Z' },
  { id: 'act-10', type: 'deploy', user: 'CI/CD Pipeline', description: 'Release a3bc88e1 deployed to staging', timestamp: '2025-04-09T08:00:00Z' },
  { id: 'act-11', type: 'issue.archived', user: 'Jane Schmidt', description: 'Archived issue JAVASCRIPT-9E3 (SyntaxError)', timestamp: '2025-04-08T17:00:00Z' },
  { id: 'act-12', type: 'bookmark', user: 'Maria Chen', description: 'Bookmarked issue FLASK-API-D23 (DatabaseError)', timestamp: '2025-04-08T16:00:00Z' },
  { id: 'act-13', type: 'comment', user: 'Sam Park', description: 'Commented on SPRING-F7C: "NullPointerException fixed in latest commit"', timestamp: '2025-04-08T15:30:00Z' },
  { id: 'act-14', type: 'issue.resolved', user: 'Keith Ryan', description: 'Resolved issue REACT-APP-F10 (NetworkError: Failed to fetch)', timestamp: '2025-04-08T14:00:00Z' },
  { id: 'act-15', type: 'alert.triggered', user: 'System', description: 'Alert "Issue regression detected" triggered on flask-api', timestamp: '2025-04-08T12:00:00Z' },
]

export default function ActivityPage() {
  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Activity</h1>

      <div style={{ maxWidth: 720, position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: 15, top: 20, bottom: 20,
          width: 2, backgroundColor: '#F0EEFF'
        }} />

        {ACTIVITIES.map((act, idx) => {
          const iconCfg = ICON_MAP[act.type] || { icon: ActivityIcon, color: TEXT_SEC }
          const Icon = iconCfg.icon

          return (
            <div key={act.id} style={{
              display: 'flex', gap: 16, padding: '12px 0', position: 'relative'
            }}>
              {/* Icon */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                backgroundColor: iconCfg.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, position: 'relative', zIndex: 1, border: '2px solid #fff'
              }}>
                <Icon size={14} color={iconCfg.color} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: TEXT_PRI, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600 }}>{act.user}</span>
                  <span style={{ color: TEXT_SEC }}> &mdash; </span>
                  {act.description}
                </div>
                <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>
                  {formatRelativeTime(act.timestamp)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
