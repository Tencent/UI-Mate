
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import './EditProfilePage.css';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const updateUser = useStore(state => state.updateUser);

  const [formData, setFormData] = useState({
    nickname: user.nickname,
    signature: user.signature || '',
    region: user.region || '',
    gender: user.gender || '男'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);

    setTimeout(() => {
      updateUser(formData);
      setIsSaving(false);
      navigate(-1);
    }, 300);
  };

  const handleChangeAvatar = () => {
    const randomNum = Math.floor(Math.random() * 1000) + 100;
    updateUser({ avatar: `https://picsum.photos/100/100?random=${randomNum}` });
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1>个人信息</h1>
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="edit-content">
        <div className="edit-section">
          <div className="edit-item clickable" onClick={handleChangeAvatar}>
            <span className="item-label">头像</span>
            <div className="item-value">
              <img src={user.avatar} alt="头像" className="avatar-preview" />
              <span className="arrow">›</span>
            </div>
          </div>
        </div>

        <div className="edit-section">
          <div className="edit-item">
            <span className="item-label">昵称</span>
            <input
              type="text"
              className="item-input"
              value={formData.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
              placeholder="请输入昵称"
            />
          </div>

          <div className="edit-item">
            <span className="item-label">微信号</span>
            <span className="item-value disabled">{user.wechatId}</span>
          </div>

          <div className="edit-item clickable" onClick={() => setShowQRCode(true)}>
            <span className="item-label">我的二维码</span>
            <div className="item-value">
              <span className="qr-icon">📱</span>
              <span className="arrow">›</span>
            </div>
          </div>
        </div>

        <div className="edit-section">
          <div className="edit-item vertical">
            <span className="item-label">个性签名</span>
            <textarea
              className="item-textarea"
              value={formData.signature}
              onChange={(e) => handleChange('signature', e.target.value)}
              placeholder="添加个性签名"
            />
          </div>
        </div>

        <div className="edit-section">
          <div className="edit-item">
            <span className="item-label">地区</span>
            <input
              type="text"
              className="item-input"
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              placeholder="请输入地区"
            />
          </div>

          <div className="edit-item">
            <span className="item-label">性别</span>
            <select
              className="item-select"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
        </div>
      </div>

      {showQRCode && (
        <div className="qr-overlay" onClick={() => setShowQRCode(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qr-header">
              <h3>我的二维码名片</h3>
              <button className="qr-close-btn" onClick={() => setShowQRCode(false)}>✕</button>
            </div>
            <div className="qr-body">
              <img src={user.avatar} alt={user.nickname} className="qr-avatar" />
              <div className="qr-name">{user.nickname}</div>
              <div className="qr-id">微信号: {user.wechatId}</div>
              <div className="qr-code-container">
                <div className="qr-code-placeholder">
                  <div className="qr-grid">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div key={i} className="qr-pixel" style={{
                        opacity: Math.random() > 0.5 ? 1 : 0
                      }} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="qr-hint">扫一扫上面的二维码图案，加我微信</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfilePage;
