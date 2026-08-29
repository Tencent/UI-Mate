import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import AccountHome from './pages/AccountHome'
import ZoneOverview from './pages/ZoneOverview'
import DnsPage from './pages/DnsPage'
import SslTlsPage from './pages/SslTlsPage'
import EdgeCertificatesPage from './pages/EdgeCertificatesPage'
import SecurityPage from './pages/SecurityPage'
import WafPage from './pages/WafPage'
import SpeedOptimizationPage from './pages/SpeedOptimizationPage'
import CachingConfigPage from './pages/CachingConfigPage'
import PageRulesPage from './pages/PageRulesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import WorkersPage from './pages/WorkersPage'
import NetworkPage from './pages/NetworkPage'
import ScrapeShieldPage from './pages/ScrapeShieldPage'
import GoPage from './pages/GoPage'
import NotFoundPage from './pages/NotFoundPage'
import DnsSettingsPage from './pages/DnsSettingsPage'
import DdosProtectionPage from './pages/DdosProtectionPage'
import SecuritySettingsPage from './pages/SecuritySettingsPage'
import RedirectRulesPage from './pages/RedirectRulesPage'
import TransformRulesPage from './pages/TransformRulesPage'
import EmailRoutingPage from './pages/EmailRoutingPage'
import AddSiteModal from './components/AddSiteModal'
import './App.css'

function ZoneLayout() {
  const { zoneId } = useParams()
  const [showAddSite, setShowAddSite] = useState(false)

  return (
    <div className="app-layout">
      <TopBar onAddSite={() => setShowAddSite(true)} />
      <div className="zone-layout">
        <Sidebar zoneId={zoneId} />
        <main className="zone-content">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ZoneOverview />} />
            <Route path="analytics" element={<Navigate to="traffic" replace />} />
            <Route path="analytics/:tab" element={<AnalyticsPage />} />
            <Route path="dns" element={<DnsPage />} />
            <Route path="dns/settings" element={<DnsSettingsPage />} />
            <Route path="ssl-tls" element={<SslTlsPage />} />
            <Route path="ssl-tls/edge-certificates" element={<EdgeCertificatesPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="security/waf" element={<WafPage />} />
            <Route path="security/bots" element={<SecurityPage tab="bots" />} />
            <Route path="security/ddos" element={<DdosProtectionPage />} />
            <Route path="security/settings" element={<SecuritySettingsPage />} />
            <Route path="speed" element={<SpeedOptimizationPage />} />
            <Route path="speed/optimization" element={<SpeedOptimizationPage />} />
            <Route path="caching" element={<CachingConfigPage />} />
            <Route path="caching/configuration" element={<CachingConfigPage />} />
            <Route path="caching/rules" element={<CachingConfigPage />} />
            <Route path="rules/page-rules" element={<PageRulesPage />} />
            <Route path="rules/redirect-rules" element={<RedirectRulesPage />} />
            <Route path="rules/transform-rules" element={<TransformRulesPage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="scrape-shield" element={<ScrapeShieldPage />} />
            <Route path="email" element={<EmailRoutingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      {showAddSite && <AddSiteModal onClose={() => setShowAddSite(false)} />}
    </div>
  )
}

function AccountLayout() {
  const [showAddSite, setShowAddSite] = useState(false)

  return (
    <div className="app-layout">
      <TopBar onAddSite={() => setShowAddSite(true)} />
      <main className="account-content">
        <AccountHome onAddSite={() => setShowAddSite(true)} />
      </main>
      {showAddSite && <AddSiteModal onClose={() => setShowAddSite(false)} />}
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/go" element={<GoPage />} />
      <Route path="/" element={<AccountLayout />} />
      <Route path="/:zoneId/*" element={<ZoneLayout />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
