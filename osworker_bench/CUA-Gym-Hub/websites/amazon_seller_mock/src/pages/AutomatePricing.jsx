import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AutomatePricing() {
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', target: 'All Active Listings', strategy: 'Match lowest price' });

  if (!state) return null;
  const { pricingRules } = state;

  const toggleRule = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    dispatch({ type: 'UPDATE_PRICING_RULE', payload: { id, status: newStatus } });
    showToast(`Pricing rule ${newStatus.toLowerCase()}`, 'info');
  };

  const deleteRule = (id) => {
    dispatch({ type: 'DELETE_PRICING_RULE', payload: id });
    showToast('Pricing rule deleted', 'info');
  };

  const createRule = () => {
    if (!newRule.name.trim()) return;
    dispatch({ type: 'ADD_PRICING_RULE', payload: {
      id: 'RULE_' + Date.now(),
      name: newRule.name,
      target: newRule.target,
      strategy: newRule.strategy,
      status: 'Active',
      productsCount: 0,
      minPrice: null,
      maxPrice: null
    }});
    setShowCreateModal(false);
    setNewRule({ name: '', target: 'All Active Listings', strategy: 'Match lowest price' });
    showToast('Pricing rule created', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Automate Pricing</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>+ Create Rule</button>
      </div>
      <div className="alert alert-info">Automated pricing rules help you stay competitive by automatically adjusting your prices based on market conditions.</div>

      {pricingRules.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No pricing rules yet</div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>Create your first automated pricing rule to stay competitive.</div>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>Create Rule</button>
        </div>
      ) : pricingRules.map(rule => (
        <div key={rule.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{rule.name}</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                Target: {rule.target} · Strategy: {rule.strategy} · {rule.productsCount} product{rule.productsCount !== 1 ? 's' : ''}
              </div>
              {rule.minPrice && <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Min Price: ${rule.minPrice.toFixed(2)}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={`badge ${rule.status === 'Active' ? 'badge-success' : 'badge-pending'}`}>{rule.status}</span>
              <label className="toggle-switch">
                <input type="checkbox" checked={rule.status === 'Active'} onChange={() => toggleRule(rule.id, rule.status)} />
                <span className="toggle-slider" />
              </label>
              <button className="btn-link" style={{ fontSize: 12, color: '#d13212' }} onClick={() => deleteRule(rule.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Create Pricing Rule</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label required">Rule Name</label>
                <input className="form-input" style={{ width: '100%' }} value={newRule.name} onChange={e => setNewRule(r => ({ ...r, name: e.target.value }))} placeholder="e.g. Match Buy Box Price" />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Target</label>
                <select className="form-select" style={{ width: '100%' }} value={newRule.target} onChange={e => setNewRule(r => ({ ...r, target: e.target.value }))}>
                  <option>All Active Listings</option>
                  <option>All Active FBA Listings</option>
                  <option>All Active FBM Listings</option>
                  <option>Candles Category</option>
                  <option>Kitchen Category</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Strategy</label>
                <select className="form-select" style={{ width: '100%' }} value={newRule.strategy} onChange={e => setNewRule(r => ({ ...r, strategy: e.target.value }))}>
                  <option>Match lowest price</option>
                  <option>Beat lowest by $0.50</option>
                  <option>Beat lowest by $1.00</option>
                  <option>Stay 5% below Buy Box</option>
                  <option>Price floor - cost + 30% margin</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createRule}>Create Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
