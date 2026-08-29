
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface UserProfileProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: state.user.firstName,
    lastName: state.user.lastName,
    email: state.user.email,
    title: state.user.title || '',
    phone: state.user.phone || '',
  });

  const handleSave = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      onShowToast('First name and last name are required', 'error');
      return;
    }
    updateState({
      user: {
        ...state.user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        title: formData.title,
        phone: formData.phone,
      }
    });
    setEditMode(false);
    onShowToast('Profile updated successfully', 'success');
  };

  const handleCancel = () => {
    setFormData({
      firstName: state.user.firstName,
      lastName: state.user.lastName,
      email: state.user.email,
      title: state.user.title || '',
      phone: state.user.phone || '',
    });
    setEditMode(false);
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>My Profile</h1>
        {!editMode && (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
          <img
            src={state.user.avatar}
            alt={`${state.user.firstName} ${state.user.lastName}`}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
              {state.user.firstName} {state.user.lastName}
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{state.user.title}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{state.user.email}</div>
          </div>
        </div>

        {editMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>First Name</label>
              <div>{state.user.firstName}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Name</label>
              <div>{state.user.lastName}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email</label>
              <div>{state.user.email}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Title</label>
              <div>{state.user.title || '—'}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Phone</label>
              <div>{state.user.phone || '—'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
