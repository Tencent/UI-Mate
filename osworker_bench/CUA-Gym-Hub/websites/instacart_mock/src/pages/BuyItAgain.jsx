import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function BuyItAgain() {
  const { state } = useApp();

  const buyItAgainProducts = useMemo(() => {
    const productCounts = {};
    state.orders.forEach(order => {
      order.items?.forEach(item => {
        if (item.productId) {
          productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
        }
      });
    });
    const productIds = Object.keys(productCounts).sort((a, b) => productCounts[b] - productCounts[a]);
    return productIds
      .map(id => state.products.find(p => p.id === id))
      .filter(Boolean);
  }, [state.orders, state.products]);

  return (
    <div className="page-content">
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Buy It Again</h1>
      {buyItAgainProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#x1F504;</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No past purchases</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Your previously ordered items will appear here</p>
        </div>
      ) : (
        <div className="product-grid">
          {buyItAgainProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
