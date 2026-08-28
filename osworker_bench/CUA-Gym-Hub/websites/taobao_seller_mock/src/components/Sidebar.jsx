import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, RotateCcw, PlusCircle,
  Package, Archive, Ticket, Megaphone, BarChart3,
  MessageSquare, Star, Settings, Truck
} from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const navStyle = (isActive) => ({
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '8px 16px 8px 20px',
  fontSize: 14, cursor: 'pointer',
  color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
  background: isActive ? 'var(--color-primary-light)' : 'transparent',
  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
  textDecoration: 'none',
  transition: 'all 0.15s',
})

function NavItem({ to, icon: Icon, label, badge, exact }) {
  const location = useLocation()
  const [toPath, toSearch] = to.split('?')
  const locationSearch = location.search.startsWith('?') ? location.search.slice(1) : location.search

  let isActive
  if (toSearch) {
    // Match both pathname and query string
    isActive = location.pathname === toPath && locationSearch === toSearch
  } else if (exact) {
    isActive = location.pathname === toPath && !locationSearch
  } else {
    isActive = (location.pathname.startsWith(toPath) && toPath !== '/')
      || (toPath === '/' && location.pathname === '/')
  }

  return (
    <NavLink
      to={to}
      style={() => navStyle(isActive)}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--color-bg-hover)'
          e.currentTarget.style.color = 'var(--color-primary)'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--color-text-primary)'
        }
      }}
    >
      <Icon size={16} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span className="count-badge">{badge > 99 ? '99+' : badge}</span>
      )}
    </NavLink>
  )
}

function NavGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        padding: '8px 16px 4px 20px',
        fontSize: 12, color: 'var(--color-text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        fontWeight: 500
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export default function Sidebar() {
  const { state } = useAppContext()

  const unreadMsgCount = state.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  const pendingRefundCount = state.refunds.filter(r => r.status === 'pending').length
  const unrepliedReviewCount = state.reviews.filter(r => !r.sellerReply).length

  return (
    <nav style={{
      width: 220, minWidth: 220, background: '#fff',
      borderRight: '1px solid var(--color-border)',
      overflowY: 'auto', flexShrink: 0
    }}>
      <NavGroup title="首页">
        <NavItem to="/" icon={LayoutDashboard} label="工作台" exact />
      </NavGroup>
      <NavGroup title="交易管理">
        <NavItem to="/orders" icon={ShoppingBag} label="已卖出的宝贝" />
        <NavItem to="/refunds" icon={RotateCcw} label="退款管理" badge={pendingRefundCount} />
        <NavItem to="/logistics" icon={Truck} label="物流管理" />
      </NavGroup>
      <NavGroup title="商品管理">
        <NavItem to="/products/new" icon={PlusCircle} label="发布商品" />
        <NavItem to="/products" icon={Package} label="出售中的宝贝" exact />
        <NavItem to="/products?status=in_warehouse" icon={Archive} label="仓库中的宝贝" />
      </NavGroup>
      <NavGroup title="营销中心">
        <NavItem to="/coupons" icon={Ticket} label="优惠券" />
        <NavItem to="/promotions" icon={Megaphone} label="营销活动" />
      </NavGroup>
      <NavGroup title="数据中心">
        <NavItem to="/analytics" icon={BarChart3} label="生意参谋" />
      </NavGroup>
      <NavGroup title="客户服务">
        <NavItem to="/messages" icon={MessageSquare} label="消息管理" badge={unreadMsgCount} />
        <NavItem to="/reviews" icon={Star} label="评价管理" badge={unrepliedReviewCount} />
      </NavGroup>
      <NavGroup title="店铺管理">
        <NavItem to="/settings" icon={Settings} label="店铺设置" />
      </NavGroup>
    </nav>
  )
}
