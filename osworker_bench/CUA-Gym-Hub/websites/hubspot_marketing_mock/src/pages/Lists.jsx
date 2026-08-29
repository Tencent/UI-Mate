import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, Pagination, EmptyState, Modal, FormField } from '../components/ui/index.jsx';

export default function Lists() {
  const { state, addItem, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newList, setNewList] = useState({ name: '', type: 'active' });
  const PER_PAGE = 25;

  const lists = state.lists || [];

  const filtered = useMemo(() => {
    let items = lists;
    if (search) items = items.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== 'all') items = items.filter(l => l.type === typeFilter);
    return items;
  }, [lists, search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCreate = () => {
    if (!newList.name.trim()) return;
    addItem('lists', {
      id: `list-${Date.now()}`,
      name: newList.name,
      type: newList.type,
      size: 0,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      filters: [],
      createdBy: 'user-1'
    });
    setShowCreate(false);
    setNewList({ name: '', type: 'active' });
    showToast('List created', 'success');
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Lists</h1>
          <div className="record-count">{lists.length} lists</div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create list</button>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--hs-text-muted)' }} />
          <input style={{ paddingLeft: 32 }} placeholder="Search lists..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {['all','active','static'].map(t => (
          <button key={t} className={`filter-btn ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
            {t === 'all' ? 'All lists' : t === 'active' ? 'Active lists' : 'Static lists'}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {pageItems.length === 0 ? (
          <EmptyState icon="📂" title="No lists found" description="Create lists to segment your contacts and target them with personalized campaigns." actionLabel="Create list" onAction={() => setShowCreate(true)} />
        ) : (
          <>
            <table className="hs-table">
              <thead>
                <tr>
                  <th>List Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Created Date</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(list => (
                  <tr key={list.id} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 500, color: 'var(--hs-teal)' }}>{list.name}</td>
                    <td>
                      <span className={`badge ${list.type === 'active' ? 'badge-blue' : 'badge-gray'}`}>
                        {list.type === 'active' ? 'Active' : 'Static'}
                      </span>
                    </td>
                    <td>{list.size?.toLocaleString()}</td>
                    <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(list.createdDate)}</td>
                    <td style={{ color: 'var(--hs-text-secondary)' }}>{formatDate(list.updatedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} />
          </>
        )}
      </div>

      {showCreate && (
        <Modal title="Create list" onClose={() => setShowCreate(false)} width={480}>
          <FormField label="List name" required>
            <input autoFocus value={newList.name} onChange={e => setNewList(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Newsletter Subscribers" />
          </FormField>
          <FormField label="List type">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="listType" value="active" checked={newList.type === 'active'} onChange={() => setNewList(p => ({ ...p, type: 'active' }))} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>Active list</div>
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>Automatically updates as contacts meet or no longer meet the list criteria.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="listType" value="static" checked={newList.type === 'static'} onChange={() => setNewList(p => ({ ...p, type: 'static' }))} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>Static list</div>
                  <div style={{ fontSize: 12, color: 'var(--hs-text-muted)' }}>Fixed list that only changes when you manually add or remove contacts.</div>
                </div>
              </label>
            </div>
          </FormField>
          {newList.type === 'active' && (
            <FormField label="Filter criteria">
              <div style={{ border: '1px solid var(--hs-border)', borderRadius: 3, padding: 12, background: 'var(--hs-page-bg)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <select style={{ flex: 1 }}>
                    <option>Lifecycle stage</option>
                    <option>Lead status</option>
                    <option>Contact owner</option>
                    <option>Source</option>
                  </select>
                  <select style={{ flex: 1 }}>
                    <option>is any of</option>
                    <option>is none of</option>
                    <option>is known</option>
                    <option>is unknown</option>
                  </select>
                  <input placeholder="Value..." style={{ flex: 1 }} />
                </div>
                <button className="btn btn-tertiary" style={{ fontSize: 13, padding: '4px 8px' }}>+ Add filter</button>
              </div>
            </FormField>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create list</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
