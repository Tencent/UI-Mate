import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function BillingOverview() {
  const { state } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const { billing } = state
  const maxSpend = Math.max(...billing.monthlySpend.map(s => s.amount))
  const maxProduct = Math.max(...billing.productBreakdown.map(p => p.amount))

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span><span>费用中心</span><span className="sep">&gt;</span><span>费用概览</span>
      </div>
      <div className="page-title" style={{ marginBottom: 16 }}>费用中心</div>

      <div className="card" style={{ background: 'linear-gradient(135deg, #FF6A00 0%, #E55D00 100%)', border: 'none', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>可用余额</div>
            <div style={{ fontSize: 36, fontWeight: 700 }}>{billing.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })} 元</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 2, fontSize: 12 }}>信用等级：{state.user.creditRating}</span>
            </div>
          </div>
          <button style={{ background: 'white', color: '#FF6A00', border: 'none', borderRadius: 2, height: 40, padding: '0 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>立即充值</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-title">月度消费趋势（近6个月）</div>
          {billing.monthlySpend.map(s => (
            <div key={s.month} className="billing-bar-wrap">
              <span className="billing-bar-label">{s.month}</span>
              <div className="billing-bar-bg"><div className="billing-bar-fill" style={{ width: `${(s.amount / maxSpend) * 100}%` }} /></div>
              <span className="billing-bar-amount">{s.amount.toFixed(2)} 元</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">本月产品消费明细</div>
          {billing.productBreakdown.map(p => (
            <div key={p.product} className="billing-bar-wrap">
              <span className="billing-bar-label">{p.product}</span>
              <div className="billing-bar-bg"><div className="billing-bar-fill" style={{ width: `${(p.amount / maxProduct) * 100}%` }} /></div>
              <span className="billing-bar-amount">{p.amount.toFixed(2)} 元</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">续费提醒</div>
          {billing.renewalReminders.length === 0 && <div style={{ color: '#999', fontSize: 13 }}>暂无续费提醒</div>}
          {billing.renewalReminders.map(r => (
            <div key={r.resourceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{r.resourceName}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{r.type} · 到期日 {r.expiry?.split('T')[0]}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {r.daysLeft < 365 && <span style={{ color: '#FFA003', fontSize: 12 }}>剩余{r.daysLeft}天</span>}
                <button className="btn-text">续费</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">优惠券</div>
          {billing.coupons.length === 0 && <div style={{ color: '#999', fontSize: 13 }}>暂无可用优惠券</div>}
          {billing.coupons.map(c => (
            <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>有效期至：{c.expiry} · 状态：{c.status}</div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#FF6A00' }}>{c.amount} 元</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
