import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import Layout from './components/Layout.jsx'

import Dashboard from './pages/Dashboard.jsx'
import PersonalInfo from './pages/PersonalInfo.jsx'
import PayStatements from './pages/PayStatements.jsx'
import PayStatementDetail from './pages/PayStatementDetail.jsx'
import TaxDocuments from './pages/TaxDocuments.jsx'
import DirectDeposit from './pages/DirectDeposit.jsx'
import Timecard from './pages/Timecard.jsx'
import Schedule from './pages/Schedule.jsx'
import Attendance from './pages/Attendance.jsx'
import TimeOff from './pages/TimeOff.jsx'
import TimeOffRequest from './pages/TimeOffRequest.jsx'
import TimeOffHistory from './pages/TimeOffHistory.jsx'
import HolidayCalendar from './pages/HolidayCalendar.jsx'
import Benefits from './pages/Benefits.jsx'
import Dependents from './pages/Dependents.jsx'
import MyTeam from './pages/MyTeam.jsx'
import TeamApprovals from './pages/TeamApprovals.jsx'
import EmployeeDirectory from './pages/EmployeeDirectory.jsx'
import OrgChart from './pages/OrgChart.jsx'
import Payroll from './pages/Payroll.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import Go from './pages/Go.jsx'

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/myself/info" element={<PersonalInfo />} />
        <Route path="/myself/pay" element={<PayStatements />} />
        <Route path="/myself/pay/:id" element={<PayStatementDetail />} />
        <Route path="/myself/tax" element={<TaxDocuments />} />
        <Route path="/myself/direct-deposit" element={<DirectDeposit />} />
        <Route path="/myself/time" element={<Timecard />} />
        <Route path="/myself/schedule" element={<Schedule />} />
        <Route path="/myself/attendance" element={<Attendance />} />
        <Route path="/myself/timeoff" element={<TimeOff />} />
        <Route path="/myself/timeoff/request" element={<TimeOffRequest />} />
        <Route path="/myself/timeoff/history" element={<TimeOffHistory />} />
        <Route path="/myself/timeoff/holidays" element={<HolidayCalendar />} />
        <Route path="/myself/benefits" element={<Benefits />} />
        <Route path="/myself/dependents" element={<Dependents />} />
        <Route path="/people" element={<EmployeeDirectory />} />
        <Route path="/people/org-chart" element={<OrgChart />} />
        <Route path="/my-team" element={<MyTeam />} />
        <Route path="/my-team/approvals" element={<TeamApprovals />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/go" element={<Go />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  )
}
