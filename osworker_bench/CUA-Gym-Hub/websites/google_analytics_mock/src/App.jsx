import { Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ReportsSnapshot from './pages/ReportsSnapshot';
import Realtime from './pages/Realtime';
import AcquisitionOverview from './pages/AcquisitionOverview';
import UserAcquisition from './pages/UserAcquisition';
import TrafficAcquisition from './pages/TrafficAcquisition';
import EngagementOverview from './pages/EngagementOverview';
import EventsReport from './pages/EventsReport';
import PagesAndScreens from './pages/PagesAndScreens';
import ConversionsReport from './pages/ConversionsReport';
import RetentionReport from './pages/RetentionReport';
import DemographicsOverview from './pages/DemographicsOverview';
import TechOverview from './pages/TechOverview';
import ExploreGallery from './pages/ExploreGallery';
import FreeFormExploration from './pages/FreeFormExploration';
import AdvertisingOverview from './pages/AdvertisingOverview';
import AdminPage from './pages/AdminPage';
import AdminPropertySettings from './pages/AdminPropertySettings';
import AdminDataStreams from './pages/AdminDataStreams';
import AdminEvents from './pages/AdminEvents';
import AdminCustomDefinitions from './pages/AdminCustomDefinitions';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<RedirectWithQuery to="/reports/snapshot" />} />
        <Route path="/reports/snapshot" element={<ReportsSnapshot />} />
        <Route path="/reports/realtime" element={<Realtime />} />
        <Route path="/reports/acquisition" element={<AcquisitionOverview />} />
        <Route path="/reports/acquisition/user-acquisition" element={<UserAcquisition />} />
        <Route path="/reports/acquisition/traffic-acquisition" element={<TrafficAcquisition />} />
        <Route path="/reports/engagement" element={<EngagementOverview />} />
        <Route path="/reports/engagement/events" element={<EventsReport />} />
        <Route path="/reports/engagement/pages" element={<PagesAndScreens />} />
        <Route path="/reports/engagement/conversions" element={<ConversionsReport />} />
        <Route path="/reports/retention" element={<RetentionReport />} />
        <Route path="/reports/user/demographics" element={<DemographicsOverview />} />
        <Route path="/reports/user/tech" element={<TechOverview />} />
        <Route path="/explore" element={<ExploreGallery />} />
        <Route path="/explore/:id" element={<FreeFormExploration />} />
        <Route path="/advertising" element={<AdvertisingOverview />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/property-settings" element={<AdminPropertySettings />} />
        <Route path="/admin/data-streams" element={<AdminDataStreams />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/custom-definitions" element={<AdminCustomDefinitions />} />
      </Route>
    </Routes>
  );
}
