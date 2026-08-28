import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastProvider'

const MATERIAL_TYPE_LABELS = {
  'HAWA': 'Trading Goods', 'ROH': 'Raw Material',
  'FERT': 'Finished Product', 'HALB': 'Semi-Finished'
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateMaterial } = useApp()
  const { showToast } = useToast()
  const mat = state.materials.find(m => m.id === id)

  const [activeTab, setActiveTab] = useState('general')
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})

  if (!mat) return <div style={{ padding: '24px', color: 'var(--xap-text-secondary)' }}>Material not found.</div>

  function startEdit() { setEditData({ ...mat }); setEditMode(true) }
  function cancelEdit() { setEditData({}); setEditMode(false) }
  function saveEdit() {
    updateMaterial(id, editData)
    setEditMode(false)
    showToast(`Material ${mat.materialNumber} saved successfully`, 'success')
  }

  const TABS = ['general', 'purchasing', 'sales', 'accounting', 'plant']
  const TAB_LABELS = { general: 'General Data', purchasing: 'Purchasing', sales: 'Sales', accounting: 'Accounting', plant: 'Plant Data' }

  function Field({ label, value, field, type = 'text', options }) {
    if (editMode && field) {
      if (type === 'select') {
        return (
          <div className="form-field">
            <label>{label}</label>
            <select value={editData[field] !== undefined ? editData[field] : ''} onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))}>
              {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
            </select>
          </div>
        )
      }
      return (
        <div className="form-field">
          <label>{label}</label>
          <input type={type} value={editData[field] !== undefined ? editData[field] : ''} onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))} />
        </div>
      )
    }
    return (
      <div className="form-field">
        <label>{label}</label>
        <div style={{ fontSize: '14px', padding: '6px 0', color: 'var(--xap-text-primary)', borderBottom: '1px solid var(--xap-border)', minHeight: '32px' }}>
          {value !== undefined && value !== null && value !== '' ? String(value) : '—'}
        </div>
      </div>
    )
  }

  const statusOptions = [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]
  const unitOptions = ['PC', 'KG', 'EA', 'L', 'M']
  const typeOptions = Object.entries(MATERIAL_TYPE_LABELS).map(([k, v]) => ({ value: k, label: `${k} — ${v}` }))

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--xap-border)', padding: '12px 24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--xap-blue)', marginBottom: '4px', cursor: 'pointer' }}
          onClick={() => navigate('/app/manage-products')}>
          Materials /
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--xap-text-primary)' }}>{mat.materialNumber}</h1>
            <div style={{ fontSize: '13px', color: 'var(--xap-text-secondary)' }}>
              {mat.materialType} — {MATERIAL_TYPE_LABELS[mat.materialType] || mat.materialType} · {mat.description}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`status-badge ${(mat.status || 'Active') === 'Active' ? 'status-delivered' : 'status-draft'}`}>
              {mat.status || 'Active'}
            </span>
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
            <div className="section-header"><h3>General Data</h3></div>
            <div className="section-body">
              <div className="form-grid-3" style={{ gap: '20px' }}>
                <Field label="Material Number" value={mat.materialNumber} />
                <Field label="Description" value={mat.description} field="description" />
                <Field label="Material Type" value={`${mat.materialType} — ${MATERIAL_TYPE_LABELS[mat.materialType] || mat.materialType}`}
                  field="materialType" type="select" options={typeOptions} />
                <Field label="Base Unit of Measure" value={mat.baseUnit} field="baseUnit" type="select"
                  options={unitOptions} />
                <Field label="Material Group" value={mat.materialGroup || '—'} field="materialGroup" />
                <Field label="Status" value={mat.status || 'Active'} field="status" type="select" options={statusOptions} />
                <Field label="Gross Weight" value={mat.grossWeight ? `${mat.grossWeight} KG` : '—'} field="grossWeight" type="number" />
                <Field label="Net Weight" value={mat.netWeight ? `${mat.netWeight} KG` : '—'} field="netWeight" type="number" />
                <Field label="Volume" value={mat.volume ? `${mat.volume} L` : '—'} field="volume" type="number" />
                <Field label="Division" value={mat.division || '—'} />
                <Field label="Industry Sector" value={mat.industrySector || 'M — Mechanical Engineering'} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'purchasing' && (
          <div className="section-card">
            <div className="section-header"><h3>Purchasing Data</h3></div>
            <div className="section-body">
              <div className="form-grid-2" style={{ gap: '20px' }}>
                <Field label="Purchase Order Unit" value={mat.purchaseOrderUnit || mat.baseUnit} field="purchaseOrderUnit" type="select" options={unitOptions} />
                <Field label="Purchasing Group" value={mat.purchasingGroup || 'Z01 — General Purchasing'} />
                <Field label="Planned Delivery Time (days)" value={mat.plannedDeliveryTime || '7'} field="plannedDeliveryTime" type="number" />
                <Field label="Minimum Order Quantity" value={mat.minimumOrderQty || '1'} field="minimumOrderQty" type="number" />
                <Field label="Goods Receipt Processing Time (days)" value={mat.grProcessingTime || '1'} />
                <Field label="Net Price" value={mat.standardPrice ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(mat.standardPrice) : '—'} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="section-card">
            <div className="section-header"><h3>Sales Data</h3></div>
            <div className="section-body">
              <div className="form-grid-2" style={{ gap: '20px' }}>
                <Field label="Sales Unit" value={mat.salesUnit || mat.baseUnit} field="salesUnit" type="select" options={unitOptions} />
                <Field label="Delivering Plant" value={mat.deliveringPlant || '1000'} />
                <Field label="Minimum Delivery Quantity" value={mat.minDeliveryQty || '1'} field="minDeliveryQty" type="number" />
                <Field label="Item Category Group" value={mat.itemCategoryGroup || 'NORM'} />
                <Field label="Availability Check" value={mat.availabilityCheck || '02 — Individual requirements'} />
                <Field label="Loading Group" value={mat.loadingGroup || '0001'} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounting' && (
          <div className="section-card">
            <div className="section-header"><h3>Accounting / Costing</h3></div>
            <div className="section-body">
              <div className="form-grid-2" style={{ gap: '20px' }}>
                <Field label="Standard Price" value={mat.standardPrice ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(mat.standardPrice) : '—'} field="standardPrice" type="number" />
                <Field label="Currency" value={mat.currency || 'USD'} />
                <Field label="Price Unit" value={mat.priceUnit || '1'} />
                <Field label="Valuation Class" value={mat.valuationClass || '3100'} />
                <Field label="Moving Average Price" value={mat.movingAveragePrice ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(mat.movingAveragePrice) : '—'} />
                <Field label="Total Stock Value" value={mat.totalStockValue ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(mat.totalStockValue) : '—'} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plant' && (
          <div className="section-card">
            <div className="section-header"><h3>Plant Data / Storage</h3></div>
            <div className="section-body">
              <div className="form-grid-2" style={{ gap: '20px' }}>
                <Field label="Plant" value="1000 — Dallas Manufacturing" />
                <Field label="Storage Location" value="SL01 — Main Warehouse" />
                <Field label="Total Stock" value={mat.totalStock !== undefined ? `${mat.totalStock} ${mat.baseUnit}` : '—'} />
                <Field label="Unrestricted Stock" value={mat.unrestrictedStock !== undefined ? `${mat.unrestrictedStock} ${mat.baseUnit}` : '—'} />
                <Field label="Reorder Point" value={mat.reorderPoint || '10'} field="reorderPoint" type="number" />
                <Field label="Maximum Stock Level" value={mat.maxStockLevel || '500'} />
                <Field label="Safety Stock" value={mat.safetyStock || '5'} />
                <Field label="Batch Management" value={mat.batchManagement ? 'Yes' : 'No'} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer edit bar */}
      {editMode && (
        <div className="sticky-footer">
          <span style={{ fontSize: '13px', color: 'var(--xap-text-secondary)', marginRight: 'auto' }}>
            Editing Material {mat.materialNumber}
          </span>
          <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          <button className="btn-primary" onClick={saveEdit}>Save</button>
        </div>
      )}
    </div>
  )
}
