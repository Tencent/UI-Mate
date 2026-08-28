import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const STATUS_MAP = { '处理中': 'processing', '已解决': 'resolved', '已关闭': 'closed', '待处理': 'pending' }
const PRIORITY_CLASS = { '高': 'ticket-priority-high', '中': 'ticket-priority-medium', '低': 'ticket-priority-low' }

export default function TicketList() {
  const { state } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [statusFilter, setStatusFilter] = useState('all')

  const tickets = (state.tickets || []).filter(t => statusFilter === 'all' || t.status === statusFilter)

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span><span>工单管理</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">工单列表</h1>
        <Link to={buildPath('/tickets/create')} className="btn-primary" style={{ textDecoration: 'none' }}>+ 提交工单</Link>
      </div>
      <div className="filter-bar">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">全部状态</option>
          <option value="待处理">待处理</option>
          <option value="处理中">处理中</option>
          <option value="已解决">已解决</option>
          <option value="已关闭">已关闭</option>
        </select>
      </div>
      <table className="data-table">
        <thead><tr><th>工单编号</th><th>标题</th><th>分类</th><th>优先级</th><th>状态</th><th>创建时间</th><th>更新时间</th><th>操作</th></tr></thead>
        <tbody>
          {tickets.length === 0 && <tr><td colSpan={8} className="empty-state">暂无工单</td></tr>}
          {tickets.map(t => (
            <tr key={t.id}>
              <td><span className="mono">{t.id}</span></td>
              <td><Link to={buildPath(`/tickets/${t.id}`)} className="link" style={{ fontWeight: 500 }}>{t.title}</Link></td>
              <td style={{ fontSize: 12 }}>{t.category}</td>
              <td><span className={PRIORITY_CLASS[t.priority] || ''}>{t.priority}</span></td>
              <td><span className={`status-tag ${STATUS_MAP[t.status] || ''}`}>{t.status}</span></td>
              <td style={{ fontSize: 12, color: '#666' }}>{t.createdAt?.replace('T', ' ').slice(0, 16)}</td>
              <td style={{ fontSize: 12, color: '#666' }}>{t.updatedAt?.replace('T', ' ').slice(0, 16)}</td>
              <td><Link to={buildPath(`/tickets/${t.id}`)} className="btn-text">查看</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
