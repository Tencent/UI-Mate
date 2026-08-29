import { useState } from 'react'
import { useApp } from '../context/AppContext'

const REPORT_TYPES = {
  daily: '日报',
  weekly: '周报',
}

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
}

function formatRelativeDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = (now - d) / 86400000
  if (diff < 1 && d.getDate() === now.getDate()) return '今天'
  if (diff < 2) return '昨天'
  return `${d.getMonth()+1}月${d.getDate()}日`
}

export default function DailyReportPage() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('received')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  const reports = state.dailyReports || []
  const getUser = (id) => state.users.find(u => u.id === id)

  const getList = () => {
    if (activeTab === 'received') {
      return reports.filter(r =>
        r.authorId !== state.currentUser.id &&
        (r.recipientIds || []).includes(state.currentUser.id)
      )
    }
    return reports.filter(r => r.authorId === state.currentUser.id)
  }

  const handleSelect = (report) => {
    setSelectedReport(report)
    if (!report.readBy.includes(state.currentUser.id)) {
      dispatch({ type: 'READ_REPORT', id: report.id })
    }
  }

  const list = getList()

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Report list */}
      <div style={{ width: 320, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>日志</span>
          <button
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => setShowCreate(true)}
          >
            + 写日志
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'received', label: '收到的' },
            { key: 'mine', label: '我发出的' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1, padding: '10px 8px', border: 'none', background: 'none',
                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-family)',
                color: activeTab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                fontWeight: activeTab === t.key ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {list.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>
              暂无日志
            </div>
          )}
          {list.map(report => {
            const author = getUser(report.authorId)
            const isUnread = !report.readBy.includes(state.currentUser.id)
            const isActive = selectedReport?.id === report.id
            return (
              <div
                key={report.id}
                onClick={() => handleSelect(report)}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  background: isActive ? 'var(--active-bg)' : 'white',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div className="avatar-circle" style={{ width: 28, height: 28, fontSize: 11, background: author?.avatar || '#ccc', flexShrink: 0 }}>
                    {author?.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isUnread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', flexShrink: 0 }} />}
                      <span style={{ fontSize: 13, fontWeight: isUnread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {author?.name} 的{REPORT_TYPES[report.type] || '日报'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {formatRelativeDate(report.createdAt)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 3, flexShrink: 0,
                    background: report.type === 'weekly' ? '#F0F5FF' : '#F6FFED',
                    color: report.type === 'weekly' ? '#1890FF' : '#52C41A',
                    fontWeight: 600,
                  }}>
                    {REPORT_TYPES[report.type] || '日报'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 36, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {report.todayWork?.split('\n')[0] || '暂无内容'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Report detail */}
      <div style={{ flex: 1, overflow: 'auto', background: '#f7f8fa', padding: '24px 32px' }}>
        {selectedReport ? (
          <ReportDetail report={selectedReport} users={state.users} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
              <div>选择日志查看详情</div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => setShowCreate(true)}
              >
                写日志
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateReportModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}

function ReportDetail({ report, users }) {
  const author = users.find(u => u.id === report.authorId)
  const recipients = (report.recipientIds || []).map(id => users.find(u => u.id === id)).filter(Boolean)
  const readUsers = (report.readBy || []).map(id => users.find(u => u.id === id)).filter(Boolean)
  const unreadUsers = recipients.filter(u => !report.readBy.includes(u.id))

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--border)', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div className="avatar-circle" style={{ width: 44, height: 44, fontSize: 16, background: author?.avatar || '#ccc' }}>
            {author?.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {author?.name} 的{REPORT_TYPES[report.type] || '日报'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {formatDate(report.createdAt)} · {author?.department || ''}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>
            {report.type === 'weekly' ? '本周完成工作' : '今日完成工作'}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', background: '#FAFAFA', padding: '12px 16px', borderRadius: 6, border: '1px solid #f0f0f0' }}>
            {report.todayWork || '无'}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#52C41A', marginBottom: 8 }}>
            {report.type === 'weekly' ? '下周工作计划' : '明日工作计划'}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', background: '#FAFAFA', padding: '12px 16px', borderRadius: 6, border: '1px solid #f0f0f0' }}>
            {report.tomorrowPlan || '无'}
          </div>
        </div>

        {report.problems && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#FA8C16', marginBottom: 8 }}>
              遇到的问题
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-primary)', background: '#FAFAFA', padding: '12px 16px', borderRadius: 6, border: '1px solid #f0f0f0' }}>
              {report.problems}
            </div>
          </div>
        )}

        {/* Read status */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>阅读状态</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: '#52C41A', marginBottom: 6 }}>已读 ({readUsers.length})</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {readUsers.map(u => (
                  <div key={u.id} className="avatar-circle" style={{ width: 24, height: 24, fontSize: 10, background: u.avatar }} title={u.name}>
                    {u.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
            {unreadUsers.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>未读 ({unreadUsers.length})</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {unreadUsers.map(u => (
                    <div key={u.id} className="avatar-circle" style={{ width: 24, height: 24, fontSize: 10, background: u.avatar, opacity: 0.5 }} title={u.name}>
                      {u.name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateReportModal({ onClose }) {
  const { state, dispatch } = useApp()
  const [reportType, setReportType] = useState('daily')
  const [todayWork, setTodayWork] = useState('')
  const [tomorrowPlan, setTomorrowPlan] = useState('')
  const [problems, setProblems] = useState('')
  const [recipientIds, setRecipientIds] = useState(['user_005'])

  const others = state.users.filter(u => !u.isCurrentUser)

  const toggleRecipient = (id) => {
    setRecipientIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (!todayWork.trim()) return
    dispatch({
      type: 'CREATE_DAILY_REPORT',
      report: {
        type: reportType,
        todayWork: todayWork.trim(),
        tomorrowPlan: tomorrowPlan.trim(),
        problems: problems.trim(),
        recipientIds,
      }
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3>写日志</h3>
          <button onClick={onClose} style={{ fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {/* Report type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>日志类型</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { key: 'daily', label: '日报' },
                { key: 'weekly', label: '周报' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setReportType(t.key)}
                  style={{
                    padding: '6px 20px', borderRadius: 4, fontSize: 13,
                    border: `1px solid ${reportType === t.key ? 'var(--primary)' : 'var(--border)'}`,
                    background: reportType === t.key ? 'var(--primary-light)' : 'white',
                    color: reportType === t.key ? 'var(--primary)' : 'var(--text-primary)',
                    cursor: 'pointer', fontWeight: reportType === t.key ? 600 : 400,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Today's work */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {reportType === 'weekly' ? '本周完成工作 *' : '今日完成工作 *'}
            </label>
            <textarea
              value={todayWork}
              onChange={e => setTodayWork(e.target.value)}
              placeholder={reportType === 'weekly' ? '请描述本周完成的主要工作...' : '请描述今天完成的主要工作...'}
              className="form-textarea"
              style={{ minHeight: 100 }}
            />
          </div>

          {/* Tomorrow's plan */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {reportType === 'weekly' ? '下周工作计划' : '明日工作计划'}
            </label>
            <textarea
              value={tomorrowPlan}
              onChange={e => setTomorrowPlan(e.target.value)}
              placeholder="请描述计划..."
              className="form-textarea"
              style={{ minHeight: 80 }}
            />
          </div>

          {/* Problems */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>遇到的问题</label>
            <textarea
              value={problems}
              onChange={e => setProblems(e.target.value)}
              placeholder="需要协助解决的问题（可选）"
              className="form-textarea"
              style={{ minHeight: 60 }}
            />
          </div>

          {/* Recipients */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>发送给</label>
            <div style={{ maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 4 }}>
              {others.map(u => (
                <div
                  key={u.id}
                  onClick={() => toggleRecipient(u.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                    cursor: 'pointer',
                    background: recipientIds.includes(u.id) ? '#E6F7FF' : 'transparent',
                  }}
                >
                  <input type="checkbox" checked={recipientIds.includes(u.id)} onChange={() => {}} style={{ width: 14, height: 14 }} />
                  <div className="avatar-circle" style={{ width: 24, height: 24, fontSize: 10, background: u.avatar }}>{u.name.charAt(0)}</div>
                  <span style={{ fontSize: 13 }}>{u.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{u.title}</span>
                </div>
              ))}
            </div>
            {recipientIds.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                已选 {recipientIds.length} 人
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!todayWork.trim()}>提交</button>
        </div>
      </div>
    </div>
  )
}
