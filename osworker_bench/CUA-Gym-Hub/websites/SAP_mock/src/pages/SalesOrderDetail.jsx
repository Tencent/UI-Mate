import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastProvider'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_CLASS = {
  'Open': 'status-ordered', 'In Process': 'status-partial',
  'Completed': 'status-delivered', 'Cancelled': 'status-cancelled'
}

export default function SalesOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateSalesOrder, addSalesOrderAttachment } = useApp()
  const { showToast } = useToast()
  const so = state.salesOrders.find(s => s.id === id)
  const items = state.salesOrderItems ? state.salesOrderItems.filter(i => i.soId === id) : []

  const [activeTab, setActiveTab] = useState('general')
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const fileInputRef = useRef(null)

  if (!so) return <div style={{ padding: '24px', color: 'var(--xap-text-secondary)' }}>Sales Order not found.</div>

  function startEdit() { setEditData({ ...so }); setEditMode(true) }
  function cancelEdit() { setEditData({}); setEditMode(false) }
  function saveEdit() {
    updateSalesOrder(id, editData)
    setEditMode(false)
    showToast(`Sales Order ${so.soNumber} saved successfully`, 'success')
  }

  async function uploadAttachment(file) {
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const params = new URLSearchParams(window.location.search)
    const storedSid = (() => {
      try { return sessionStorage.getItem('sap_mock_sid') || '' } catch (e) { return '' }
    })()
    const sid = params.get('sid') || storedSid
    const url = sid ? `/upload?sid=${encodeURIComponent(sid)}` : '/upload'
    try {
      const res = await fetch(url, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      const uploaded = data.files?.[0]
      if (!uploaded) throw new Error('No file returned')
      addSalesOrderAttachment(id, {
        id: 'att-' + Date.now(),
        name: uploaded.original_name,
        size: uploaded.size,
        contentType: uploaded.content_type,
        url: uploaded.url,
        uploadedAt: new Date().toISOString(),
        uploadedBy: state.currentUser?.firstName + ' ' + state.currentUser?.lastName
      })
      showToast(`${uploaded.original_name} uploaded`, 'success')
    } catch (e) {
      showToast('Attachment upload failed', 'error')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const TABS = ['general', 'items', 'partners', 'prices', 'attachments']
  const TAB_LABELS = { general: 'General Information', items: 'Items', partners: 'Partners', prices: 'Prices', attachments: 'Attachments' }

  function Field({ label, value, field, type = 'text', options }) {
    if (editMode && field) {
      if (type === 'select') {
        return (
          <div className="form-field">
            <label>{label}</label>
            <select value={editData[field] || ''} onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))}>
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        )
      }
      return (
        <div className="form-field">
          <label>{label}</label>
          <input type={type} value={editData[field] || ''} onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))} />
        </div>
      )
    }
    return (
      <div className="form-field">
        <label>{label}</label>
        <div style={{ fontSize: '14px', padding: '6px 0', color: 'var(--xap-text-primary)', borderBottom: '1px solid var(--xap-border)', minHeight: '32px' }}>
          {value || '—'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--xap-border)', padding: '12px 24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--xap-blue)', marginBottom: '4px', cursor: 'pointer' }}
          onClick={() => navigate('/app/manage-sales-orders')}>
          Sales Orders /
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--xap-text-primary)' }}>{so.soNumber}</h1>
            <div style={{ fontSize: '13px', color: 'var(--xap-text-secondary)' }}>{so.orderType || 'Standard Order'} · {so.customerName}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`status-badge ${STATUS_CLASS[so.status] || ''}`}>{so.status}</span>
            {!editMode && <button className="btn-secondary" onClick={startEdit}>Edit</button>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="object-tabs" style={{ paddingLeft: '24px', background: '#fff' }}>
        {TABS.map(t => (
          <button key={t} className={`object-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {activeTab === 'general' && (
          <div className="section-card">
            <div className="section-header"><h3>Header Information</h3></div>
            <div className="section-body">
              <div className="form-grid-3" style={{ gap: '20px' }}>
                <Field label="Sales Order Number" value={so.soNumber} />
                <Field label="Status" value={so.status} field="status" type="select"
                  options={['Open', 'In Process', 'Completed', 'Cancelled']} />
                <Field label="Order Date" value={so.createdDate} />
                <Field label="Sold-to Party" value={so.customerName} field="customerName" />
                <Field label="Customer Reference" value={so.customerReference || '—'} field="customerReference" />
                <Field label="Sales Organization" value={`${so.salesOrg || ''} — ${so.salesOrgName || ''}`} />
                <Field label="Distribution Channel" value={so.distributionChannel || '—'} />
                <Field label="Division" value={so.division || '—'} />
                <Field label="Payment Terms" value={so.paymentTerms || '—'} field="paymentTerms"
                  type="select" options={['NET30', 'NET45', 'NET60', 'IMMEDIATE']} />
                <Field label="Incoterms" value={so.incoterms || '—'} field="incoterms"
                  type="select" options={['FOB', 'CIF', 'EXW', 'DAP']} />
                <Field label="Requested Delivery Date" value={so.requestedDeliveryDate || '—'} field="requestedDeliveryDate" type="date" />
                <Field label="Overall Delivery Status" value={so.overallDeliveryStatus || '—'} />
                <Field label="Overall Billing Status" value={so.overallBillingStatus || '—'} />
                <Field label="Total Net Value" value={`${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(so.totalNetValue)} ${so.currency}`} />
                <Field label="Created By" value={so.createdBy || '—'} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="section-card">
            <div className="section-header">
              <h3>Items ({items.length})</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="xap-table">
                <thead>
                  <tr>
                    <th>Item #</th>
                    <th>Material</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th>Unit</th>
                    <th style={{ textAlign: 'right' }}>Net Price</th>
                    <th style={{ textAlign: 'right' }}>Net Value</th>
                    <th>Delivery Status</th>
                    <th>Billing Status</th>
                    <th>Rejection Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: 'var(--xap-text-secondary)' }}>No items</td></tr>
                  ) : items.map(item => (
                    <tr key={item.id}>
                      <td>{item.itemNumber}</td>
                      <td>{item.materialNumber || '—'}</td>
                      <td>{item.materialName}</td>
                      <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.netPrice)}</td>
                      <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.netValue)}</td>
                      <td>{item.deliveryStatus || '—'}</td>
                      <td>{item.billingStatus || '—'}</td>
                      <td>{item.rejectionReason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="section-card">
            <div className="section-header"><h3>Partner Functions</h3></div>
            <div className="section-body">
              <div className="form-grid-2" style={{ gap: '20px' }}>
                <Field label="Sold-to Party" value={`${so.customerId || ''} — ${so.customerName}`} />
                <Field label="Ship-to Party" value={so.shipToParty || so.customerName} field="shipToParty" />
                <Field label="Bill-to Party" value={so.billToParty || so.customerName} field="billToParty" />
                <Field label="Payer" value={so.payer || so.customerName} field="payer" />
                <Field label="Sales Employee" value={so.salesEmployee || '—'} />
                <Field label="Contact Person" value={so.contactPerson || '—'} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="section-card">
            <div className="section-header"><h3>Pricing Summary</h3></div>
            <div className="section-body">
              <div className="form-grid-2" style={{ gap: '20px' }}>
                <Field label="Total Net Value" value={`${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(so.totalNetValue)}`} />
                <Field label="Currency" value={so.currency} />
                <Field label="Number of Items" value={items.length} />
                <Field label="Payment Terms" value={so.paymentTerms || '—'} />
                <Field label="Incoterms" value={so.incoterms || '—'} />
                <Field label="Tax Amount" value={so.taxAmount ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(so.taxAmount) : '—'} />
              </div>
              {items.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <table className="xap-table">
                    <thead>
                      <tr>
                        <th>Item #</th>
                        <th>Description</th>
                        <th style={{ textAlign: 'right' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Net Price</th>
                        <th style={{ textAlign: 'right' }}>Net Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td>{item.itemNumber}</td>
                          <td>{item.materialName}</td>
                          <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.netPrice)}</td>
                          <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.netValue)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '2px solid var(--xap-border)', fontWeight: 600 }}>
                        <td colSpan={4} style={{ textAlign: 'right' }}>Total</td>
                        <td style={{ textAlign: 'right' }}>
                          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(so.totalNetValue)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="section-card">
            <div className="section-header">
              <h3>Attachments</h3>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={e => uploadAttachment(e.target.files?.[0])}
              />
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>Upload</button>
            </div>
            <div className="section-body">
              {(so.attachments || []).length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--xap-text-secondary)' }}>No attachments.</p>
              ) : (
                <table className="xap-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Size</th>
                      <th>Uploaded By</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(so.attachments || []).map(att => (
                      <tr key={att.id}>
                        <td>{att.name}</td>
                        <td>{att.contentType || 'application/octet-stream'}</td>
                        <td style={{ textAlign: 'right' }}>{Math.ceil((att.size || 0) / 1024)} KB</td>
                        <td>{att.uploadedBy || 'Local User'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <a className="btn-link" href={att.url} download={att.name}>Download</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer edit bar */}
      {editMode && (
        <div className="sticky-footer">
          <span style={{ fontSize: '13px', color: 'var(--xap-text-secondary)', marginRight: 'auto' }}>
            Editing Sales Order {so.soNumber}
          </span>
          <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          <button className="btn-primary" onClick={saveEdit}>Save</button>
        </div>
      )}
    </div>
  )
}
