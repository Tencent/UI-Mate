import { Outlet, useParams } from 'react-router-dom'
import TopBar from './TopBar.jsx'
import Sidebar from './Sidebar.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function Layout({ noSidebar }) {
  const { group, project } = useParams()
  const { state } = useApp()
  const currentProject = (group && project)
    ? state.projects.find(p => p.fullPath === `${group}/${project}`)
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!noSidebar && currentProject && (
          <Sidebar project={currentProject} group={group} projectPath={project} />
        )}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--gl-bg-primary)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
