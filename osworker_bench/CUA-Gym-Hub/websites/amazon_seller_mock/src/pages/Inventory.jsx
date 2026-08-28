import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STATUS_TABS = ['Active', 'Inactive', 'Suppressed', 'Incomplete', 'All'];
const PAGE_SIZE = 15;

function getInitials(title) {
  return title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function colorForProduct(id) {
  const colors = ['#232f3e', '#0066c0', '#067d62', '#b7791f', '#d13212', '#007185'];
  const idx = parseInt(id.replace(/\D/g, '')) % colors.length;
  return colors[idx];
}

function StatusBadge({ status }) {
  const map = { 'Active': 'badge-success', 'Inactive': 'badge-inactive', 'Suppressed': 'badge-error', 'Incomplete': 'badge-pending' };
  return <span className={`badge ${map[status] || 'badge-inactive'}`}>{status}</span>;
}

function InlineEdit({ value, type, onSave, prefix }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef();

  const startEdit = () => { setVal(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 10); };
  const save = () => {
    const parsed = type === 'number' ? parseFloat(val) : parseInt(val);
    if (isNaN(parsed) || parsed < 0) { setEditing(false); return; }
    if (type === 'price' && parsed <= 0) { setEditing(false); return; }
    onSave(parsed);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  const cancel = () => setEditing(false);

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {prefix && <span style={{ fontSize: 13 }}>{prefix}</span>}
        <input
          ref={inputRef}
          type="number"
          step={type === 'price' ? '0.01' : '1'}
          min={type === 'price' ? '0.01' : '0'}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          onBlur={save}
          style={{ width: 80, height: 26, padding: '2px 6px', border: '1px solid #007185', borderRadius: 3, fontSize: 13, boxShadow: '0 0 0 2px rgba(0,113,133,0.15)', transition: 'border-color 150ms ease, box-shadow 150ms ease' }}
        />
      </div>
    );
  }
  return (
    <span onClick={startEdit} style={{ cursor: 'pointer', color: '#0066c0', borderBottom: '1px dashed #0066c0', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {prefix}{type === 'price' ? value.toFixed(2) : value}
      {saved && <Check size={12} color="#067d62" />}
    </span>
  );
}

export default function Inventory() {
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState('Active');
  const [search, setSearch] = useState(initialSearch);
  const [fulfillment, setFulfillment] = useState('All');
  const [sortCol, setSortCol] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (!state) return null;
  const { products } = state;

  const tabCounts = useMemo(() => {
    const counts = { All: products.length };
    STATUS_TABS.slice(0, -1).forEach(s => { counts[s] = products.filter(p => p.status === s).length; });
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeTab !== 'All') list = list.filter(p => p.status === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.asin.toLowerCase().includes(q));
    }
    if (fulfillment !== 'All') list = list.filter(p => p.fulfillmentChannel === fulfillment);
    list = [...list].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [products, activeTab, search, fulfillment, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageProds = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };
  const SortIcon = ({ col }) => sortCol !== col ? null : sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;

  const savePrice = (id, price) => { dispatch({ type: 'UPDATE_PRODUCT', payload: { id, price, lastUpdated: new Date().toISOString() } }); showToast('Price updated', 'success'); };
  const saveQty = (id, qty) => { dispatch({ type: 'UPDATE_PRODUCT', payload: { id, availableQuantity: qty, lastUpdated: new Date().toISOString() } }); showToast('Quantity updated', 'success'); };
  const closeListing = (id) => { dispatch({ type: 'UPDATE_PRODUCT', payload: { id, status: 'Inactive' } }); showToast('Listing closed', 'info'); };
  const deleteProduct = (id) => { dispatch({ type: 'DELETE_PRODUCT', payload: id }); setDeleteConfirm(null); showToast('Listing deleted', 'info'); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Manage All Inventory</h1>
        <button className="btn-primary" onClick={() => navigate('/catalog/add-product')}>+ Add a Product</button>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {STATUS_TABS.map(tab => (
          <div key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setPage(1); }}>
            {tab} ({tabCounts[tab] || 0})
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input className="form-input" style={{ width: 300 }} placeholder="Search by product name, SKU, or ASIN" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="form-select" value={fulfillment} onChange={e => { setFulfillment(e.target.value); setPage(1); }}>
          <option value="All">All Fulfillment</option>
          <option value="FBA">FBA</option>
          <option value="FBM">FBM</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}><input type="checkbox" checked={selected.length === pageProds.length && pageProds.length > 0} onChange={() => setSelected(sel => sel.length === pageProds.length ? [] : pageProds.map(p => p.id))} /></th>
              <th style={{ width: 70 }}>Image</th>
              <th onClick={() => handleSort('title')} style={{ cursor: 'pointer', minWidth: 200 }}>Product Name <SortIcon col="title" /></th>
              <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>Price <SortIcon col="price" /></th>
              <th onClick={() => handleSort('availableQuantity')} style={{ cursor: 'pointer' }}>Available <SortIcon col="availableQuantity" /></th>
              <th>Reserved</th>
              <th>Inbound</th>
              <th>Fulfillment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageProds.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: '#555' }}>No products found</td></tr>
            ) : pageProds.map(prod => (
              <tr key={prod.id}>
                <td><input type="checkbox" checked={selected.includes(prod.id)} onChange={() => setSelected(sel => sel.includes(prod.id) ? sel.filter(x => x !== prod.id) : [...sel, prod.id])} /></td>
                <td>
                  <div style={{ width: 56, height: 56, background: colorForProduct(prod.id), borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
                    {getInitials(prod.title)}
                  </div>
                </td>
                <td>
                  <Link to={`/catalog/edit-product/${prod.id}`} style={{ fontWeight: 700, display: 'block', maxWidth: 240 }} className="truncate">{prod.title.slice(0, 60)}{prod.title.length > 60 ? '...' : ''}</Link>
                  <div style={{ fontSize: 11, color: '#555' }}>SKU: {prod.sku}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>ASIN: {prod.asin}</div>
                </td>
                <td><InlineEdit value={prod.price} type="price" onSave={v => savePrice(prod.id, v)} prefix="$" /></td>
                <td><InlineEdit value={prod.availableQuantity} type="qty" onSave={v => saveQty(prod.id, v)} /></td>
                <td>{prod.reservedQuantity}</td>
                <td>{prod.fulfillmentChannel === 'FBA' ? prod.inboundQuantity : '-'}</td>
                <td><span className={prod.fulfillmentChannel === 'FBA' ? 'badge badge-fba' : 'badge badge-fbm'}>{prod.fulfillmentChannel}</span></td>
                <td><StatusBadge status={prod.status} /></td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button className="btn-link" style={{ fontSize: 12 }} onClick={() => navigate(`/catalog/edit-product/${prod.id}`)}>Edit</button>
                    {prod.status === 'Active' && <button className="btn-link" style={{ fontSize: 12 }} onClick={() => closeListing(prod.id)}>Close</button>}
                    <button className="btn-link" style={{ fontSize: 12, color: '#d13212' }} onClick={() => setDeleteConfirm(prod.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
          <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
        ))}
        <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        <span style={{ fontSize: 12, color: '#555', marginLeft: 8 }}>{filtered.length} products</span>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header"><h2>Delete Listing</h2><button onClick={() => setDeleteConfirm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button></div>
            <div className="modal-body">Are you sure you want to delete this listing? This action cannot be undone.</div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-primary" style={{ background: 'linear-gradient(to bottom, #f5a0a0, #e05555)', borderColor: '#c44' }} onClick={() => deleteProduct(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
