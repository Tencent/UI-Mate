import Sidebar from './Sidebar'
import TopBar from './TopBar'

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{
          marginTop: 'var(--topbar-height)',
          flex: 1,
          background: 'var(--light-gray)',
          minHeight: 'calc(100vh - var(--topbar-height))',
          display: 'flex',
          justifyContent: 'flex-start',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
