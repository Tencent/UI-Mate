import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'

const STATUS_MAP = {
  active: { label: '进行中', class: 'badge-success' },
  expired: { label: '已过期', class: 'badge-default' },
  draft: { label: '未开始', class: 'badge-warning' },
}

const TYPE_MAP = {
  threshold: { label: '满减', color: '#FF6600', bg: '#FFF0EB' },
  percentage: { label: '折扣', color: '#1890FF', bg: '#E6F7FF' },
  fixed: { label: '无门槛', color: '#52C41A', bg: '#F6FFED' },
}

function formatCouponContent(c) {
  if (c.type === 'threshold') return `满¥${c.threshold}减¥${c.discountAmount}`
  if (c.type === 'percentage') return `${(c.discountRate * 10).toFixed(1)}折`
  if (c.type === 'fixed') return `减¥${c.discountAmount}`
  return ''
}

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'expired', label: '已过期' },
  { key: 'draft', label: '未开始' },
]

export default function CouponList() {
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [deleteId, setDeleteId] = useState(null)

  const filtered = state.coupons.filter(c => {
    if (activeTab === 'all') return true
    return c.status === activeTab
  })

  function handleDelete(id) {
    dispatch({ type: 'DELETE_COUPON', payload: id })
    addToast('优惠券已删除', 'info')
    setDeleteId(null)
  }

  function handleCopy(coupon) {
    const newCoupon = {
      ...coupon,
      id: `coupon_copy_${Date.now()}`,
      name: coupon.name + '（复制）',
      status: 'draft',
      usedQuantity: 0,
      claimedQuantity: 0,
    }
    dispatch({ type: 'ADD_COUPON', payload: newCoupon })
    addToast('已创建副本', 'success')
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">优惠券管理</h1>
        <button className="btn btn-primary" onClick={() => navigate('/coupons/new')}>创建优惠券</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="tabs">
          {TABS.map(tab => (
            <div key={tab.key} className={`tab-item ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </div>
          ))}
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>优惠券名称</th>
                <th>类型</th>
                <th>优惠内容</th>
                <th>有效期</th>
                <th>领取/使用</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无优惠券</td></tr>
              ) : filtered.map(coupon => {
                const typeInfo = TYPE_MAP[coupon.type] || { label: coupon.type, color: '#999', bg: '#f5f5f5' }
                const statusInfo = STATUS_MAP[coupon.status] || { label: coupon.status, class: 'badge-default' }
                const usageRatio = coupon.totalQuantity > 0 ? (coupon.usedQuantity / coupon.totalQuantity * 100) : 0

                return (
                  <tr key={coupon.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{coupon.name}</td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: 4, background: typeInfo.bg, color: typeInfo.color, fontSize: 12, fontWeight: 500 }}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 14 }}>
                      {formatCouponContent(coupon)}
                    </td>
                    <td style={{ fontSize: 12, color: '#666' }}>
                      {coupon.startDate} 至 {coupon.endDate}
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        {coupon.claimedQuantity}/{coupon.usedQuantity}
                        <span style={{ color: '#999', marginLeft: 4 }}>（领取/使用）</span>
                      </div>
                      <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, width: 100 }}>
                        <div style={{ height: '100%', width: `${usageRatio}%`, background: 'var(--color-primary)', borderRadius: 2 }} />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-link" style={{ fontSize: 12 }} onClick={() => navigate(`/coupons/${coupon.id}/edit`)}>编辑</button>
                        <button className="btn btn-link" style={{ fontSize: 12 }} onClick={() => handleCopy(coupon)}>复制</button>
                        <button className="btn btn-link" style={{ fontSize: 12, color: 'var(--color-danger)' }} onClick={() => setDeleteId(coupon.id)}>删除</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">确认删除</span>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)} style={{ fontSize: 18 }}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14 }}>确定要删除这张优惠券吗？</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setDeleteId(null)}>取消</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
