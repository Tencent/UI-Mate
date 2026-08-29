import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_COLORS = {
  'Working': 'badge-pending',
  'In Transit': 'badge-info',
  'Receiving': 'badge-success',
  'Closed': 'badge-inactive',
  'Cancelled': 'badge-error'
};

export default function FBAShipments() {
  const { state } = useApp();
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  if (!state) return null;
  const { fbaInventory } = state;

  const filtered = statusFilter === 'All'
    ? fbaInventory.inboundShipments
    : fbaInventory.inboundShipments.filter(s => s.status === statusFilter);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>FBA Shipments</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {['Working', 'In Transit', 'Receiving', 'Closed'].map(status => {
          const count = fbaInventory.inboundShipments.filter(s => s.status === status).length;
          return (
            <div key={status} className="card" style={{ marginBottom: 0, cursor: 'pointer', border: statusFilter === status ? '2px solid #ff9900' : '1px solid #ddd' }}
              onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}>
              <div style={{ fontSize: 12, color: '#555' }}>{status}</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{count}</div>
              <div style={{ fontSize: 12, color: '#555' }}>shipment{count !== 1 ? 's' : ''}</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}></th>
              <th>Shipment Name</th>
              <th>Shipment ID</th>
              <th>Status</th>
              <th>Destination</th>
              <th>Created</th>
              <th>Est. Arrival</th>
              <th>Items</th>
              <th>Received</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const pct = s.itemCount > 0 ? Math.round((s.receivedCount / s.itemCount) * 100) : 0;
              return (
                <React.Fragment key={s.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                    <td>{expanded === s.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                    <td style={{ fontWeight: 700 }}>{s.shipmentName}</td>
                    <td style={{ fontSize: 12, color: '#555' }}>{s.id}</td>
                    <td><span className={`badge ${STATUS_COLORS[s.status] || 'badge-inactive'}`}>{s.status}</span></td>
                    <td style={{ fontSize: 12 }}>{s.destination}</td>
                    <td style={{ fontSize: 12 }}>{new Date(s.createdDate).toLocaleDateString()}</td>
                    <td style={{ fontSize: 12 }}>{s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString() : '-'}</td>
                    <td>{s.itemCount}</td>
                    <td>{s.receivedCount}</td>
                    <td style={{ width: 100 }}>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-fill progress-fill-success" style={{ width: pct + '%' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{pct}%</div>
                    </td>
                  </tr>
                  {expanded === s.id && (
                    <tr>
                      <td colSpan={10} style={{ background: '#f9fafb', padding: 16 }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Shipment Items</div>
                        <table className="data-table" style={{ background: 'white' }}>
                          <thead>
                            <tr>
                              <th>ASIN</th>
                              <th>SKU</th>
                              <th>Shipped</th>
                              <th>Received</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {s.items.map((item, i) => (
                              <tr key={i}>
                                <td style={{ fontSize: 12 }}>{item.asin}</td>
                                <td style={{ fontSize: 12 }}>{item.sku}</td>
                                <td>{item.quantity}</td>
                                <td>{item.received}</td>
                                <td>
                                  {item.received === item.quantity
                                    ? <span className="badge badge-success">Complete</span>
                                    : item.received > 0
                                      ? <span className="badge badge-info">Partial</span>
                                      : <span className="badge badge-pending">Awaiting</span>
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
