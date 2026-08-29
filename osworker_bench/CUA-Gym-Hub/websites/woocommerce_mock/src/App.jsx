import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import AdminBar from './components/AdminBar'
import Sidebar from './components/Sidebar'
import ActivityPanel from './components/ActivityPanel'
import './styles/wp-admin.css'

// Pages
import Go from './pages/Go'
import Dashboard from './pages/Dashboard'
import OrdersList from './pages/OrdersList'
import OrderDetail from './pages/OrderDetail'
import ProductsList from './pages/ProductsList'
import ProductEdit from './pages/ProductEdit'
import CustomersList from './pages/CustomersList'
import CustomerDetail from './pages/CustomerDetail'
import AnalyticsRevenue from './pages/AnalyticsRevenue'
import { AnalyticsOrders, AnalyticsProducts, AnalyticsCategories } from './pages/AnalyticsPages'
import { AnalyticsCoupons, AnalyticsTaxes, AnalyticsDownloads, AnalyticsStock, AnalyticsCustomers, AnalyticsSettings as AnalyticsSettingsPage } from './pages/AnalyticsExtra'
import { SettingsGeneral, SettingsProducts, SettingsTax, SettingsShipping, SettingsPayments, SettingsAccounts, SettingsEmails } from './pages/Settings'
import CouponsList from './pages/CouponsList'
import AddEditCoupon from './pages/AddEditCoupon'
import { ProductCategories, ProductTags } from './pages/ProductTaxonomy'
import PlaceholderPage from './pages/PlaceholderPage'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

const WC_PAGES = ['/', '/orders', '/customers', '/products', '/analytics', '/coupons', '/settings']

function isWCPage(path) {
  return WC_PAGES.some(p => path === p || path.startsWith(p + '/') || path.startsWith(p + '?'))
}

function getBreadcrumb(pathname) {
  if (pathname === '/') return 'XooCommerce / Home'
  if (pathname.startsWith('/orders')) return 'XooCommerce / Orders'
  if (pathname.startsWith('/products')) return 'XooCommerce / Products'
  if (pathname.startsWith('/customers')) return 'XooCommerce / Customers'
  if (pathname.startsWith('/analytics/revenue')) return 'XooCommerce / Analytics / Revenue'
  if (pathname.startsWith('/analytics/orders')) return 'XooCommerce / Analytics / Orders'
  if (pathname.startsWith('/analytics/categories')) return 'XooCommerce / Analytics / Categories'
  if (pathname.startsWith('/analytics/products')) return 'XooCommerce / Analytics / Products'
  if (pathname.startsWith('/analytics')) return 'XooCommerce / Analytics'
  if (pathname.startsWith('/settings')) return 'XooCommerce / Settings'
  if (pathname.startsWith('/coupons')) return 'XooCommerce / Coupons'
  return 'XooCommerce'
}

function AppLayout() {
  const { state } = useApp()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('wc_sidebar_collapsed') === 'true'
  })

  const toggleSidebar = () => {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    localStorage.setItem('wc_sidebar_collapsed', String(next))
  }

  const showActivityPanel = isWCPage(location.pathname)
  const breadcrumb = getBreadcrumb(location.pathname)

  return (
    <div className="wp-app">
      <AdminBar currentUser={state.currentUser} storeName={state.store.name} />
      <div className="wp-main">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        <div className={`wp-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {showActivityPanel && <ActivityPanel breadcrumb={breadcrumb} />}
          <div className="wp-page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/orders/:orderId" element={<OrderDetail />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/new" element={<ProductEdit />} />
              <Route path="/products/categories" element={<ProductCategories />} />
              <Route path="/products/tags" element={<ProductTags />} />
              <Route path="/products/:productId" element={<ProductEdit />} />
              <Route path="/customers" element={<CustomersList />} />
              <Route path="/customers/:customerId" element={<CustomerDetail />} />
              <Route path="/analytics" element={<RedirectWithQuery to="/analytics/revenue" />} />
              <Route path="/analytics/revenue" element={<AnalyticsRevenue />} />
              <Route path="/analytics/orders" element={<AnalyticsOrders />} />
              <Route path="/analytics/products" element={<AnalyticsProducts />} />
              <Route path="/analytics/categories" element={<AnalyticsCategories />} />
              <Route path="/analytics/coupons" element={<AnalyticsCoupons />} />
              <Route path="/analytics/taxes" element={<AnalyticsTaxes />} />
              <Route path="/analytics/downloads" element={<AnalyticsDownloads />} />
              <Route path="/analytics/stock" element={<AnalyticsStock />} />
              <Route path="/analytics/customers" element={<AnalyticsCustomers />} />
              <Route path="/analytics/settings" element={<AnalyticsSettingsPage />} />
              <Route path="/coupons" element={<CouponsList />} />
              <Route path="/coupons/new" element={<AddEditCoupon />} />
              <Route path="/coupons/:couponId" element={<AddEditCoupon />} />
              <Route path="/settings" element={<RedirectWithQuery to="/settings/general" />} />
              <Route path="/settings/general" element={<SettingsGeneral />} />
              <Route path="/settings/products" element={<SettingsProducts />} />
              <Route path="/settings/tax" element={<SettingsTax />} />
              <Route path="/settings/shipping" element={<SettingsShipping />} />
              <Route path="/settings/payments" element={<SettingsPayments />} />
              <Route path="/settings/accounts" element={<SettingsAccounts />} />
              <Route path="/settings/emails" element={<SettingsEmails />} />
              <Route path="/wp/*" element={<PlaceholderPage title="This section is not available in the mock." />} />
              <Route path="/woocommerce" element={<RedirectWithQuery to="/" />} />
              <Route path="*" element={<PlaceholderPage title="Page not found" />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
