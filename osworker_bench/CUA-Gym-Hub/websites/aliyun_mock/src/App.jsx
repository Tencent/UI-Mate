import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'

import Go from './pages/Go'
import ConsoleDashboard from './pages/ConsoleDashboard'
import ECSInstanceList from './pages/ECSInstanceList'
import ECSInstanceDetail from './pages/ECSInstanceDetail'
import ECSDisks from './pages/ECSDisks'
import ECSImages from './pages/ECSImages'
import ECSKeyPairs from './pages/ECSKeyPairs'
import SecurityGroupList from './pages/SecurityGroupList'
import SecurityGroupDetail from './pages/SecurityGroupDetail'
import OSSBucketList from './pages/OSSBucketList'
import OSSBucketDetail from './pages/OSSBucketDetail'
import RDSInstanceList from './pages/RDSInstanceList'
import RDSInstanceDetail from './pages/RDSInstanceDetail'
import VPCList from './pages/VPCList'
import VSwitchList from './pages/VSwitchList'
import SLBInstanceList from './pages/SLBInstanceList'
import SLBInstanceDetail from './pages/SLBInstanceDetail'
import BillingOverview from './pages/BillingOverview'
import BillingBills from './pages/BillingBills'
import MonitorAlarms from './pages/MonitorAlarms'
import TicketList from './pages/TicketList'
import TicketDetail from './pages/TicketDetail'
import TicketCreate from './pages/TicketCreate'
import AccountSettings from './pages/AccountSettings'
import SecuritySettings from './pages/SecuritySettings'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route path="/" element={<Layout><ConsoleDashboard /></Layout>} />

      <Route path="/ecs" element={<RedirectWithQuery to="/ecs/instances" />} />
      <Route path="/ecs/instances" element={<Layout><ECSInstanceList /></Layout>} />
      <Route path="/ecs/instances/:id" element={<Layout><ECSInstanceDetail /></Layout>} />
      <Route path="/ecs/disks" element={<Layout><ECSDisks /></Layout>} />
      <Route path="/ecs/images" element={<Layout><ECSImages /></Layout>} />
      <Route path="/ecs/key-pairs" element={<Layout><ECSKeyPairs /></Layout>} />
      <Route path="/ecs/security-groups" element={<Layout><SecurityGroupList /></Layout>} />
      <Route path="/ecs/security-groups/:id" element={<Layout><SecurityGroupDetail /></Layout>} />

      <Route path="/oss" element={<RedirectWithQuery to="/oss/buckets" />} />
      <Route path="/oss/buckets" element={<Layout><OSSBucketList /></Layout>} />
      <Route path="/oss/buckets/:name" element={<Layout><OSSBucketDetail /></Layout>} />

      <Route path="/rds" element={<RedirectWithQuery to="/rds/instances" />} />
      <Route path="/rds/instances" element={<Layout><RDSInstanceList /></Layout>} />
      <Route path="/rds/instances/:id" element={<Layout><RDSInstanceDetail /></Layout>} />

      <Route path="/vpc" element={<RedirectWithQuery to="/vpc/list" />} />
      <Route path="/vpc/list" element={<Layout><VPCList /></Layout>} />
      <Route path="/vpc/vswitches" element={<Layout><VSwitchList /></Layout>} />

      <Route path="/slb" element={<RedirectWithQuery to="/slb/instances" />} />
      <Route path="/slb/instances" element={<Layout><SLBInstanceList /></Layout>} />
      <Route path="/slb/instances/:id" element={<Layout><SLBInstanceDetail /></Layout>} />

      <Route path="/billing" element={<RedirectWithQuery to="/billing/overview" />} />
      <Route path="/billing/overview" element={<Layout><BillingOverview /></Layout>} />
      <Route path="/billing/bills" element={<Layout><BillingBills /></Layout>} />

      <Route path="/monitor" element={<RedirectWithQuery to="/monitor/alarms" />} />
      <Route path="/monitor/alarms" element={<Layout><MonitorAlarms /></Layout>} />

      <Route path="/tickets" element={<Layout><TicketList /></Layout>} />
      <Route path="/tickets/create" element={<Layout><TicketCreate /></Layout>} />
      <Route path="/tickets/:id" element={<Layout><TicketDetail /></Layout>} />

      <Route path="/account" element={<RedirectWithQuery to="/account/settings" />} />
      <Route path="/account/settings" element={<Layout><AccountSettings /></Layout>} />
      <Route path="/account/security" element={<Layout><SecuritySettings /></Layout>} />

      <Route path="*" element={<RedirectWithQuery to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
