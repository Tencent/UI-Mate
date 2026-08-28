import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function BillingBills() {
  const { state } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const { billing } = state

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span>
        <Link to={buildPath('/billing/overview')} className="link">费用中心</Link><span className="sep">&gt;</span><span>账单管理</span>
      </div>
      <div className="page-header"><h1 className="page-title">账单管理</h1></div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>账期</th><th>总费用（元）</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {billing.monthlySpend.map(s => (
              <tr key={s.month}>
                <td>{s.month}</td>
                <td style={{ fontWeight: 500 }}>{s.amount.toFixed(2)} 元</td>
                <td><span className="status-tag ok"><span className="status-dot ok" />已结清</span></td>
                <td>
                  <div className="row-actions">
                    <button className="btn-text">查看明细</button>
                    <button className="btn-text">导出账单</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
