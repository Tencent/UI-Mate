import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const TABS = [
  { label: 'General', path: '/settings/general' },
  { label: 'Products', path: '/settings/products' },
  { label: 'Tax', path: '/settings/tax' },
  { label: 'Shipping', path: '/settings/shipping' },
  { label: 'Payments', path: '/settings/payments' },
  { label: 'Accounts & Privacy', path: '/settings/accounts' },
  { label: 'Emails', path: '/settings/emails' },
]

function SettingsTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <div className="wc-settings-tabs">
      {TABS.map(tab => (
        <button
          key={tab.path}
          className={`wc-settings-tab ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => {
            const sid = new URL(window.location.href).searchParams.get('sid')
            navigate(sid ? `${tab.path}?sid=${sid}` : tab.path)
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function SettingsGeneral() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ ...state.store })
  const [notice, setNotice] = useState(null)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const setAddr = (field, value) => setForm(f => ({ ...f, address: { ...f.address, [field]: value } }))

  const save = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form })
    setNotice('Your settings have been saved.')
    setTimeout(() => setNotice(null), 4000)
  }

  return (
    <div>
      <div className="wp-page-title"><h1>XooCommerce settings</h1></div>
      <SettingsTabs />
      {notice && (
        <div className="notice notice-success">
          <span>{notice}</span>
          <button className="notice-dismiss" onClick={() => setNotice(null)}>×</button>
        </div>
      )}
      <div className="wc-card">
        <div className="wc-card-body">
          <div className="wc-settings-section">
            <div className="wc-settings-section-title">Store Address</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>Address line 1</th>
                  <td><input type="text" value={form.address?.address1 || ''} onChange={e => setAddr('address1', e.target.value)} style={{ width: 300 }} /></td>
                </tr>
                <tr>
                  <th>Address line 2</th>
                  <td><input type="text" value={form.address?.address2 || ''} onChange={e => setAddr('address2', e.target.value)} style={{ width: 300 }} /></td>
                </tr>
                <tr>
                  <th>City</th>
                  <td><input type="text" value={form.address?.city || ''} onChange={e => setAddr('city', e.target.value)} style={{ width: 200 }} /></td>
                </tr>
                <tr>
                  <th>Country / State</th>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <select value={form.address?.country || 'US'} onChange={e => setAddr('country', e.target.value)} style={{ height: 30, width: 150 }}>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                    <input type="text" value={form.address?.state || ''} onChange={e => setAddr('state', e.target.value)} placeholder="State" style={{ width: 80 }} />
                  </td>
                </tr>
                <tr>
                  <th>Postcode / ZIP</th>
                  <td><input type="text" value={form.address?.postcode || ''} onChange={e => setAddr('postcode', e.target.value)} style={{ width: 120 }} /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="wc-settings-section">
            <div className="wc-settings-section-title">General Options</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>Selling location(s)</th>
                  <td>
                    <select value={form.sellingLocation || 'all'} onChange={e => set('sellingLocation', e.target.value)} style={{ height: 30, width: 250 }}>
                      <option value="all">Sell to all countries</option>
                      <option value="specific">Sell to specific countries only</option>
                      <option value="except">Sell to all countries, except for…</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>Shipping location(s)</th>
                  <td>
                    <select value={form.shippingLocation || 'all'} onChange={e => set('shippingLocation', e.target.value)} style={{ height: 30, width: 250 }}>
                      <option value="all">Ship to all countries you sell to</option>
                      <option value="specific">Ship to specific countries only</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>Enable tax</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.enableTax} onChange={e => set('enableTax', e.target.checked)} />
                      Enable tax rates and calculations
                    </label>
                  </td>
                </tr>
                <tr>
                  <th>Enable coupons</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.enableCoupons} onChange={e => set('enableCoupons', e.target.checked)} />
                      Enable the use of coupon codes
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="wc-settings-section">
            <div className="wc-settings-section-title">Currency Options</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>Currency</th>
                  <td>
                    <select value={form.currency} onChange={e => set('currency', e.target.value)} style={{ height: 30, width: 250 }}>
                      <option value="USD">United States Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">Pound Sterling (£)</option>
                      <option value="CAD">Canadian Dollar (C$)</option>
                      <option value="AUD">Australian Dollar (A$)</option>
                    </select>
                    <div className="description">This controls what currency prices are listed at in the catalog and which currency gateways will take payments in.</div>
                  </td>
                </tr>
                <tr>
                  <th>Currency position</th>
                  <td>
                    <select value={form.currencyPosition} onChange={e => set('currencyPosition', e.target.value)} style={{ height: 30, width: 200 }}>
                      <option value="left">Left ($99.99)</option>
                      <option value="right">Right (99.99$)</option>
                      <option value="left_space">Left with space ($ 99.99)</option>
                      <option value="right_space">Right with space (99.99 $)</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>Thousand separator</th>
                  <td><input type="text" value={form.thousandSeparator} onChange={e => set('thousandSeparator', e.target.value)} style={{ width: 50 }} /></td>
                </tr>
                <tr>
                  <th>Decimal separator</th>
                  <td><input type="text" value={form.decimalSeparator} onChange={e => set('decimalSeparator', e.target.value)} style={{ width: 50 }} /></td>
                </tr>
                <tr>
                  <th>Number of decimals</th>
                  <td><input type="number" value={form.decimals} onChange={e => set('decimals', parseInt(e.target.value))} style={{ width: 60 }} min={0} max={4} /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className="button-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  )
}

export function SettingsProducts() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ ...state.store })
  const [notice, setNotice] = useState(null)
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const save = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form })
    setNotice('Your settings have been saved.')
    setTimeout(() => setNotice(null), 4000)
  }
  return (
    <div>
      <div className="wp-page-title"><h1>XooCommerce settings</h1></div>
      <SettingsTabs />
      {notice && <div className="notice notice-success"><span>{notice}</span><button className="notice-dismiss" onClick={() => setNotice(null)}>×</button></div>}
      <div className="wc-card">
        <div className="wc-card-body">
          <div className="wc-settings-section">
            <div className="wc-settings-section-title">Measurements</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>Weight unit</th>
                  <td>
                    <select value={form.weightUnit} onChange={e => set('weightUnit', e.target.value)} style={{ height: 30 }}>
                      {['kg', 'g', 'lbs', 'oz'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>Dimensions unit</th>
                  <td>
                    <select value={form.dimensionUnit} onChange={e => set('dimensionUnit', e.target.value)} style={{ height: 30 }}>
                      {['m', 'cm', 'mm', 'in', 'yd'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="wc-settings-section">
            <div className="wc-settings-section-title">Reviews</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>Enable reviews</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.enableReviews} onChange={e => set('enableReviews', e.target.checked)} />
                      Enable product reviews
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="button-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  )
}

export function SettingsTax() {
  const { state, dispatch } = useApp()
  const [taxRates, setTaxRates] = useState(state.taxRates)
  const [notice, setNotice] = useState(null)

  const save = () => {
    taxRates.forEach(t => dispatch({ type: 'UPDATE_TAX_RATE', payload: t }))
    setNotice('Your settings have been saved.')
    setTimeout(() => setNotice(null), 4000)
  }

  const addRow = () => {
    setTaxRates(prev => [...prev, { id: `tax_${Date.now()}`, country: 'US', state: '', postcode: '', city: '', rate: '0.00', name: 'Tax', priority: 1, compound: false, shipping: true, taxClass: 'standard' }])
  }

  const removeRow = (id) => setTaxRates(prev => prev.filter(t => t.id !== id))

  const updateRow = (id, field, value) => {
    setTaxRates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  return (
    <div>
      <div className="wp-page-title"><h1>XooCommerce settings</h1></div>
      <SettingsTabs />
      {notice && <div className="notice notice-success"><span>{notice}</span><button className="notice-dismiss" onClick={() => setNotice(null)}>×</button></div>}
      <div className="wc-card">
        <div className="wc-card-body">
          <div className="wc-settings-section-title" style={{ marginBottom: 12 }}>Standard Rates</div>
          <table className="wp-list-table" style={{ marginBottom: 12 }}>
            <thead>
              <tr>
                <th>Country Code</th><th>State Code</th><th>Postcode</th><th>City</th><th>Rate %</th><th>Tax Name</th><th>Priority</th><th>Compound</th><th>Shipping</th><th></th>
              </tr>
            </thead>
            <tbody>
              {taxRates.map(t => (
                <tr key={t.id}>
                  {['country', 'state', 'postcode', 'city'].map(field => (
                    <td key={field}><input type="text" value={t[field]} onChange={e => updateRow(t.id, field, e.target.value)} style={{ width: 60, height: 26 }} /></td>
                  ))}
                  <td><input type="text" value={t.rate} onChange={e => updateRow(t.id, 'rate', e.target.value)} style={{ width: 60, height: 26 }} /></td>
                  <td><input type="text" value={t.name} onChange={e => updateRow(t.id, 'name', e.target.value)} style={{ width: 80, height: 26 }} /></td>
                  <td><input type="number" value={t.priority} onChange={e => updateRow(t.id, 'priority', parseInt(e.target.value))} style={{ width: 50, height: 26 }} /></td>
                  <td><input type="checkbox" checked={t.compound} onChange={e => updateRow(t.id, 'compound', e.target.checked)} /></td>
                  <td><input type="checkbox" checked={t.shipping} onChange={e => updateRow(t.id, 'shipping', e.target.checked)} /></td>
                  <td><button className="button-link" style={{ color: '#d63638' }} onClick={() => removeRow(t.id)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="button" style={{ marginBottom: 16 }} onClick={addRow}>Insert row</button>
          <div>
            <button className="button-primary" onClick={save}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SettingsShipping() {
  const { state, dispatch } = useApp()
  const [notice, setNotice] = useState(null)
  const save = () => { setNotice('Your settings have been saved.'); setTimeout(() => setNotice(null), 4000) }
  return (
    <div>
      <div className="wp-page-title"><h1>XooCommerce settings</h1></div>
      <SettingsTabs />
      {notice && <div className="notice notice-success"><span>{notice}</span><button className="notice-dismiss" onClick={() => setNotice(null)}>×</button></div>}
      <div className="wc-card">
        <div className="wc-card-header">Shipping Zones</div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead>
            <tr><th>Zone name</th><th>Region(s)</th><th>Shipping methods</th></tr>
          </thead>
          <tbody>
            {state.shippingZones.map(zone => (
              <tr key={zone.id}>
                <td style={{ fontWeight: 600 }}>{zone.name}</td>
                <td>{zone.regions.join(', ')}</td>
                <td style={{ fontSize: 12 }}>
                  {zone.methods.filter(m => m.enabled).map(m => (
                    <div key={m.id}>{m.title}{m.cost ? `: $${m.cost}` : ''}{m.minAmount ? ` (min $${m.minAmount})` : ''}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: 12 }}>
          <button className="button-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  )
}

export function SettingsPayments() {
  const { state, dispatch } = useApp()
  const [notice, setNotice] = useState(null)
  const [managingGateway, setManagingGateway] = useState(null)
  const toggle = (id, enabled) => dispatch({ type: 'UPDATE_PAYMENT_GATEWAY', payload: { id, enabled } })
  const save = () => { setNotice('Your settings have been saved.'); setTimeout(() => setNotice(null), 4000) }
  return (
    <div>
      <div className="wp-page-title"><h1>XooCommerce settings</h1></div>
      <SettingsTabs />
      {notice && <div className="notice notice-success"><span>{notice}</span><button className="notice-dismiss" onClick={() => setNotice(null)}>×</button></div>}
      <div className="wc-card">
        <div className="wc-card-header">Payment gateways</div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead>
            <tr><th>Enabled</th><th>Payment method</th><th>Description</th><th>Action</th></tr>
          </thead>
          <tbody>
            {state.paymentGateways.map(gw => (
              <tr key={gw.id}>
                <td>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={gw.enabled} onChange={e => toggle(gw.id, e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </td>
                <td style={{ fontWeight: 600 }}>{gw.title}</td>
                <td style={{ color: '#646970', fontSize: 12 }}>{gw.description}</td>
                <td>
                  <button className="button" style={{ fontSize: 12, height: 26 }} onClick={() => setManagingGateway(managingGateway === gw.id ? null : gw.id)}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {managingGateway && (
          <div style={{ padding: 16, borderTop: '1px solid #dcdcde', background: '#f6f7f7' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              {state.paymentGateways.find(g => g.id === managingGateway)?.title} Settings
            </div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>Enable/Disable</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={state.paymentGateways.find(g => g.id === managingGateway)?.enabled} onChange={e => toggle(managingGateway, e.target.checked)} />
                      Enable {state.paymentGateways.find(g => g.id === managingGateway)?.title}
                    </label>
                  </td>
                </tr>
                <tr>
                  <th>Title</th>
                  <td><input type="text" defaultValue={state.paymentGateways.find(g => g.id === managingGateway)?.title} style={{ width: 300 }} /></td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td><textarea rows={3} defaultValue={state.paymentGateways.find(g => g.id === managingGateway)?.description} style={{ width: '100%' }} /></td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="button-primary" onClick={() => { setManagingGateway(null); save() }}>Save changes</button>
              <button className="button" onClick={() => setManagingGateway(null)}>Close</button>
            </div>
          </div>
        )}
        <div style={{ padding: 12 }}>
          <button className="button-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  )
}

export function SettingsAccounts() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({
    enableGuestCheckout: true,
    enableAccountCreation: true,
    enableAccountCreationDuringCheckout: true,
    enableLoginDuringCheckout: true,
    deleteInactiveAccounts: false,
    inactiveAccountDays: 365,
    removePersonalDataOnErasure: true,
    privacyPage: '',
    termsPage: '',
  })
  const [notice, setNotice] = useState(null)
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const save = () => { setNotice('Your settings have been saved.'); setTimeout(() => setNotice(null), 4000) }

  return (
    <div>
      <div className="wp-page-title"><h1>XooCommerce settings</h1></div>
      <SettingsTabs />
      {notice && <div className="notice notice-success"><span>{notice}</span><button className="notice-dismiss" onClick={() => setNotice(null)}>×</button></div>}
      <div className="wc-card">
        <div className="wc-card-body">
          <div className="wc-settings-section">
            <div className="wc-settings-section-title">Guest Checkout</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>Allow guest checkout</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.enableGuestCheckout} onChange={e => set('enableGuestCheckout', e.target.checked)} />
                      Allow customers to place orders without an account
                    </label>
                  </td>
                </tr>
                <tr>
                  <th>Login during checkout</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.enableLoginDuringCheckout} onChange={e => set('enableLoginDuringCheckout', e.target.checked)} />
                      Allow customers to log into an existing account during checkout
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="wc-settings-section">
            <div className="wc-settings-section-title">Account Creation</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>During checkout</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.enableAccountCreationDuringCheckout} onChange={e => set('enableAccountCreationDuringCheckout', e.target.checked)} />
                      Allow customers to create an account during checkout
                    </label>
                  </td>
                </tr>
                <tr>
                  <th>On "My Account" page</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.enableAccountCreation} onChange={e => set('enableAccountCreation', e.target.checked)} />
                      Allow customers to create an account on the "My Account" page
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="wc-settings-section">
            <div className="wc-settings-section-title">Privacy Policy</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>Account erasure requests</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.removePersonalDataOnErasure} onChange={e => set('removePersonalDataOnErasure', e.target.checked)} />
                      Remove personal data from orders on request
                    </label>
                    <div className="description">When handling an account erasure request, should personal data within orders be retained or removed?</div>
                  </td>
                </tr>
                <tr>
                  <th>Inactive accounts</th>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.deleteInactiveAccounts} onChange={e => set('deleteInactiveAccounts', e.target.checked)} />
                      Delete inactive accounts after
                    </label>
                    <input type="number" value={form.inactiveAccountDays} onChange={e => set('inactiveAccountDays', parseInt(e.target.value))} style={{ width: 80, marginLeft: 4 }} min="30" /> days
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="button-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  )
}

export function SettingsEmails() {
  const { state } = useApp()
  const [notice, setNotice] = useState(null)
  const [emailNotifications] = useState([
    { id: 'new_order', title: 'New order', recipient: state.store.email, enabled: true, description: 'New order emails are sent to chosen recipient(s) when a new order is received.' },
    { id: 'cancelled_order', title: 'Cancelled order', recipient: state.store.email, enabled: true, description: 'Cancelled order emails are sent to chosen recipient(s) when orders have been marked cancelled.' },
    { id: 'failed_order', title: 'Failed order', recipient: state.store.email, enabled: true, description: 'Failed order emails are sent to chosen recipient(s) when orders have been marked failed.' },
    { id: 'order_on_hold', title: 'Order on-hold', recipient: 'Customer', enabled: true, description: 'This is an order notification sent to customers containing order details after an order is placed on-hold.' },
    { id: 'processing_order', title: 'Processing order', recipient: 'Customer', enabled: true, description: 'This is an order notification sent to customers containing order details after payment.' },
    { id: 'completed_order', title: 'Completed order', recipient: 'Customer', enabled: true, description: 'Order complete emails are sent to customers when their orders are marked completed.' },
    { id: 'refunded_order', title: 'Refunded order', recipient: 'Customer', enabled: true, description: 'Order refunded emails are sent to customers when their orders are refunded.' },
    { id: 'customer_invoice', title: 'Customer invoice / Order details', recipient: 'Customer', enabled: true, description: 'Customer invoice emails can be sent to customers containing their order information and payment links.' },
    { id: 'customer_note', title: 'Customer note', recipient: 'Customer', enabled: true, description: 'Customer note emails are sent when you add a note to an order.' },
    { id: 'reset_password', title: 'Reset password', recipient: 'Customer', enabled: true, description: 'Customer "reset password" emails are sent when customers reset their passwords.' },
    { id: 'new_account', title: 'New account', recipient: 'Customer', enabled: true, description: 'Customer "new account" emails are sent to the customer when a customer signs up via checkout or account pages.' },
  ])
  const save = () => { setNotice('Your settings have been saved.'); setTimeout(() => setNotice(null), 4000) }

  return (
    <div>
      <div className="wp-page-title"><h1>XooCommerce settings</h1></div>
      <SettingsTabs />
      {notice && <div className="notice notice-success"><span>{notice}</span><button className="notice-dismiss" onClick={() => setNotice(null)}>×</button></div>}
      <div className="wc-card">
        <div className="wc-card-header">Email notifications</div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Recipient(s)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {emailNotifications.map(en => (
              <tr key={en.id}>
                <td>
                  <strong style={{ fontSize: 13 }}>{en.title}</strong>
                  <div style={{ fontSize: 12, color: '#646970', marginTop: 2 }}>{en.description}</div>
                </td>
                <td style={{ fontSize: 13 }}>{en.recipient}</td>
                <td>
                  {en.enabled ? (
                    <span style={{ color: '#5b841b', fontSize: 12 }}>Enabled</span>
                  ) : (
                    <span style={{ color: '#646970', fontSize: 12 }}>Disabled</span>
                  )}
                </td>
                <td>
                  <button className="button" style={{ fontSize: 12, height: 26 }} onClick={() => setNotice(`${en.title} notification settings opened. (Mock only)`)}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="wc-card">
        <div className="wc-card-body">
          <div className="wc-settings-section">
            <div className="wc-settings-section-title">Email Sender Options</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <th>"From" name</th>
                  <td><input type="text" defaultValue={state.store.name} style={{ width: 250 }} /></td>
                </tr>
                <tr>
                  <th>"From" address</th>
                  <td><input type="email" defaultValue={state.store.email} style={{ width: 250 }} /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="button-primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  )
}
