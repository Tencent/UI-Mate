import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft } from 'lucide-react'

const BLANK = {
  code: '',
  discountType: 'percent',
  amount: '',
  description: '',
  usageLimit: '',
  usageLimitPerUser: '',
  minimumAmount: '',
  maximumAmount: '',
  dateExpires: '',
  freeShipping: false,
  excludeSaleItems: false,
}

export default function AddEditCoupon() {
  const { couponId } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const existing = couponId ? state.coupons.find(c => c.id === couponId) : null

  const [form, setForm] = useState(() => {
    if (existing) {
      return {
        code: existing.code || '',
        discountType: existing.discountType || 'percent',
        amount: existing.amount || '',
        description: existing.description || '',
        usageLimit: existing.usageLimit || '',
        usageLimitPerUser: existing.usageLimitPerUser || '',
        minimumAmount: existing.minimumAmount || '',
        maximumAmount: existing.maximumAmount || '',
        dateExpires: existing.dateExpires ? existing.dateExpires.substring(0, 10) : '',
        freeShipping: existing.freeShipping || false,
        excludeSaleItems: existing.excludeSaleItems || false,
      }
    }
    return { ...BLANK }
  })

  const [notice, setNotice] = useState(null)

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const save = () => {
    if (!form.code.trim()) {
      setNotice({ type: 'error', msg: 'Coupon code is required.' })
      return
    }

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      amount: parseFloat(form.amount) || 0,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      usageLimitPerUser: form.usageLimitPerUser ? parseInt(form.usageLimitPerUser) : null,
      minimumAmount: form.minimumAmount || null,
      maximumAmount: form.maximumAmount || null,
      dateExpires: form.dateExpires ? new Date(form.dateExpires).toISOString() : null,
    }

    if (existing) {
      dispatch({ type: 'UPDATE_COUPON', payload: { id: existing.id, ...payload, dateModified: new Date().toISOString() } })
      setNotice({ type: 'success', msg: 'Coupon updated.' })
      setTimeout(() => navTo('/coupons'), 1000)
    } else {
      const newCoupon = {
        id: `coupon_${Date.now()}`,
        ...payload,
        usageCount: 0,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_COUPON', payload: newCoupon })
      setNotice({ type: 'success', msg: 'Coupon created.' })
      setTimeout(() => navTo('/coupons'), 1000)
    }
  }

  return (
    <div>
      {notice && (
        <div className={`notice notice-${notice.type}`}>
          <span>{notice.msg}</span>
          <button className="notice-dismiss" onClick={() => setNotice(null)}>×</button>
        </div>
      )}

      <div className="wp-page-title">
        <h1>{existing ? `Edit Coupon: ${existing.code}` : 'Add Coupon'}</h1>
        <button className="button" onClick={() => navTo('/coupons')}>
          <ChevronLeft size={14} /> Back to coupons
        </button>
      </div>

      <div className="wp-two-col">
        <div className="wp-col-main">
          <div className="postbox">
            <div className="postbox-header">General</div>
            <div className="postbox-body">
              <table className="form-table">
                <tbody>
                  <tr>
                    <th><label>Coupon code</label></th>
                    <td>
                      <input
                        type="text"
                        value={form.code}
                        onChange={e => set('code', e.target.value.toUpperCase())}
                        style={{ width: 300, textTransform: 'uppercase' }}
                        placeholder="e.g. SAVE10"
                      />
                      <div className="description">The coupon code customers enter at checkout.</div>
                    </td>
                  </tr>
                  <tr>
                    <th><label>Discount type</label></th>
                    <td>
                      <select value={form.discountType} onChange={e => set('discountType', e.target.value)} style={{ height: 30, width: 250 }}>
                        <option value="percent">Percentage discount</option>
                        <option value="fixed_cart">Fixed cart discount</option>
                        <option value="fixed_product">Fixed product discount</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <th><label>Coupon amount</label></th>
                    <td>
                      <input
                        type="number"
                        value={form.amount}
                        onChange={e => set('amount', e.target.value)}
                        style={{ width: 100 }}
                        min="0"
                        step="0.01"
                      />
                      <span style={{ marginLeft: 6, color: '#646970', fontSize: 13 }}>
                        {form.discountType === 'percent' ? '%' : '$'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th><label>Description</label></th>
                    <td>
                      <textarea
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        rows={3}
                        style={{ width: '100%' }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th><label>Allow free shipping</label></th>
                    <td>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.freeShipping} onChange={e => set('freeShipping', e.target.checked)} />
                        Check this box if the coupon grants free shipping.
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <th><label>Exclude sale items</label></th>
                    <td>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.excludeSaleItems} onChange={e => set('excludeSaleItems', e.target.checked)} />
                        Do not apply this coupon to items on sale.
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="postbox">
            <div className="postbox-header">Usage restriction</div>
            <div className="postbox-body">
              <table className="form-table">
                <tbody>
                  <tr>
                    <th><label>Minimum spend</label></th>
                    <td>
                      <input
                        type="number"
                        value={form.minimumAmount}
                        onChange={e => set('minimumAmount', e.target.value)}
                        style={{ width: 120 }}
                        min="0"
                        step="0.01"
                        placeholder="No minimum"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th><label>Maximum spend</label></th>
                    <td>
                      <input
                        type="number"
                        value={form.maximumAmount}
                        onChange={e => set('maximumAmount', e.target.value)}
                        style={{ width: 120 }}
                        min="0"
                        step="0.01"
                        placeholder="No maximum"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="postbox">
            <div className="postbox-header">Usage limits</div>
            <div className="postbox-body">
              <table className="form-table">
                <tbody>
                  <tr>
                    <th><label>Usage limit per coupon</label></th>
                    <td>
                      <input
                        type="number"
                        value={form.usageLimit}
                        onChange={e => set('usageLimit', e.target.value)}
                        style={{ width: 100 }}
                        min="0"
                        placeholder="Unlimited"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th><label>Usage limit per user</label></th>
                    <td>
                      <input
                        type="number"
                        value={form.usageLimitPerUser}
                        onChange={e => set('usageLimitPerUser', e.target.value)}
                        style={{ width: 100 }}
                        min="0"
                        placeholder="Unlimited"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="wp-col-side">
          <div className="postbox">
            <div className="postbox-header">Expiry date</div>
            <div className="postbox-body">
              <input
                type="date"
                value={form.dateExpires}
                onChange={e => set('dateExpires', e.target.value)}
                style={{ width: '100%' }}
              />
              <div className="description" style={{ marginTop: 6 }}>Leave blank for no expiry.</div>
            </div>
          </div>

          <div className="postbox">
            <div className="postbox-header">Publish</div>
            <div className="postbox-body">
              <button className="button-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={save}>
                {existing ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
