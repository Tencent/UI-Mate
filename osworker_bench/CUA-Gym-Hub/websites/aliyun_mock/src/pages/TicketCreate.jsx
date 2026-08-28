import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function TicketCreate() {
  const { state, updateState } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p

  const [form, setForm] = useState({ title: '', category: '云服务器ECS', priority: '中', description: '' })

  const submitTicket = () => {
    if (!form.title || !form.description) return
    const ticketId = `ticket-${new Date().toISOString().slice(0,10).replace(/-/g,'')}${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`
    const newTicket = {
      id: ticketId,
      title: form.title,
      category: form.category,
      priority: form.priority,
      status: '待处理',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: form.description,
      replies: []
    }
    updateState(prev => ({ ...prev, tickets: [newTicket, ...(prev.tickets || [])] }))
    navigate(buildPath(`/tickets/${ticketId}`))
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span>
        <Link to={buildPath('/tickets')} className="link">工单管理</Link><span className="sep">&gt;</span>
        <span>提交工单</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">提交工单</h1>
      </div>

      <div className="card">
        <div className="form-group">
          <label className="form-label required">工单标题</label>
          <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="请简要描述您遇到的问题" autoFocus />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">问题分类</label>
            <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="云服务器ECS">云服务器 ECS</option>
              <option value="对象存储OSS">对象存储 OSS</option>
              <option value="云数据库RDS">云数据库 RDS</option>
              <option value="负载均衡SLB">负载均衡 SLB</option>
              <option value="专有网络VPC">专有网络 VPC</option>
              <option value="费用账单">费用账单</option>
              <option value="账号安全">账号安全</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">优先级</label>
            <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="低">低 - 一般咨询</option>
              <option value="中">中 - 有一定影响</option>
              <option value="高">高 - 业务受损</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label required">问题描述</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: 120 }}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="请详细描述您遇到的问题，包括：&#10;1. 问题现象&#10;2. 影响范围&#10;3. 已尝试的解决方案"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-normal" onClick={() => navigate(buildPath('/tickets'))}>取消</button>
          <button className="btn-primary" disabled={!form.title || !form.description} onClick={submitTicket}>提交工单</button>
        </div>
      </div>
    </div>
  )
}
