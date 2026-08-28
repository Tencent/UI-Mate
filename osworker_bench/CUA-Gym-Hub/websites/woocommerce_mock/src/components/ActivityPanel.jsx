import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Mail, ClipboardList, Box, Star, Globe } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function OrdersPanel({ orders, onClose }) {
  const navigate = useNavigate()
  const processing = orders.filter(o => o.status === 'processing').slice(0, 5)

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
    onClose()
  }

  return (
    <div className="wc-activity-dropdown" style={{ right: 'auto', left: '50%', transform: 'translateX(-50%)' }}>
      <div className="wc-activity-dropdown-header">
        <span>Orders</span>
      </div>
      {processing.length === 0 ? (
        <div className="wc-activity-dropdown-item" style={{ color: '#646970' }}>No orders awaiting fulfillment</div>
      ) : processing.map(o => {
        const name = `${o.billing.firstName} ${o.billing.lastName}`
        const products = o.lineItems.length
        const timeAgo = formatDistanceToNow(new Date(o.dateCreated), { addSuffix: true })
        return (
          <div key={o.id} className="wc-activity-dropdown-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>
                Order <button className="button-link" onClick={() => navTo(`/orders/${o.id}`)}>#{o.number}</button> placed by{' '}
                <strong>{name}</strong>
              </span>
              <span className="text-muted">{timeAgo}</span>
            </div>
            <div className="text-muted" style={{ marginBottom: 6 }}>
              {products} product{products !== 1 ? 's' : ''} &bull; ${o.total}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#5b841b', display: 'inline-block' }} />
              <span style={{ fontSize: 13 }}>Processing</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <button className="button" style={{ fontSize: 12, height: 26 }} onClick={() => navTo(`/orders/${o.id}`)}>
                Begin fulfillment
              </button>
            </div>
          </div>
        )
      })}
      <div className="wc-activity-dropdown-footer">
        <button className="button-link" onClick={() => navTo('/orders')} style={{ color: '#7f54b3' }}>
          Manage all orders
        </button>
      </div>
    </div>
  )
}

function InboxPanel({ notifications, onClose, onMarkAllRead }) {
  const navigate = useNavigate()
  const unread = notifications.filter(n => !n.isRead)

  const navTo = (url) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${url}?sid=${sid}` : url)
    onClose()
  }

  return (
    <div className="wc-activity-dropdown">
      <div className="wc-activity-dropdown-header">
        <span>Inbox {unread.length > 0 && <span style={{ color: '#7f54b3' }}>({unread.length})</span>}</span>
        {unread.length > 0 && (
          <button className="button-link" style={{ fontSize: 12 }} onClick={onMarkAllRead}>Mark all as read</button>
        )}
      </div>
      {notifications.slice(0, 6).map(n => (
        <div key={n.id} className="wc-activity-dropdown-item" style={{ borderLeft: !n.isRead ? '3px solid #7f54b3' : '3px solid transparent', paddingLeft: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <strong style={{ fontSize: 13 }}>{n.title}</strong>
            <span className="text-muted">{formatDistanceToNow(new Date(n.dateCreated), { addSuffix: true })}</span>
          </div>
          <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>{n.content}</div>
          {n.actions?.map(a => (
            <button key={a.label} className="button-link" style={{ fontSize: 12 }} onClick={() => navTo(a.url)}>
              {a.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

function StockPanel({ products, onClose }) {
  const navigate = useNavigate()
  const lowStock = products.filter(p => p.manageStock && p.stockQuantity !== null && p.stockQuantity < 10 && p.status !== 'trash')

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
    onClose()
  }

  return (
    <div className="wc-activity-dropdown">
      <div className="wc-activity-dropdown-header">Stock</div>
      {lowStock.length === 0 ? (
        <div className="wc-activity-dropdown-item" style={{ color: '#646970' }}>All products are well-stocked</div>
      ) : lowStock.map(p => (
        <div key={p.id} className="wc-activity-dropdown-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>{p.name}</span>
            <span style={{ fontSize: 12, color: p.stockQuantity === 0 ? '#761919' : '#94660c' }}>
              {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} remaining`}
            </span>
          </div>
          <button className="button-link" style={{ fontSize: 12 }} onClick={() => navTo(`/products/${p.id}`)}>
            Update stock
          </button>
        </div>
      ))}
    </div>
  )
}

