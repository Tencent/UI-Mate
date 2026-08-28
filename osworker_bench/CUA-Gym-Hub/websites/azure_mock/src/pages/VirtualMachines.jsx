import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, RefreshCw, Play, Square, RotateCcw, Trash2 } from 'lucide-react';

export default function VirtualMachines() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [rgFilter, setRgFilter] = useState('');

  const filtered = state.virtualMachines.filter(vm => {
    if (search && !vm.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (rgFilter && vm.resourceGroup !== rgFilter) return false;
    return true;
  });

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map(vm => vm.id));
  };

  const statusBadge = (status) => {
    if (status === 'Running') return <span className="badge badge-success">Running</span>;
    if (status === 'Stopped' || status === 'Deallocated') return <span className="badge badge-gray">{status}</span>;
    return <span className="badge badge-info">{status}</span>;
  };

  const rgs = [...new Set(state.virtualMachines.map(vm => vm.resourceGroup))];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Virtual machines' }]} />
      <h1 className="page-title">Virtual machines</h1>

      <div className="command-bar">
        <button className="btn btn-primary" onClick={() => navigate('/virtual-machines/create')}><Plus size={14} /> Create</button>
        <button className="btn btn-default"><RefreshCw size={14} /> Refresh</button>
        {selected.length > 0 && (
          <>
            <button className="btn btn-default" onClick={() => selected.forEach(id => dispatch({ type: 'START_VM', payload: id }))}><Play size={14} /> Start</button>
            <button className="btn btn-default" onClick={() => selected.forEach(id => dispatch({ type: 'RESTART_VM', payload: id }))}><RotateCcw size={14} /> Restart</button>
            <button className="btn btn-default" onClick={() => selected.forEach(id => dispatch({ type: 'STOP_VM', payload: id }))}><Square size={14} /> Stop</button>
            <button className="btn btn-danger" onClick={() => selected.forEach(id => dispatch({ type: 'DELETE_VM', payload: id }))}><Trash2 size={14} /> Delete</button>
          </>
        )}
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Filter by name..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" value={rgFilter} onChange={e => setRgFilter(e.target.value)}>
          <option value="">All resource groups</option>
          {rgs.map(rg => <option key={rg} value={rg}>{rg}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr>
              <th style={{ width: '32px' }}><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
              <th>Name</th>
              <th>Resource group</th>
              <th>Status</th>
              <th>Location</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(vm => (
              <tr key={vm.id} className={selected.includes(vm.id) ? 'selected' : ''}>
                <td><input type="checkbox" checked={selected.includes(vm.id)} onChange={() => toggleSelect(vm.id)} /></td>
                <td><Link to={`/virtual-machines/${vm.id}`}>{vm.name}</Link></td>
                <td>{vm.resourceGroup}</td>
                <td>{statusBadge(vm.status)}</td>
                <td>{vm.location}</td>
                <td>{vm.size}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No virtual machines found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
