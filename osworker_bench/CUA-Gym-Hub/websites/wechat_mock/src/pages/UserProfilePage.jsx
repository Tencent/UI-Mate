
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const contacts = useStore(state => state.contacts);
  const moments = useStore(state => state.moments);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const isCurrentUser = userId === user.userId;
  const profile = isCurrentUser ? user : contacts.find(c => c.userId === userId);

  if (!profile) {
    return <div className="error-page">用户不存在</div>;
  }

  const userMoments = moments.filter(m => m.userId === userId);
  const recentPhotos = userMoments
    .flatMap(m => m.images)
    .slice(0, 9);

  const sendMessage = useStore(state => state.sendMessage);

  const handleSendMessage = () => {
    navigate(`/chat/${userId}`);
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleVoiceCall = () => {
    setShowVoiceCall(true);
    const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    setTimeout(() => {
      clearInterval(interval);
    }, 60000);
  };

  const handleVideoCall = () => {
    setShowVideoCall(true);
    const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    setTimeout(() => {
      clearInterval(interval);
    }, 60000);
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = (type) => {
    const duration = formatCallDuration(callDuration);
    sendMessage(userId, `${type === 'voice' ? '语音' : '视频'}通话时长 ${duration}`, 'text');
    setShowVoiceCall(false);
    setShowVideoCall(false);
    setCallDuration(0);
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="user-profile-page">
      <div className="profile-header-section">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <div className="cover-image" style={{ backgroundImage: `url(${profile.coverImage || 'https://picsum.photos/400/200?random=1000'})` }}>
          <img src={profile.avatar} alt={profile.nickname} className="profile-avatar-large" />
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-basic-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 className="profile-nickname">{profile.nickname}</h2>
              <p className="profile-xechat-id">微信号: {profile.wechatId}</p>
            </div>
            <button
              style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '20px' }}
              onClick={() => setShowQRCode(true)}
              title="查看二维码"
            >📱</button>
          </div>
        </div>

        {profile.signature && (
          <div className="profile-section">
            <div className="section-label">个性签名</div>
            <div className="section-content">{profile.signature}</div>
          </div>
        )}

        {profile.region && (
          <div className="profile-section">
            <div className="section-label">地区</div>
            <div className="section-content">{profile.region}</div>
          </div>
        )}

        {profile.gender && (
          <div className="profile-section">
            <div className="section-label">性别</div>
            <div className="section-content">{profile.gender}</div>
          </div>
        )}

        {profile.phone && (
          <div className="profile-section">
            <div className="section-label">电话</div>
            <div className="section-content">📞 {profile.phone}</div>
          </div>
        )}

        {recentPhotos.length > 0 && (
          <div className="profile-section">
            <div className="section-label">朋友圈</div>
            <div className="photo-wall">
              {recentPhotos.map((photo, index) => (
                <img key={index} src={photo} alt="朋友圈照片" className="photo-item" />
              ))}
            </div>
          </div>
        )}

        <div className="profile-actions">
          {isCurrentUser ? (
            <button className="action-btn primary" onClick={handleEditProfile}>
              编辑资料
            </button>
          ) : (
            <>
              <button className="action-btn primary" onClick={handleSendMessage}>
                发消息
              </button>
              <button className="action-btn secondary" onClick={handleVoiceCall}>
                语音通话
              </button>
              <button className="action-btn secondary" onClick={handleVideoCall}>
                视频通话
              </button>
            </>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowQRCode(false)}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '13px', color: '#666' }}>扫码添加微信</div>
            <div style={{ width: '160px', height: '160px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
              {/* Simulated QR pattern */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,16px)', gap: '2px' }}>
                {Array.from({length: 64}).map((_, i) => (
                  <div key={i} style={{ width: '16px', height: '16px', backgroundColor: [0,1,2,7,8,14,15,21,28,35,42,49,56,57,58,59,60,61,62,63,3,4,5,9,10,11,16,17,18,25,26,27,30,31,36,37,43,44,50,51].includes(i) ? '#333' : '#fff', borderRadius: '2px' }} />
                ))}
              </div>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{profile.nickname}</div>
            <button style={{ padding: '8px 24px', background: '#07c160', color: '#fff', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '14px' }} onClick={() => setShowQRCode(false)}>关闭</button>
          </div>
        </div>
      )}

      {/* Voice Call Screen */}
      {showVoiceCall && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '40px 20px' }}>
            <img src={profile.avatar} alt={profile.nickname} style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)' }} />
            <div style={{ color: '#fff', fontSize: '24px', fontWeight: '600' }}>{profile.nickname}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>语音通话中...</div>
            <div style={{ color: '#fff', fontSize: '20px', fontVariantNumeric: 'tabular-nums' }}>{formatCallDuration(callDuration)}</div>
            <button style={{ marginTop: '30px', padding: '14px 44px', backgroundColor: '#ff4d4f', color: 'white', borderRadius: '30px', fontSize: '17px', fontWeight: '500', border: 'none', cursor: 'pointer' }} onClick={() => handleEndCall('voice')}>结束通话</button>
          </div>
        </div>
      )}

      {/* Video Call Screen */}
      {showVideoCall && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#1a1a2e', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '40px 20px' }}>
            <img src={profile.avatar} alt={profile.nickname} style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #576b95' }} />
            <div style={{ color: '#fff', fontSize: '24px', fontWeight: '600' }}>{profile.nickname}</div>
            <div style={{ color: '#aaa', fontSize: '15px' }}>视频通话中...</div>
            <div style={{ color: '#fff', fontSize: '20px' }}>{formatCallDuration(callDuration)}</div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
              <button style={{ padding: '14px 24px', backgroundColor: '#576b95', color: 'white', borderRadius: '30px', fontSize: '15px', border: 'none', cursor: 'pointer' }} onClick={() => setShowVideoCall(false)}>关闭摄像头</button>
              <button style={{ padding: '14px 24px', backgroundColor: '#ff4d4f', color: 'white', borderRadius: '30px', fontSize: '15px', border: 'none', cursor: 'pointer' }} onClick={() => handleEndCall('video')}>结束通话</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;

