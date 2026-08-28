
import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Edit, Trash2, X, ArrowUpDown, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const statusTabs = ['All', 'Active', 'Draft', 'Archived'];

function getStatusBadge(status) {
  const map = {
    active: 'badge-success',
    draft: 'badge-info',
    archived: 'badge-info',
  };
  return map[status] || 'badge-info';
}

function getTotalInventory(product) {
  if (!product.variants || product.variants.length === 0) return 0;
  return product.variants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);
}

function getProductImage(product) {
  if (product.images && product.images.length > 0) {
    return product.images[0].src;
  }
  return `https://placehold.co/40x40/e4e5e7/616161?text=${encodeURIComponent(product.title?.[0] || 'P')}`;
}

function getProductPrice(product) {
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants.map(v => parseFloat(v.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `$${min.toFixed(2)}`;
    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }
  return 'N/A';
}

export default function Products() {
  const { state, addProduct, updateProduct, deleteProduct } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('Title,Vendor,Type,Price,SKU,Qty,Status\nCanvas Tote,Evergreen Goods,Accessories,29.00,TOTE-001,40,active');
  const [importResult, setImportResult] = useState(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = state.products || [];

    // Tab filter
    if (activeTab !== 'All') {
      result = result.filter(p => p.status === activeTab.toLowerCase());
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortField) {
      result = [...result].sort((a, b) => {
        let aVal, bVal;
        if (sortField === 'title') { aVal = a.title; bVal = b.title; }
        else if (sortField === 'inventory') { aVal = getTotalInventory(a); bVal = getTotalInventory(b); }
        else if (sortField === 'type') { aVal = a.productType; bVal = b.productType; }
        else if (sortField === 'vendor') { aVal = a.vendor; bVal = b.vendor; }
        else { return 0; }
        if (typeof aVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [state.products, searchQuery, activeTab, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
        selectedIds.forEach(id => deleteProduct(id));
        setSelectedIds([]);
      }
    } else if (['active', 'draft', 'archived'].includes(action)) {
      selectedIds.forEach(id => updateProduct(id, { status: action }));
      setSelectedIds([]);
    }
  };

  // Get tab counts
  const tabCounts = useMemo(() => {
    const products = state.products || [];
    return {
      All: products.length,
      Active: products.filter(p => p.status === 'active').length,
      Draft: products.filter(p => p.status === 'draft').length,
      Archived: products.filter(p => p.status === 'archived').length,
    };
  }, [state.products]);

  const parseCsv = (text) => {
    const rows = text.split(/\r?\n/).map(row => row.trim()).filter(Boolean);
    if (rows.length < 2) return [];
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
    return rows.slice(1).map(row => {
      const values = row.split(',').map(v => v.trim());
      const record = {};
      headers.forEach((h, index) => { record[h] = values[index] || ''; });
      return record;
    });
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result || ''));
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImportProducts = () => {
    const rows = parseCsv(importText);
    const imported = rows
      .filter(row => row.title || row.handle)
      .map((row, index) => {
        const title = row.title || row.handle || `Imported product ${index + 1}`;
        const price = row.price || row['variant price'] || '0.00';
        const sku = row.sku || row['variant sku'] || `IMP-${Date.now()}-${index}`;
        const quantity = parseInt(row.qty || row.quantity || row['variant inventory qty'] || '0', 10) || 0;
        return {
          title,
          bodyHtml: row.body || row.description || '',
          vendor: row.vendor || 'Imported',
          productType: row.type || row.producttype || 'General',
          handle: (row.handle || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          status: ['active', 'draft', 'archived'].includes((row.status || '').toLowerCase()) ? row.status.toLowerCase() : 'draft',
          tags: (row.tags || '').split('|').join(',').split(',').map(t => t.trim()).filter(Boolean),
          images: [],
          options: [],
          variants: [{
            id: `var_${Date.now()}_${index}`,
            title: 'Default',
            price,
            compareAtPrice: null,
            sku,
            inventoryQuantity: quantity,
            option1: null,
            option2: null,
            position: 1,
          }],
          collections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

    imported.forEach(product => addProduct(product));
    setImportResult(`${imported.length} product${imported.length === 1 ? '' : 's'} imported`);
    if (imported.length > 0) {
      setActiveTab('All');
      setSearchQuery('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Products</h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-[13px]" onClick={() => setShowImportModal(true)}>
            <Upload size={16} /> Import
          </button>
          <Link to="/products/new" className="btn-primary text-[13px]">
            <Plus size={16} /> Add product
          </Link>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-xl shadow-modal w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#e3e3e3' }}>
              <h2 className="text-[16px] font-semibold text-[#303030]">Import products</h2>
              <button onClick={() => setShowImportModal(false)}><X size={18} /></button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-[13px] text-[#616161]">Upload or paste CSV with Title, Vendor, Type, Price, SKU, Qty, and Status columns.</p>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFile} />
              <button className="btn-secondary text-[13px]" onClick={() => fileInputRef.current?.click()}>Choose CSV file</button>
              <textarea
                className="w-full h-48 text-[13px] font-mono"
                value={importText}
                onChange={e => { setImportText(e.target.value); setImportResult(null); }}
              />
              {importResult && (
                <div className="p-3 rounded-lg text-[13px] font-medium" style={{ background: '#aee9d1', color: '#047b5d' }}>{importResult}</div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: '#e3e3e3' }}>
              <button className="btn-secondary text-[13px]" onClick={() => setShowImportModal(false)}>Close</button>
              <button className="btn-primary text-[13px]" onClick={handleImportProducts}>Import products</button>
            </div>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b" style={{ borderColor: '#e3e3e3' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
            <input
              type="text"
              placeholder="Search products"
              className="w-full pl-9 py-[7px] text-[13px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto" style={{ borderColor: '#e3e3e3' }}>
          {statusTabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedIds([]); }}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#303030] text-[#303030]'
                  : 'border-transparent text-[#616161] hover:text-[#303030]'
              }`}
            >
              {tab} {tabCounts[tab] > 0 && <span className="ml-1 text-[#616161]">({tabCounts[tab]})</span>}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="bg-[#f6f6f7] border-b p-3 flex items-center gap-3" style={{ borderColor: '#e3e3e3' }}>
            <button onClick={() => setSelectedIds([])} className="p-1 hover:bg-[#e3e3e3] rounded">
              <X size={16} className="text-[#616161]" />
            </button>
            <span className="text-[13px] font-medium">{selectedIds.length} selected</span>
            <div className="h-4 w-px bg-[#e3e3e3]"></div>
            <button onClick={() => handleBulkAction('active')} className="btn-secondary text-[12px] py-1">Set as active</button>
            <button onClick={() => handleBulkAction('draft')} className="btn-secondary text-[12px] py-1">Set as draft</button>
            <button onClick={() => handleBulkAction('archived')} className="btn-secondary text-[12px] py-1">Archive</button>
            <button onClick={() => handleBulkAction('delete')} className="btn-danger text-[12px] py-1">Delete</button>
          </div>
        )}

        {/* Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40, paddingLeft: 16 }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
                  style={{ width: 16, height: 16 }}
                />
              </th>
              <th></th>
              <th>
                <button onClick={() => handleSort('title')} className="flex items-center gap-1 text-[#616161] hover:text-[#303030]">
                  Product <ArrowUpDown size={14} />
                </button>
              </th>
              <th>Status</th>
              <th>
                <button onClick={() => handleSort('inventory')} className="flex items-center gap-1 text-[#616161] hover:text-[#303030]">
                  Inventory <ArrowUpDown size={14} />
                </button>
              </th>
              <th>
                <button onClick={() => handleSort('type')} className="flex items-center gap-1 text-[#616161] hover:text-[#303030]">
                  Type <ArrowUpDown size={14} />
                </button>
              </th>
              <th>
                <button onClick={() => handleSort('vendor')} className="flex items-center gap-1 text-[#616161] hover:text-[#303030]">
                  Vendor <ArrowUpDown size={14} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-[#616161] py-12">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const inventory = getTotalInventory(product);
                const isLow = inventory > 0 && inventory < 10;
                return (
                  <tr
                    key={product.id}
                    className={selectedIds.includes(product.id) ? 'bg-[#f6f6f7]' : ''}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <td style={{ paddingLeft: 16, width: 40 }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: 16, height: 16 }}
                      />
                    </td>
                    <td style={{ width: 52, paddingRight: 0 }}>
                      <div className="w-10 h-10 rounded overflow-hidden border" style={{ borderColor: '#e3e3e3' }}>
                        <img
                          src={getProductImage(product)}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td>
                      <Link
                        to={`/products/${product.id}`}
                        className="font-medium text-[#303030] hover:underline"
                        style={{ color: '#303030' }}
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(product.status)}`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={isLow ? 'text-[#d72c0d] font-medium' : 'text-[#303030]'}>
                        {inventory} in stock
                      </span>
                      {product.variants && product.variants.length > 1 && (
                        <div className="text-[12px] text-[#616161]">
                          for {product.variants.length} variants
                        </div>
                      )}
                    </td>
                    <td className="text-[#616161]">{product.productType}</td>
                    <td className="text-[#616161]">{product.vendor}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
