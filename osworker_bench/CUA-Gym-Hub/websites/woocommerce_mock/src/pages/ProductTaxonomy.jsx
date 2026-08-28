import { useState } from 'react'
import { useApp } from '../context/AppContext'

export function ProductCategories() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ name: '', slug: '', parent: '', description: '' })
  const [notice, setNotice] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '', description: '' })

  const addCategory = () => {
    if (!form.name.trim()) return
    const cat = {
      id: `cat_${Date.now()}`,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      parent: form.parent || null,
      description: form.description,
      count: 0,
    }
    dispatch({ type: 'ADD_CATEGORY', payload: cat })
    setForm({ name: '', slug: '', parent: '', description: '' })
    setNotice({ type: 'success', msg: `Category "${cat.name}" added.` })
    setTimeout(() => setNotice(null), 3000)
  }

  const deleteCategory = (id) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id })
    setNotice({ type: 'success', msg: 'Category deleted.' })
    setTimeout(() => setNotice(null), 3000)
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditForm({ name: cat.name, slug: cat.slug, description: cat.description || '' })
  }

  const saveEdit = () => {
    if (!editForm.name.trim()) return
    // Delete old and re-add with updated info (since we don't have UPDATE_CATEGORY)
    const oldCat = state.categories.find(c => c.id === editingId)
    dispatch({ type: 'DELETE_CATEGORY', payload: editingId })
    dispatch({ type: 'ADD_CATEGORY', payload: { ...oldCat, ...editForm, slug: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-') } })
    setEditingId(null)
    setNotice({ type: 'success', msg: 'Category updated.' })
    setTimeout(() => setNotice(null), 3000)
  }

  const topLevel = state.categories.filter(c => !c.parent)
  const children = state.categories.filter(c => c.parent)

  return (
    <div>
      {notice && (
        <div className={`notice notice-${notice.type}`}>
          <span>{notice.msg}</span>
          <button className="notice-dismiss" onClick={() => setNotice(null)}>×</button>
        </div>
      )}
      <div className="wp-page-title"><h1>Product Categories</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div className="postbox">
          <div className="postbox-header">Add New Category</div>
          <div className="postbox-body">
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={{ width: '100%' }} placeholder="Auto-generated from name" />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Parent category</label>
              <select value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))} style={{ height: 30, width: '100%' }}>
                <option value="">None</option>
                {topLevel.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <button className="button-primary" onClick={addCategory}>Add new category</button>
          </div>
        </div>
        <div>
          <table className="wp-list-table">
            <thead>
              <tr>
                <th className="cb"><input type="checkbox" /></th>
                <th>Name</th>
                <th>Description</th>
                <th>Slug</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {topLevel.map(cat => [
                <tr key={cat.id}>
                  <td className="cb"><input type="checkbox" /></td>
                  <td>
                    <button className="button-link" style={{ fontWeight: 600 }} onClick={() => startEdit(cat)}>{cat.name}</button>
                    <div className="row-actions">
                      <span><button className="button-link edit" onClick={() => startEdit(cat)}>Edit</button></span>
                      <span><button className="button-link" style={{ color: '#761919' }} onClick={() => deleteCategory(cat.id)}>Delete</button></span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#646970' }}>{cat.description}</td>
                  <td style={{ fontSize: 12 }}>{cat.slug}</td>
                  <td>{cat.count}</td>
                </tr>,
                editingId === cat.id && (
                  <tr key={`edit-${cat.id}`}>
                    <td colSpan={5} style={{ background: '#f6f7f7', padding: 12 }}>
                      <strong style={{ display: 'block', marginBottom: 8 }}>Quick Edit</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Name</label>
                          <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Slug</label>
                          <input type="text" value={editForm.slug} onChange={e => setEditForm(f => ({ ...f, slug: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description</label>
                          <input type="text" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="button-primary" onClick={saveEdit}>Update</button>
                        <button className="button" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ),
                ...children.filter(c => c.parent === cat.id).map(child => (
                  <tr key={child.id}>
                    <td className="cb"><input type="checkbox" /></td>
                    <td>
                      <span style={{ paddingLeft: 16, color: '#646970' }}>— </span>
                      <button className="button-link" onClick={() => startEdit(child)}>{child.name}</button>
                      <div className="row-actions">
                        <span><button className="button-link edit" onClick={() => startEdit(child)}>Edit</button></span>
                        <span><button className="button-link" style={{ color: '#761919' }} onClick={() => deleteCategory(child.id)}>Delete</button></span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: '#646970' }}>{child.description}</td>
                    <td style={{ fontSize: 12 }}>{child.slug}</td>
                    <td>{child.count}</td>
                  </tr>
                ))
              ])}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function ProductTags() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [notice, setNotice] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '', description: '' })

  const addTag = () => {
    if (!form.name.trim()) return
    const tag = {
      id: `tag_${Date.now()}`,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      count: 0,
    }
    dispatch({ type: 'ADD_TAG', payload: tag })
    setForm({ name: '', slug: '', description: '' })
    setNotice({ type: 'success', msg: `Tag "${tag.name}" added.` })
    setTimeout(() => setNotice(null), 3000)
  }

  const startEdit = (tag) => {
    setEditingId(tag.id)
    setEditForm({ name: tag.name, slug: tag.slug, description: tag.description || '' })
  }

  const saveEdit = () => {
    if (!editForm.name.trim()) return
    const oldTag = state.tags.find(t => t.id === editingId)
    dispatch({ type: 'DELETE_TAG', payload: editingId })
    dispatch({ type: 'ADD_TAG', payload: { ...oldTag, ...editForm, slug: editForm.slug || editForm.name.toLowerCase().replace(/\s+/g, '-') } })
    setEditingId(null)
    setNotice({ type: 'success', msg: 'Tag updated.' })
    setTimeout(() => setNotice(null), 3000)
  }

  return (
    <div>
      {notice && (
        <div className={`notice notice-${notice.type}`}>
          <span>{notice.msg}</span>
          <button className="notice-dismiss" onClick={() => setNotice(null)}>×</button>
        </div>
      )}
      <div className="wp-page-title"><h1>Product Tags</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div className="postbox">
          <div className="postbox-header">Add New Tag</div>
          <div className="postbox-body">
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={{ width: '100%' }} placeholder="Auto-generated" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <button className="button-primary" onClick={addTag}>Add new tag</button>
          </div>
        </div>
        <div>
          <table className="wp-list-table">
            <thead>
              <tr>
                <th className="cb"><input type="checkbox" /></th>
                <th>Name</th>
                <th>Description</th>
                <th>Slug</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {state.tags.map(tag => [
                <tr key={tag.id}>
                  <td className="cb"><input type="checkbox" /></td>
                  <td>
                    <button className="button-link" style={{ fontWeight: 600 }} onClick={() => startEdit(tag)}>{tag.name}</button>
                    <div className="row-actions">
                      <span><button className="button-link edit" onClick={() => startEdit(tag)}>Edit</button></span>
                      <span><button className="button-link" style={{ color: '#761919' }} onClick={() => dispatch({ type: 'DELETE_TAG', payload: tag.id })}>Delete</button></span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#646970' }}>{tag.description || '-'}</td>
                  <td style={{ fontSize: 12 }}>{tag.slug}</td>
                  <td>{tag.count}</td>
                </tr>,
                editingId === tag.id && (
                  <tr key={`edit-${tag.id}`}>
                    <td colSpan={5} style={{ background: '#f6f7f7', padding: 12 }}>
                      <strong style={{ display: 'block', marginBottom: 8 }}>Quick Edit</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Name</label>
                          <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Slug</label>
                          <input type="text" value={editForm.slug} onChange={e => setEditForm(f => ({ ...f, slug: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Description</label>
                          <input type="text" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="button-primary" onClick={saveEdit}>Update</button>
                        <button className="button" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ),
              ])}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
