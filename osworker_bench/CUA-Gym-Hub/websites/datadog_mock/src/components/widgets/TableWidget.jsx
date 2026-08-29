import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function TableWidget({ widget }) {
  const { state } = useAppContext();
  const def = widget.definition || {};
  const columns = def.columns || ['Name', 'Value'];

  // Generate table data from hosts
  const hosts = state.hosts.filter(h => h.status === 'active');
  const rows = hosts.map(h => ({
    Host: h.hostname,
    'CPU %': h.cpu.toFixed(1),
    'Memory %': h.memory.toFixed(1),
    'Load 15': h.load15.toFixed(2),
    Status: h.status.toUpperCase(),
    // cost data
    'Instance Type': h.instanceType,
    Count: '1',
    'Monthly Cost': '$' + (Math.random() * 800 + 200).toFixed(0),
  }));

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      <table className="data-table" style={{ fontSize: 12 }}>
        <thead>
          <tr>
            {columns.map(col => <th key={col}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col} className={typeof row[col] === 'number' || (row[col] && /^[\d.$%]+$/.test(row[col])) ? 'numeric' : ''}>
                  {col === 'Status' ? (
                    <span className={`status-badge ${row[col] === 'ACTIVE' ? 'ok' : 'nodata'}`} style={{ fontSize: 10 }}>
                      {row[col]}
                    </span>
                  ) : row[col] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
