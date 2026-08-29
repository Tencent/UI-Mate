import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const OrderList = lazy(() => import('./pages/OrderList'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const RefundList = lazy(() => import('./pages/RefundList'))
const RefundDetail = lazy(() => import('./pages/RefundDetail'))
const ProductList = lazy(() => import('./pages/ProductList'))
const ProductForm = lazy(() => import('./pages/ProductForm'))
const CouponList = lazy(() => import('./pages/CouponList'))
const CouponForm = lazy(() => import('./pages/CouponForm'))
const PromotionList = lazy(() => import('./pages/PromotionList'))
const Analytics = lazy(() => import('./pages/Analytics'))
const MessageCenter = lazy(() => import('./pages/MessageCenter'))
const ReviewList = lazy(() => import('./pages/ReviewList'))
const StoreSettings = lazy(() => import('./pages/StoreSettings'))
const LogisticsManagement = lazy(() => import('./pages/LogisticsManagement'))
const Go = lazy(() => import('./pages/Go'))

function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#999' }}>
      加载中...
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/go" element={<Go />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/refunds" element={<RefundList />} />
          <Route path="/refunds/:id" element={<RefundDetail />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/coupons" element={<CouponList />} />
          <Route path="/coupons/new" element={<CouponForm />} />
          <Route path="/coupons/:id/edit" element={<CouponForm />} />
          <Route path="/promotions" element={<PromotionList />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/messages" element={<MessageCenter />} />
          <Route path="/reviews" element={<ReviewList />} />
          <Route path="/logistics" element={<LogisticsManagement />} />
          <Route path="/settings" element={<StoreSettings />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
