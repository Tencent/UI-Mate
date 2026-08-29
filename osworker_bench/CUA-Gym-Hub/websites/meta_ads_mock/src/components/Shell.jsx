import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useApp } from '../context/AppContext';
import './Shell.css';

export default function Shell() {
  const { state } = useApp();
  const collapsed = state.sidebarCollapsed;

  return (
    <div className="shell">
      <TopBar />
      <Sidebar />
      <main className={`shell-main ${collapsed ? 'shell-main--collapsed' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
