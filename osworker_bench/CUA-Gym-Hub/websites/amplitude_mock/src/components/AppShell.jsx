import TopBar from './TopBar'
import Sidebar from './Sidebar'
import { useApp } from '../context/AppContext'
import './AppShell.css'

export default function AppShell({ children }) {
  const { state, dispatch } = useApp()
  const expanded = state.ui.sidebarExpanded

  return (
    <div className="appshell">
      <TopBar onToggleSidebar={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} />
      <Sidebar />
      <main className={`appshell-main ${expanded ? 'main-expanded' : 'main-collapsed'}`}>
        {children}
      </main>
    </div>
  )
}
