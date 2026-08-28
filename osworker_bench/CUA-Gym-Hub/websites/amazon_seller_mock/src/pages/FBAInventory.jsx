import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function FBAInventory() {
  const { state, showToast } = useApp();
  if (!state) return null;
  const { products } = state;
  const fbaProducts = products.filter(p => p.fulfillmentChannel === 'FBA');

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>FBA Inventory</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>ASIN</th>
              <th>Available</th>
              <th>Reserved</th>
              <th>Inbound</th>
              <th>Total</th>
              <th>Days of Supply</th>
            </tr>
          </thead>
          <tbody>
            {fbaProducts.map(prod => {
              const total = prod.availableQuantity + prod.reservedQuantity + prod.inboundQuantity;
              const dos = prod.availableQuantity > 0 ? Math.floor(prod.availableQuantity / 3) : 0;
              return (
                <tr key={prod.id}>
                  <td><div className="truncate" style={{ maxWidth: 240, fontWeight: 700 }}>{prod.title.slice(0, 50)}</div><div style={{ fontSize: 11, color: '#555' }}>{prod.sku}</div></td>
                  <td style={{ fontSize: 12 }}>{prod.asin}</td>
                  <td style={{ fontWeight: 700, color: prod.availableQuantity < 10 ? '#d13212' : '#111' }}>{prod.availableQuantity}</td>
                  <td>{prod.reservedQuantity}</td>
                  <td>{prod.inboundQuantity}</td>
                  <td>{total}</td>
                  <td style={{ color: dos < 15 ? '#d13212' : dos < 30 ? '#b7791f' : '#067d62', fontWeight: 700 }}>{dos} days</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
