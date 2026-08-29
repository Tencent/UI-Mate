import React, { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const PRIORITY_CLASS = { '高': 'ticket-priority-high', '中': 'ticket-priority-medium', '低': 'ticket-priority-low' }
const STATUS_MAP = { '处理中': 'processing', '已解决': 'resolved', '已关闭': 'closed', '待处理': 'pending' }

export default function TicketDetail() {
  const { id } = useParams()
  const { state, updateState } = useApp()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const buildPath = (p) => sid ? `${p}?sid=${sid}` : p
  const [replyText, setReplyText] = useState('')

  const ticket = (state.tickets || []).find(t => t.id === id)

  if (!ticket) {
    return <div className="card"><div className="empty-state">工单不存在。</div></div>
  }

  const addReply = () => {
    if (!replyText.trim()) return
    const newReply = { id: `r-${Date.now()}`, role: '用户', name: state.user.displayName, content: replyText.trim(), createdAt: new Date().toISOString() }
    updateState(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => t.id === id ? { ...t, replies: [...(t.replies || []), newReply], updatedAt: new Date().toISOString() } : t)
    }))
    setReplyText('')
  }

  const closeTicket = () => {
    updateState(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => t.id === id ? { ...t, status: '已关闭', updatedAt: new Date().toISOString() } : t)
    }))
  }

  return (
    <div>
      <div className="breadcrumb">
        <Link to={buildPath('/')} className="link">控制台首页</Link><span className="sep">&gt;</span>
        <Link to={buildPath('/tickets')} className="link">工单管理</Link><span className="sep">&gt;</span>
        <span>{ticket.id}</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">{ticket.title}</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: 12 }}>{ticket.id}</span>
            <span style={{ fontSize: 12, color: '#666' }}>{ticket.category}</span>
            <span className={PRIORITY_CLASS[ticket.priority] || ''} style={{ fontSize: 12 }}>优先级：{ticket.priority}</span>
            <span className={`status-tag ${STATUS_MAP[ticket.status] || ''}`}>{ticket.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {ticket.status !== '已关闭' && <button className="btn-normal" onClick={closeTicket}>关闭工单</button>}
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <div className="card-title">问题描述</div>
        <div style={{ fontSize: 13, lineHeight: '22px', color: '#333' }}>{ticket.description}</div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>提交时间：{ticket.createdAt?.replace('T', ' ').slice(0, 16)}</div>
      </div>

      {/* Replies */}
      <div className="card">
        <div className="card-title">回复记录</div>
        {(!ticket.replies || ticket.replies.length === 0) && <div style={{ color: '#999', fontSize: 13, padding: '12px 0' }}>暂无回复</div>}
        {(ticket.replies || []).map(reply => (
          <div key={reply.id} style={{
            padding: '12px 16px',
            marginBottom: 8,
            borderRadius: 2,
            background: reply.role === '客服' ? '#F0F7FF' : '#FFF7F0',
            border: reply.role === '客服' ? '1px solid #D1E9FF' : '1px solid #FFE4CC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13, color: reply.role === '客服' ? '#0070CC' : '#FF6A00' }}>{reply.name}</span>
                <span style={{ fontSize: 11, color: '#999', marginLeft: 8, padding: '1px 6px', border: '1px solid #D9D9D9', borderRadius: 2 }}>{reply.role}</span>
              </div>
              <span style={{ fontSize: 12, color: '#999' }}>{reply.createdAt?.replace('T', ' ').slice(0, 16)}</span>
            </div>
            <div style={{ fontSize: 13, lineHeight: '20px', color: '#333' }}>{reply.content}</div>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {ticket.status !== '已关闭' && (
        <div className="card">
          <div className="card-title">回复工单</div>
          <textarea
            className="form-textarea"
            style={{ minHeight: 100 }}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="请输入回复内容..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="btn-primary" disabled={!replyText.trim()} onClick={addReply}>提交回复</button>
          </div>
        </div>
      )}
    </div>
  )
}
