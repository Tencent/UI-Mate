import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ApprovalList from '../components/ApprovalList'
import ApprovalDetail from '../components/ApprovalDetail'
import TodoPage from './TodoPage'
import AttendancePage from './AttendancePage'
import AnnouncementsPage from './AnnouncementsPage'
import DailyReportPage from './DailyReportPage'
import MeetingPage from './MeetingPage'
import DocsPage from './DocsPage'
import './WorkbenchPage.css'

export default function WorkbenchPage({ section }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { id: approvalId } = useParams()
  const sid = searchParams.get('sid')
  const getPath = (p) => sid ? `${p}?sid=${sid}` : p

  const categories = ['OA', '效率', '协作', '通讯']

  const handleAppClick = (app) => {
    if (app.route) navigate(getPath(app.route))
  }

  const renderContent = () => {
    if (!section) {
      return (
        <div className="workbench-main">
          <div className="workbench-frequent">
            <div className="wb-section-title">常用应用</div>
            <div className="wb-apps-row">
              {state.workbenchApps.slice(0, 6).map(app => (
                <AppCard key={app.id} app={app} onClick={() => handleAppClick(app)} />
              ))}
            </div>
          </div>
          <div className="wb-separator" />
          <div className="wb-section-title" style={{ padding: '12px 20px 0' }}>全部应用</div>
          {categories.map(cat => {
            const apps = state.workbenchApps.filter(a => a.category === cat)
            if (!apps.length) return null
            return (
              <div key={cat} style={{ padding: '0 20px 12px' }}>
                <div className="wb-category-label">{cat}</div>
                <div className="wb-apps-grid">
                  {apps.map(app => (
                    <AppCard key={app.id} app={app} onClick={() => handleAppClick(app)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )
    }
    if (section === 'approval') return <ApprovalList />
    if (section === 'approval-detail') return <ApprovalDetail id={approvalId} />
    if (section === 'todo') return <TodoPage />
    if (section === 'attendance') return <AttendancePage />
    if (section === 'announcements') return <AnnouncementsPage />
    if (section === 'log') return <DailyReportPage />
    if (section === 'meeting') return <MeetingPage />
    if (section === 'docs') return <DocsPage />
    if (section === 'report') return <DailyReportPage />
    return <DailyReportPage />
  }

  return (
    <div className="workbench-page">
      {/* Middle panel */}
      <div className="list-panel">
        <div className="list-panel-header">
          <span style={{ fontWeight: 600, fontSize: 15 }}>工作台</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <div
            className={`wb-nav-item ${!section ? 'wb-nav-active' : ''}`}
            onClick={() => navigate(getPath('/workbench'))}
          >
            🔧 应用总览
          </div>
          <div className="wb-nav-group-label">OA办公</div>
          {state.workbenchApps.filter(a => a.category === 'OA').map(app => (
            <div
              key={app.id}
              className={`wb-nav-item ${section === app.route.split('/').pop() ? 'wb-nav-active' : ''}`}
              onClick={() => handleAppClick(app)}
            >
              <span>{app.icon}</span>
              <span>{app.name}</span>
              {app.badge > 0 && <span className="badge" style={{ marginLeft: 'auto' }}>{app.badge}</span>}
            </div>
          ))}
          <div className="wb-nav-group-label">效率工具</div>
          {state.workbenchApps.filter(a => a.category === '效率').map(app => (
            <div key={app.id} className={`wb-nav-item ${section === app.route.split('/').pop() ? 'wb-nav-active' : ''}`} onClick={() => handleAppClick(app)}>
              <span>{app.icon}</span>
              <span>{app.name}</span>
              {app.badge > 0 && <span className="badge" style={{ marginLeft: 'auto' }}>{app.badge}</span>}
            </div>
          ))}
          <div className="wb-nav-group-label">协作工具</div>
          {state.workbenchApps.filter(a => a.category === '协作').map(app => (
            <div key={app.id} className={`wb-nav-item ${section === app.route.split('/').pop() ? 'wb-nav-active' : ''}`} onClick={() => handleAppClick(app)}>
              <span>{app.icon}</span>
              <span>{app.name}</span>
              {app.badge > 0 && <span className="badge" style={{ marginLeft: 'auto' }}>{app.badge}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Right content */}
      <div className="chat-panel" style={{ background: '#f7f8fa', overflow: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  )
}

function AppCard({ app, onClick }) {
  return (
    <div className="app-card" onClick={onClick}>
      <div className="app-card-icon" style={{ background: app.color }}>
        {app.icon}
        {app.badge > 0 && <span className="app-badge">{app.badge}</span>}
      </div>
      <div className="app-card-name">{app.name}</div>
    </div>
  )
}