function ReviewsPanel({ reviews, onClose }) {
  const { dispatch } = useApp()
  const pending = reviews.filter(r => r.status === 'hold')

  const StarRating = ({ rating }) => (
    <span className="star-rating" style={{ fontSize: 14 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= rating ? '' : 'star-empty'}>★</span>
      ))}
    </span>
  )

  return (
    <div className="wc-activity-dropdown">
      <div className="wc-activity-dropdown-header">
        Reviews {pending.length > 0 && <span style={{ color: '#7f54b3' }}>({pending.length} pending)</span>}
      </div>
      {reviews.slice(0, 5).map(r => (
        <div key={r.id} className="wc-activity-dropdown-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <StarRating rating={r.rating} />
            <span className="text-muted">{formatDistanceToNow(new Date(r.dateCreated), { addSuffix: true })}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{r.reviewer} on {r.productName}</div>
          <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>{r.review.slice(0, 80)}...</div>
          {r.status === 'hold' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="button-link" style={{ fontSize: 12, color: '#5b841b' }} onClick={() => dispatch({ type: 'UPDATE_REVIEW', payload: { id: r.id, status: 'approved' } })}>Approve</button>
              <button className="button-link" style={{ fontSize: 12, color: '#761919' }} onClick={() => dispatch({ type: 'UPDATE_REVIEW', payload: { id: r.id, status: 'spam' } })}>Spam</button>
              <button className="button-link" style={{ fontSize: 12, color: '#761919' }} onClick={() => dispatch({ type: 'UPDATE_REVIEW', payload: { id: r.id, status: 'trash' } })}>Trash</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ActivityPanel({ breadcrumb }) {
  const { state, dispatch } = useApp()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(null)
  const panelRef = useRef(null)

  const processingCount = state.orders.filter(o => o.status === 'processing').length
  const unreadCount = state.notifications.filter(n => !n.isRead).length
  const pendingReviews = state.reviews.filter(r => r.status === 'hold').length

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setActiveTab(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleTab = (tab) => setActiveTab(prev => prev === tab ? null : tab)

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: Mail, badge: unreadCount },
    { id: 'orders', label: 'Orders', icon: ClipboardList, badge: processingCount },
    { id: 'stock', label: 'Stock', icon: Box, badge: 0 },
    { id: 'reviews', label: 'Reviews ' + pendingReviews, icon: Star, badge: pendingReviews },
    { id: 'notices', label: 'Notices', icon: Globe, badge: 0 },
  ]

  return (
    <div className="wc-activity-panel" ref={panelRef} style={{ position: 'relative' }}>
      <div className="wc-activity-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`wc-activity-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => toggleTab(tab.id)}
          >
            <span className="wc-activity-tab-icon">
              <tab.icon size={20} />
              {tab.badge > 0 && <span className="wc-activity-badge">{tab.badge}</span>}
            </span>
            <span style={{ fontSize: 12 }}>{tab.label}</span>
          </button>
        ))}
      </div>
      {breadcrumb && (
        <div className="wc-activity-breadcrumb">
          {breadcrumb}
        </div>
      )}
      {activeTab === 'orders' && (
        <OrdersPanel orders={state.orders} onClose={() => setActiveTab(null)} />
      )}
      {activeTab === 'inbox' && (
        <InboxPanel
          notifications={state.notifications}
          onClose={() => setActiveTab(null)}
          onMarkAllRead={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
        />
      )}
      {activeTab === 'stock' && (
        <StockPanel products={state.products} onClose={() => setActiveTab(null)} />
      )}
      {activeTab === 'reviews' && (
        <ReviewsPanel reviews={state.reviews} onClose={() => setActiveTab(null)} />
      )}
      {activeTab === 'notices' && (
        <div className="wc-activity-dropdown">
          <div className="wc-activity-dropdown-header">Notices</div>
          <div className="wc-activity-dropdown-item" style={{ color: '#646970' }}>No new notices</div>
        </div>
      )}
    </div>
  )
}
