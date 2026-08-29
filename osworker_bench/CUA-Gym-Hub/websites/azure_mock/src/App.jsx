import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Go from './pages/Go';
import AllResources from './pages/AllResources';
import ResourceGroups from './pages/ResourceGroups';
import ResourceGroupDetail from './pages/ResourceGroupDetail';
import VirtualMachines from './pages/VirtualMachines';
import VirtualMachineDetail from './pages/VirtualMachineDetail';
import CreateVM from './pages/CreateVM';
import StorageAccounts from './pages/StorageAccounts';
import StorageAccountDetail from './pages/StorageAccountDetail';
import CreateStorageAccount from './pages/CreateStorageAccount';
import AppServices from './pages/AppServices';
import AppServiceDetail from './pages/AppServiceDetail';
import SqlDatabases from './pages/SqlDatabases';
import SqlDatabaseDetail from './pages/SqlDatabaseDetail';
import CreateResourceGroup from './pages/CreateResourceGroup';
import VirtualNetworks from './pages/VirtualNetworks';
import VirtualNetworkDetail from './pages/VirtualNetworkDetail';
import NetworkSecurityGroups from './pages/NetworkSecurityGroups';
import NsgDetail from './pages/NsgDetail';
import Subscriptions from './pages/Subscriptions';
import SubscriptionDetail from './pages/SubscriptionDetail';
import CostManagement from './pages/CostManagement';
import CostAnalysis from './pages/CostAnalysis';
import CostBudgets from './pages/CostBudgets';
import AllServices from './pages/AllServices';
import ActivityLog from './pages/ActivityLog';
import CreateResource from './pages/CreateResource';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';

export default function App() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const menuBehavior = state.portalSettings.menuBehavior;
  const isDocked = menuBehavior === 'docked';
  const [sidebarOpen, setSidebarOpen] = useState(isDocked);
  const prevMenuBehavior = useRef(menuBehavior);
  const startupApplied = useRef(false);

  // Apply theme to document root
  useEffect(() => {
    const theme = state.portalSettings.theme;
    document.documentElement.setAttribute('data-theme', theme);
  }, [state.portalSettings.theme]);

  // Sync sidebar when menu behavior setting changes
  useEffect(() => {
    if (prevMenuBehavior.current !== menuBehavior) {
      prevMenuBehavior.current = menuBehavior;
      setSidebarOpen(menuBehavior === 'docked');
    }
  }, [menuBehavior]);

  // Apply startup page on first load
  useEffect(() => {
    if (startupApplied.current) return;
    startupApplied.current = true;
    const startupPage = state.portalSettings.startupPage;
    if (location.pathname === '/' && startupPage && startupPage !== 'home') {
      const pathMap = { dashboard: '/dashboard', 'all-resources': '/all-resources' };
      if (pathMap[startupPage]) navigate(pathMap[startupPage], { replace: true });
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => { if (!isDocked) setSidebarOpen(false); };

  return (
    <div className="app-layout">
      <Header onToggleSidebar={toggleSidebar} />
      {sidebarOpen && (
        <>
          <Sidebar onClose={closeSidebar} isDocked={isDocked} />
          {!isDocked && <div className="overlay-backdrop" onClick={closeSidebar} />}
        </>
      )}
      <div className="app-body">
        <main className={`main-content ${sidebarOpen && isDocked ? 'with-sidebar' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/all-resources" element={<AllResources />} />
            <Route path="/resource-groups" element={<ResourceGroups />} />
            <Route path="/resource-groups/create" element={<CreateResourceGroup />} />
            <Route path="/resource-groups/:name" element={<ResourceGroupDetail />} />
            <Route path="/virtual-machines" element={<VirtualMachines />} />
            <Route path="/virtual-machines/create" element={<CreateVM />} />
            <Route path="/virtual-machines/:id" element={<VirtualMachineDetail />} />
            <Route path="/storage-accounts" element={<StorageAccounts />} />
            <Route path="/storage-accounts/create" element={<CreateStorageAccount />} />
            <Route path="/storage-accounts/:id" element={<StorageAccountDetail />} />
            <Route path="/app-services" element={<AppServices />} />
            <Route path="/app-services/:id" element={<AppServiceDetail />} />
            <Route path="/sql-databases" element={<SqlDatabases />} />
            <Route path="/sql-databases/:id" element={<SqlDatabaseDetail />} />
            <Route path="/virtual-networks" element={<VirtualNetworks />} />
            <Route path="/virtual-networks/:id" element={<VirtualNetworkDetail />} />
            <Route path="/network-security-groups" element={<NetworkSecurityGroups />} />
            <Route path="/network-security-groups/:id" element={<NsgDetail />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/subscriptions/:id" element={<SubscriptionDetail />} />
            <Route path="/cost-management" element={<CostManagement />} />
            <Route path="/cost-management/cost-analysis" element={<CostAnalysis />} />
            <Route path="/cost-management/budgets" element={<CostBudgets />} />
            <Route path="/all-services" element={<AllServices />} />
            <Route path="/activity-log" element={<ActivityLog />} />
            <Route path="/create-resource" element={<CreateResource />} />
            <Route path="/go" element={<Go />} />
            <Route path="*" element={<Placeholder title="Page Not Found" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
