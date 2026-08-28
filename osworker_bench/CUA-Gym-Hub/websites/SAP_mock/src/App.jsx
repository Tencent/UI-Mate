import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ShellBar from './components/ShellBar'
import NavigationTabBar from './components/NavigationTabBar'
import Home from './pages/Home'
import ManagePurchaseOrders from './pages/ManagePurchaseOrders'
import PurchaseOrderDetail from './pages/PurchaseOrderDetail'
import CreatePurchaseOrder from './pages/CreatePurchaseOrder'
import ManageSalesOrders from './pages/ManageSalesOrders'
import SalesOrderDetail from './pages/SalesOrderDetail'
import CreateSalesOrder from './pages/CreateSalesOrder'
import ManageProducts from './pages/ManageProducts'
import ProductDetail from './pages/ProductDetail'
import JournalEntries from './pages/JournalEntries'
import JournalEntryDetail from './pages/JournalEntryDetail'
import CreateJournalEntry from './pages/CreateJournalEntry'
import Go from './pages/Go'
import ToastProvider from './components/ToastProvider'
import { useLocation } from 'react-router-dom'

function AppLayout() {
  const location = useLocation()
  const isGoPage = location.pathname === '/go'
  const isAppPage = location.pathname.startsWith('/app/')

  if (isGoPage) {
    return (
      <Routes>
        <Route path="/go" element={<Go />} />
      </Routes>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <ShellBar />
      {!isAppPage && <NavigationTabBar />}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--xap-page-bg)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app/manage-purchase-orders" element={<ManagePurchaseOrders />} />
          <Route path="/app/purchase-order/:id" element={<PurchaseOrderDetail />} />
          <Route path="/app/create-purchase-order" element={<CreatePurchaseOrder />} />
          <Route path="/app/manage-sales-orders" element={<ManageSalesOrders />} />
          <Route path="/app/sales-order/:id" element={<SalesOrderDetail />} />
          <Route path="/app/create-sales-order" element={<CreateSalesOrder />} />
          <Route path="/app/manage-products" element={<ManageProducts />} />
          <Route path="/app/product/:id" element={<ProductDetail />} />
          <Route path="/app/journal-entries" element={<JournalEntries />} />
          <Route path="/app/journal-entry/:id" element={<JournalEntryDetail />} />
          <Route path="/app/create-journal-entry" element={<CreateJournalEntry />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </BrowserRouter>
  )
}
