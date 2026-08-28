import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Overview from './pages/Overview.jsx'
import Campaigns from './pages/Campaigns.jsx'
import CampaignDetail from './pages/CampaignDetail.jsx'
import AdGroupDetail from './pages/AdGroupDetail.jsx'
import AllAdGroups from './pages/AllAdGroups.jsx'
import AllAds from './pages/AllAds.jsx'
import AllKeywords from './pages/AllKeywords.jsx'
import Recommendations from './pages/Recommendations.jsx'
import SearchTerms from './pages/SearchTerms.jsx'
import Dashboards from './pages/Dashboards.jsx'
import Settings from './pages/Settings.jsx'
import Goals from './pages/Goals.jsx'
import Tools from './pages/Tools.jsx'
import Billing from './pages/Billing.jsx'
import Go from './pages/Go.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/go" element={<Go />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
          <Route path="/campaigns/:campaignId/ad-groups/:adGroupId" element={<AdGroupDetail />} />
          <Route path="/ad-groups" element={<AllAdGroups />} />
          <Route path="/ads" element={<AllAds />} />
          <Route path="/keywords" element={<AllKeywords />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/insights/search-terms" element={<SearchTerms />} />
          <Route path="/insights/dashboards" element={<Dashboards />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
