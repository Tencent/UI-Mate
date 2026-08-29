import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'

const STATUS_LABELS = {
  active: { label: '进行中', cls: 'badge-success' },
  completed: { label: '已结束', cls: 'badge-default' },
  scheduled: { label: '即将开始', cls: 'badge-warning' },
}

function computeStatus(startDate, endDate) {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (end < now) return 'completed'
  if (start > now) return 'scheduled'
  return 'active'
}

const EMPTY_FORM = {
  name: '',
  type: 'discount',
  discountType: 'percentage',
  discountValue: '',
  startDate: '',
  endDate: '',
  description: '',
}

export default function PromotionList() {
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const promotions = state.promotions || []

  const [showModal, setShowModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  function openCreate() {
    setEditingPromo(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(promo) {
    setEditingPromo(promo)
    setForm({
      name: promo.name,
      type: promo.type,
      discountType: promo.discountType,
      discountValue: promo.discountValue !== undefined ? String(promo.discountValue) : '',
      startDate: promo.startDate ? promo.startDate.slice(0, 10) : '',
      endDate: promo.endDate ? promo.endDate.slice(0, 10) : '',
      description: promo.description || '',
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name.trim()) { addToast('请填写活动名称', 'error'); return }
    if (!form.startDate || !form.endDate) { addToast('请填写活动时间', 'error'); return }
    if (!form.description.trim()) { addToast('请填写优惠内容', 'error'); return }

    const startISO = form.startDate + 'T00:00:00Z'
    const endISO = form.endDate + 'T23:59:59Z'
    const status = computeStatus(startISO, endISO)

    if (editingPromo) {
      dispatch({
        type: 'UPDATE_PROMOTION',
        payload: {
          ...editingPromo,
          name: form.name,
          type: form.type,
          discountType: form.discountType,
          discountValue: form.discountValue !== '' ? Number(form.discountValue) : undefined,
          startDate: startISO,
          endDate: endISO,
          status,
          description: form.description,
        }
      })
      addToast('活动已更新', 'success')
    } else {
      dispatch({
        type: 'ADD_PROMOTION',
        payload: {
          id: `promo_${Date.now()}`,
          name: form.name,
          type: form.type,
          discountType: form.discountType,
          discountValue: form.discountValue !== '' ? Number(form.discountValue) : undefined,
          startDate: startISO,
          endDate: endISO,
          status,
          productIds: 'all',
          description: form.description,
        }
      })
      addToast('活动已创建', 'success')
    }
    setShowModal(false)
  }

  function handleDeleteConfirmed() {
    dispatch({ type: 'DELETE_PROMOTION', payload: deleteConfirm })
    addToast('活动已删除', 'info')
    setDeleteConfirm(null)
  }

  function formatDate(iso) {
    if (!iso) return '-'
    return iso.slice(0, 10)
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">营销活动</h1>
        <button className="btn btn-primary" onClick={openCreate}>创建活动</button>
      </div>

      {promotions.length === 0 ? (
        <div className="empty-state"><p>暂无营销活动，点击右上角"创建活动"开始</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {promotions.map(p => {
            const statusInfo = STATUS_LABELS[p.status] || { label: p.status, cls: 'badge-default' }
            return (
              <div key={p.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
                    <span style={{ fontSize: 12, padding: '2px 8px', background: '#E6F7FF', color: '#1890FF', borderRadius: 4 }}>{p.type}</span>
                  </div>
                  <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                </div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
                  <div>时间：{formatDate(p.startDate)} 至 {formatDate(p.endDate)}</div>
                  <div>优惠：<strong style={{ color: 'var(--color-primary)' }}>{p.description}</strong></div>
                  {p.discountValue !== undefined && (
                    <div>折扣值：{p.discountType === 'percentage' ? `${(p.discountValue * 100).toFixed(0)}折` : `减¥${p.discountValue}`}</div>
                  )}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-default btn-sm" onClick={() => openEdit(p)}>编辑</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(p.id)}>删除</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <span className="modal-title">{editingPromo ? '编辑营销活动' : '创建营销活动'}</span>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ fontSize: 18 }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label required">活动名称</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="请输入活动名称" />
              </div>
              <div className="form-group">
                <label className="form-label">活动类型</label>
                <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="discount">限时折扣</option>
                  <option value="threshold">满减活动</option>
                  <option value="coupon">优惠券</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">折扣类型</label>
                <select className="form-input" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                  <option value="percentage">折扣比例（如0.85=85折）</option>
                  <option value="fixed">固定减免（¥）</option>
                  <option value="threshold">满减规则</option>
                </select>
              </div>
              {(form.discountType === 'percentage' || form.discountType === 'fixed') && (
                <div className="form-group">
                  <label className="form-label">折扣值</label>
                  <input type="number" className="form-input" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    placeholder={form.discountType === 'percentage' ? '如0.85表示85折' : '如15表示减15元'} step="0.01" />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label required">开始时间</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label required">结束时间</label>
                  <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label required">优惠内容说明</label>
                <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="如：全场8折、满100减15" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSave}>{editingPromo ? '保存修改' : '创建活动'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">确认删除</span>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)} style={{ fontSize: 18 }}>×</button>
            </div>
            <div className="modal-body">
              <p>确定要删除此营销活动吗？此操作不可撤销。</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setDeleteConfirm(null)}>取消</button>
              <button className="btn btn-danger" onClick={handleDeleteConfirmed}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
