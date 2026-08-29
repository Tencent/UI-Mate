import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, RefreshCw } from 'lucide-react';

export default function AllResources() {
  const { state, getAllResources } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [rgFilter, setRgFilter] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [refreshKey, setRefreshKey] = useState(0);

  const resources = useMemo(() => getAllResources(), [getAllResources]);

  const filtered = useMemo(() => {
    let list = resources;
    if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter) list = list.filter(r => r.type === typeFilter);
    if (rgFilter) list = list.filter(r => r.resourceGroup === rgFilter);
    list.sort((a, b) => {
      const av = a[sortCol] || '';
      const bv = b[sortCol] || '';
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [resources, search, typeFilter, rgFilter, sortCol, sortDir]);

  const types = [...new Set(resources.map(r => r.type))];
  const rgs = [...new Set(resources.map(r => r.resourceGroup).filter(Boolean))];

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'All resources' }]} />
      <h1 className="page-title">All resources</h1>

      <div className="command-bar">
        <button className="btn btn-primary" onClick={() => navigate('/create-resource')}><Plus size={14} /> Create</button>
        <button className="btn btn-default" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Filter by name..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input" value={rgFilter} onChange={e => setRgFilter(e.target.value)}>
          <option value="">All resource groups</option>
          {rgs.map(rg => <option key={rg} value={rg}>{rg}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')}>Name {sortCol === 'name' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}</th>
              <th className="sortable" onClick={() => handleSort('type')}>Type {sortCol === 'type' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}</th>
              <th className="sortable" onClick={() => handleSort('resourceGroup')}>Resource group</th>
              <th className="sortable" onClick={() => handleSort('location')}>Location</th>
              <th>Subscription</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td><Link to={r.detailPath}>{r.name}</Link></td>
                <td>{r.type}</td>
                <td>{r.resourceGroup}</td>
                <td>{r.location}</td>
                <td>{state.subscriptions[0]?.displayName}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--xzure-text-secondary)', padding: '24px' }}>No resources found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
