import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../App.jsx';

const PRESET_AVATARS = Array.from({ length: 8 }, (_, i) => `https://i.pravatar.cc/150?u=avatar${i + 10}`);

export default function EditProfileModal({ onClose }) {
  const { state, currentUserId, editProfile } = useApp();
  const showToast = useToast();
  const currentUser = state?.users?.[currentUserId];

  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [redId, setRedId] = useState(currentUser?.redId || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [gender, setGender] = useState(currentUser?.gender || 'other');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (!currentUser) return null;

  const handleSave = () => {
    if (!nickname.trim()) { showToast('请填写昵称'); return; }
    editProfile({
      nickname: nickname.trim(),
      redId: redId.trim() || currentUser.redId,
      bio: bio.trim(),
      gender,
      location: location.trim(),
      avatar: avatar || currentUser.avatar
    });
    showToast('资料已更新');
    onClose();
  };

  return (
    <div className="edit-profile-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="edit-profile-content">
        <div className="edit-profile-title">编辑资料</div>

        {/* Avatar selection */}
        <div className="form-field" style={{ textAlign: 'center' }}>
          <img
            src={avatar || currentUser.avatar}
            alt="avatar"
            style={{
              width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
              border: '3px solid var(--xhs-border)', cursor: 'pointer', margin: '0 auto 8px'
            }}
            onClick={() => setShowAvatarPicker(v => !v)}
            onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
          />
          <div
            style={{ fontSize: 12, color: 'var(--xhs-red)', cursor: 'pointer' }}
            onClick={() => setShowAvatarPicker(v => !v)}
          >
            更换头像
          </div>
          {showAvatarPicker && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
              padding: '12px 0', marginTop: 8
            }}>
              {PRESET_AVATARS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  onClick={() => { setAvatar(url); setShowAvatarPicker(false); }}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: '50%', objectFit: 'cover',
                    cursor: 'pointer',
                    border: avatar === url ? '2px solid var(--xhs-red)' : '2px solid transparent'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">昵称</label>
          <input
            type="text"
            className="form-input"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="form-field">
          <label className="form-label">小红书号</label>
          <input
            type="text"
            className="form-input"
            value={redId}
            onChange={e => setRedId(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="form-field">
          <label className="form-label">简介</label>
          <textarea
            className="form-textarea"
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={150}
            rows={3}
          />
        </div>

        <div className="form-field">
          <label className="form-label">性别</label>
          <div className="gender-options">
            {[['female', '女'], ['male', '男'], ['other', '保密']].map(([val, label]) => (
              <label key={val} className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value={val}
                  checked={gender === val}
                  onChange={() => setGender(val)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">所在地</label>
          <input
            type="text"
            className="form-input"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="城市"
            maxLength={30}
          />
        </div>

        <div className="edit-profile-btns">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-save" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
