
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatTime } from '../utils/helpers';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const favorites = useStore(state => state.favorites);
  const [showServices, setShowServices] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [activeSettingsItem, setActiveSettingsItem] = useState(null);

  // Sticker packs local state so download can toggle
  const [stickerPacks, setStickerPacks] = useState([
    { id: 'sp1', name: '可爱小熊', thumbnail: '🧸', stickers: ['🧸','🐻','🐼','🐨','🦊','🐰','🐱','🐶'], added: true },
    { id: 'sp2', name: '经典表情', thumbnail: '😂', stickers: ['😂','😭','🤣','😊','😍','🥺','😎','🤗'], added: true },
    { id: 'sp3', name: '办公日常', thumbnail: '💼', stickers: ['💼','📎','📝','💻','☕','📊','🗂️','📅'], added: false },
    { id: 'sp4', name: '美食天堂', thumbnail: '🍕', stickers: ['🍕','🍔','🍜','🍣','🍰','🧁','🍩','🍿'], added: true },
    { id: 'sp5', name: '可爱猫咪', thumbnail: '😺', stickers: ['😺','😸','😹','😻','😼','😽','🙀','😿'], added: false },
    { id: 'sp6', name: '运动达人', thumbnail: '⚽', stickers: ['⚽','🏀','🏈','⚾','🎾','🏐','🏓','🎳'], added: false },
  ]);

  if (!user) return null;

  const getFavTypeIcon = (type) => {
    switch (type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'link': return '🔗';
      case 'file': return '📄';
      default: return '⭐';
    }
  };

  const getFavPreview = (fav) => {
    if (fav.type === 'text') return fav.content;
    if (fav.type === 'image') return '[图片]';
    if (fav.type === 'link') return fav.title || fav.content;
    if (fav.type === 'file') return fav.fileName || fav.content;
    return fav.content;
  };

  const togglePackAdded = (packId, e) => {
    e.stopPropagation();
    setStickerPacks(prev => prev.map(p =>
      p.id === packId ? { ...p, added: !p.added } : p
    ));
  };

  const settingsItems = [
    { key: 'account', label: '帐号与安全', section: 1 },
    { key: 'youth', label: '青少年模式', section: 2 },
    { key: 'care', label: '关怀模式', desc: '大字体', section: 2 },
    { key: 'notifications', label: '新消息通知', section: 3 },
    { key: 'privacy', label: '隐私', section: 3 },
    { key: 'general', label: '通用', section: 3 },
    { key: 'about', label: '关于微信', desc: 'XeChat 8.0.44', section: 4 },
  ];

  const settingSections = [1, 2, 3, 4];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>我</h1>
      </div>

      {/* Profile Card */}
      <div className="profile-card" onClick={() => navigate(`/user/${user.userId}`)}>
        <img src={user.avatar} alt={user.nickname} className="profile-avatar" />
        <div className="profile-info">
          <div className="profile-name">{user.nickname}</div>
          <div className="profile-id">微信号: {user.wechatId}</div>
        </div>
        <span className="qr-code-icon">📱</span>
        <span className="arrow">›</span>
      </div>

      {/* Section 1: Services */}
      <div className="profile-menu">
        <div className="menu-item" onClick={() => setShowServices(true)}>
          <div className="menu-icon-box" style={{ backgroundColor: '#07c160' }}>💰</div>
          <span className="menu-label">服务</span>
          <span className="arrow">›</span>
        </div>
      </div>

      {/* Section 2: Favorites, Moments, Cards, Stickers */}
      <div className="profile-menu">
        <div className="menu-item" onClick={() => setShowFavorites(true)}>
          <div className="menu-icon-box" style={{ backgroundColor: '#fa9d3b' }}>⭐</div>
          <span className="menu-label">收藏</span>
          <span className="arrow">›</span>
        </div>
        <div className="menu-item" onClick={() => navigate('/moments')}>
          <div className="menu-icon-box" style={{ backgroundColor: '#576b95' }}>📷</div>
          <span className="menu-label">朋友圈</span>
          <span className="arrow">›</span>
        </div>
        <div className="menu-item" onClick={() => setShowWallet(true)}>
          <div className="menu-icon-box" style={{ backgroundColor: '#576b95' }}>💳</div>
          <span className="menu-label">卡包</span>
          <span className="arrow">›</span>
        </div>
        <div className="menu-item" onClick={() => setShowStickers(true)}>
          <div className="menu-icon-box" style={{ backgroundColor: '#fa9d3b' }}>😊</div>
          <span className="menu-label">表情</span>
          <span className="arrow">›</span>
        </div>
      </div>

      {/* Section 3: Settings */}
      <div className="profile-menu">
        <div className="menu-item" onClick={() => setShowSettings(true)}>
          <div className="menu-icon-box" style={{ backgroundColor: '#576b95' }}>⚙️</div>
          <span className="menu-label">设置</span>
          <span className="arrow">›</span>
        </div>
      </div>

      {/* Services Modal */}
      {showServices && (
        <div className="modal-overlay" onClick={() => setShowServices(false)}>
          <div className="services-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-btn" onClick={() => setShowServices(false)}>‹</button>
              <h3>服务</h3>
            </div>
            <div className="services-content">
              <div className="service-section">
                <h4>金融理财</h4>
                <div className="service-grid">
                  {[{icon:'💰',name:'微信支付'},{icon:'🏦',name:'银行卡'},{icon:'📊',name:'理财通'}].map(s => (
                    <div key={s.name} className="service-item" style={{ cursor: 'pointer' }} onClick={() => setShowServices(false)}>
                      <div className="service-icon">{s.icon}</div>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="service-section">
                <h4>生活服务</h4>
                <div className="service-grid">
                  {[{icon:'📱',name:'手机充值'},{icon:'💡',name:'生活缴费'},{icon:'🏥',name:'医疗健康'}].map(s => (
                    <div key={s.name} className="service-item" style={{ cursor: 'pointer' }} onClick={() => setShowServices(false)}>
                      <div className="service-icon">{s.icon}</div>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="service-section">
                <h4>出行交通</h4>
                <div className="service-grid">
                  {[{icon:'🚗',name:'滴滴出行'},{icon:'🚄',name:'火车票机票'},{icon:'🏨',name:'酒店'}].map(s => (
                    <div key={s.name} className="service-item" style={{ cursor: 'pointer' }} onClick={() => setShowServices(false)}>
                      <div className="service-icon">{s.icon}</div>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWallet && (
        <div className="modal-overlay" onClick={() => setShowWallet(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-btn" onClick={() => setShowWallet(false)}>‹</button>
              <h3>卡包</h3>
            </div>
            <div className="wallet-content">
              <div className="wallet-section">
                {[{icon:'💳',label:'会员卡',count:3},{icon:'🎫',label:'优惠券',count:5},{icon:'🎟️',label:'电影票',count:1},{icon:'✈️',label:'机票/火车票',count:0}].map(w => (
                  <div key={w.label} className="wallet-item" style={{ cursor: 'pointer' }}>
                    <span className="wallet-icon">{w.icon}</span>
                    <span className="wallet-label">{w.label}</span>
                    <span className="wallet-count">{w.count}张</span>
                    <span className="arrow">›</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Modal */}
      {showFavorites && (
        <div className="modal-overlay" onClick={() => setShowFavorites(false)}>
          <div className="favorites-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-btn" onClick={() => setShowFavorites(false)}>‹</button>
              <h3>收藏</h3>
            </div>
            <div className="favorites-content">
              {favorites && favorites.length > 0 ? (
                <div className="favorites-list">
                  {favorites.map(fav => (
                    <div key={fav.favoriteId} className="favorite-item">
                      <span className="fav-type-icon">{getFavTypeIcon(fav.type)}</span>
                      <div className="fav-info">
                        <div className="fav-preview">{getFavPreview(fav)}</div>
                        <div className="fav-meta">
                          <span className="fav-source">来自 {fav.source}</span>
                          <span className="fav-time">{formatTime(fav.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="favorites-empty">
                  <div className="empty-icon">⭐</div>
                  <p>暂无收藏内容</p>
                  <span className="empty-hint">收藏的内容将会显示在这里</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stickers Modal */}
      {showStickers && (
        <div className="modal-overlay" onClick={() => setShowStickers(false)}>
          <div className="stickers-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-btn" onClick={() => { setShowStickers(false); setSelectedPack(null); }}>‹</button>
              <h3>{selectedPack ? selectedPack.name : '表情'}</h3>
            </div>
            <div className="stickers-content">
              {selectedPack ? (
                <div className="sticker-pack-detail">
                  <div className="sticker-pack-grid">
                    {selectedPack.stickers.map((sticker, i) => (
                      <div key={i} className="sticker-item">{sticker}</div>
                    ))}
                  </div>
                  <button className="back-to-packs" onClick={() => setSelectedPack(null)}>
                    返回表情商店
                  </button>
                </div>
              ) : (
                <div className="sticker-packs-list">
                  {stickerPacks.map(pack => (
                    <div key={pack.id} className="sticker-pack-item" onClick={() => setSelectedPack(pack)}>
                      <span className="pack-thumbnail">{pack.thumbnail}</span>
                      <div className="pack-info">
                        <span className="pack-name">{pack.name}</span>
                      </div>
                      <span
                        className={`pack-status ${pack.added ? 'added' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => togglePackAdded(pack.id, e)}
                      >
                        {pack.added ? '已添加' : '下载'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && !activeSettingsItem && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-btn" onClick={() => setShowSettings(false)}>‹</button>
              <h3>设置</h3>
            </div>
            <div className="settings-content">
              {settingSections.map(sec => {
                const items = settingsItems.filter(i => i.section === sec);
                if (items.length === 0) return null;
                return (
                  <div key={sec} className="settings-section">
                    {items.map(item => (
                      <div
                        key={item.key}
                        className="settings-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActiveSettingsItem(item.key)}
                      >
                        <span className="settings-label">{item.label}</span>
                        {item.desc && <span className="settings-desc">{item.desc}</span>}
                        <span className="arrow">›</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Settings Sub-page */}
      {activeSettingsItem && (
        <div className="modal-overlay" onClick={() => setActiveSettingsItem(null)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="back-btn" onClick={() => setActiveSettingsItem(null)}>‹</button>
              <h3>{settingsItems.find(i => i.key === activeSettingsItem)?.label}</h3>
            </div>
            <div className="settings-content" style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
              <p>该设置项功能正在完善中</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

