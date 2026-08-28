import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastProvider'
import ValueHelpDialog from '../components/ValueHelpDialog'

export default function CreateSalesOrder() {
  const navigate = useNavigate()
  const { state, addSalesOrder } = useApp()
  const { showToast } = useToast()
  const { customers, materials } = state

  const [activeTab, setActiveTab] = useState('general')
  const [general, setGeneral] = useState({
    customerId: '', customerName: '', customerReference: '',
    salesOrg: '1000', salesOrgName: 'BestRun Sales Org',
    distributionChannel: '10', division: '00',
    paymentTerms: 'NET30', incoterms: 'FOB',
    requestedDeliveryDate: '', orderReason: '', notes: ''
  })
  const [items, setItems] = useState([])
  const [showCustomerHelp, setShowCustomerHelp] = useState(false)
  const [showMaterialHelp, setShowMaterialHelp] = useState(null)
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!general.customerName) errs.customerName = 'Customer is required'
    return errs
  }

  function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const now = new Date().toISOString().split('T')[0]
    const newId = 'so-' + Date.now()
    const maxSO = state.salesOrders.reduce((m, s) => Math.max(m, parseInt(s.soNumber) || 0), 1000001245)
    const soNumber = String(maxSO + 1)
    const totalNetValue = items.reduce((s, i) => s + (parseFloat(i.quantity) * parseFloat(i.netPrice) || 0), 0)
    const newSO = {
      id: newId, soNumber,
      customerId: general.customerId, customerName: general.customerName,
      customerReference: general.customerReference,
      salesOrg: general.salesOrg, salesOrgName: general.salesOrgName,
      distributionChannel: general.distributionChannel, division: general.division,
      orderType: 'OR', orderTypeName: 'Standard Order',
      createdDate: now, createdBy: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      status: 'Open',
      totalNetValue: parseFloat(totalNetValue.toFixed(2)), currency: 'USD',
      overallDeliveryStatus: 'Not Delivered', overallBillingStatus: 'Not Billed',
      paymentTerms: general.paymentTerms, incoterms: general.incoterms,
      requestedDeliveryDate: general.requestedDeliveryDate,
      orderReason: general.orderReason, notes: general.notes,
      lastChanged: now
    }
    const soItems = items.map((item, idx) => ({
      id: 'soi-' + Date.now() + idx,
      soId: newId, itemNumber: (idx + 1) * 10,
      materialId: item.materialId || '', materialName: item.materialName, materialNumber: item.materialNumber || '',
      quantity: parseFloat(item.quantity) || 0, unit: item.unit,
      netPrice: parseFloat(item.netPrice) || 0,
      netValue: parseFloat(((parseFloat(item.quantity) || 0) * (parseFloat(item.netPrice) || 0)).toFixed(2)),
      currency: 'USD', deliveryStatus: 'Not Delivered', billingStatus: 'Not Billed',
      rejectionReason: ''
    }))
    addSalesOrder(newSO, soItems)
    showToast(`Sales Order ${soNumber} created successfully`, 'success')
    navigate(`/app/sales-order/${newId}`)
  }

  function addItem() {
    setItems(prev => [...prev, { materialId: '', materialName: '', materialNumber: '', quantity: '1', unit: 'PC', netPrice: '0' }])
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function updateItem(idx, field, val) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item))
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--xap-border)', padding: '12px 24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--xap-blue)', marginBottom: '4px', cursor: 'pointer' }}
          onClick={() => navigate('/app/manage-sales-orders')}>
          Sales Orders /
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>New Sales Order</h1>
      </div>

      {/* Tabs */}
      <div className="object-tabs" style={{ paddingLeft: '24px', background: '#fff' }}>
        <button className={`object-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General Information</button>
        <button className={`object-tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Items ({items.length})</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {activeTab === 'general' && (
          <div className="section-card">
            <div className="section-header"><h3>General Information</h3></div>
            <div className="section-body">
              <div className="form-grid-2" style={{ gap: '20px' }}>
                {/* Customer with value help */}
                <div className="form-field">
                  <label>Customer *</label>
                  <div className="value-help-input" style={errors.customerName ? { borderColor: 'var(--xap-status-error)' } : {}}>
                    <input value={general.customerName} onChange={e => setGeneral(g => ({ ...g, customerName: e.target.value, customerId: '' }))} placeholder="Customer name" />
                    <button className="value-help-btn" onClick={() => setShowCustomerHelp(true)} title="Browse">⊞</button>
                  </div>
                  {errors.customerName && <span style={{ fontSize: '11px', color: 'var(--xap-status-error)' }}>{errors.customerName}</span>}
                </div>
                <div className="form-field">
                  <label>Customer Reference</label>
                  <input value={general.customerReference} onChange={e => setGeneral(g => ({ ...g, customerReference: e.target.value }))} placeholder="Customer PO number" />
                </div>
                <div className="form-field">
                  <label>Sales Organization</label>
                  <select value={general.salesOrg} onChange={e => setGeneral(g => ({ ...g, salesOrg: e.target.value }))}>
                    <option value="1000">1000 — BestRun Sales Org</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Distribution Channel</label>
                  <select value={general.distributionChannel} onChange={e => setGeneral(g => ({ ...g, distributionChannel: e.target.value }))}>
                    <option value="10">10 — Direct Sales</option>
                    <option value="20">20 — Indirect Sales</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Payment Terms</label>
                  <select value={general.paymentTerms} onChange={e => setGeneral(g => ({ ...g, paymentTerms: e.target.value }))}>
                    {['NET30', 'NET45', 'NET60', 'IMMEDIATE'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Incoterms</label>
                  <select value={general.incoterms} onChange={e => setGeneral(g => ({ ...g, incoterms: e.target.value }))}>
                    {['FOB', 'CIF', 'EXW', 'DAP'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Requested Delivery Date</label>
                  <input type="date" value={general.requestedDeliveryDate} onChange={e => setGeneral(g => ({ ...g, requestedDeliveryDate: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Order Reason</label>
                  <select value={general.orderReason} onChange={e => setGeneral(g => ({ ...g, orderReason: e.target.value }))}>
                    <option value="">— None —</option>
                    <option value="New Business">New Business</option>
                    <option value="Repeat Order">Repeat Order</option>
                    <option value="Promotional">Promotional</option>
                  </select>
                </div>
                <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Notes</label>
                  <textarea rows={2} value={general.notes} onChange={e => setGeneral(g => ({ ...g, notes: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="section-card">
            <div className="section-header">
              <h3>Items</h3>
              <button className="btn-secondary" onClick={addItem}>Add Item</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="xap-table">
                <thead>
                  <tr>
                    <th>Item #</th>
                    <th>Material</th>
                    <th>Material No.</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Net Price</th>
                    <th>Net Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--xap-text-secondary)' }}>
                      No items. Click "Add Item" to add line items.
                    </td></tr>
                  ) : items.map((item, idx) => {
                    const netVal = (parseFloat(item.quantity) || 0) * (parseFloat(item.netPrice) || 0)
                    return (
                      <tr key={idx}>
                        <td style={{ color: 'var(--xap-text-secondary)', fontSize: '13px' }}>{(idx + 1) * 10}</td>
                        <td>
                          <div className="value-help-input" style={{ minWidth: '150px' }}>
                            <input value={item.materialName} onChange={e => updateItem(idx, 'materialName', e.target.value)} placeholder="Material" style={{ minWidth: 0 }} />
                            <button className="value-help-btn" onClick={() => setShowMaterialHelp(idx)} title="Browse">⊞</button>
                          </div>
                        </td>
                        <td><input style={{ width: '100px', border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', outline: 'none' }} value={item.materialNumber} onChange={e => updateItem(idx, 'materialNumber', e.target.value)} placeholder="MAT-XXXX" /></td>
                        <td><input type="number" min="0" style={{ width: '70px', border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', outline: 'none' }} value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /></td>
                        <td>
                          <select value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}
                            style={{ border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px' }}>
                            {['PC', 'KG', 'EA', 'L', 'M'].map(u => <option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td><input type="number" min="0" step="0.01" style={{ width: '90px', border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', outline: 'none' }} value={item.netPrice} onChange={e => updateItem(idx, 'netPrice', e.target.value)} /></td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(netVal)}</td>
                        <td><button style={{ background: 'none', border: 'none', color: 'var(--xap-status-error)', fontSize: '18px', cursor: 'pointer' }} onClick={() => removeItem(idx)}>×</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky-footer">
        <button className="btn-secondary" onClick={() => navigate('/app/manage-sales-orders')}>Cancel</button>
        <button className="btn-primary" onClick={handleSave}>Save</button>
      </div>

      {showCustomerHelp && (
        <ValueHelpDialog
          title="Customer"
          columns={[
            { key: 'customerNumber', label: 'Customer No.' },
            { key: 'name', label: 'Name' },
            { key: 'country', label: 'Country' },
            { key: 'city', label: 'City' }
          ]}
          rows={customers}
          onSelect={row => { setGeneral(g => ({ ...g, customerId: row.id, customerName: row.name })); setErrors(e => ({ ...e, customerName: undefined })); setShowCustomerHelp(false) }}
          onCancel={() => setShowCustomerHelp(false)}
        />
      )}

      {showMaterialHelp !== null && (
        <ValueHelpDialog
          title="Material"
          columns={[
            { key: 'materialNumber', label: 'Material No.' },
            { key: 'description', label: 'Description' },
            { key: 'materialTypeName', label: 'Type' },
            { key: 'baseUnit', label: 'Unit' }
          ]}
          rows={materials}
          onSelect={row => {
            updateItem(showMaterialHelp, 'materialId', row.id)
            updateItem(showMaterialHelp, 'materialName', row.description)
            updateItem(showMaterialHelp, 'materialNumber', row.materialNumber)
            updateItem(showMaterialHelp, 'unit', row.baseUnit)
            updateItem(showMaterialHelp, 'netPrice', String(row.standardPrice))
            setShowMaterialHelp(null)
          }}
          onCancel={() => setShowMaterialHelp(null)}
        />
      )}
    </div>
  )
}
