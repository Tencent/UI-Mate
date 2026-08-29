import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, CreditCard, Bell, Truck, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const sectionLinkStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
  textDecoration: 'none', color: 'inherit',
};

export default function AccountInfo() {
  const { state, dispatch, showToast } = useApp();
  const navigate = useNavigate();
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
    { label: 'Display Name', value: seller.displayName, editable: false },
    { label: 'Store Name', value: seller.storeName, editable: true, editState: editStore, setEdit: () => { setStoreVal(seller.storeName); setEditStore(true); }, editVal: storeVal, setEditVal: setStoreVal, save: saveStore, cancel: () => setEditStore(false) },
    { label: 'Legal Name', value: seller.legalName, editable: false },
    { label: 'Seller ID', value: seller.sellerId, editable: false },
    { label: 'Email', value: seller.email, editable: true, editState: editEmail, setEdit: () => { setEmailVal(seller.email); setEditEmail(true); }, editVal: emailVal, setEditVal: setEmailVal, save: saveEmail, cancel: () => setEditEmail(false) },
    { label: 'Marketplace', value: seller.marketplace, editable: false },
    { label: 'Plan Type', value: seller.planType, editable: false },
    { label: 'Member Since', value: new Date(seller.registeredSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), editable: false },
  ];

  const sections = [
    { icon: <Shield size={18} color="#555" />, label: 'Login & Security', desc: 'Password, two-step verification', path: '/settings' },
    { icon: <CreditCard size={18} color="#555" />, label: 'Payment Methods', desc: 'Deposit methods, bank accounts', path: '/payments' },
    { icon: <Bell size={18} color="#555" />, label: 'Notification Preferences', desc: 'Email and SMS alerts', path: '/settings/notifications' },
    { icon: <Truck size={18} color="#555" />, label: 'Shipping Settings', desc: 'Carrier accounts, ship-from address', path: '/settings/shipping' },
  ];

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 20px' }}>Account Information</h1>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0 16px', borderBottom: '1px solid #eee', marginBottom: 4 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#232f3e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={26} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{seller.displayName}</div>
            <div style={{ fontSize: 13, color: '#555' }}>{seller.email}</div>
          </div>
        </div>

        {fields.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < fields.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
            <div style={{ width: 160, fontSize: 13, fontWeight: 700, color: '#555', flexShrink: 0 }}>{f.label}</div>
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

      {/* Quick links */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '10px 16px 6px', fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Account Settings
        </div>
        {sections.map((s, i) => (
          <div
            key={i}
            onClick={() => navigate(s.path)}
            style={{ ...sectionLinkStyle, borderBottom: i < sections.length - 1 ? '1px solid #f0f0f0' : 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f7f8fa'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {s.icon}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#777' }}>{s.desc}</div>
              </div>
            </div>
            <ChevronRight size={16} color="#aaa" />
          </div>
        ))}
      </div>
    </div>
  );
}
