import React, { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { Search, Edit, Trash2 } from 'lucide-react'

const SORT_OPTIONS = [
  { key: 'default', label: '默认排序' },
  { key: 'price_asc', label: '价格升序' },
  { key: 'price_desc', label: '价格降序' },
  { key: 'sales_desc', label: '销量降序' },
  { key: 'created_desc', label: '上架时间' },
]

const STATUS_LABELS = {
  on_sale: { label: '出售中', class: 'badge-success' },
  in_warehouse: { label: '仓库中', class: 'badge-default' },
  removed: { label: '已下架', class: 'badge-danger' },
}

const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
function getProductColor(id) { return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length] }

const TABS = [
  { key: 'on_sale', label: '出售中' },
  { key: 'in_warehouse', label: '仓库中' },
  { key: 'removed', label: '已下架' },
]

export default function ProductList() {
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const defaultStatus = searchParams.get('status') || 'on_sale'
  const [activeTab, setActiveTab] = useState(defaultStatus)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null)
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState('default')
  const pageSize = 20

  const categories = useMemo(() => {
    const cats = new Set(state.products.map(p => p.category))
    return ['all', ...cats]
  }, [state.products])

  const filtered = useMemo(() => {
    let result = state.products.filter(p => {
      if (p.status !== activeTab) return false
      if (search && !p.title.includes(search) && !p.id.includes(search)) return false
      if (category !== 'all' && p.category !== category) return false
      return true
    })
    if (sortKey === 'price_asc') result = [...result].sort((a, b) => a.price - b.price)
    else if (sortKey === 'price_desc') result = [...result].sort((a, b) => b.price - a.price)
    else if (sortKey === 'sales_desc') result = [...result].sort((a, b) => b.sales - a.sales)
    else if (sortKey === 'created_desc') result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return result
  }, [state.products, activeTab, search, category, sortKey])

  const counts = useMemo(() => {
    const c = {}
    state.products.forEach(p => { c[p.status] = (c[p.status] || 0) + 1 })
    return c
  }, [state.products])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  const allSelected = paged.length > 0 && paged.every(p => selected.includes(p.id))

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(prev => prev.filter(id => !paged.find(p => p.id === id)))
    } else {
      setSelected(prev => [...new Set([...prev, ...paged.map(p => p.id)])])
    }
  }

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleBatchStatus(status) {
    dispatch({ type: 'UPDATE_PRODUCT_STATUS', payload: { ids: selected, status } })
    addToast(`已成功${status === 'on_sale' ? '上架' : '下架'} ${selected.length} 件商品`, 'success')
    setSelected([])
  }

  function handleBatchDelete() {
    dispatch({ type: 'UPDATE_PRODUCT_STATUS', payload: { ids: selected, status: 'removed' } })
    addToast(`已删除 ${selected.length} 件商品`, 'info')
    setSelected([])
    setDeleteConfirm(false)
  }

  function handleToggleStatus(product) {
    const newStatus = product.status === 'on_sale' ? 'in_warehouse' : 'on_sale'
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id: product.id, status: newStatus } })
    addToast(`商品已${newStatus === 'on_sale' ? '上架' : '下架'}`, 'success')
  }

  function handleDelete(id) {
    dispatch({ type: 'DELETE_PRODUCT', payload: id })
    addToast('商品已删除', 'info')
    setDeleteConfirmProduct(null)
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">商品管理</h1>
        <button className="btn btn-primary" onClick={() => navigate('/products/new')}>发布新商品</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {/* Tabs */}
        <div className="tabs">
          {TABS.map(tab => (
            <div
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setSelected([]); setPage(1) }}
            >
              {tab.label}
              <span style={{ fontSize: 12, marginLeft: 4 }}>({counts[tab.key] || 0})</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              placeholder="搜索商品标题/ID"
              style={{ paddingLeft: 28, width: 200 }}
              className="form-input"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select className="form-input" style={{ width: 140 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
            <option value="all">全部分类</option>
            {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-input" style={{ width: 120 }} value={sortKey} onChange={e => { setSortKey(e.target.value); setPage(1) }}>
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          {selected.length > 0 && (
            <>
              <span style={{ fontSize: 13, color: '#666' }}>已选 {selected.length} 件</span>
              {activeTab !== 'on_sale' && <button className="btn btn-default btn-sm" onClick={() => handleBatchStatus('on_sale')}>批量上架</button>}
              {activeTab !== 'in_warehouse' && <button className="btn btn-default btn-sm" onClick={() => handleBatchStatus('in_warehouse')}>批量下架</button>}
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>批量删除</button>
            </>
          )}
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th>商品信息</th>
                <th>价格</th>
                <th>库存</th>
                <th>销量</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无商品</td></tr>
              ) : paged.map(product => (
                <tr key={product.id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 4, flexShrink: 0,
                        background: getProductColor(product.id),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 18, fontWeight: 700
                      }}>
                        {product.title.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {product.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>ID: {product.id}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>¥{product.price.toFixed(2)}</td>
                  <td style={{ fontSize: 13 }}>{product.stock}</td>
                  <td style={{ fontSize: 13 }}>{product.sales}</td>
                  <td>
                    <span className={`badge ${STATUS_LABELS[product.status]?.class || 'badge-default'}`}>
                      {STATUS_LABELS[product.status]?.label || product.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-link" style={{ fontSize: 12 }} onClick={() => navigate(`/products/${product.id}/edit`)}>
                        <Edit size={12} style={{ marginRight: 2 }} />编辑
                      </button>
                      <button
                        className="btn btn-link"
                        style={{ fontSize: 12 }}
                        onClick={() => handleToggleStatus(product)}
                      >
                        {product.status === 'on_sale' ? '下架' : '上架'}
                      </button>
                      <button
                        className="btn btn-link"
                        style={{ fontSize: 12, color: 'var(--color-danger)' }}
                        onClick={() => setDeleteConfirmProduct(product)}
                      >
                        <Trash2 size={12} style={{ marginRight: 2 }} />删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">共 {filtered.length} 件商品</span>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">确认删除</span>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(false)} style={{ fontSize: 18 }}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14 }}>确定要删除选中的 <strong>{selected.length}</strong> 件商品吗？此操作不可恢复。</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setDeleteConfirm(false)}>取消</button>
              <button className="btn btn-danger" onClick={handleBatchDelete}>确定删除</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmProduct && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">确认删除</span>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirmProduct(null)} style={{ fontSize: 18 }}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14 }}>确定要删除该商品吗？此操作不可恢复。</p>
              <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>{deleteConfirmProduct.title}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setDeleteConfirmProduct(null)}>取消</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirmProduct.id)}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
