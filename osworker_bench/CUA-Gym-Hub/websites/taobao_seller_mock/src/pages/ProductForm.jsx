import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../components/Toast'

const colors = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1']
function getProductColor(id) { return colors[parseInt((id || '').replace(/\D/g, '')) % colors.length] }

const CATEGORIES = ['男装', '女装', '鞋靴', '配饰', '数码']
const SUBCATEGORIES = {
  '男装': ['卫衣', '裤子', '羽绒服', 'T恤', '衬衫', '外套'],
  '女装': ['连衣裙', '大衣', '半身裙', '毛衣', '上衣', '外套'],
  '鞋靴': ['运动鞋', '靴子', '帆布鞋', '皮鞋', '凉鞋'],
  '配饰': ['背包', '手表', '帽子', '围巾', '腰带'],
  '数码': ['手机配件', '耳机', '充电器', '键盘', '鼠标'],
}

export default function ProductForm() {
  const { id } = useParams()
  const { state, dispatch } = useAppContext()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const isEdit = !!id

  const existingProduct = isEdit ? state.products.find(p => p.id === id) : null

  const [form, setForm] = useState({
    title: existingProduct?.title || '',
    category: existingProduct?.category || '男装',
    subcategory: existingProduct?.subcategory || '',
    description: existingProduct?.description || '',
    price: existingProduct?.price || '',
    stock: existingProduct?.stock || '',
    weight: existingProduct?.weight || '',
    skuMode: existingProduct?.skus?.length > 1 || false,
    colors: existingProduct?.skus ? [...new Set(existingProduct.skus.map(s => s.color))] : [],
    sizes: existingProduct?.skus ? [...new Set(existingProduct.skus.map(s => s.size))] : [],
    skus: existingProduct?.skus || [],
    logisticsTemplate: existingProduct?.logisticsTemplate || 'lt_003',
    images: existingProduct?.images || [],
  })

  const [errors, setErrors] = useState({})
  const [newColor, setNewColor] = useState('')
  const [newSize, setNewSize] = useState('')

  function addColor() {
    if (newColor && !form.colors.includes(newColor)) {
      setForm(f => ({ ...f, colors: [...f.colors, newColor] }))
      setNewColor('')
      rebuildSkus([...form.colors, newColor], form.sizes)
    }
  }

  function removeColor(color) {
    const newColors = form.colors.filter(c => c !== color)
    setForm(f => ({ ...f, colors: newColors }))
    rebuildSkus(newColors, form.sizes)
  }

  function addSize() {
    if (newSize && !form.sizes.includes(newSize)) {
      setForm(f => ({ ...f, sizes: [...f.sizes, newSize] }))
      setNewSize('')
      rebuildSkus(form.colors, [...form.sizes, newSize])
    }
  }

  function removeSize(size) {
    const newSizes = form.sizes.filter(s => s !== size)
    setForm(f => ({ ...f, sizes: newSizes }))
    rebuildSkus(form.colors, newSizes)
  }

  function rebuildSkus(colors, sizes) {
    const skus = []
    colors.forEach(color => {
      sizes.forEach(size => {
        const existing = form.skus.find(s => s.color === color && s.size === size)
        skus.push(existing || { id: `sku_new_${color}_${size}`, color, size, price: form.price || 0, stock: 0 })
      })
    })
    setForm(f => ({ ...f, skus }))
  }

  function updateSku(color, size, field, value) {
    setForm(f => ({
      ...f,
      skus: f.skus.map(s => s.color === color && s.size === size ? { ...s, [field]: Number(value) } : s)
    }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = '请填写商品标题'
    if (!form.skuMode && (!form.price || Number(form.price) <= 0)) errs.price = '请填写有效价格'
    if (!form.skuMode && (form.stock === '' || Number(form.stock) < 0)) errs.stock = '请填写有效库存'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function buildSkus() {
    if (!form.skuMode) {
      return [{ id: 'sku_single', color: '默认', size: '均码', price: Number(form.price), stock: Number(form.stock) }]
    }
    return form.skus
  }

  function handleSubmit(status) {
    if (!validate()) return
    const skus = buildSkus()
    const totalStock = skus.reduce((s, sku) => s + (Number(sku.stock) || 0), 0)

    if (isEdit) {
      dispatch({
        type: 'UPDATE_PRODUCT',
        payload: {
          id,
          title: form.title,
          category: form.category,
          subcategory: form.subcategory,
          description: form.description,
          price: form.skuMode ? Math.min(...skus.map(s => s.price)) : Number(form.price),
          stock: form.skuMode ? totalStock : Number(form.stock),
          weight: Number(form.weight) || 0,
          skus,
          logisticsTemplate: form.logisticsTemplate,
          status,
          updatedAt: new Date().toISOString(),
        }
      })
      addToast('商品已保存', 'success')
    } else {
      const newId = `prod_new_${Date.now()}`
      dispatch({
        type: 'ADD_PRODUCT',
        payload: {
          id: newId,
          title: form.title,
          category: form.category,
          subcategory: form.subcategory,
          description: form.description,
          price: form.skuMode ? Math.min(...skus.map(s => s.price)) : Number(form.price),
          originalPrice: form.skuMode ? Math.min(...skus.map(s => s.price)) : Number(form.price),
          mainImage: '',
          images: [],
          stock: form.skuMode ? totalStock : Number(form.stock),
          sales: 0,
          views: 0,
          favoriteCount: 0,
          rating: 5.0,
          reviewCount: 0,
          shippingFee: 0,
          weight: Number(form.weight) || 0,
          skus,
          logisticsTemplate: form.logisticsTemplate,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })
      addToast(status === 'on_sale' ? '商品已发布！' : '商品已存入仓库', 'success')
    }
    navigate('/products')
  }

  const subcats = SUBCATEGORIES[form.category] || []

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 13, color: '#999' }}>
        <span style={{ cursor: 'pointer', color: 'var(--color-link)' }} onClick={() => navigate('/products')}>商品管理</span>
        {' > '}
        {isEdit ? '编辑商品' : '发布商品'}
      </div>

      <div className="page-header">
        <h1 className="page-title">{isEdit ? '编辑商品' : '发布商品'}</h1>
      </div>

      {/* Basic info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>基本信息</div>
        <div className="form-group">
          <label className="form-label required">商品标题</label>
          <input
            className="form-input"
            placeholder="请填写商品标题（最多60字）"
            maxLength={60}
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {errors.title && <div className="form-error">{errors.title}</div>}
            <div className="form-hint" style={{ marginLeft: 'auto' }}>{form.title.length}/60</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label required">商品分类</label>
            <select
              className="form-input"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">子分类</label>
            <select
              className="form-input"
              value={form.subcategory}
              onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
            >
              <option value="">请选择</option>
              {subcats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">商品描述</label>
          <textarea
            className="form-input"
            style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
            placeholder="请填写商品描述"
            maxLength={200}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <div className="form-hint">{form.description.length}/200</div>
        </div>
      </div>

      {/* Images */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>商品图片</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 100, height: 100, border: '1px dashed var(--color-border)',
                borderRadius: 4, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                background: form.images[i] ? getProductColor(`prod_${i}`) : '#FAFAFA',
                color: form.images[i] ? '#fff' : '#999', fontSize: 12,
                transition: 'border-color 0.15s'
              }}
              onClick={() => {
                const newImages = [...form.images]
                if (newImages[i]) newImages.splice(i, 1)
                else newImages[i] = `placeholder_${i}`
                setForm(f => ({ ...f, images: newImages }))
              }}
            >
              {form.images[i] ? (
                <span style={{ fontSize: 24, fontWeight: 700 }}>图{i + 1}</span>
              ) : (
                <>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>+</span>
                  <span style={{ marginTop: 4 }}>添加图片</span>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="form-hint" style={{ marginTop: 8 }}>最多上传5张图片，建议尺寸800×800</div>
      </div>

      {/* Price & Stock */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>价格库存</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!form.skuMode && (
              <button
                type="button"
                className="btn btn-default btn-sm"
                onClick={() => setForm(f => ({ ...f, skuMode: true }))}
              >
                添加规格
              </button>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.skuMode}
                onChange={e => setForm(f => ({ ...f, skuMode: e.target.checked }))}
              />
              添加规格（颜色/尺码）
            </label>
          </div>
        </div>

        {!form.skuMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label required">售价（¥）</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              />
              {errors.price && <div className="form-error">{errors.price}</div>}
            </div>
            <div className="form-group">
              <label className="form-label required">库存</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              />
              {errors.stock && <div className="form-error">{errors.stock}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">重量（kg）</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.0"
                value={form.weight}
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
              />
            </div>
          </div>
        ) : (
          <div>
            {/* Color input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>颜色</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {form.colors.map(c => (
                  <span key={c} style={{
                    padding: '4px 10px', background: '#E6F7FF', color: '#1890FF',
                    borderRadius: 4, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {c}
                    <span style={{ cursor: 'pointer' }} onClick={() => removeColor(c)}>×</span>
                  </span>
                ))}
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    className="form-input"
                    style={{ width: 100, padding: '4px 8px' }}
                    placeholder="添加颜色"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addColor()}
                  />
                  <button className="btn btn-default btn-sm" onClick={addColor}>添加</button>
                </div>
              </div>
            </div>
            {/* Size input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>尺码</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {form.sizes.map(s => (
                  <span key={s} style={{
                    padding: '4px 10px', background: '#F6FFED', color: '#52C41A',
                    borderRadius: 4, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    {s}
                    <span style={{ cursor: 'pointer' }} onClick={() => removeSize(s)}>×</span>
                  </span>
                ))}
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    className="form-input"
                    style={{ width: 80, padding: '4px 8px' }}
                    placeholder="添加尺码"
                    value={newSize}
                    onChange={e => setNewSize(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSize()}
                  />
                  <button className="btn btn-default btn-sm" onClick={addSize}>添加</button>
                </div>
              </div>
            </div>

            {/* SKU matrix */}
            {form.skus.length > 0 && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>颜色</th>
                      <th>尺码</th>
                      <th>价格（¥）</th>
                      <th>库存</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.skus.map(sku => (
                      <tr key={`${sku.color}_${sku.size}`}>
                        <td>{sku.color}</td>
                        <td>{sku.size}</td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: 100 }}
                            value={sku.price}
                            onChange={e => updateSku(sku.color, sku.size, 'price', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            style={{ width: 100 }}
                            value={sku.stock}
                            onChange={e => updateSku(sku.color, sku.size, 'stock', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logistics */}
      <div className="card" style={{ marginBottom: 80 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>物流信息</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">运费模板</label>
            <select
              className="form-input"
              value={form.logisticsTemplate}
              onChange={e => setForm(f => ({ ...f, logisticsTemplate: e.target.value }))}
            >
              {state.logisticsTemplates.map(lt => (
                <option key={lt.id} value={lt.id}>{lt.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">商品重量（kg）</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.0"
              value={form.weight}
              onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 220, right: 0,
        background: '#fff', padding: '12px 24px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex', gap: 12, justifyContent: 'flex-end', zIndex: 10
      }}>
        <button className="btn btn-default" onClick={() => navigate('/products')}>取消</button>
        <button className="btn btn-default" onClick={() => handleSubmit('in_warehouse')}>存入仓库</button>
        <button className="btn btn-primary" onClick={() => handleSubmit('on_sale')}>
          {isEdit ? '保存修改' : '发布上架'}
        </button>
      </div>
    </div>
  )
}
