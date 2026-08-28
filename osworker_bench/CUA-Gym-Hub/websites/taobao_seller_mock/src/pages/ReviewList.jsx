import React, { useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { Star } from 'lucide-react'

const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
function getProductColor(id) { return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length] }

function StarRating({ rating, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= rating ? '#FAAD14' : 'none'} color={i <= rating ? '#FAAD14' : '#ddd'} />
      ))}
    </span>
  )
}

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'good', label: '好评(4-5星)' },
  { key: 'medium', label: '中评(3星)' },
  { key: 'bad', label: '差评(1-2星)' },
  { key: 'unreplied', label: '待回复' },
]

export default function ReviewList() {
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('all')
  const [replyId, setReplyId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const goodReviews = state.reviews.filter(r => r.rating >= 4)
  const totalReviews = state.reviews.length
  const goodRate = totalReviews > 0 ? ((goodReviews.length / totalReviews) * 100).toFixed(1) : 0

  const ratingDist = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    state.reviews.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1 })
    return dist
  }, [state.reviews])

  const filtered = useMemo(() => {
    return state.reviews.filter(r => {
      if (activeTab === 'good') return r.rating >= 4
      if (activeTab === 'medium') return r.rating === 3
      if (activeTab === 'bad') return r.rating <= 2
      if (activeTab === 'unreplied') return !r.sellerReply
      return true
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [state.reviews, activeTab])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  function submitReply(reviewId) {
    if (!replyText.trim()) { addToast('请填写回复内容', 'error'); return }
    dispatch({ type: 'REPLY_REVIEW', payload: { reviewId, reply: replyText.trim() } })
    addToast('回复成功', 'success')
    setReplyId(null)
    setReplyText('')
  }

  function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">评价管理</h1>
      </div>

      {/* Stats bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#52C41A' }}>{goodRate}%</div>
            <div style={{ fontSize: 12, color: '#999' }}>好评率</div>
          </div>
          <div style={{ fontSize: 13, color: '#666' }}>共 {totalReviews} 条评价</div>
          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#999', width: 32 }}>{star}星</span>
                <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4 }}>
                  <div style={{
                    width: `${totalReviews > 0 ? (ratingDist[star] / totalReviews * 100) : 0}%`,
                    height: '100%',
                    background: star >= 4 ? '#FAAD14' : star === 3 ? '#FA8C16' : '#FF4D4F',
                    borderRadius: 4
                  }} />
                </div>
                <span style={{ fontSize: 12, color: '#999', width: 20 }}>{ratingDist[star] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="tabs">
          {TABS.map(tab => (
            <div key={tab.key} className={`tab-item ${activeTab === tab.key ? 'active' : ''}`} onClick={() => { setActiveTab(tab.key); setPage(1) }}>
              {tab.label}
            </div>
          ))}
        </div>

        <div style={{ padding: 16 }}>
          {paged.length === 0 ? (
            <div className="empty-state"><p>暂无评价</p></div>
          ) : paged.map(review => (
            <div key={review.id} style={{
              background: '#fff', border: '1px solid var(--color-border)',
              borderRadius: 8, padding: 16, marginBottom: 12
            }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: getProductColor(review.productId),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 600, fontSize: 14
                }}>
                  {review.buyerName.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{review.buyerName}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    <span style={{ fontSize: 12, color: '#999' }}>{formatDate(review.createdAt)}</span>
                  </div>
                  {review.skuInfo && (
                    <span style={{ display: 'inline-block', marginTop: 2, fontSize: 11, background: '#F5F5F5', padding: '1px 8px', borderRadius: 4, color: '#666' }}>
                      {review.skuInfo}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7, marginBottom: 8, paddingLeft: 46 }}>
                {review.content}
              </div>

              <div style={{ paddingLeft: 46, fontSize: 12, color: '#999', marginBottom: 10 }}>
                商品：{review.productTitle}
              </div>

              {/* Seller reply */}
              {review.sellerReply ? (
                <div style={{
                  background: '#F6F6F6', borderRadius: 6, padding: '10px 12px', marginLeft: 46,
                  fontSize: 13, color: '#555', lineHeight: 1.7
                }}>
                  <span style={{ fontWeight: 600, color: '#333' }}>卖家回复：</span>
                  {review.sellerReply}
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#bbb' }}>{formatDate(review.sellerReplyTime)}</span>
                </div>
              ) : (
                <div style={{ paddingLeft: 46 }}>
                  {replyId === review.id ? (
                    <div>
                      <textarea
                        className="form-input"
                        style={{ width: '100%', height: 80, resize: 'vertical', marginBottom: 8 }}
                        placeholder="请填写回复内容..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => submitReply(review.id)}>提交回复</button>
                        <button className="btn btn-default btn-sm" onClick={() => { setReplyId(null); setReplyText('') }}>取消</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-link"
                      style={{ fontSize: 13, color: 'var(--color-link)' }}
                      onClick={() => { setReplyId(review.id); setReplyText('') }}
                    >
                      回复
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">共 {filtered.length} 条评价</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
