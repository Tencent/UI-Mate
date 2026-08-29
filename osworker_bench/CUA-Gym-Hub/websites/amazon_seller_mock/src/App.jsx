import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/AppLayout';
import Go from './pages/Go';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Inventory from './pages/Inventory';
import FBAInventory from './pages/FBAInventory';
import InventoryPlanning from './pages/InventoryPlanning';
import FBAShipments from './pages/FBAShipments';
import ProductForm from './pages/ProductForm';
import Pricing from './pages/Pricing';
import AutomatePricing from './pages/AutomatePricing';
import Advertising from './pages/Advertising';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import Messages from './pages/Messages';
import Returns from './pages/Returns';
import AccountHealth from './pages/AccountHealth';
import Feedback from './pages/Feedback';
import BusinessReports from './pages/BusinessReports';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import NotificationPrefs from './pages/NotificationPrefs';
import ShippingSettings from './pages/ShippingSettings';
import InsightsPage from './pages/InsightsPage';
import AccountInfo from './pages/AccountInfo';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
      <Route path="/inventory/fba" element={<AppLayout><FBAInventory /></AppLayout>} />
      <Route path="/inventory/planning" element={<AppLayout><InventoryPlanning /></AppLayout>} />
      <Route path="/inventory/shipments" element={<AppLayout><FBAShipments /></AppLayout>} />
      <Route path="/catalog/add-product" element={<AppLayout><ProductForm mode="add" /></AppLayout>} />
      <Route path="/catalog/edit-product/:id" element={<AppLayout><ProductForm mode="edit" /></AppLayout>} />
      <Route path="/pricing" element={<AppLayout><Pricing /></AppLayout>} />
      <Route path="/pricing/automate" element={<AppLayout><AutomatePricing /></AppLayout>} />
      <Route path="/orders" element={<AppLayout><Orders /></AppLayout>} />
      <Route path="/orders/reports" element={<AppLayout><InsightsPage title="Order Reports" /></AppLayout>} />
      <Route path="/orders/:id" element={<AppLayout><OrderDetail /></AppLayout>} />
      <Route path="/returns" element={<AppLayout><Returns /></AppLayout>} />
      <Route path="/advertising" element={<AppLayout><Advertising /></AppLayout>} />
      <Route path="/advertising/create" element={<AppLayout><CreateCampaign /></AppLayout>} />
      <Route path="/advertising/:id" element={<AppLayout><CampaignDetail /></AppLayout>} />
      <Route path="/reports" element={<AppLayout><BusinessReports /></AppLayout>} />
      <Route path="/reports/advertising" element={<AppLayout><InsightsPage title="Advertising Reports" /></AppLayout>} />
      <Route path="/payments" element={<AppLayout><Payments /></AppLayout>} />
      <Route path="/account-health" element={<AppLayout><AccountHealth /></AppLayout>} />
      <Route path="/feedback" element={<AppLayout><Feedback /></AppLayout>} />
      <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
      <Route path="/messages/:threadId" element={<AppLayout><Messages /></AppLayout>} />
      <Route path="/account-info" element={<AppLayout><AccountInfo /></AppLayout>} />
      <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
      <Route path="/settings/notifications" element={<AppLayout><NotificationPrefs /></AppLayout>} />
      <Route path="/settings/shipping" element={<AppLayout><ShippingSettings /></AppLayout>} />
      <Route path="/stores" element={<AppLayout><InsightsPage title="Manage Stores" /></AppLayout>} />
      <Route path="/growth" element={<AppLayout><InsightsPage title="Growth Opportunities" /></AppLayout>} />
      <Route path="/performance/voc" element={<AppLayout><InsightsPage title="Voice of the Customer" /></AppLayout>} />
      <Route path="/b2b" element={<AppLayout><InsightsPage title="B2B Central" /></AppLayout>} />
      <Route path="/brands" element={<AppLayout><InsightsPage title="Brand Dashboard" /></AppLayout>} />
      <Route path="*" element={<RedirectWithQuery to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
