import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastProvider'
import ConfirmDialog from '../components/ConfirmDialog'

const STATUS_CLASS = {
  'Draft': 'status-draft', 'Ordered': 'status-ordered',
  'Partially Delivered': 'status-partial', 'Fully Delivered': 'status-delivered',
  'Closed': 'status-closed'
}

export default function PurchaseOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updatePurchaseOrder, addPOItem, deletePOItem } = useApp()
  const { showToast } = useToast()
  const po = state.purchaseOrders.find(p => p.id === id)
  const items = state.purchaseOrderItems.filter(i => i.poId === id)
  const [activeTab, setActiveTab] = useState('general')
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null)
  const [addingItem, setAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({ materialName: '', materialNumber: '', quantity: '', unit: 'PC', netPrice: '', deliveryDate: '', plant: '1000', storageLocation: 'SL01' })

  if (!po) return <div style={{ padding: '24px', color: 'var(--xap-text-secondary)' }}>Purchase Order not found.</div>

  function startEdit() {
    setEditData({ ...po })
    setEditMode(true)
  }

  function cancelEdit() {
    setEditData({})
    setEditMode(false)
  }

  function saveEdit() {
    updatePurchaseOrder(id, editData)
    setEditMode(false)
    showToast(`Purchase Order ${po.poNumber} saved successfully`, 'success')
  }

  function handleAddItem() {
    if (!newItem.materialName || !newItem.quantity || !newItem.netPrice) return
    const qty = parseFloat(newItem.quantity) || 0
    const price = parseFloat(newItem.netPrice) || 0
    const newId = 'poi-' + Date.now()
    const existingItems = state.purchaseOrderItems.filter(i => i.poId === id)
    const maxItem = existingItems.reduce((m, i) => Math.max(m, i.itemNumber || 0), 0)
    const item = {
      id: newId, poId: id,
      itemNumber: maxItem + 10,
      materialId: '', materialName: newItem.materialName, materialNumber: newItem.materialNumber,
      quantity: qty, unit: newItem.unit, netPrice: price, priceUnit: 1,
      netValue: parseFloat((qty * price).toFixed(2)),
      currency: po.currency, deliveryDate: newItem.deliveryDate,
      plant: newItem.plant, storageLocation: newItem.storageLocation,
      taxCode: 'V1', accountAssignment: 'K', costCenter: 'CC1000', glAccount: '400000'
    }
    addPOItem(item)
    setNewItem({ materialName: '', materialNumber: '', quantity: '', unit: 'PC', netPrice: '', deliveryDate: '', plant: '1000', storageLocation: 'SL01' })
    setAddingItem(false)
    showToast('Item added successfully', 'success')
  }

  const TABS = ['general', 'items', 'delivery', 'pricing', 'notes']
  const TAB_LABELS = { general: 'General Information', items: 'Items', delivery: 'Delivery Details', pricing: 'Pricing', notes: 'Notes' }

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
          onClick={() => navigate('/app/manage-purchase-orders')}>
          Purchase Orders /
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--xap-text-primary)' }}>{po.poNumber}</h1>
            <div style={{ fontSize: '13px', color: 'var(--xap-text-secondary)' }}>{po.poTypeName} · {po.supplierName}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`status-badge ${STATUS_CLASS[po.status] || ''}`}>{po.status}</span>
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
                <Field label="Purchase Order Number" value={po.poNumber} />
                <Field label="Purchase Order Type" value={`${po.poType} — ${po.poTypeName}`} field="poTypeName" />
                <Field label="Status" value={po.status} field="status" type="select" options={['Draft','Ordered','Partially Delivered','Fully Delivered','Closed']} />
                <Field label="Supplier" value={po.supplierName} field="supplierName" />
                <Field label="Purchasing Organization" value={`${po.purchasingOrg} — ${po.purchasingOrgName}`} />
                <Field label="Purchasing Group" value={`${po.purchasingGroup} — ${po.purchasingGroupName}`} />
                <Field label="Company Code" value={po.companyCode} />
                <Field label="Plant" value={`${po.plant} — ${po.plantName}`} />
                <Field label="Created Date" value={po.createdDate} />
                <Field label="Created By" value={po.createdBy} />
                <Field label="Payment Terms" value={po.paymentTerms} field="paymentTerms" />
                <Field label="Incoterms" value={po.incoterms} field="incoterms" />
                <Field label="Total Net Value" value={`${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(po.totalNetValue)} ${po.currency}`} />
                <Field label="Delivery Status" value={po.deliveryStatus} />
                <Field label="Last Changed" value={po.lastChanged} />
              </div>
              {(editMode || po.notes) && (
                <div style={{ marginTop: '16px' }}>
                  <div className="form-field">
                    <label>Notes</label>
                    {editMode
                      ? <textarea rows={3} value={editData.notes || ''} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))} style={{ resize: 'vertical' }} />
                      : <div style={{ fontSize: '14px', padding: '6px 0', color: 'var(--xap-text-primary)', minHeight: '32px' }}>{po.notes || '—'}</div>
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="section-card">
            <div className="section-header">
              <h3>Items ({items.length})</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {editMode && <button className="btn-secondary" onClick={() => setAddingItem(true)}>Add Item</button>}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="xap-table">
                <thead>
                  <tr>
                    <th>Item #</th>
                    <th>Material</th>
                    <th>Material No.</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th>Unit</th>
                    <th style={{ textAlign: 'right' }}>Net Price</th>
                    <th style={{ textAlign: 'right' }}>Net Value</th>
                    <th>Delivery Date</th>
                    <th>Plant</th>
                    {editMode && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{item.itemNumber}</td>
                      <td><button className="btn-link" onClick={() => {
                        const mat = state.materials.find(m => m.id === item.materialId)
                        if (mat) navigate(`/app/product/${mat.id}`)
                      }}>{item.materialName}</button></td>
                      <td>{item.materialNumber}</td>
                      <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.netPrice)}</td>
                      <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.netValue)}</td>
                      <td>{item.deliveryDate}</td>
                      <td>{item.plant}</td>
                      {editMode && <td>
                        <button className="btn-ghost" style={{ color: 'var(--xap-status-error)', fontSize: '16px', padding: '0 8px' }}
                          onClick={() => setConfirmDeleteItem(item)}>×</button>
                      </td>}
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={editMode ? 10 : 9} style={{ textAlign: 'center', padding: '24px', color: 'var(--xap-text-secondary)' }}>No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {addingItem && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--xap-border)', background: 'var(--xap-page-bg)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Add New Item</div>
                <div className="form-grid-3">
                  <div className="form-field">
                    <label>Material Name *</label>
                    <input value={newItem.materialName} onChange={e => setNewItem(n => ({ ...n, materialName: e.target.value }))} placeholder="Material description" />
                  </div>
                  <div className="form-field">
                    <label>Material Number</label>
                    <input value={newItem.materialNumber} onChange={e => setNewItem(n => ({ ...n, materialNumber: e.target.value }))} placeholder="MAT-XXXX" />
                  </div>
                  <div className="form-field">
                    <label>Quantity *</label>
                    <input type="number" min="0" value={newItem.quantity} onChange={e => setNewItem(n => ({ ...n, quantity: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Unit</label>
                    <select value={newItem.unit} onChange={e => setNewItem(n => ({ ...n, unit: e.target.value }))}>
                      {['PC','KG','EA','L','M'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Net Price *</label>
                    <input type="number" min="0" step="0.01" value={newItem.netPrice} onChange={e => setNewItem(n => ({ ...n, netPrice: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Delivery Date</label>
                    <input type="date" value={newItem.deliveryDate} onChange={e => setNewItem(n => ({ ...n, deliveryDate: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button className="btn-primary" onClick={handleAddItem}>Add</button>
                  <button className="btn-secondary" onClick={() => setAddingItem(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="section-card">
            <div className="section-header"><h3>Delivery Details</h3></div>
            <div className="section-body">
              <div className="form-grid-2">
                <Field label="Delivery Status" value={po.deliveryStatus} />
                <Field label="Plant" value={`${po.plant} — ${po.plantName}`} />
                <Field label="Incoterms" value={po.incoterms} field="incoterms" />
                <Field label="Payment Terms" value={po.paymentTerms} field="paymentTerms" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="section-card">
            <div className="section-header"><h3>Pricing Information</h3></div>
            <div className="section-body">
              <div className="form-grid-2">
                <Field label="Total Net Value" value={`${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(po.totalNetValue)}`} />
                <Field label="Currency" value={po.currency} />
                <Field label="Number of Items" value={items.length} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="section-card">
            <div className="section-header"><h3>Notes</h3></div>
            <div className="section-body">
              {editMode
                ? <textarea rows={6} value={editData.notes || ''} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))} style={{ width: '100%', resize: 'vertical', border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '8px', fontFamily: 'inherit', fontSize: '13px' }} />
                : <p style={{ fontSize: '14px', color: po.notes ? 'var(--xap-text-primary)' : 'var(--xap-text-secondary)' }}>{po.notes || 'No notes'}</p>
              }
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer edit bar */}
      {editMode && (
        <div className="sticky-footer">
          <span style={{ fontSize: '13px', color: 'var(--xap-text-secondary)', marginRight: 'auto' }}>
            Editing Purchase Order {po.poNumber}
          </span>
          <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          <button className="btn-primary" onClick={saveEdit}>Save</button>
        </div>
      )}

      {confirmDeleteItem && (
        <ConfirmDialog
          title="Delete Item"
          message={`Delete item ${confirmDeleteItem.itemNumber} (${confirmDeleteItem.materialName})?`}
          confirmLabel="Delete"
          confirmClass="btn-danger"
          onConfirm={() => { deletePOItem(confirmDeleteItem.id); setConfirmDeleteItem(null); showToast('Item deleted', 'success') }}
          onCancel={() => setConfirmDeleteItem(null)}
        />
      )}
    </div>
  )
}
