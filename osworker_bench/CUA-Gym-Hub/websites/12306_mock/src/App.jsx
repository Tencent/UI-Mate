import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookingPage from './pages/BookingPage';
import OrderListPage from './pages/OrderListPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PassengersPage from './pages/PassengersPage';
import MyPage from './pages/MyPage';
import TrainDetailPage from './pages/TrainDetailPage';
import WaitlistPage from './pages/WaitlistPage';
import FoodOrderPage from './pages/FoodOrderPage';
import PassTicketsPage from './pages/PassTicketsPage';
import TravelPage from './pages/TravelPage';
import MembershipPage from './pages/MembershipPage';
import StationServicesPage from './pages/StationServicesPage';
import ServiceCenterPage from './pages/ServiceCenterPage';
import FAQPage from './pages/FAQPage';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/booking/:trainNo" element={<BookingPage />} />
      <Route path="/orders" element={<OrderListPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      <Route path="/passengers" element={<PassengersPage />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/train/:trainNo" element={<TrainDetailPage />} />
      <Route path="/waitlist" element={<WaitlistPage />} />
      <Route path="/food-order" element={<FoodOrderPage />} />
      <Route path="/pass-tickets" element={<PassTicketsPage />} />
      <Route path="/travel" element={<TravelPage />} />
      <Route path="/membership" element={<MembershipPage />} />
      <Route path="/station-services" element={<StationServicesPage />} />
      <Route path="/service-center" element={<ServiceCenterPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/go" element={<Go />} />
      <Route path="*" element={<RedirectWithQuery to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
