import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function InventoryPlanning() {
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();
  if (!state) return null;
  const { fbaInventory } = state;

  const ipiColor = fbaInventory.inventoryPerformanceIndex >= 400 ? '#067d62' : fbaInventory.inventoryPerformanceIndex >= 300 ? '#b7791f' : '#d13212';
  const ipiPct = Math.min(100, (fbaInventory.inventoryPerformanceIndex / 1000) * 100);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Inventory Planning</h1>

      {/* IPI Score */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: ipiColor, lineHeight: 1 }}>{fbaInventory.inventoryPerformanceIndex}</div>
          <div style={{ fontSize: 12, color: '#555' }}>IPI Score</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Inventory Performance Index</div>
          <div className="progress-bar" style={{ height: 12, marginBottom: 8 }}>
            <div className="progress-fill" style={{ width: ipiPct + '%', background: ipiColor }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555' }}>
            <span>0</span>
            <span style={{ color: '#b7791f' }}>Target: 400</span>
            <span>1000</span>
          </div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>Score above 400 avoids storage limits. Your score is <strong style={{ color: ipiColor }}>excellent</strong>.</div>
        </div>
      </div>

      {/* Restock Suggestions */}
      <div className="card">
        <div className="card-title">Restock Suggestions</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>ASIN</th>
              <th>Current Stock</th>
              <th>Days of Supply</th>
              <th>Recommended Qty</th>
              <th>Alert</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {fbaInventory.restockSuggestions.map((rs, i) => (
              <tr key={i}>
                <td><div className="truncate" style={{ maxWidth: 200 }}>{rs.title.slice(0, 40)}</div></td>
                <td style={{ fontSize: 12 }}>{rs.asin}</td>
                <td style={{ fontWeight: 700, color: '#d13212' }}>{rs.currentStock}</td>
                <td style={{ color: rs.daysOfSupply < 15 ? '#d13212' : '#b7791f' }}>{rs.daysOfSupply} days</td>
                <td style={{ fontWeight: 700 }}>{rs.recommendedQuantity}</td>
                <td><span className={`badge ${rs.alert === 'Low stock' ? 'badge-error' : 'badge-pending'}`}>{rs.alert}</span></td>
                <td><button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => { dispatch({ type: 'ADD_ORDER', payload: { id: 'SHIP_' + Date.now(), type: 'FBA Shipment', product: rs.title, quantity: rs.recommendedQuantity, status: 'Working', createdDate: new Date().toISOString() } }); showToast(`Shipment created for ${rs.recommendedQuantity} units of ${rs.title.slice(0, 30)}...`, 'success'); }}>Create Shipment</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inbound Shipments */}
      <div className="card">
        <div className="card-title">Inbound Shipments</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Shipment Name</th>
              <th>Status</th>
              <th>Destination</th>
              <th>Created</th>
              <th>Items</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {fbaInventory.inboundShipments.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700 }}>{s.shipmentName}</td>
                <td><span className="badge badge-info">{s.status}</span></td>
                <td style={{ fontSize: 12 }}>{s.destination}</td>
                <td style={{ fontSize: 12 }}>{new Date(s.createdDate).toLocaleDateString()}</td>
                <td>{s.itemCount}</td>
                <td>{s.receivedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
