import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { state, dispatch, showToast } = useApp();
  const [editStore, setEditStore] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [storeVal, setStoreVal] = useState('');
  const [emailVal, setEmailVal] = useState('');

  if (!state) return null;
  const { seller } = state;

  const saveStore = () => {
    dispatch({ type: 'SET_STATE', payload: { seller: { ...seller, storeName: storeVal } } });
    setEditStore(false);
    showToast('Store name updated', 'success');
  };
  const saveEmail = () => {
    dispatch({ type: 'SET_STATE', payload: { seller: { ...seller, email: emailVal } } });
    setEditEmail(false);
    showToast('Email updated', 'success');
  };

  const fields = [
    { label: 'Store Name', value: seller.storeName, editable: true, editState: editStore, setEdit: () => { setStoreVal(seller.storeName); setEditStore(true); }, editVal: storeVal, setEditVal: setStoreVal, save: saveStore, cancel: () => setEditStore(false) },
    { label: 'Legal Name', value: seller.legalName, editable: false },
    { label: 'Seller ID', value: seller.sellerId, editable: false },
    { label: 'Email', value: seller.email, editable: true, editState: editEmail, setEdit: () => { setEmailVal(seller.email); setEditEmail(true); }, editVal: emailVal, setEditVal: setEmailVal, save: saveEmail, cancel: () => setEditEmail(false) },
    { label: 'Marketplace', value: seller.marketplace, editable: false },
    { label: 'Plan Type', value: seller.planType, editable: false },
    { label: 'Member Since', value: new Date(seller.registeredSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), editable: false }
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Account Settings</h1>
      <div className="card">
        <div className="card-title">Account Information</div>
        {fields.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < fields.length - 1 ? '1px solid #eee' : 'none' }}>
            <div style={{ width: 160, fontSize: 13, fontWeight: 700, color: '#555' }}>{f.label}</div>
            <div style={{ flex: 1 }}>
              {f.editable && f.editState ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="form-input" value={f.editVal} onChange={e => f.setEditVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') f.save(); if (e.key === 'Escape') f.cancel(); }} style={{ width: 280 }} autoFocus />
                  <button className="btn-primary" onClick={f.save}>Save</button>
                  <button className="btn-secondary" onClick={f.cancel}>Cancel</button>
                </div>
              ) : (
                <span style={{ fontSize: 13 }}>{f.value}</span>
              )}
            </div>
            {f.editable && !f.editState && (
              <button className="btn-link" onClick={f.setEdit} style={{ fontSize: 12 }}>Edit</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
