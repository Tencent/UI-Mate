import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastProvider'
import ValueHelpDialog from '../components/ValueHelpDialog'

export default function CreatePurchaseOrder() {
  const navigate = useNavigate()
  const { state, addPurchaseOrder } = useApp()
  const { showToast } = useToast()
  const { suppliers, materials, plants } = state

  const [activeTab, setActiveTab] = useState('general')
  const [general, setGeneral] = useState({
    supplierId: '', supplierName: '', poType: 'NB', poTypeName: 'Standard PO',
    purchasingOrg: '1000', purchasingGroup: 'Z01', plant: '1000', paymentTerms: 'NET30', incoterms: 'FOB', notes: ''
  })
  const [items, setItems] = useState([])
  const [showSupplierHelp, setShowSupplierHelp] = useState(false)
  const [showMaterialHelp, setShowMaterialHelp] = useState(null)
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!general.supplierName) errs.supplierName = 'Supplier is required'
    return errs
  }

  function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const now = new Date().toISOString().split('T')[0]
    const newId = 'po-' + Date.now()
    const maxPO = state.purchaseOrders.reduce((m, p) => Math.max(m, parseInt(p.poNumber) || 0), 4500001248)
    const poNumber = String(maxPO + 1)
    const totalNetValue = items.reduce((s, i) => s + (parseFloat(i.quantity) * parseFloat(i.netPrice) || 0), 0)
    const plant = plants.find(p => p.plantCode === general.plant)
    const newPO = {
      id: newId, poNumber, supplier: general.supplierId, supplierName: general.supplierName,
      poType: general.poType, poTypeName: general.poTypeName,
      purchasingOrg: general.purchasingOrg, purchasingOrgName: 'BestRun Purchasing Org',
      purchasingGroup: general.purchasingGroup, purchasingGroupName: 'General Purchasing',
      companyCode: '1000', createdDate: now, createdBy: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      totalNetValue: parseFloat(totalNetValue.toFixed(2)), currency: 'USD', status: 'Draft',
      deliveryStatus: 'On Time', plant: general.plant, plantName: plant?.name || '',
      paymentTerms: general.paymentTerms, incoterms: general.incoterms, notes: general.notes,
      lastChanged: now, lastChangedBy: `${state.currentUser.firstName} ${state.currentUser.lastName}`
    }
    const poItems = items.map((item, idx) => ({
      id: 'poi-' + Date.now() + idx,
      poId: newId, itemNumber: (idx + 1) * 10,
      materialId: item.materialId || '', materialName: item.materialName, materialNumber: item.materialNumber || '',
      quantity: parseFloat(item.quantity) || 0, unit: item.unit, netPrice: parseFloat(item.netPrice) || 0,
      priceUnit: 1, netValue: parseFloat(((parseFloat(item.quantity) || 0) * (parseFloat(item.netPrice) || 0)).toFixed(2)),
      currency: 'USD', deliveryDate: item.deliveryDate || '',
      plant: general.plant, storageLocation: 'SL01', taxCode: 'V1', accountAssignment: 'K', costCenter: 'CC1000', glAccount: '400000'
    }))
    addPurchaseOrder(newPO, poItems)
    showToast(`Purchase Order ${poNumber} created successfully`, 'success')
    navigate(`/app/purchase-order/${newId}`)
  }

  function addItem() {
    setItems(prev => [...prev, { materialId: '', materialName: '', materialNumber: '', quantity: '1', unit: 'PC', netPrice: '0', deliveryDate: '' }])
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
          onClick={() => navigate('/app/manage-purchase-orders')}>
          Purchase Orders /
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700 }}>New Purchase Order</h1>
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
                {/* Supplier with value help */}
                <div className="form-field">
                  <label>Supplier *</label>
                  <div className="value-help-input" style={errors.supplierName ? { borderColor: 'var(--xap-status-error)' } : {}}>
                    <input value={general.supplierName} onChange={e => setGeneral(g => ({ ...g, supplierName: e.target.value, supplierId: '' }))} placeholder="Supplier name" />
                    <button className="value-help-btn" onClick={() => setShowSupplierHelp(true)} title="Browse">⊞</button>
                  </div>
                  {errors.supplierName && <span style={{ fontSize: '11px', color: 'var(--xap-status-error)' }}>{errors.supplierName}</span>}
                </div>
                <div className="form-field">
                  <label>Purchase Order Type</label>
                  <select value={general.poType} onChange={e => {
                    const map = { NB: 'Standard PO', FO: 'Framework Order' }
                    setGeneral(g => ({ ...g, poType: e.target.value, poTypeName: map[e.target.value] || e.target.value }))
                  }}>
                    <option value="NB">NB — Standard PO</option>
                    <option value="FO">FO — Framework Order</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Purchasing Organization</label>
                  <select value={general.purchasingOrg} onChange={e => setGeneral(g => ({ ...g, purchasingOrg: e.target.value }))}>
                    <option value="1000">1000 — BestRun Purchasing Org</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Purchasing Group</label>
                  <select value={general.purchasingGroup} onChange={e => setGeneral(g => ({ ...g, purchasingGroup: e.target.value }))}>
                    <option value="Z01">Z01 — General Purchasing</option>
                    <option value="Z02">Z02 — Electronic Components</option>
                    <option value="Z03">Z03 — Industrial Parts</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Plant</label>
                  <select value={general.plant} onChange={e => setGeneral(g => ({ ...g, plant: e.target.value }))}>
                    {plants.map(p => <option key={p.plantCode} value={p.plantCode}>{p.plantCode} — {p.name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Payment Terms</label>
                  <select value={general.paymentTerms} onChange={e => setGeneral(g => ({ ...g, paymentTerms: e.target.value }))}>
                    {['NET30','NET45','NET60'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Incoterms</label>
                  <select value={general.incoterms} onChange={e => setGeneral(g => ({ ...g, incoterms: e.target.value }))}>
                    {['FOB','CIF','EXW','DAP'].map(t => <option key={t}>{t}</option>)}
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
                    <th>Delivery Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--xap-text-secondary)' }}>
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
                            {['PC','KG','EA','L','M'].map(u => <option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td><input type="number" min="0" step="0.01" style={{ width: '90px', border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', outline: 'none' }} value={item.netPrice} onChange={e => updateItem(idx, 'netPrice', e.target.value)} /></td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(netVal)}</td>
                        <td><input type="date" style={{ border: '1px solid var(--xap-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', outline: 'none' }} value={item.deliveryDate} onChange={e => updateItem(idx, 'deliveryDate', e.target.value)} /></td>
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
        <button className="btn-secondary" onClick={() => navigate('/app/manage-purchase-orders')}>Cancel</button>
        <button className="btn-primary" onClick={handleSave}>Save</button>
      </div>

      {showSupplierHelp && (
        <ValueHelpDialog
          title="Supplier"
          columns={[
            { key: 'supplierNumber', label: 'Supplier No.' },
            { key: 'name', label: 'Name' },
            { key: 'country', label: 'Country' },
            { key: 'city', label: 'City' }
          ]}
          rows={suppliers}
          onSelect={row => { setGeneral(g => ({ ...g, supplierId: row.id, supplierName: row.name })); setErrors(e => ({ ...e, supplierName: undefined })); setShowSupplierHelp(false) }}
          onCancel={() => setShowSupplierHelp(false)}
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
