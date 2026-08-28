import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import { ChevronLeft } from 'lucide-react'

const STATUS_LABELS = {
  processing: 'Processing', completed: 'Completed', 'on-hold': 'On hold',
  pending: 'Pending payment', cancelled: 'Cancelled', refunded: 'Refunded', failed: 'Failed'
}

function StatusBadge({ status }) {
  return <span className={`order-status-badge status-${status}`}>{STATUS_LABELS[status] || status}</span>
}

export default function CustomerDetail() {
  const { customerId } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()

  const customer = state.customers.find(c => c.id === customerId)
  const customerOrders = state.orders.filter(o => o.customerId === customerId)
    .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  if (!customer) {
    return (
      <div>
        <div className="wp-page-title"><h1>Customer not found</h1></div>
        <button className="button" onClick={() => navTo('/customers')}>← Back to customers</button>
      </div>
    )
  }

  const billingAddr = customer.billing
  const shippingAddr = customer.shipping

  return (
    <div>
      <div className="wp-page-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={customer.avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: 2 }} />
          <div>
            <h1 style={{ marginBottom: 0 }}>{customer.firstName} {customer.lastName}</h1>
            <div className="text-muted">{customer.email}</div>
          </div>
        </div>
        <button className="button" onClick={() => navTo('/customers')}>
          <ChevronLeft size={14} /> Back to customers
        </button>
      </div>

      <div className="wp-two-col">
        <div className="wp-col-main">
          {/* Overview */}
          <div className="postbox">
            <div className="postbox-header">Overview</div>
            <div className="postbox-body">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Email', customer.email],
                    ['Username', customer.username],
                    ['Date registered', format(new Date(customer.dateCreated), 'MMM d, yyyy')],
                    ['Last active', format(new Date(customer.dateLastActive), 'MMM d, yyyy')],
                    ['Orders count', customer.ordersCount],
                    ['Total spent', `$${parseFloat(customer.totalSpent).toFixed(2)}`],
                    ['Avg order value', `$${parseFloat(customer.averageOrderValue).toFixed(2)}`],
                    ['Role', customer.role],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: '6px 10px 6px 0', color: '#646970', width: 160, fontSize: 13 }}>{label}:</td>
                      <td style={{ padding: '6px 0', fontSize: 13 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent orders */}
          <div className="postbox">
            <div className="postbox-header">Orders ({customerOrders.length})</div>
            {customerOrders.length === 0 ? (
              <div className="postbox-body" style={{ color: '#646970' }}>No orders yet.</div>
            ) : (
              <table className="wp-list-table" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map(o => (
                    <tr key={o.id}>
                      <td>
                        <button className="button-link" style={{ fontWeight: 600 }} onClick={() => navTo(`/orders/${o.id}`)}>
                          #{o.number}
                        </button>
                      </td>
                      <td className="text-muted">{format(new Date(o.dateCreated), 'MMM d, yyyy')}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>${o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="wp-col-side">
          {/* Billing address */}
          <div className="postbox">
            <div className="postbox-header">Billing address</div>
            <div className="postbox-body" style={{ fontSize: 13 }}>
              {billingAddr ? (
                <>
                  <div>{billingAddr.firstName} {billingAddr.lastName}</div>
                  {billingAddr.company && <div>{billingAddr.company}</div>}
                  <div>{billingAddr.address1}{billingAddr.address2 ? `, ${billingAddr.address2}` : ''}</div>
                  <div>{billingAddr.city}, {billingAddr.state} {billingAddr.postcode}</div>
                  <div>{billingAddr.country}</div>
                  {billingAddr.email && <div style={{ marginTop: 6 }}><a href={`mailto:${billingAddr.email}`}>{billingAddr.email}</a></div>}
                  {billingAddr.phone && <div>{billingAddr.phone}</div>}
                </>
              ) : <span className="text-muted">No billing address</span>}
            </div>
          </div>

          {/* Shipping address */}
          <div className="postbox">
            <div className="postbox-header">Shipping address</div>
            <div className="postbox-body" style={{ fontSize: 13 }}>
              {shippingAddr ? (
                <>
                  <div>{shippingAddr.firstName} {shippingAddr.lastName}</div>
                  {shippingAddr.company && <div>{shippingAddr.company}</div>}
                  <div>{shippingAddr.address1}{shippingAddr.address2 ? `, ${shippingAddr.address2}` : ''}</div>
                  <div>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.postcode}</div>
                  <div>{shippingAddr.country}</div>
                </>
              ) : <span className="text-muted">Same as billing</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
