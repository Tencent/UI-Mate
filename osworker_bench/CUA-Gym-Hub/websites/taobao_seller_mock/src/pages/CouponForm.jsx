import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'

export default function CouponForm() {
  const { id } = useParams()
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const isEdit = !!id

  const existing = isEdit ? state.coupons.find(c => c.id === id) : null

  const [form, setForm] = useState({
    name: existing?.name || '',
    type: existing?.type || 'threshold',
    discountAmount: existing?.discountAmount || '',
    threshold: existing?.threshold || '',
    discountRate: existing?.discountRate ? (existing.discountRate * 10).toFixed(1) : '',
    startDate: existing?.startDate || '',
    endDate: existing?.endDate || '',
    totalQuantity: existing?.totalQuantity || '',
    scope: existing?.scope || 'all',
    scopeValue: existing?.scopeValue || '',
    status: existing?.status || 'active',
  })

  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = '请填写优惠券名称'
    if (form.type === 'threshold') {
      if (!form.discountAmount || Number(form.discountAmount) <= 0) errs.discountAmount = '请填写减免金额'
      if (!form.threshold || Number(form.threshold) <= 0) errs.threshold = '请填写消费门槛'
    }
    if (form.type === 'percentage') {
      if (!form.discountRate || Number(form.discountRate) <= 0 || Number(form.discountRate) >= 10) errs.discountRate = '请填写有效折扣（0-10折）'
    }
    if (form.type === 'fixed') {
      if (!form.discountAmount || Number(form.discountAmount) <= 0) errs.discountAmount = '请填写减免金额'
    }
    if (!form.startDate) errs.startDate = '请选择开始日期'
    if (!form.endDate) errs.endDate = '请选择结束日期'
    if (!form.totalQuantity || Number(form.totalQuantity) <= 0) errs.totalQuantity = '请填写发放数量'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) return

    const payload = {
      id: isEdit ? id : `coupon_${Date.now()}`,
      name: form.name,
      type: form.type,
      discountAmount: form.type !== 'percentage' ? Number(form.discountAmount) : null,
      threshold: form.type === 'threshold' ? Number(form.threshold) : (form.type === 'fixed' ? 0 : null),
      discountRate: form.type === 'percentage' ? Number(form.discountRate) / 10 : null,
      startDate: form.startDate,
      endDate: form.endDate,
      totalQuantity: Number(form.totalQuantity),
      usedQuantity: existing?.usedQuantity || 0,
      claimedQuantity: existing?.claimedQuantity || 0,
      status: form.status,
      scope: form.scope,
      scopeValue: form.scope !== 'all' ? form.scopeValue : undefined,
    }

    if (isEdit) {
      dispatch({ type: 'UPDATE_COUPON', payload })
      addToast('优惠券已更新', 'success')
    } else {
      dispatch({ type: 'ADD_COUPON', payload })
      addToast('优惠券已创建', 'success')
    }
    navigate('/coupons')
  }

  const F = ({ k }) => <div className="form-error">{errors[k]}</div>

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 13, color: '#999' }}>
        <span style={{ cursor: 'pointer', color: 'var(--color-link)' }} onClick={() => navigate('/coupons')}>优惠券管理</span>
        {' > '}{isEdit ? '编辑优惠券' : '创建优惠券'}
      </div>

      <div className="page-header">
        <h1 className="page-title">{isEdit ? '编辑优惠券' : '创建优惠券'}</h1>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="form-group">
          <label className="form-label required">优惠券名称</label>
          <input className="form-input" placeholder="请填写优惠券名称" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          {errors.name && <F k="name" />}
        </div>

        <div className="form-group">
          <label className="form-label required">优惠类型</label>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { value: 'threshold', label: '满减券' },
              { value: 'percentage', label: '折扣券' },
              { value: 'fixed', label: '无门槛券' },
            ].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="radio"
                  value={opt.value}
                  checked={form.type === opt.value}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {form.type === 'threshold' && (
          <>
            <div className="form-group">
              <label className="form-label required">消费门槛（¥）</label>
              <input type="number" className="form-input" placeholder="满多少元可用" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} />
              {errors.threshold && <F k="threshold" />}
            </div>
            <div className="form-group">
              <label className="form-label required">减免金额（¥）</label>
              <input type="number" className="form-input" placeholder="减多少元" value={form.discountAmount} onChange={e => setForm(f => ({ ...f, discountAmount: e.target.value }))} />
              {errors.discountAmount && <F k="discountAmount" />}
            </div>
          </>
        )}

        {form.type === 'percentage' && (
          <div className="form-group">
            <label className="form-label required">折扣（几折）</label>
            <input type="number" className="form-input" placeholder="如：8.5 表示八五折" min="0.1" max="9.9" step="0.1" value={form.discountRate} onChange={e => setForm(f => ({ ...f, discountRate: e.target.value }))} />
            {errors.discountRate && <F k="discountRate" />}
            <div className="form-hint">范围0.1~9.9，例如：8.5 = 打八五折</div>
          </div>
        )}

        {form.type === 'fixed' && (
          <div className="form-group">
            <label className="form-label required">减免金额（¥）</label>
            <input type="number" className="form-input" placeholder="无门槛减多少元" value={form.discountAmount} onChange={e => setForm(f => ({ ...f, discountAmount: e.target.value }))} />
            {errors.discountAmount && <F k="discountAmount" />}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label required">开始日期</label>
            <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            {errors.startDate && <F k="startDate" />}
          </div>
          <div className="form-group">
            <label className="form-label required">结束日期</label>
            <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            {errors.endDate && <F k="endDate" />}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label required">发放数量</label>
          <input type="number" className="form-input" placeholder="总发放量" value={form.totalQuantity} onChange={e => setForm(f => ({ ...f, totalQuantity: e.target.value }))} />
          {errors.totalQuantity && <F k="totalQuantity" />}
        </div>

        <div className="form-group">
          <label className="form-label">适用范围</label>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { value: 'all', label: '全部商品' },
              { value: 'category', label: '指定分类' },
            ].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input type="radio" value={opt.value} checked={form.scope === opt.value} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} />
                {opt.label}
              </label>
            ))}
          </div>
          {form.scope === 'category' && (
            <select className="form-input" style={{ marginTop: 8, width: 200 }} value={form.scopeValue} onChange={e => setForm(f => ({ ...f, scopeValue: e.target.value }))}>
              <option value="">请选择分类</option>
              {['男装', '女装', '鞋靴', '配饰', '数码'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">状态</label>
          <select className="form-input" style={{ width: 160 }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="active">进行中</option>
            <option value="draft">未开始</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-default" onClick={() => navigate('/coupons')}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{isEdit ? '保存修改' : '创建优惠券'}</button>
        </div>
      </div>
    </div>
  )
}
