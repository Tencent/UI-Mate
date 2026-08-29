import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

export default function InfrastructureContainers() {
  const { state } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    let ctns = state.containers || [];
    if (statusFilter !== 'all') ctns = ctns.filter(c => c.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      ctns = ctns.filter(c => c.name.toLowerCase().includes(q) || c.image.toLowerCase().includes(q) || c.host.toLowerCase().includes(q));
    }
    ctns = [...ctns].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return ctns;
  }, [state.containers, search, statusFilter, sortCol, sortDir]);

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  function sortInd(col) {
    if (sortCol !== col) return '';
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
  }

  const running = (state.containers || []).filter(c => c.status === 'running').length;
  const stopped = (state.containers || []).filter(c => c.status !== 'running').length;

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Containers</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {running} running, {stopped} stopped
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="search-input" placeholder="Search by name, image, or host..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: 6, fontSize: 14 }}>
          <option value="all">All Statuses</option>
          <option value="running">Running</option>
          <option value="exited">Exited</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')}>Container{sortInd('name')}</th>
              <th onClick={() => toggleSort('image')}>Image{sortInd('image')}</th>
              <th onClick={() => toggleSort('status')}>Status{sortInd('status')}</th>
              <th onClick={() => toggleSort('host')}>Host{sortInd('host')}</th>
              <th onClick={() => toggleSort('cpu')} className="numeric">CPU %{sortInd('cpu')}</th>
              <th className="numeric">Memory</th>
              <th>Uptime</th>
              <th className="numeric">Restarts</th>
              <th>Ports</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td><strong style={{ color: 'var(--color-brand)' }}>{c.name}</strong></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{c.image}</td>
                <td>
                  <span className={`status-badge ${c.status === 'running' ? 'ok' : 'alert'}`} style={{ fontSize: 10 }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ fontSize: 12 }}>{c.host}</td>
                <td className="numeric">
                  {c.status === 'running' ? (
                    <div className="mini-bar">
                      <span>{c.cpu.toFixed(1)}</span>
                      <div className="mini-bar-track">
                        <div className="mini-bar-fill" style={{ width: `${Math.min(c.cpu, 100)}%`, background: c.cpu > 80 ? 'var(--color-alert)' : c.cpu > 50 ? 'var(--color-warn)' : 'var(--color-ok)' }} />
                      </div>
                    </div>
                  ) : '-'}
                </td>
                <td className="numeric">
                  {c.status === 'running' ? (
                    <span>{c.memory} / {c.memoryLimit} MB</span>
                  ) : '-'}
                </td>
                <td style={{ fontSize: 12 }}>{c.uptime}</td>
                <td className="numeric" style={{ color: c.restarts > 2 ? 'var(--color-alert)' : c.restarts > 0 ? 'var(--color-warn)' : 'inherit' }}>
                  {c.restarts}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{c.ports || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
