import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import { ChevronLeft } from 'lucide-react'

const STATUS_OPTIONS = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed']
const STATUS_LABELS = {
  processing: 'Processing', completed: 'Completed', 'on-hold': 'On hold',
  pending: 'Pending payment', cancelled: 'Cancelled', refunded: 'Refunded', failed: 'Failed'
}

function StatusBadge({ status }) {
  return <span className={`order-status-badge status-${status}`}>{STATUS_LABELS[status] || status}</span>
}

function AddressBlock({ addr, title }) {
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div>{addr.firstName} {addr.lastName}</div>
      {addr.company && <div>{addr.company}</div>}
      <div>{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</div>
      <div>{addr.city}, {addr.state} {addr.postcode}</div>
      <div>{addr.country}</div>
      {addr.email && <div style={{ marginTop: 4 }}><a href={`mailto:${addr.email}`}>{addr.email}</a></div>}
      {addr.phone && <div>{addr.phone}</div>}
    </div>
  )
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const order = state.orders.find(o => o.id === orderId)
  const [status, setStatus] = useState(order?.status || 'pending')
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState('private')
  const [notice, setNotice] = useState(null)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  if (!order) {
    return (
      <div>
        <div className="wp-page-title"><h1>Order not found</h1></div>
        <button className="button" onClick={() => navTo('/orders')}>← Back to orders</button>
      </div>
    )
  }

  const saveOrder = () => {
    const oldStatus = order.status
    const updates = { id: order.id, status, dateModified: new Date().toISOString() }
    dispatch({ type: 'UPDATE_ORDER', payload: updates })
    if (oldStatus !== status) {
      const note = {
        id: `note_${Date.now()}`,
        content: `Order status changed from ${STATUS_LABELS[oldStatus] || oldStatus} to ${STATUS_LABELS[status] || status}.`,
        dateCreated: new Date().toISOString(),
        isCustomerNote: false,
        addedBy: 'system'
      }
      dispatch({ type: 'ADD_NOTE', payload: { orderId: order.id, note } })
    }
    setNotice({ type: 'success', msg: 'Order updated.' })
  }

  const addNote = () => {
    if (!noteText.trim()) return
    const note = {
      id: `note_${Date.now()}`,
      content: noteText.trim(),
      dateCreated: new Date().toISOString(),
      isCustomerNote: noteType === 'customer',
      addedBy: 'admin'
    }
    dispatch({ type: 'ADD_NOTE', payload: { orderId: order.id, note } })
    setNoteText('')
  }

  const processRefund = () => {
    const amt = parseFloat(refundAmount)
    if (isNaN(amt) || amt <= 0) return
    dispatch({ type: 'UPDATE_ORDER', payload: { id: order.id, status: 'refunded', dateModified: new Date().toISOString() } })
    const note = {
      id: `note_${Date.now()}`,
      content: `Refund of $${amt.toFixed(2)} processed.`,
      dateCreated: new Date().toISOString(),
      isCustomerNote: false,
      addedBy: 'admin'
    }
    dispatch({ type: 'ADD_NOTE', payload: { orderId: order.id, note } })
    setStatus('refunded')
    setShowRefundModal(false)
    setRefundAmount('')
    setNotice({ type: 'success', msg: `Refund of $${amt.toFixed(2)} processed. Order status set to Refunded.` })
  }

  const sendInvoiceEmail = () => {
    const email = order.billing?.email || 'customer@example.com'
    setNotice({ type: 'success', msg: `Invoice email sent to ${email}.` })
  }

  const fmt = (n) => '$' + parseFloat(n || 0).toFixed(2)

  const notes = [...(order.orderNotes || [])].sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated))

  return (
    <div>
      {notice && (
        <div className={`notice notice-${notice.type}`}>
          <span>{notice.msg}</span>
          <button className="notice-dismiss" onClick={() => setNotice(null)}>×</button>
        </div>
      )}

      <div className="wp-page-title">
        <h1>Order #{order.number} details</h1>
        <button className="button" onClick={() => navTo('/orders')}>
          <ChevronLeft size={14} /> Back to orders
        </button>
      </div>

      <div className="wp-two-col">
        {/* Left column */}
        <div className="wp-col-main">
          {/* Order Details */}
          <div className="postbox">
            <div className="postbox-header">
              <span>Order #{order.number} <StatusBadge status={order.status} /></span>
            </div>
            <div className="postbox-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <label style={{ minWidth: 80, fontWeight: 600 }}>Status:</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ height: 30 }}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {/* General info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 8, borderBottom: '1px solid #dcdcde', paddingBottom: 4 }}>General</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                    <div><span style={{ color: '#646970' }}>Date created:</span> {format(new Date(order.dateCreated), 'MMM d, yyyy h:mm a')}</div>
                    {order.datePaid && <div><span style={{ color: '#646970' }}>Date paid:</span> {format(new Date(order.datePaid), 'MMM d, yyyy h:mm a')}</div>}
                    {order.dateCompleted && <div><span style={{ color: '#646970' }}>Date completed:</span> {format(new Date(order.dateCompleted), 'MMM d, yyyy h:mm a')}</div>}
                    <div><span style={{ color: '#646970' }}>Payment method:</span> {order.paymentMethodTitle}</div>
                    {order.customerNote && <div><span style={{ color: '#646970' }}>Customer note:</span> {order.customerNote}</div>}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 8, borderBottom: '1px solid #dcdcde', paddingBottom: 4 }}>Billing</div>
                  <AddressBlock addr={order.billing} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, borderBottom: '1px solid #dcdcde', paddingBottom: 4 }}>Shipping</div>
                <AddressBlock addr={order.shipping} />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="postbox">
            <div className="postbox-header">Line items</div>
            <div className="postbox-body" style={{ padding: 0 }}>
              <table className="wp-list-table" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Cost</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.lineItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <button className="button-link" onClick={() => navTo(`/products/${item.productId}`)}>
                          {item.name}
                        </button>
                      </td>
                      <td className="text-muted">{item.sku}</td>
                      <td>{fmt(item.price)}</td>
                      <td>× {item.quantity}</td>
                      <td style={{ fontWeight: 600 }}>{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', color: '#646970' }}>Subtotal:</td>
                    <td>{fmt(order.subtotal)}</td>
                  </tr>
                  {parseFloat(order.discountTotal) > 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right', color: '#646970' }}>Discount:</td>
                      <td>-{fmt(order.discountTotal)}</td>
                    </tr>
                  )}
                  {order.shippingLines?.map((s, i) => (
                    <tr key={i}>
                      <td colSpan={4} style={{ textAlign: 'right', color: '#646970' }}>Shipping ({s.methodTitle}):</td>
                      <td>{fmt(s.total)}</td>
                    </tr>
                  ))}
                  {parseFloat(order.totalTax) > 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right', color: '#646970' }}>Tax:</td>
                      <td>{fmt(order.totalTax)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Order total:</td>
                    <td style={{ fontWeight: 700, fontSize: 15 }}>{fmt(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
              <div style={{ padding: 12, borderTop: '1px solid #dcdcde' }}>
                <button className="button" onClick={() => setShowRefundModal(true)}>Refund</button>
              </div>
              {showRefundModal && (
                <div style={{ padding: '12px 16px', background: '#f6f7f7', borderTop: '1px solid #dcdcde' }}>
                  <strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>Process Refund</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <label style={{ fontSize: 13 }}>Amount ($):</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={refundAmount}
                      onChange={e => setRefundAmount(e.target.value)}
                      style={{ width: 100, height: 28 }}
                      placeholder={order.total}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button-primary" onClick={processRefund}>Process refund</button>
                    <button className="button" onClick={() => { setShowRefundModal(false); setRefundAmount('') }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="wp-col-side">
          {/* Order Actions */}
          <div className="postbox">
            <div className="postbox-header">Order actions</div>
            <div className="postbox-body">
              <button className="button-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }} onClick={saveOrder}>
                Save order
              </button>
              <button className="button-link" style={{ fontSize: 12, display: 'block', marginBottom: 4 }} onClick={sendInvoiceEmail}>
                Email invoice / order details to customer
              </button>
            </div>
          </div>

          {/* Order Notes */}
          <div className="postbox">
            <div className="postbox-header">Order notes</div>
            <div className="postbox-body">
              {notes.length === 0 ? (
                <p style={{ color: '#646970', fontSize: 12 }}>No notes yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {notes.map(n => (
                    <li key={n.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>
                        {format(new Date(n.dateCreated), 'MMM d, yyyy h:mm a')} by{' '}
                        <span style={{ background: n.addedBy === 'system' ? '#e5e5e5' : '#c6e1c6', padding: '1px 5px', borderRadius: 3 }}>
                          {n.addedBy}
                        </span>
                        {n.isCustomerNote && <span style={{ background: '#c8d7e1', padding: '1px 5px', borderRadius: 3, marginLeft: 4 }}>Customer</span>}
                      </div>
                      <div style={{ fontSize: 13 }}>{n.content}</div>
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ marginTop: 12 }}>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                  style={{ width: '100%', marginBottom: 6 }}
                  placeholder="Add a note..."
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select value={noteType} onChange={e => setNoteType(e.target.value)} style={{ height: 30, flex: 1 }}>
                    <option value="private">Private note</option>
                    <option value="customer">Note to customer</option>
                  </select>
                  <button className="button-primary" onClick={addNote}>Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
